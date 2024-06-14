import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loginUrl = 'http://localhost:8080/api/auth/login';
  private tokenKey = 'token';

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(this.loginUrl, { email, password }).pipe(
      tap(response => {
        localStorage.setItem(this.tokenKey, response.token);
        localStorage.setItem('permissions', JSON.stringify(response.permissions));
        localStorage.setItem('roles', JSON.stringify(response.roles));
        localStorage.setItem('matricule', response.matricule);
        localStorage.setItem('nom', response.nom);
        localStorage.setItem('prenom', response.prenom);
      })
    );
  }

  getUserRoles(): string[] {
    return JSON.parse(localStorage.getItem('roles') || '[]');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  getUserPermissions(): string[] {
    return JSON.parse(localStorage.getItem('permissions') || '[]');
  }

  getUserMatricule(): number {
    const matricule = localStorage.getItem('matricule');
    return matricule ? +matricule : 0;
  }
}
