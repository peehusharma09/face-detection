import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainRoutingModule } from './main-routing.module';
import { SidebarComponent } from './components/common/sidebar/sidebar.component';
import { HeaderComponent } from './components/common/header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MainComponent } from './components/main/main.component';
import { ImagesPopupComponent } from './components/images-popup/images-popup.component';


@NgModule({
  declarations: [MainComponent,SidebarComponent, HeaderComponent, ImagesPopupComponent],
  imports: [
    CommonModule,
    MainRoutingModule,
    MatIconModule,
    MatSelectModule,
    MatCardModule,
    MatDialogModule,
  ],
  exports:[SidebarComponent,HeaderComponent,]
})
export class MainModule { }
