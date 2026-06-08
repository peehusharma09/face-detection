import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { AttendanceSummaryRoutingModule } from './attendance-summary-routing.module';
import { AttendanceSummaryComponent } from './components/attendance-summary/attendance-summary.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { MatSortModule } from '@angular/material/sort';
// import { DateFormatPipe } from 'src/app/attendance/pipe/datePipe/date-format.pipe';


@NgModule({
  declarations: [
    AttendanceSummaryComponent,
    // DateFormatPipe

  ],
  imports: [
    CommonModule,
    AttendanceSummaryRoutingModule,
    MatTableModule,
    MatDialogModule,
    MatPaginatorModule,
    MatIconModule,
    MatFormFieldModule,
    FormsModule,
    RouterModule,
    MatDatepickerModule,
    NgxMaterialTimepickerModule,
    MatSortModule,
  ],
  providers: [DatePipe],

})
export class AttendanceSummaryModule { }
