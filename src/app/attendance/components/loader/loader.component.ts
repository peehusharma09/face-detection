import { Component } from '@angular/core';
import { LoaderService } from './loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {
  isLoading: boolean = false;
  timestamp: number = Date.now();
  constructor(private loaderService: LoaderService){
   this.loaderService.showLoader.subscribe((value:boolean)=>{
    this.isLoading = value
   })
  }
}
