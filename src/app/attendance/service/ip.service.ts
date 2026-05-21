import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IpService {
  private apiUrl = 'https://api.ipify.org?format=json'; // ipify API URL

  constructor(private http: HttpClient) { }

  getIpAddress(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
  
}
