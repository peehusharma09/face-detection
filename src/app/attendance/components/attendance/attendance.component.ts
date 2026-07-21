import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { IpService } from '../../service/ip.service';
import { ErpService } from 'src/app/services/erp.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent {
  title = 'attendance_erp';
  currentDate: any;
  showAttendance = false;
  currentTime: any;
  ipAddress: string | undefined;
  isContentVisible: boolean = true;
  activeView: 'angular' | 'faceview' = 'angular';
  attendanceType: string = 'manual';
  facialAutoMode: boolean = false;
  logoUrl: string = '';
  constructor(private datePipe: DatePipe,
    private ipService: IpService,
    private toastr: ErpService,
    private http: HttpClient,
  ) {
    this.ipService.getIpAddress().subscribe(
      (response) => {
        this.ipAddress = response.ip;
        if (this.ipAddress == "106.201.206.165" || this.ipAddress == "124.123.76.210") {
          console.log("Current IP Address", this.ipAddress)
          this.isContentVisible = true;
        } else {
          // this.toastr.toast.snackbarError("IP Address Not Matching....");
          this.isContentVisible = true;
        }
      },
      (error) => {
        this.toastr.toast.snackbarError(error);
        console.error('Error fetching IP address', error);
        this.isContentVisible = true;
      }
    );
    this.currentDate = this.datePipe.transform(new Date(), 'fullDate');
    this.updateTime();
    setInterval(() => {
      this.updateTime();
    }, 1000);

    this.getAttendanceMode();
  }
  toggleAttendance() {
    this.showAttendance = !this.showAttendance;
  }
  getCurrentYear(): number {
    return new Date().getFullYear();
  }
  ngOnInit() {

    this.getSystemLogo();
  }
  updateTime() {
    this.currentTime = this.datePipe.transform(new Date(), 'shortTime');
  }
  getSystemLogo() {
    this.http.get<any>('https://erp-backend-y4l2.onrender.com/getAllSystemSettings')
      .subscribe({
        next: (res) => {
          if (res?.data?.logo) {
            this.logoUrl = res.data.logo;
          }
        },
        error: (err) => {
          console.error('Logo API Error', err);
        }
      });
  }
  getAttendanceMode() {

    this.http
      .get<any>('https://erp-backend-y4l2.onrender.com/api/getAttendanceMode')
      .subscribe({

        next: (res) => {

          this.attendanceType =
            res?.data?.attendanceType || 'manual';

          if (this.attendanceType === 'manual facial' || this.attendanceType === 'auto facial') {

            this.activeView = 'faceview';
            this.facialAutoMode = this.attendanceType === 'auto facial';

          } else {

            this.activeView = 'angular';
            this.facialAutoMode = false;

          }

        },

        error: (err) => {

          console.error(err);

          this.attendanceType = 'manual';
          this.activeView = 'angular';
          this.facialAutoMode = false;

        }

      });

  }
}
