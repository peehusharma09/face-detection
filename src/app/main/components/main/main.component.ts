import { Component } from '@angular/core';
import { IpService } from 'src/app/attendance/service/ip.service';
import { ErpService } from 'src/app/services/erp.service';
import { SidebarService } from 'src/app/services/sidebar.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  sidebarVisible: boolean = true;
  ipAddress: string | undefined;
  isContentVisible: boolean = true;

  constructor( private sidebarService: SidebarService,
    private ipService: IpService,
    private toastr: ErpService,
  ){
    // this.ipService.getIpAddress().subscribe(
    //   (response) => {
    //     this.ipAddress = response.ip;
    //     if(this.ipAddress == "106.201.206.165" ||  this.ipAddress == "124.123.76.210"){
    //       console.log("Current IP Address", this.ipAddress)
    //       this.isContentVisible = true;
    //     } else {
    //       this.toastr.toast.snackbarError("IP Address Not Matching....");
    //       this.isContentVisible = false;
    //     }
    //   },
    //   (error) => {
    //     this.toastr.toast.snackbarError(error);
    //     console.error('Error fetching IP address', error);
    //     this.isContentVisible = false;
    //   }
    // );
    this.sidebarService.sidebarVisible.subscribe(visible => {
      if(this.sidebarVisible){
      this.sidebarVisible = false;
      } else{
      this.sidebarVisible = true;
      }
    });
  }
}
