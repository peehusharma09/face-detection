import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/app/environment';

@Injectable({
    providedIn: 'root'
})
export class CloudinaryService {

    constructor(private http: HttpClient) { }

    uploadImage(file: Blob) {

        const formData = new FormData();

        formData.append('file', file);

        formData.append(
            'upload_preset',
            environment.cloudinary.uploadPreset
        );

        return this.http.post(
            `https://api.cloudinary.com/v1_1/${environment.cloudinary.cloudName}/image/upload`,
            formData
        );
    }
}