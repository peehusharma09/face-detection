import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './components/main/main.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent
    , children: [
      {
        path: 'employee',
        loadChildren: () => import('./components/employee/employee.module').then(m => m.EmployeeModule)
      },
      {
        path: 'attendance-summary',
        loadChildren: () => import('./components/attendance-summary/attendance-summary.module').then(m => m.AttendanceSummaryModule),

      }

    ],

  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
