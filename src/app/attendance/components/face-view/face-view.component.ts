import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, HostListener, Input } from '@angular/core';
import { EmplyoeeService } from '../../service/emplyoee.service';
import { ErpService } from 'src/app/services/erp.service';
import { LoaderService } from '../loader/loader.service';
import * as faceapi from '@vladmandic/face-api';
import { HttpClient } from '@angular/common/http';

const FACE_MODELS_URL = 'assets/face-models';
const CLOUDINARY_CLOUD_NAME = 'dbly8fcvj';
const CLOUDINARY_UPLOAD_PRESET = 'face_attendence';

@Component({
    selector: 'app-face-view',
    templateUrl: './face-view.component.html',
    styleUrls: ['./face-view.component.scss']
})
export class FaceViewComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() autoMode: boolean = false;
    @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
    @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

    isLoading = false;
    loadingText = 'FACE DETECTION';
    showAttendance = false;
    successMessage = '';
    errorMessage = '';
    isSpoofError = false;
    attendanceRecords: any[] = [];
    logoUrl: string = '';
    private mediaStream: MediaStream | null = null;
    private recognition: any = null;
    private faceModelsLoaded = false;
    private detectionInterval: any = null;
    private consecutiveFaceFrames = 0;
    private isCapturing = false;
    private inCooldown = false;
    private cooldownTimeout: any = null;
    private consecutiveFailures = 0;
    private dualFaceWarned = false;
    debugStatus = 'init';

    constructor(
        private employeeService: EmplyoeeService,
        private toastr: ErpService,
        private spinner: LoaderService,
        private http: HttpClient
    ) { }

    ngOnInit() {
        this.fetchAttendanceData();
        this.getSystemLogo();
    }

    ngAfterViewInit() {
        this.debugStatus = 'requesting camera...';
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
            .then(async stream => {
                this.mediaStream = stream;
                const video = this.videoRef.nativeElement;
                video.srcObject = stream;
                video.style.transform = 'scaleX(-1)';

                if (this.autoMode) {
                    this.debugStatus = 'loading face model...';
                    await this.loadFaceModels();
                    this.debugStatus = 'model loaded, starting scan';
                    this.startAutoDetectLoop();
                } else {
                    this.debugStatus = 'manual mode';
                }
            })
            .catch((err) => {
                this.debugStatus = 'camera error: ' + err?.message;
                this.showError('Camera access denied. Please allow camera access in your browser settings.');
            });

        this.setupVoiceRecognition();
    }

    private async loadFaceModels() {
        if (this.faceModelsLoaded) return;
        try {
            await faceapi.nets.tinyFaceDetector.loadFromUri(FACE_MODELS_URL);

            this.debugStatus = 'starting tf backend (cpu)...';
            await (faceapi.tf as any).setBackend('cpu');
            await (faceapi.tf as any).ready();

            this.faceModelsLoaded = true;
        } catch (e: any) {
            this.debugStatus = 'model load FAILED: ' + e?.message;
            throw e;
        }
    }

    private startAutoDetectLoop() {
        this.detectionInterval = setInterval(async () => {
            if (!this.faceModelsLoaded) { this.debugStatus = 'model not loaded'; return; }
            if (this.isCapturing) { this.debugStatus = 'capturing...'; return; }
            if (this.inCooldown) { this.debugStatus = 'cooldown...'; return; }
            if (this.isLoading) { this.debugStatus = 'busy...'; return; }

            const video = this.videoRef.nativeElement;
            if (video.readyState < 2) { this.debugStatus = 'video not ready (readyState=' + video.readyState + ')'; return; }

            try {
                const detectPromise = faceapi.detectAllFaces(
                    video,
                    new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
                );
                const timeoutPromise = new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('detect timeout')), 3000)
                );
                const allDetections = await Promise.race([detectPromise, timeoutPromise]);

                // Ignore small/background faces (posters, reflections, people far
                // behind) — only count faces that take up a real chunk of the frame.
                const minFaceWidth = video.videoWidth * 0.12;
                const detections = allDetections.filter(d => d.box.width >= minFaceWidth);

                if (detections.length >= 2) {
                    this.consecutiveFaceFrames = 0;
                    this.debugStatus = `dual face detected (${detections.length})`;
                    if (!this.dualFaceWarned) {
                        this.dualFaceWarned = true;
                        this.showError('Dual face detected. Please ensure only one person is in front of the camera.');
                        this.speak('Dual face detected. Please make sure only one person is in front of the camera.');
                    }
                } else if (detections.length === 1) {
                    this.dualFaceWarned = false;
                    this.consecutiveFaceFrames++;
                    this.debugStatus = `face score=${detections[0].score.toFixed(2)} frames=${this.consecutiveFaceFrames}`;
                } else {
                    this.dualFaceWarned = false;
                    this.consecutiveFaceFrames = 0;
                    this.debugStatus = 'no face';
                }

                // Require a stable single face across several frames so someone briefly
                // passing behind the camera doesn't trigger an attendance mark.
                if (this.consecutiveFaceFrames >= 4) {
                    this.consecutiveFaceFrames = 0;
                    this.debugStatus = 'triggering capture';
                    this.triggerAutoCapture();
                }
            } catch (e: any) {
                this.debugStatus = 'detect error: ' + e?.message;
                console.error('Face detection error', e);
            }
        }, 500);
    }

    private async triggerAutoCapture() {
        this.isCapturing = true;
        this.errorMessage = '';
        this.successMessage = '';
        await this.captureAndSubmit();
        this.isCapturing = false;

        const failed = !!this.errorMessage;
        this.consecutiveFailures = failed ? this.consecutiveFailures + 1 : 0;
        this.startCooldown(failed);
    }

    private startCooldown(failed: boolean = false) {
        this.inCooldown = true;
        clearTimeout(this.cooldownTimeout);

        // Back off on repeated failures (e.g. liveness check rejects) so the
        // camera/voice prompt doesn't spam the person every ~20s.
        const duration = failed
            ? Math.min(8000 * this.consecutiveFailures, 30000)
            : 2500;

        this.cooldownTimeout = setTimeout(() => {
            this.inCooldown = false;
        }, duration);
    }

    getSystemLogo() {
        this.http.get<any>('https://erp-api-face.onrender.com/getAllSystemSettings')
            .subscribe({
                next: (res) => {
                    if (res?.data?.logo) {
                        this.logoUrl = res.data.logo;
                    }
                },
                error: (err) => {
                    console.error('Logo API Error', err);
                }
            });
    }

    ngOnDestroy() {
        this.mediaStream?.getTracks().forEach(t => t.stop());
        this.recognition?.stop();
        clearInterval(this.detectionInterval);
        clearTimeout(this.cooldownTimeout);
    }

    @HostListener('document:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter') this.captureAndSubmit();
        if (event.ctrlKey && event.key === 'v') {
            event.preventDefault();
            this.toggleAttendance();
        }
    }

    toggleAttendance() {
        this.showAttendance = !this.showAttendance;
        if (this.showAttendance) this.fetchAttendanceData();
    }

    async captureAndSubmit() {
        if (this.isLoading) return;
        this.isLoading = true;
        this.loadingText = 'FACE DETECTION';
        this.successMessage = '';
        this.errorMessage = '';

        try {
            await this.loadFaceModels();
            const detection = await faceapi.detectSingleFace(
                this.videoRef.nativeElement,
                new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.6 })
            );
            if (!detection) {
                this.showError('No face detected. Please stand in front of the camera.');
                this.speak('No face detected. Please stand in front of the camera.');
                this.isLoading = false;
                return;
            }

            const imageUrl = await this.captureAndUpload();
            const localTime = new Date().toISOString();
            this.loadingText = 'VERIFYING LIVENESS';

            this.employeeService.faceAttendance({ imageUrl, localTime }).subscribe(
                (response: any) => {
                    this.isLoading = false;
                    const msg = `Hello ${response.username}, Your ${response.action}!`;
                    this.showSuccess(msg);
                    this.speak(msg);
                    this.fetchAttendanceData();
                    this.employeeService.employeeAttendanceFun(response.empID);
                },
                (error: any) => {
                    this.isLoading = false;
                    const msg = error?.error?.message || 'Face not recognized. Please try again.';
                    this.showError(msg);
                    this.speak(msg);
                }
            );
        } catch (error) {
            this.isLoading = false;
            this.showError('An error occurred. Please try again.');
            this.speak('An error occurred. Please try again.');
        }
    }

    private async captureAndUpload(): Promise<string> {
        const video = this.videoRef.nativeElement;
        const canvas = this.canvasRef.nativeElement;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d')!;
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();

        const blob = await new Promise<Blob>(resolve =>
            canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.9)
        );

        const formData = new FormData();
        formData.append('file', blob, `face_${Date.now()}.jpg`);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            { method: 'POST', body: formData }
        );
        const data = await res.json();
        if (!res.ok) throw new Error('Upload failed');
        return data.secure_url;
    }

    fetchAttendanceData() {
        this.employeeService.employeeThreeDays().subscribe(
            (data: any[]) => this.attendanceRecords = data,
            () => { }
        );
    }

    formatTime(time: any): string {
        if (!time) return 'N/A';
        return new Date(time).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Kolkata'
        });
    }

    getBreakTimes(breaks: any[]): string {
        if (!breaks?.length) return 'N/A';
        return breaks
            .map(b =>
                new Date(b.time).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                    timeZone: 'Asia/Kolkata'
                })
            )
            .join(', ');
    }

    getLatestImage(record: any): string {
        const events: { time: string; image: string }[] = [];

        if (record.In?.time && record.In?.image)
            events.push({ time: record.In.time, image: record.In.image });
        if (record.Out?.time && record.Out?.image)
            events.push({ time: record.Out.time, image: record.Out.image });

        (record.breakIn || []).forEach((b: any) => {
            if (b.time && b.image) events.push({ time: b.time, image: b.image });
        });
        (record.breakOut || []).forEach((b: any) => {
            if (b.time && b.image) events.push({ time: b.time, image: b.image });
        });

        if (!events.length) return record.In?.image || '';
        events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        return events[0].image;
    }

    private expandedBreakKey: string | null = null;

    private recordKey(record: any): string {
        return `${record?.VID ?? record?.name ?? ''}_${record?.date ?? ''}`;
    }

    toggleBreaks(record: any): void {
        const key = this.recordKey(record);
        this.expandedBreakKey = this.expandedBreakKey === key ? null : key;
    }

    isBreaksExpanded(record: any): boolean {
        return this.expandedBreakKey === this.recordKey(record);
    }

    private showSuccess(msg: string) {
        this.successMessage = msg;
        setTimeout(() => {
            this.successMessage = '';
        }, 4000);
    }

    private showError(msg: string) {
        this.errorMessage = msg;
        this.isSpoofError = msg.includes('Spoof detected');
        this.isLoading = false;
        setTimeout(() => {
            this.errorMessage = '';
            this.isSpoofError = false;
        }, 4000);
    }

    private speak(message: string) {
        if (!('speechSynthesis' in window)) return;
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'en-US';
        utterance.volume = 1;
        utterance.rate = 1;
        utterance.pitch = 1.2;

        const setVoice = () => {
            const voices = synth.getVoices();
            const female = voices.find(v =>
                v.name.includes('Female') || v.name.includes('Samantha') ||
                v.name.includes('Google UK English Female') || v.name.includes('Victoria') ||
                v.name.includes('Alice') || v.name.includes('Karen')
            );
            if (female) utterance.voice = female;
            synth.speak(utterance);
        };

        if (synth.getVoices().length > 0) setVoice();
        else synth.onvoiceschanged = setVoice;
    }

    private setupVoiceRecognition() {
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) return;

        this.recognition = new SR();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event: any) => {
            const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
            if (transcript.includes('hi click me') || transcript.includes('hi take photo')) {
                this.captureAndSubmit();
            } else {
                this.showError("Sorry, I didn't catch that. Please use the capture icon to take a photo.");
                this.speak("Sorry, I didn't catch that. Please use the capture icon to take a photo.");
            }
        };

        this.recognition.onerror = (event: any) => console.error('Speech error:', event.error);
        this.recognition.onend = () => { 
            try { 
                this.recognition?.start(); 
            } catch { 
                // Handle error silently
            } 
        };
        this.recognition.start();
    }
}