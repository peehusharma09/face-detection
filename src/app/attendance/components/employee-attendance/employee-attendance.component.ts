import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { EmplyoeeService } from '../../service/emplyoee.service';
import { ErpService } from 'src/app/services/erp.service';

@Component({
  selector: 'app-employee-attendance',
  templateUrl: './employee-attendance.component.html',
  styleUrls: ['./employee-attendance.component.scss'],
})
export class EmployeeAttendanceComponent {
  employeeDetails: any[] = [];
  slideConfig: any;
  constructor(
    private http: HttpClient,
    private employeeService: EmplyoeeService,
    private toastr: ErpService
  ) {
    this.slideConfig = {
      slidesToShow: 1,
      slidesToScroll: 1,
      dots: true,
      infinite: true,
      autoplay: true,
      autoplaySpeed: 2000,
    };
    this.employeeService.employeeAttendance.subscribe((value: any) => {
      this.employeeThreeDays();
    });
  }

  employeeThreeDays(): void {
    this.employeeService.employeeThreeDays().subscribe(
      (data: any) => {
        console.log("sevendaysdata",data)
        this.employeeDetails=data;  
      (error: any) => {
        this.toastr.toast.snackbarError('API Error: ' + error.message);
      }
    }
    );
  }

  private expandedBreakKey: string | null = null;

  private recordKey(detail: any): string {
    return `${detail?.VID ?? detail?.name ?? ''}_${detail?.date ?? ''}`;
  }

  toggleBreaks(detail: any): void {
    const key = this.recordKey(detail);
    this.expandedBreakKey = this.expandedBreakKey === key ? null : key;
  }

  isBreaksExpanded(detail: any): boolean {
    return this.expandedBreakKey === this.recordKey(detail);
  }
}
