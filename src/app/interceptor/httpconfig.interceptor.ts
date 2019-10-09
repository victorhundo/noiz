import { Injectable } from '@angular/core';
import { ErrordialogService } from 'src/app/services/errordialog.service';
import {
    HttpInterceptor,
    HttpRequest,
    HttpResponse,
    HttpHandler,
    HttpEvent,
    HttpErrorResponse
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
    constructor(
        public errorDialogService: ErrordialogService,
        private authService: AuthService,
        private router: Router) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token: any = `${this.authService.getToken()}`;
        if (!(token === null) && !(token === 'null')) {
            request = request.clone({ headers: request.headers.set('Authorization', token) });
        }

        if (!request.headers.has('Content-Type')) {
            request = request.clone({ headers: request.headers.set('Content-Type', 'application/json') });
        }

        request = request.clone({ headers: request.headers.set('Accept', 'application/json; charset=utf-8') });


        return next.handle(request).pipe(
            map((event: HttpEvent<any>) => {
                return event;
            }),
            catchError((error: HttpErrorResponse) => {
                const data: any = {
                    reason: error.error.message,
                    status: error.status
                };
                if (data.reason === 'User not logged in to the system.') {
                    this.router.navigate(['login']);
                } else {
                    this.errorDialogService.openDialog(data);
                }
                return throwError(error);
            }));
    }
}
