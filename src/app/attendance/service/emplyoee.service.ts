import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
//new
export class EmplyoeeService {
  ApiPath: any = 'http://localhost:8093/api/'
  // ApiPath: any = 'https://entry-systemapinew.onrender.com/api/'

  employeeAttendance = new BehaviorSubject('');
  disableEnterBtn = new Subject();
  employeePicClick = new Subject();
  employeePic = new Subject();
  private isLoggedIn: boolean = false;
  private token: string | null = null;
  constructor(private http: HttpClient) {
    this.setToken();
  }

  setToken() {
    const storedLoggedIn = localStorage.getItem('isLoggedIn');
    this.token = storedLoggedIn;
    this.isLoggedIn = true;
  }

  clearToken() {
    this.token = null;
    this.isLoggedIn = false;
  }

  private getHeaders() {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    if (this.isLoggedIn && this.token) {
      const tokenWithoutQuotes = this.token.replace(/^"(.*)"$/, '$1');
      headers = headers.set('Authorization', `Bearer ${tokenWithoutQuotes}`);
    }

    return headers;
  }

  disableEnterBtnFun(value: any) {
    this.disableEnterBtn.next(value);
  }

  employeeAttendanceFun(value: any) {
    this.employeeAttendance.next(value);
  }

  employeePicClickFun(value: any) {
    this.employeePicClick.next(value);
  }

  employeePicFun(value: any) {
    this.employeePic.next(value);
  }

  getEmployeeDetailsById(employeeId: any): Observable<any> {
    return this.http.get(`${this.ApiPath}findByEmployeeID/${employeeId}`, {
      headers: this.getHeaders(),
    });
  }

  findEmployeeDetailByFilterByName(empName?: string, fromDate?: string, toDate?: string): Observable<any> {
    let queryParams = `name=${empName}`;
    if (fromDate) {
      queryParams += `&fromdate=${fromDate}`;
    }

    if (toDate) {
      queryParams += `&todate=${toDate}`;
    }
    const url = `${this.ApiPath}/findEmployeeDetailByFilter?${queryParams}`;
    return this.http.get(url, {
      headers: this.getHeaders()
    });
  }

  officeEmployee(employeeId: any): Observable<any> {
    const headers = this.getHeaders();
    const url = `${this.ApiPath}officeEmployee/${employeeId}`;
    return this.http.get(url, { headers });
  }

  getEmployeeById(employeeId: any): Observable<any> {
    const headers = this.getHeaders();
    const url = `${this.ApiPath}employee/${employeeId}`;
    return this.http.get(url, { headers });
  }


  logInUser(data: any): Observable<any> {
    return this.http.post<any>(`${this.ApiPath}login`, data, {
      headers: this.getHeaders(),
    });
  }

  findEmployeeDetailByFilter(): Observable<any> {
    return this.http.get(`${this.ApiPath}findEmployeeDetailByFilter`, {
      headers: this.getHeaders(),
    });
  }

  addEmployeeAttendance(data: any): Observable<any> {
    return this.http.post<any>(`${this.ApiPath}addEmployee`, data, {
      headers: this.getHeaders(),
    });
  }

  editEmployee(data: any): Observable<any> {
    return this.http.put<any>(`${this.ApiPath}editEmployee`, data, {
      headers: this.getHeaders(),
    });
  }

  employeeThreeDays() {
    return this.http.get<any>(`${this.ApiPath}employeeThreeDays`, {
      headers: this.getHeaders(),
    });
  }
  // faceAttendance(data: { imageUrl: string; status?: string; localTime?: string }): Observable<any> {
  //   return this.http.post<any>(`${this.ApiPath}faceAttendance`, data, {
  //     headers: this.getHeaders(),
  //   });
  // }
  faceAttendance(data: { imageUrl: string; status?: string; localTime?: string }): Observable<any> {

    console.log('API URL:', `${this.ApiPath}faceAttendance`);
    console.log('Request Data:', data);

    return this.http.post<any>(
      `${this.ApiPath}faceAttendance`,
      data,
      {
        headers: this.getHeaders(),
      }
    );
  }
  getAllSystemSettings() {
    return this.http.get(
      'https://erp-backend-y4l2.onrender.com/getAllSystemSettings'
    );
  }
}