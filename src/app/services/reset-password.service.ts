import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResetPasswordService {
  private resetPasswordUrl = 'http://localhost:8080/api/auth/reset-password';

  constructor(private http: HttpClient) { }

  resetPassword(email: string, newPassword: string): Observable<any> {
    const resetPasswordRequest = { email, newPassword };
    return this.http.post(this.resetPasswordUrl, resetPasswordRequest);
  }
}