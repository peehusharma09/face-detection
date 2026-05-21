import { AuthguardServiceService } from './../services/authguard-service.service';
import { Injectable } from '@angular/core';
import {  ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationGuard {
    constructor(private authService: AuthguardServiceService, private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
      if (!this.authService.gettoken()) {
        // If the user is not logged in, navigate to the login page
        this.router.navigate(['/login']);
        return false;
      }
      return true;
    }


  
  
}
