import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthguardServiceService {

  gettoken(){
    return localStorage.getItem('isLoggedIn')
  }

}
