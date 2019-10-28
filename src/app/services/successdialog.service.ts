import { Injectable } from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SuccessdialogService {

  constructor(public dialog: MatSnackBar) { }

  public open(message: any, action?: any) {
    this.dialog.open(message, action, {
      duration: 3000,
      panelClass: ['green-snackbar']
    });
  }
}
