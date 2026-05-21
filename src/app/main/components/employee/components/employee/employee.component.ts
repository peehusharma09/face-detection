import { ErpService } from './../../../../../services/erp.service';
import { Component,  ViewChild } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss']
})
export class EmployeeComponent {

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [
    'Profile',
    'Date & time',
    'Leave Duration',
    'Leave Type',
    'attachments',
    'Status',
    'Activity',
    'Action',
  ];

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  sort!: MatSort;
  pageSize:number = 10;
  pageIndex: number = 0;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  showEmployeeArr: any;
  userInfo:any =localStorage.getItem('userInfo')
  userInfoObj: any;
  filteredData: any;
SearchVal: any;

  constructor(private ErpService:ErpService,
    public router:Router,
    public dialog: MatDialog){
      this.userInfoObj = JSON.parse(this.userInfo)


    this.GetAllEmployees()

  }
  GetAllEmployees(){
    this.ErpService.GetAllEmployees().subscribe((res:any)=>{

      this.dataSource.data = res?.data
      this.dataSource.paginator = this.paginator;
      this.showEmployeeArr = res?.data
    })
  }
  Search(event: any) {
    if (event) {
      const searchValue = event.target.value.toLowerCase().trim();
      this.showEmployeeArr = this.dataSource.data.filter((val: any) =>
        val.username.toLowerCase().includes(searchValue)
      );
    } else {
      // If the event is null or undefined, reset to the original data source
      this.showEmployeeArr = this.dataSource.data;
    }
  }


}
