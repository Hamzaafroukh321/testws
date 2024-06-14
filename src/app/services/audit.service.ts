import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuditDTO {
  action: string;
  description: string;
  timestamp: Date;
  // Ajoutez d'autres propriétés si nécessaire
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  // Ajoutez d'autres propriétés si nécessaire
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private apiUrl = 'http://localhost:8080/api/audits';

  constructor(private http: HttpClient) { }

  getAuditsByDay(date: string, page: number = 0, size: number = 10): Observable<PagedResponse<AuditDTO>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PagedResponse<AuditDTO>>(`${this.apiUrl}/day/${date}`, { params });
  }

  getAuditsByWeek(date: string, page: number = 0, size: number = 10): Observable<PagedResponse<AuditDTO>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PagedResponse<AuditDTO>>(`${this.apiUrl}/week/${date}`, { params });
  }

  getAuditsByMonth(date: string, page: number = 0, size: number = 10): Observable<PagedResponse<AuditDTO>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PagedResponse<AuditDTO>>(`${this.apiUrl}/month/${date}`, { params });
  }

  getAuditsByDateRange(startDate: string, endDate: string, page: number = 0, size: number = 10): Observable<PagedResponse<AuditDTO>> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PagedResponse<AuditDTO>>(`${this.apiUrl}/range`, { params });
  }
}
