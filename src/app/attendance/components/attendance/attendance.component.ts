import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { IpService } from '../../service/ip.service';
import { ErpService } from 'src/app/services/erp.service';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent {
  title = 'attendance_erp';
  currentDate: any;
  currentTime: any;
  ipAddress: string | undefined;
  isContentVisible: boolean = true;
  
  constructor(private datePipe: DatePipe, 
    private ipService: IpService,
    private toastr: ErpService,
  ) {
    this.ipService.getIpAddress().subscribe(
      (response) => {
        this.ipAddress = response.ip;
        if( this.ipAddress == "106.201.206.165" ||  this.ipAddress == "124.123.76.210"){
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
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  updateTime() {
    this.currentTime = this.datePipe.transform(new Date(), 'shortTime');
  }
}
