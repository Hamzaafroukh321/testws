import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CongeDTO {
  id?: number;
  dateDebut: string;
  dateFin: string;
  status: string;
  remplacantMatricule: number;
  requestedByMatricule: number;
  approvedOrRejectedByMatricule?: number;
  motif: string;
}

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

export interface Page<T> {
  content: T[];
  pageable: {
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

@Injectable({
  providedIn: 'root'
})
@Injectable({
  providedIn: 'root'
})
export class ManageCongeesService {
  private apiUrl = `http://localhost:8080/api/congees`;
  private userApiUrl = 'http://localhost:8080/users/matricules';

  constructor(private http: HttpClient) {}

  approveCongees(id: number, approverMatricule: number): Observable<CongeDTO> {
    const params = new HttpParams().set('approverMatricule', approverMatricule.toString());
    return this.http.post<CongeDTO>(`${this.apiUrl}/${id}/approve`, {}, { params });
  }

  rejectCongees(id: number, approverMatricule: number, motif: string): Observable<CongeDTO> {
    const params = new HttpParams().set('approverMatricule', approverMatricule.toString()).set('motif', motif);
    return this.http.post<CongeDTO>(`${this.apiUrl}/${id}/reject`, {}, { params });
  }

  getAllCongees(page: number, size: number, sort: string[]): Observable<Page<CongeDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort.join(','));
    return this.http.get<Page<CongeDTO>>(this.apiUrl, { params });
  }

  getCongeesById(id: number): Observable<CongeDTO> {
    return this.http.get<CongeDTO>(`${this.apiUrl}/${id}`);
  }

  getCongeesByMatricule(matricule: number): Observable<CongeDTO[]> {
    return this.http.get<CongeDTO[]>(`${this.apiUrl}/user/${matricule}`);
  }

  getCongeesByRequestedByMatricule(matricule: number): Observable<CongeDTO[]> {
    return this.http.get<CongeDTO[]>(`${this.apiUrl}/requestedBy/${matricule}`);
  }

  createCongees(congeDTO: CongeDTO): Observable<CongeDTO> {
    return this.http.post<CongeDTO>(`${this.apiUrl}`, congeDTO);
  }

  updateCongees(id: number, congeDTO: CongeDTO): Observable<CongeDTO> {
    return this.http.put<CongeDTO>(`${this.apiUrl}/${id}`, congeDTO);
  }

  deleteCongees(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getUserMatricules(): Observable<number[]> {
    return this.http.get<number[]>(this.userApiUrl);
  }
}
