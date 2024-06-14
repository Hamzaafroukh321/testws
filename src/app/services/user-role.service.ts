// user-role.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserRoleService {
  private apiUrl = 'http://localhost:8080/api/user-roles';

  constructor(private http: HttpClient) { }

  getUserRoles(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getUserRoleByName(name: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${name}`);
  }

  updateUserRolePermissions(name: string, permissionNames: string[]): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${name}/permissions`, permissionNames);
  }

  
}