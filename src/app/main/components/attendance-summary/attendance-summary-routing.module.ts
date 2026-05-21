import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AttendanceSummaryComponent } from './components/attendance-summary/attendance-summary.component';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';

const routes: Routes = [{
  path:'',component:AttendanceSummaryComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes),
    MatSortModule,
    MatTableModule,
    MatPaginatorModule,
  ],
  exports: [RouterModule]
})
export class AttendanceSummaryRoutingModule { }
