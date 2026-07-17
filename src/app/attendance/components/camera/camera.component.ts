import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
// import { AngularFireStorage } from '@angular/fire/compat/storage';
import { CloudinaryService } from '../../service/cloudinary.service';
import { finalize } from 'rxjs/operators';
import { EmplyoeeService } from '../../service/emplyoee.service';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import { ErpService } from 'src/app/services/erp.service';
import { LoaderService } from '../loader/loader.service';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss']
})
export class CameraComponent implements OnInit, AfterViewInit {
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  @ViewChild('picture') picture!: ElementRef;
  @ViewChild('canvas') canvas!: ElementRef;
  blur: boolean = false;
  sepia: boolean = false;
  invert: boolean = false;
  flip: boolean = false;
  videoElement!: HTMLVideoElement;
  labels = { hello: 'world' };
  predictionValue = [{
    class: '- - -',
    score: 0
  }];
  isProcessing: boolean = false;

  // constructor(private storage: AngularFireStorage,
  //   private employeeService: EmplyoeeService,
  //   private toastr: ErpService,
  //   private spinnerService: LoaderService
  // ) {
  //   this.employeeService.employeePicClick.subscribe((value: any) => {
  //     this.loadImageDetection();
  //   })
  // }
  constructor(
    private cloudinary: CloudinaryService,
    private employeeService: EmplyoeeService,
    private toastr: ErpService,
    private spinnerService: LoaderService
  ) {
    this.employeeService.employeePicClick.subscribe((value: any) => {
      this.loadImageDetection();
    });

    this.spinnerService.showLoader.subscribe((value: boolean) => {
      this.isProcessing = value;
    });
  }
  ngAfterViewInit() {
    this.videoElement = this.video.nativeElement;
  }

  ngOnInit() {
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
    })
      .then(stream => {
        this.videoElement = this.video.nativeElement;
        this.videoElement.srcObject = stream;
        this.videoElement.style.transform = 'scaleX(-1)';
      })
      .catch(error => {
        this.spinnerService.showHideLoader(false);
        this.employeeService.disableEnterBtnFun(false);
        console.error('Error accessing video stream:', error);
      });
  }

  async loadImageDetection() {
    cocoSsd.load().then(model => {
      model.detect(this.video.nativeElement).then(predictions => {
        this.predictionValue = predictions;
        if (this.predictionValue[0]?.class == 'person') {
          this.takePicture();
        } else {
          this.spinnerService.showHideLoader(false);
          this.employeeService.disableEnterBtnFun(false);
          this.toastr.toast.snackbarError("Error: Face detection failed.");
        }
      });
    });;
  }


  // takePicture() {
  //   const canvasElement = this.canvas.nativeElement;
  //   const context = canvasElement.getContext('2d');
  //   context.drawImage(this.video.nativeElement, 0, 0, canvasElement.width, canvasElement.height);
  //   const dataUrl = canvasElement.toDataURL('image/jpeg', 1.0);
  //   const fileName = `image_${new Date().getTime()}.jpg`;
  //   const filePath = `images/${fileName}`;
  //   const blob = this.dataURLtoBlob(dataUrl);
  //   const fileRef = this.storage.ref(filePath);
  //   const uploadTask = this.storage.upload(filePath, blob);
  //   uploadTask.snapshotChanges().pipe(
  //     finalize(async () => {
  //       try {
  //         const imageUrl = await fileRef.getDownloadURL().toPromise();
  //         this.employeeService.employeePicFun(imageUrl);
  //         console.log('Uploaded Image URL:', imageUrl);
  //       } catch (error) {
  //         console.error('Error getting download URL:', error);
  //       }
  //     })
  //   ).subscribe();
  // }
  takePicture() {

    const canvasElement = this.canvas.nativeElement;

    const context = canvasElement.getContext('2d');

    context.drawImage(
      this.video.nativeElement,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    const dataUrl = canvasElement.toDataURL('image/jpeg', 1.0);

    const blob = this.dataURLtoBlob(dataUrl);

    this.cloudinary.uploadImage(blob).subscribe({
      next: (response: any) => {

        const imageUrl = response.secure_url;

        console.log('Uploaded Image URL:', imageUrl);

        this.employeeService.employeePicFun(imageUrl);

        this.spinnerService.showHideLoader(false);
      },

      error: (error) => {

        console.error('Cloudinary Upload Error:', error);

        this.spinnerService.showHideLoader(false);

        this.employeeService.disableEnterBtnFun(false);

        this.toastr.toast.snackbarError(
          'Image upload failed.'
        );
      }
    });
  }

  dataURLtoBlob(dataUrl: string): Blob {
    const byteString = atob(dataUrl.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    return new Blob([uint8Array], { type: 'image/jpeg' });
  }


  getStyles() {
    let filter = '';
    let transform = '';

    if (this.blur) {
      filter += 'blur(5px)';
    }
    if (this.sepia) {
      filter += 'sepia(50%)';
    }
    if (this.invert) {
      filter += 'invert(1)';
    }
    if (this.flip) {
      transform += 'scaleX(-1)';
    }

    return {
      filter,
      transform,
    };
  }

}
