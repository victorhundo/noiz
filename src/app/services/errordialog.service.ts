import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import {Component} from '@angular/core';
import { ErrorDialogComponent } from '../components/error-dialog/error-dialog.component';
// import { ErrorDialogComponent } from 'src/app/components/error-dialog/error-dialog.component';


@Injectable({
  providedIn: 'root'
})

export class ErrordialogService {

  public isDialogOpen = false;
    constructor(public dialog: MatDialog) { }
    public openDialog(dataDialog: any) {
        if (this.isDialogOpen) {
            return false;
        }
        this.isDialogOpen = true;
        const dialogRef = this.dialog.open(ErrorDialogComponent, {
            width: '400px',
            data: dataDialog
        });

        dialogRef.afterClosed().subscribe(result => {
            this.isDialogOpen = false;
        });
    }
}
