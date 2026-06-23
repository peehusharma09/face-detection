import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { EmplyoeeService } from '../../service/emplyoee.service';
import { ErpService } from 'src/app/services/erp.service';
import { LoaderService } from '../loader/loader.service';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import { HttpClient } from '@angular/common/http';

const CLOUDINARY_CLOUD_NAME = 'dbly8fcvj';
const CLOUDINARY_UPLOAD_PRESET = 'face_attendence';

@Component({
    selector: 'app-face-view',
    templateUrl: './face-view.component.html',
    styleUrls: ['./face-view.component.scss']
})
export class FaceViewComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
    @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

    isLoading = false;
    showAttendance = false;
    successMessage = '';
    errorMessage = '';
    attendanceRecords: any[] = [];
    logoUrl: string = '';
    private mediaStream: MediaStream | null = null;
    private recognition: any = null;

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
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
            .then(stream => {
                this.mediaStream = stream;
                const video = this.videoRef.nativeElement;
                video.srcObject = stream;
                video.style.transform = 'scaleX(-1)';
            })
            .catch(() => this.showError('Camera access denied. Please allow camera access in your browser settings.'));

        this.setupVoiceRecognition();
    }

    getSystemLogo() {
        this.http.get<any>('https://erp-backend-y4l2.onrender.com/getAllSystemSettings')
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
        this.successMessage = '';
        this.errorMessage = '';

        try {
            const model = await cocoSsd.load();
            const predictions = await model.detect(this.videoRef.nativeElement);
            if (!predictions.some((p: any) => p.class === 'person')) {
                this.showError('No person detected. Please stand in front of the camera.');
                this.speak('No person detected. Please stand in front of the camera.');
                this.isLoading = false;
                return;
            }

            const imageUrl = await this.captureAndUpload();
            const localTime = new Date().toISOString();
            
            this.employeeService.faceAttendance({ imageUrl, localTime }).subscribe(
                (response: any) => {
                    this.isLoading = false;
                    const msg = `Hello ${response.username}, Your ${response.action}!`;
                    this.showSuccess(msg);
                    this.speak(msg);
                    this.fetchAttendanceData();
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

    private showSuccess(msg: string) {
        this.successMessage = msg;
        setTimeout(() => {
            this.successMessage = '';
        }, 4000);
    }

    private showError(msg: string) {
        this.errorMessage = msg;
        this.isLoading = false;
        setTimeout(() => this.errorMessage = '', 4000);
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