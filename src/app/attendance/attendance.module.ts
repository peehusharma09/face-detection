import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularFireModule } from "@angular/fire/compat";
import { PopupComponent } from './components/popup/popup.component';
import { CommonModule, DatePipe } from '@angular/common';
import { AttendanceRoutingModule } from './attendance-routing.module';
import { CameraComponent } from './components/camera/camera.component';
import { EmployeeDetailsComponent } from './components/employee-details/employee-details.component';
import { EmployeeAttendanceComponent } from './components/employee-attendance/employee-attendance.component';
import { AttendanceComponent } from './components/attendance/attendance.component';
import { MatDialogModule } from '@angular/material/dialog';
import { environment } from './environments/environment';
import { NgxSpinnerModule } from 'ngx-spinner';
import { LoaderComponent } from './components/loader/loader.component';

@NgModule({
  declarations: [
    PopupComponent,
    AttendanceComponent,
    CameraComponent,
    EmployeeDetailsComponent,
    EmployeeAttendanceComponent,
    LoaderComponent,
  ],
  imports: [
    CommonModule,
    AttendanceRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    FormsModule,
    MatDialogModule,
    NgxSpinnerModule,
  ],

  providers: [DatePipe],
})
export class AttendanceModule { }
