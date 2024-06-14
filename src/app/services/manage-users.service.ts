import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface UserDTO {
  matricule: number;
  nom: string;
  prenom: string;
  departement: string;
  emailpersonnel: string;
  roles: string[];
  email: string;
  tel: string;
}

@Injectable({
  providedIn: 'root'
})
export class ManageUsersService {
  private apiUrl = 'http://localhost:8080/users';

  constructor(private http: HttpClient) { }

  createUser(userDTO: UserDTO): Observable<UserDTO> {
    return this.http.post<UserDTO>(`${this.apiUrl}`, userDTO);
  }

  getUserByMatricule(matricule: number): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.apiUrl}/${matricule}`);
  }

  updateUser(matricule: number, userDTO: UserDTO): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.apiUrl}/${matricule}`, userDTO);
  }

  deleteUserByMatricule(matricule: number): Observable<void> {
    const url = `${this.apiUrl}/${matricule}`;
    console.log('Deleting user with matricule:', matricule);
    console.log('Delete URL:', url);
    return this.http.delete<void>(url);
  }

  saveAndFlushUser(userDTO: UserDTO): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.apiUrl}`, userDTO);
  }

  getAllUsers(): Observable<UserDTO[]> {
    return this.http.get<any>(`${this.apiUrl}`).pipe(
      map(response => response.content as UserDTO[])
    );
  }

  searchUsers(nom: string | null, prenom: string | null, matricule: number | null, page: number, size: number): Observable<any> {
    let params = new HttpParams();

    if (nom !== null && nom !== '') {
      params = params.set('nom', nom);
    }

    if (prenom !== null && prenom !== '') {
      params = params.set('prenom', prenom);
    }

    if (matricule !== null) {
      console.log('Valeur de matricule :', matricule);
      params = params.set('matricule', matricule.toString());
    }

    params = params.set('page', (page - 1).toString());
    params = params.set('size', size.toString());

    const url = `${this.apiUrl}/search?${params.toString()}`;
    console.log('URL de la requête :', url);

    return this.http.get<any>(url, { observe: 'response' });
  }

  getUsersPage(page: number, size: number): Observable<any> {
    const url = `${this.apiUrl}?page=${page - 1}&size=${size}`;
    return this.http.get<any>(url);
  }

  getTotalUsers(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }

  getAllUsersMatricules(): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/matricules`);
  }

  getAllUsersByRoleName(roleName: string): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.apiUrl}/roles/${roleName}`);
  }
}
