// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// declare var AWS : any;
// @Injectable({
//   providedIn: 'root'
// })
// export class FileUploadService {
//   apiUrl : String = "https://api.chaturvediji.stageprojects.xyz/"
//     // apiUrl : String = "https://test.api.chaturvediji.stageprojects.xyz/"
//     // apiUrl : String = "http://localhost:4019/"
//   headers: any;

//   loadingFlag: boolean = false;
//   uploadPercentage1: any = '';
//   uploadPercentage: any = '';

//   constructor(public http: HttpClient,
//   ) {
//     AWS.config.update({
//       accessKeyId: 'AWS_ACCESS_KEY_ID_REMOVED',
//       secretAccessKey: 'AWS_SECRET_ACCESS_KEY_REMOVED',
//       region: 'ap-south-1'
//     });
//   }

//   private basePath: string = '/';

//   pushUpload(upload:any, subfolderPath: string) {
//     let date = new Date();
//     let name = '';
//     name = name + date.getFullYear() + (date.getMonth() + 1) + date.getDate() + date.getHours() + date.getMinutes() + date.getSeconds() + '-' + date.getMilliseconds() + upload.name;
//       let bucket = new AWS.S3(
//         {
//           accessKeyId: 'AWS_ACCESS_KEY_ID_REMOVED',
//           secretAccessKey: 'AWS_SECRET_ACCESS_KEY_REMOVED',
//           region: 'ap-south-1'
//         }
//       );

//       const params =
//       {
//         Bucket: 'chaturvedi-v2',
//         Key: 'chaturvedi' + subfolderPath + name,
//         Body: upload.file ? upload.file : upload,
//         ContentType: upload.type,
//         ACL: "public-read-write"
//       };

//     return new Promise((resolve, reject) => {
//       this.loadingFlag = true;
//       let self = this;
//       bucket.upload(params).on('httpUploadProgress', function (evt:any) {
//         // self.uploadPercentage = ((evt.loaded / evt.total) * 100).toFixed(0);;

//         upload.progress = ((evt.loaded / evt.total) * 100).toFixed(0);
//         self.uploadPercentage1 = upload.progress

//       }).send(function (err:any, data:any) {
//         if (err) {
//           self.loadingFlag = false;
//           reject(err);
//         }
//         if (data) {
//           resolve({ url: data.Location });
//           self.loadingFlag = false;
//         }
//       });
//     });
//   }

//   pushUploadmultiple(files: any, subfolderPath: string): Promise<any[]> {
//     const promises: Promise<any>[] = [];

//     for (let i = 0; i < files.length; i++) {
//       promises.push(this.uploadFile(files[i], subfolderPath, i));
//     }

//     return Promise.all(promises);
//   }

//   private uploadFile(file: any, subfolderPath: string, index: number): Promise<any> {
//     return new Promise((resolve, reject) => {
//       let date = new Date();
//       let name = '';
//       name = name + date.getFullYear() + (date.getMonth() + 1) + date.getDate() + date.getHours() + date.getMinutes() + date.getSeconds() + '-' + date.getMilliseconds() + file.name;

//       let bucket = new AWS.S3(
//         {
//           accessKeyId: 'AWS_ACCESS_KEY_ID_REMOVED',
//           secretAccessKey: 'AWS_SECRET_ACCESS_KEY_REMOVED',
//           region: 'ap-south-1'
//         }
//       );

//       const params = {
//         Bucket: 'chaturvedi-v2',
//         Key: 'chaturvedi' + subfolderPath + name || '',
//         Body: file,
//         ContentType: file.type,
//         ACL: "public-read-write"
//       };
//       // {
//       //   Bucket: 'chaturvedi-v2',
//       //   Key: 'chaturvedi' + subfolderPath + name || '',
//       //   Body: upload.file ? upload.file : upload,
//       //   ContentType: upload.type,
//       //   ACL: "public-read-write"
//       // };



//       this.loadingFlag = true;
//       let self = this;

//       bucket.upload(params).on('httpUploadProgress', function (evt: any) {
//         self.uploadPercentage = ((evt.loaded / evt.total) * 100).toFixed(0);
//         file['progress'] = self.uploadPercentage;
//       }).send(function (err: any, data: any) {
//         if (err) {
//           self.loadingFlag = false;
//           reject(err);
//         }
//         if (data) {
//           resolve({ url: data.Location });
//           self.loadingFlag = false;
//         }
//       });
//     });
//   }

// }
