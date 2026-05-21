import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface PopupData {
  empName: string;
  empID: string;
  status: string;
  time: string;
  date: string;
  empImage: string;
}

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent {
  empStatus:any;
  constructor(@Inject(MAT_DIALOG_DATA) public data: PopupData,
  private dialogRef: MatDialogRef<PopupComponent>
) {
  }

  getTime() {
    const currentTime = new Date();
    let hours = currentTime.getHours();
    const amOrPm = hours >= 12 ? ' PM' : ' AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Handle midnight (0 hours)
    const minutes = currentTime.getMinutes();
    const timeString = `${hours}:${minutes < 10 ? '0' + minutes : minutes}${amOrPm}`;
    return timeString;
  }
  
  onConfirm(): void {
    this.dialogRef.close({ confirmed: true });
  }

  onCancel(): void {
    this.dialogRef.close({ confirmed: false });
  }

}
