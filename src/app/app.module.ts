import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { ToastComponent } from './services/toast/components/toast/toast.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { MatTableSortComponent } from './mat-table-sort/mat-table-sort.component';
import {MatSortModule} from '@angular/material/sort';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

  declarations: [
    AppComponent,
    MatTableSortComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AuthModule,
    BrowserAnimationsModule,
    FormsModule,
    MatSortModule,
  ],

  providers:[
    ToastComponent,
    MatSnackBar,
  ],


  bootstrap: [AppComponent]
})
export class AppModule { }
