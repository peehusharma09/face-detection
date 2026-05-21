import { ErpService } from 'src/app/services/erp.service';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { SidebarService } from 'src/app/services/sidebar.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  sidebarVisible: boolean = true;

  usern:any = localStorage?.getItem('username');
  use:any = localStorage?.getItem('userInfo');
  username: any;
  isOpen: boolean = false;
  @ViewChild('dropdownMenu') dropdownMenu: ElementRef | any;
  userInfo: any;
  notificationArr: any;

  constructor(private router:Router,
    private ErpService:ErpService,
    private CookieService:CookieService,
    public dialog: MatDialog,
    private sidebarService:SidebarService){
    // this.username = JSON?.parse(this.usern)
    // this.userInfo = JSON?.parse(this.use)

    // this.getAllNotification()

    this.sidebarService.sidebarVisible.subscribe(visible => {
      if(this.sidebarVisible){
      this.sidebarVisible = false;
      } else{
      this.sidebarVisible = true;
      }
    });

  }


  myAccount(){
  }
//   getAllNotification(){
//     this.ErpService.getAllNotificationForParticularReceiverId(this.userInfo?._id).subscribe((res:any)=>{
// this.notificationArr = res
//     })
//   }

  notification(){
    // const dialogRef = this.dialog.open(NotificationComponent, {
    //   width: '400px',
    //   data: {item:this.notificationArr },
    // });
    // dialogRef.afterClosed().subscribe(result => {
    //   if (result) {
    //   }
    // });


  }

  changePassword(){

  }
  logout(){
    localStorage.clear()
    this.router.navigate(['/login']);
    this.ErpService.toast.snackbarSuccess('Logout Successfully!')

  }
  gotoprofile(){
    let userInfo:any = localStorage?.getItem('userInfo');

    // userInfo = userInfo ? JSON.parse(userInfo): '';
    this.router.navigate(['/main/profile/'+userInfo?._id]);

  }

  hideShow(){

  }

  toggleSidebar() {

    this.sidebarService.toggleSidebar();
  }






}
