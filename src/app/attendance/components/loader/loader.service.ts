import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  showLoader = new BehaviorSubject(false)
  constructor() { }

  showHideLoader(value:boolean){
    this.showLoader.next(value)
  }
}
