import { ErpService } from 'src/app/services/erp.service';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { SidebarService } from 'src/app/services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  sidebarVisible: boolean = true;

  MenuArr:any[]=[
    // {
    //   "name": "Dashboard",
    //   "route":"/main/dashboard",
    //   "icon": "fa fa-th-large" ,

    //   "isSubfolder": false,
    //   "submenu": []
    // },
    {
      "name": "Attendance",
      "route":"attendance-summary",
      "icon": "fa fa-calendar",
      "isSubfolder": false,
      "submenu": []
    },
   
    {
      "name": "Employee",
      "icon": "fa fa-user",
      "isSubfolder": true,
      "submenu": [
        {
          "name": "All Employee",
          // "icon": "fa fa-users",
          "route": "/main/employee"
        },
        {
          "name": "Ex-Employees",

          "route": "/main/employee/ExEmployees"
        },
       
      ]
    },

  ]

  constructor(private router :Router,
    private ErpService:ErpService,
    private cookieService: CookieService,
    private sidebarService: SidebarService
    ){
    
        this.MenuArr = [
          {
            "name": "Attendance",
            "route":"attendance-summary",
            "icon": "fa fa-calendar",
            "isSubfolder": false,
            "submenu": []
          },

          {
            "name": "Employee",
            "icon": "fa fa-user",
            "isSubfolder": true,
            "submenu": [
              {
                "name": "All Employee",
                "route": "employee"
              },



            ]
          },
        ]
  }

  ngOnInit(){
    this.sidebarService.sidebarVisible.subscribe(visible => {
      if(this.sidebarVisible){
      this.sidebarVisible = false;
      } else{
      this.sidebarVisible = true;
      }
    });
  }
  logout(){
    localStorage.clear()
    this.router.navigate(['/login']);
    this.ErpService.toast.snackbarSuccess('Logout Successfully!')

  }
  toggleSubmenu(event: Event, item: any) {
    event.preventDefault();
    item.isOpen = !item.isOpen;
  }

  toggleSubfolder(item: any) {
    item.isOpen = !item.isOpen;
  }
}
