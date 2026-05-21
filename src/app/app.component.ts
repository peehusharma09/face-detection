import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { BnNgIdleService } from 'bn-ng-idle';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'crm';
  url:any
  data: any;
  constructor(
    private bnIdle: BnNgIdleService,

    private  router: Router,
  ){
    this.url = window.location.href
    console.log(this.router.url,'this.router.url',window.location.href);
    this.bnIdle.startWatching(1800).subscribe((res:any) => {
      if(res && this.router.url !='/login') {
        localStorage.clear();
        this.router.navigate(['/login']);
        this.data.sort=this.sort
      }
    })
  }
    @ViewChild(MatSort) sort:MatSort | undefined;
  ngOnInit(): void {
    console.log(this.router.url);

    // Disable right-click context menu
    // document.body.oncontextmenu = () => false;

    // Disable specific keyboard shortcuts
    // document.onkeydown = (e) => {
    //   if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') ||
    //       (e.ctrlKey && e.shiftKey && e.key === 'C') ||
    //       (e.ctrlKey && e.shiftKey && e.key === 'J') ||
    //       (e.ctrlKey && e.key === 'U')) {
    //     e.preventDefault();
    //   }
    // };
  }

}
