import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  public sidebarVisible = new BehaviorSubject('');
  sidebarVisible$ = this.sidebarVisible.asObservable();

  constructor() { }


  toggleSidebar() {

    this.sidebarVisible.next('');
  }
}
