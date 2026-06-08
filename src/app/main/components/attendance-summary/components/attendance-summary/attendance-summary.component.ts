import { Component, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import * as moment from 'moment';
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { CsvService } from 'src/app/attendance/service/csv.service';
import { EmplyoeeService } from 'src/app/attendance/service/emplyoee.service';
import { ImagesPopupComponent } from '../../../images-popup/images-popup.component';
import { MatDialog } from '@angular/material/dialog';

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
};

@Component({
  selector: 'app-attendance-summary',
  templateUrl: './attendance-summary.component.html',
  styleUrls: ['./attendance-summary.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class AttendanceSummaryComponent {
  showInfo: boolean = false;
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [
    'date',
    'VID',
    'name',
    'In',
    'Out',
    'breakIn',
    'breakOut',
    'total',
    'image'
  ];
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  pageSize: number = 10;
  pageIndex: number = 0;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  userMenuList: any;
  moment: any = moment;
  searchfilter: any;
  listDate: any;
  startdate: any;
  enddate: any;
  userData: any = localStorage.getItem('userInfo');
  userInfo: any;
  timer: any;
  constructor(
    private employeeService: EmplyoeeService,
    private datePipe: DatePipe,
    private csvService: CsvService,
    private dialog: MatDialog,
  ) {
    const currentDate = new Date();
    const firstDateOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const lastDateOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    this.startdate = firstDateOfMonth;
    this.enddate = lastDateOfMonth;
    this.selectrange(firstDateOfMonth, lastDateOfMonth);
  }
  ngOnInit() {
    this.getSystemSettings();
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  debounce(func: Function, timeout: number = 500) {
    clearTimeout(this.timer);

    this.timer = setTimeout(() => { func.apply(this); }, timeout);
  }

  debounceSet() {
    ; this.debounce(() => this.Search());
  }

  Search() {
    this.employeeService.findEmployeeDetailByFilterByName(
      this.searchfilter
    ).subscribe((res: any) => {
      this.listDate = res;
      this.dataSource.data = res;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      console.log(this.listDate, '----', this.dataSource.data);
    });
  }

  downloadCSV() {
    const csvData = this.convertToCSV(this.dataSource.data);
    this.csvService.download(csvData, 'attendance.csv');
  }

  convertToCSV(data: any[]): string {
    const header = ['image', 'Employee Id', 'Employee Name', 'Status', 'Date', 'Time'];
    const csvRows = [];
    csvRows.push(header.join(','));
    data.forEach((row: any) => {
      const values = [
        row.image,
        row.empID,
        row.empName,
        row.status,
        this.formatDate(row.date),
        this.formatTime(row.date),
      ];
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }
  requiredWorkingHours: number = 0;
  getSystemSettings() {
    this.employeeService.getAllSystemSettings().subscribe(
      (res: any) => {
        if (res?.success) {
          this.requiredWorkingHours = res.data.workHours;
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }
  getAttendanceStatus(element: any): boolean {

    // If employee has not punched out yet
    if (!element?.Out?.time) {
      return false;
    }

    const totalHours = Number(element?.totalHour || 0);

    return totalHours >= this.requiredWorkingHours;
  }

  formatDate(date: string): string {
    return date;
  }

  formatTime(time: string): string {
    return time;
  }

  selectrange(startdate: any, enddate: any) {
    if (!startdate || !enddate) return;
    if (!this.searchfilter) {
      this.searchfilter = '';
    }
    const formattedStartDate = this.datePipe.transform(
      startdate,
      'yyyy-MM-dd'
    )!;
    const formattedEndDate = this.datePipe.transform(enddate, 'yyyy-MM-dd')!;

    this.employeeService.findEmployeeDetailByFilterByName(
      this.searchfilter,
      formattedStartDate,
      formattedEndDate
    ).subscribe((filteredData: any) => {
      this.dataSource.data = filteredData;
      this.dataSource.sort = this.sort;
    });
  }


  openPopup(id: any): void {
    this.employeeService.getEmployeeById(id).subscribe(
      (response: any) => {
        const dialogRef = this.dialog.open(ImagesPopupComponent, {
          width: '1000px',
          maxWidth: '89vw',
          data: { ...response },
          disableClose: false
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result && result.confirmed === true) {
            // this.save();
          } else {
            // this.cancel();
          }
        });
      },
      (error: any) => {
        // this.toastr.toast.snackbarError("API Error: " + error.error.message);
      }
    );
  }

}
