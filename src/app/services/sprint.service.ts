// src/app/services/sprint.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from './task.service';

export interface Sprint {
  id: number;
  nom: string;
  dateDebut: string;
  dateFin: string;
  projetId: number;
  tasks: Task[];
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
export class SprintService {
  private baseUrl = 'http://localhost:8080/api/sprints';

  constructor(private http: HttpClient) {}

  getAllSprints(): Observable<Sprint[]> {
    return this.http.get<Sprint[]>(`${this.baseUrl}`);
  }

  getSprintById(id: number): Observable<Sprint> {
    return this.http.get<Sprint>(`${this.baseUrl}/${id}`);
  }

  createSprint(sprint: Sprint): Observable<Sprint> {
    return this.http.post<Sprint>(this.baseUrl, sprint);
  }

  updateSprint(id: number, sprint: Sprint): Observable<Sprint> {
    return this.http.put<Sprint>(`${this.baseUrl}/${id}`, sprint);
  }

  deleteSprint(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getSprintsByProjetId(projetId: number, page: number, size: number): Observable<Page<Sprint>> {
    return this.http.get<Page<Sprint>>(`${this.baseUrl}/project/${projetId}?page=${page}&size=${size}`);
  }
}
