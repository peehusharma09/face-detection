import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-images-popup',
  templateUrl: './images-popup.component.html',
  styleUrls: ['./images-popup.component.scss']
})
export class ImagesPopupComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ImagesPopupComponent>
  ) {

  }
}
