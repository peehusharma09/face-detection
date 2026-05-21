import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EmplyoeeService } from 'src/app/attendance/service/emplyoee.service';
import { ErpService } from 'src/app/services/erp.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: any;
  password: any;
  showmsg: boolean = false;
  showPassword: boolean = false;
  loadingNext: boolean = false;

  constructor(
    private router: Router,
    public emplyoeeService: EmplyoeeService,
    private toastr: ErpService,
  ) {}

  onSubmit() {
    if (!this.email || !this.password) {
      this.showmsg = true;
      return;
    }
    this.loadingNext = true;

    let payload = {
      email: this.email,
      password: this.password,
    };

    setTimeout(() => {
      this.loadingNext = false;
    }, 12000);

    this.emplyoeeService.logInUser(payload).subscribe(
      (res: any) => {
        if (res) {
          localStorage.setItem('isLoggedIn', JSON.stringify(res?.token));
          localStorage.setItem('loginid', JSON.stringify(res?.loginid));
           this.toastr.toast.snackbarSuccess("Login Successfully!");
           this.emplyoeeService.setToken();
          // if (this.email === 'system@vidhema.com') {
          //   this.router.navigate(['/entry-system']);
          // } else {
            this.router.navigate(['/admin']);
          // }

          this.loadingNext = false;
        } else {
          this.toastr.toast.snackbarError("Login Failed!");
        }
      },
      (error: any) => {
        this.toastr.toast.snackbarError("Invalid email or password");
        console.log(error, 'erererere');
        if (error.status === 401) {
          this.loadingNext = false;
          this.toastr.toast.snackbarError("Invalid email or password");
        } else {
          this.toastr.toast.snackbarError("Something went wrong");
        }
      }
    );
  }
}
