import { Component, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import moment from 'moment';
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
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [
    'date',
    'VID',
    'empImage',
    'name',
    'In',
    'Out',
    'breakIn',
    'breakOut',
    'total',
    'image'
  ];
  
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  pageSize: number = 10;
  pageIndex: number = 0;
  pageSizeOptions: number[] = [5, 10, 25, 50, 100];
  moment: any = moment;
  searchfilter: string = '';
  startdate: any = null;
  enddate: any = null;
  timer: any;
  requiredWorkingHours: number = 8;
  
  // Popup
  showPopup: boolean = false;
  selectedEmployee: any = null;

  constructor(
    private employeeService: EmplyoeeService,
    private datePipe: DatePipe,
    private csvService: CsvService,
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

  clearSearch() {
    this.searchfilter = '';
    this.Search();
  }

  clearDateRange() {
    this.startdate = null;
    this.enddate = null;
    this.selectrange(null, null);
  }

  debounce(func: Function, timeout: number = 500) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => { func.apply(this); }, timeout);
  }

  debounceSet() {
    this.debounce(() => this.Search());
  }

  Search() {
    this.employeeService.findEmployeeDetailByFilterByName(
      this.searchfilter
    ).subscribe((res: any) => {
      this.dataSource.data = res || [];
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  downloadCSV() {
    const csvData = this.convertToCSV(this.dataSource.data);
    this.csvService.download(csvData, 'attendance.csv');
  }

  // ============ GET FIRST ENTRY ============
  getFirstEntryTime(entry: any): string | null {
    if (entry?.In?.time) {
      return entry.In.time;
    }
    if (entry?.breakIn?.length > 0) {
      return entry.breakIn[0].time;
    }
    return null;
  }

  // ============ GET LAST ENTRY ============
  getLastEntryTime(entry: any): string | null {
    if (entry?.Out?.time) {
      return entry.Out.time;
    }

    let latestTime: string | null = null;
    let latestMoment: moment.Moment | null = null;

    if (entry?.breakOut?.length > 0) {
      for (const breakOut of entry.breakOut) {
        const time = moment(breakOut.time);
        if (!latestMoment || time.isAfter(latestMoment)) {
          latestMoment = time;
          latestTime = breakOut.time;
        }
      }
    }

    if (entry?.breakIn?.length > 0) {
      for (const breakIn of entry.breakIn) {
        const time = moment(breakIn.time);
        if (!latestMoment || time.isAfter(latestMoment)) {
          latestMoment = time;
          latestTime = breakIn.time;
        }
      }
    }

    if (entry?.In?.time) {
      const time = moment(entry.In.time);
      if (!latestMoment || time.isAfter(latestMoment)) {
        latestMoment = time;
        latestTime = entry.In.time;
      }
    }

    return latestTime;
  }

  // ============ GET OUT DISPLAY TIME ============
  getOutDisplayTime(entry: any): string | null {
    if (entry?.Out?.time) {
      return entry.Out.time;
    }
    return this.getLastEntryTime(entry);
  }

  // ============ CALCULATE TOTAL BREAK MINUTES ============
  getTotalBreakMinutes(entry: any): number {
    // If no break records at all
    if (!entry?.breakIn?.length && !entry?.breakOut?.length) {
      return 0;
    }

    // If only breakIn exists (no breakOut) - deduct 1 hour (60 minutes)
    if (entry?.breakIn?.length > 0 && !entry?.breakOut?.length) {
      return 60;
    }

    // If only breakOut exists (no breakIn) - deduct 1 hour (60 minutes)
    if (!entry?.breakIn?.length && entry?.breakOut?.length > 0) {
      return 60;
    }

    // If both breakIn and breakOut exist - calculate actual break time
    let totalBreakMinutes = 0;
    const breakInTimes = entry.breakIn.map((b: any) => moment(b.time));
    const breakOutTimes = entry.breakOut.map((b: any) => moment(b.time));

    const minLength = Math.min(breakInTimes.length, breakOutTimes.length);
    
    for (let i = 0; i < minLength; i++) {
      const breakIn = breakInTimes[i];
      const breakOut = breakOutTimes[i];
      
      // Only count if breakOut is after breakIn
      if (breakIn.isValid() && breakOut.isValid() && breakOut.isAfter(breakIn)) {
        const minutes = breakOut.diff(breakIn, 'minutes');
        // Only add if duration is reasonable (max 3 hours)
        if (minutes <= 180) {
          totalBreakMinutes += minutes;
        }
      }
    }

    // If actual break time is less than 15 minutes, deduct 1 hour
    if (totalBreakMinutes > 0 && totalBreakMinutes < 15) {
      return 60;
    }

    // If actual break time is more than 3 hours, deduct 1 hour
    if (totalBreakMinutes > 180) {
      return 60;
    }

    // Return actual break time if it's between 15 minutes and 3 hours
    return totalBreakMinutes;
  }

  // ============ CALCULATE TOTAL HOURS ============
  getTotalHours(entry: any): string {
    const firstEntry = this.getFirstEntryTime(entry);
    const lastEntry = this.getLastEntryTime(entry);

    if (!firstEntry || !lastEntry) {
      return '0h 0m';
    }

    try {
      const startTime = moment(firstEntry);
      const endTime = moment(lastEntry);
      
      if (!startTime.isValid() || !endTime.isValid() || endTime.isBefore(startTime)) {
        return '0h 0m';
      }

      let totalMinutes = endTime.diff(startTime, 'minutes');
      
      // Check if it's a full day (4 hours or more = 240 minutes)
      const isFullDay = totalMinutes >= 240;
      
      if (isFullDay) {
        // Deduct break time
        const breakMinutes = this.getTotalBreakMinutes(entry);
        
        // If breakMinutes is 0, deduct 1 hour (default)
        if (breakMinutes === 0) {
          totalMinutes = totalMinutes - 60;
        } else {
          totalMinutes = totalMinutes - breakMinutes;
        }
      }
      
      if (totalMinutes < 0) totalMinutes = 0;
      
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      return `${hours}h ${minutes}m`;
    } catch (error) {
      console.error('Error calculating hours:', error);
      return '0h 0m';
    }
  }

  // ============ GET TOTAL HOURS AS NUMBER ============
  getTotalHoursNumber(entry: any): number {
    const firstEntry = this.getFirstEntryTime(entry);
    const lastEntry = this.getLastEntryTime(entry);

    if (!firstEntry || !lastEntry) {
      return 0;
    }

    try {
      const startTime = moment(firstEntry);
      const endTime = moment(lastEntry);
      
      if (!startTime.isValid() || !endTime.isValid() || endTime.isBefore(startTime)) {
        return 0;
      }

      let totalMinutes = endTime.diff(startTime, 'minutes');
      
      const isFullDay = totalMinutes >= 240;
      
      if (isFullDay) {
        const breakMinutes = this.getTotalBreakMinutes(entry);
        if (breakMinutes === 0) {
          totalMinutes = totalMinutes - 60;
        } else {
          totalMinutes = totalMinutes - breakMinutes;
        }
      }
      
      if (totalMinutes < 0) totalMinutes = 0;
      
      return parseFloat((totalMinutes / 60).toFixed(2));
    } catch (error) {
      console.error('Error calculating hours:', error);
      return 0;
    }
  }

  hasImages(employee: any): boolean {
    return !!(employee?.In?.image || 
              (employee?.breakIn?.length > 0 && employee?.breakIn[0]?.image) ||
              (employee?.breakOut?.length > 0 && employee?.breakOut[0]?.image) ||
              employee?.Out?.image ||
              employee?.image ||
              employee?.empImage);
  }

  convertToCSV(data: any[]): string {
    const header = ['Date', 'Employee ID', 'Employee Name', 'In', 'Out (Last Entry)', 'Break In', 'Break Out', 'Total Hours'];
    const csvRows = [];
    csvRows.push(header.join(','));
    data.forEach((row: any) => {
      const breakInTimes = row?.breakIn?.map((b: any) => moment(b.time).format('hh:mm A')).join('; ') || '';
      const breakOutTimes = row?.breakOut?.map((b: any) => moment(b.time).format('hh:mm A')).join('; ') || '';
      const outDisplay = this.getOutDisplayTime(row);
      const values = [
        row.date ? moment(row.date).format('DD MMM YYYY') : '',
        row.VID || '',
        row.name || '',
        row?.In?.time ? moment(row.In.time).format('hh:mm A') : '',
        outDisplay ? moment(outDisplay).format('hh:mm A') : '',
        breakInTimes,
        breakOutTimes,
        this.getTotalHours(row)
      ];
      csvRows.push(values.join(','));
    });
    return csvRows.join('\n');
  }

  getSystemSettings() {
    this.employeeService.getAllSystemSettings().subscribe(
      (res: any) => {
        if (res?.success) {
          this.requiredWorkingHours = res.data.workHours || 8;
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  selectrange(startdate: any, enddate: any) {
    if (!startdate || !enddate) {
      this.loadAllData();
      return;
    }
    if (!this.searchfilter) {
      this.searchfilter = '';
    }
    const formattedStartDate = this.datePipe.transform(startdate, 'yyyy-MM-dd')!;
    const formattedEndDate = this.datePipe.transform(enddate, 'yyyy-MM-dd')!;

    this.employeeService.findEmployeeDetailByFilterByName(
      this.searchfilter,
      formattedStartDate,
      formattedEndDate
    ).subscribe((filteredData: any) => {
      this.dataSource.data = filteredData || [];
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });
  }

  loadAllData() {
    this.employeeService.findEmployeeDetailByFilterByName(
      this.searchfilter || ''
    ).subscribe((res: any) => {
      this.dataSource.data = res || [];
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });
  }

  // ============ STATUS METHODS ============
  getStatus(employee: any): string {
    if (employee?.In?.time) {
      return 'Present';
    }
    return 'Absent';
  }

  getStatusClass(employee: any): string {
    if (employee?.In?.time) {
      return 'status-present';
    }
    return 'status-absent';
  }

  // ============ POPUP METHODS ============
  
  openPopup(employee: any): void {
    this.selectedEmployee = employee;
    this.showPopup = true;
    document.body.style.overflow = 'hidden';
  }

  closePopup(): void {
    this.showPopup = false;
    this.selectedEmployee = null;
    document.body.style.overflow = 'auto';
  }

  openImage(imageUrl: string): void {
    if (imageUrl) {
      window.open(imageUrl, '_blank');
    }
  }
}