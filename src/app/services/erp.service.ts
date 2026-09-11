import { Injectable } from '@angular/core';
import { ApiService } from './service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErpService extends ApiService {
  localpath:any=`https://erp-api-face.onrender.com`


  GetAllEmployees() {
    return this.request({
      path:`${this.localpath}/getAllUsersList`,
      method:"GET",
    });
  }
 
}
