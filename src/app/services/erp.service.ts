import { Injectable } from '@angular/core';
import { ApiService } from './service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErpService extends ApiService {
  // localpath:any = `http://localhost:4000`;
  localpath:any=`https://erp-backend-y4l2.onrender.com`


  GetAllEmployees() {
    return this.request({
      path:`${this.localpath}/getAllUsersList`,
      method:"GET",
    });
  }
 
}
