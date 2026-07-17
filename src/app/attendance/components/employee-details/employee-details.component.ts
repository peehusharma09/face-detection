import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PopupComponent } from '../popup/popup.component';
import { EmplyoeeService } from '../../service/emplyoee.service';
import { ErpService } from 'src/app/services/erp.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { LoaderService } from '../loader/loader.service';


@Component({
  selector: 'app-employee-details',
  templateUrl: './employee-details.component.html',
  styleUrls: ['./employee-details.component.scss']
})
export class EmployeeDetailsComponent {
  @Output() viewAttendanceClick = new EventEmitter<void>();

  showAttendance() {
    this.viewAttendanceClick.emit();
  }
  @Output() valueChange = new EventEmitter<string>();
  employeeId: any = '';
  inLunch: boolean = false;
  outLunch: boolean = false;
  breakIn: boolean = false;
  breakOut: boolean = false;
  showValidation: boolean = false;
  selectedOption: any
  emplyoeeMatched: boolean = false
  selectboxOptions = [
    { value: 'In', label: 'In', },
    { value: 'Out', label: 'Out', },
    { value: 'BreakIn', label: 'Break-In', },
    { value: 'BreakOut', label: 'Break-Out', },
  ];
  imageUrl: any;
  employeeName: any;
  userDetails: any;
  isProcessing: boolean = false;

  constructor(private http: HttpClient,
    private employeeService: EmplyoeeService,
    private dialog: MatDialog,
    private toastr: ErpService,
    private spinnerService: LoaderService,
    private elementRef: ElementRef
  ) {

    this.spinnerService.showLoader.subscribe((value: boolean) => {
      this.isProcessing = value;
    })

    this.employeeService.disableEnterBtn.subscribe((value: any) => {
      this.spinnerService.showHideLoader(false);
    })

    this.employeeService.employeePic.subscribe((value: any) => {
      this.imageUrl = value
      this.openPopup();
    })
  }


  onButtonClick(value: any) {
    this.employeeId += value;
  }


  onBackspace(): void {
    this.valueChange.emit('backspace');
  }

  onCheckboxChange(event: any): void {
    const value = event.target.value;
    if (event.target.checked) {
      this.selectedOption.push(value);
    } else {
      const index = this.selectedOption.indexOf(value);
      if (index !== -1) {
        this.selectedOption.splice(index, 1);
      }
    }
  }

  cancel() {
    this.spinnerService.showHideLoader(false);
    this.employeeId = ""
    this.selectedOption = ""
  }


  openPopup(): void {
    this.spinnerService.showHideLoader(false);
    const dialogRef = this.dialog.open(PopupComponent, {
      width: '1000px',
      maxWidth: '89vw',
      data: {
        empName: this.userDetails.username,
        empID: this.employeeId,
        status: this.selectedOption,
        time: new Date().toLocaleTimeString(),
        date: new Date(),
        empImage: this.imageUrl
      },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.confirmed === true) {
        this.save();
      } else {
        this.cancel();
      }
    });
  }


  employeeValueChange() {
    const element = this.elementRef.nativeElement.querySelector('#employeeIdInput');
    if (element) {
      element.classList.remove('helight');
    }

  }
  optionValueChange() {
    if (!this.selectedOption) {
      this.showValidation = false;
    }
  }

  enter() {
    this.spinnerService.showHideLoader(true);
    if (!this.employeeId) {
      const element = this.elementRef.nativeElement.querySelector('#employeeIdInput');
      if (element) {
        this.spinnerService.showHideLoader(false);
        element.classList.add('helight');
      }
      return;
    }
    if (!this.selectedOption) {
      this.showValidation = true;
      this.spinnerService.showHideLoader(false);
      return;
    }
    else {
      this.showValidation = false;
    }
    this.employeeService.officeEmployee(this.employeeId).subscribe(
      (response: any) => {
        this.userDetails = response;
        this.spinnerService.showHideLoader(true);
        this.employeeService.employeePicClickFun(true);
      },
      (error: any) => {
        this.spinnerService.showHideLoader(false);
        this.employeeId = "";
        this.selectedOption = "";
        this.toastr.toast.snackbarError(error.error.message);
      }
    );
  }

  save() {
    if (this.selectedOption == "In") {
      const postData = {
        id: this.employeeId,
        imageUrl: this.imageUrl
      };
      this.employeeService.addEmployeeAttendance(postData).subscribe(
        (response: any) => {
          this.spinnerService.showHideLoader(false);
          this.toastr.toast.snackbarSuccess("Congratulations on submitting the employee attendance successfully");
          this.employeeService.employeeAttendanceFun(response.empID)
          this.cancel();
        },
        (error: any) => {
          this.selectedOption = ""
          this.employeeId = ""
          this.spinnerService.showHideLoader(false);
          this.toastr.toast.snackbarError("API Error: " + error.error.message);
        }
      );
    } else {
      const postData = {
        id: this.employeeId,
        imageUrl: this.imageUrl,
        status: this.selectedOption
      };
      this.employeeService.editEmployee(postData).subscribe(
        (response: any) => {
          this.toastr.toast.snackbarSuccess("Congratulations on submitting the employee Status successfully");
          this.spinnerService.showHideLoader(false);
          this.employeeService.employeeAttendanceFun(response.empID)
          this.cancel();
        },
        (error: any) => {
          this.selectedOption = ""
          this.employeeId = ""
          this.spinnerService.showHideLoader(false);
          this.toastr.toast.snackbarError("API Error: " + error.error.message);
        }
      );
    }

  }
}


