import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface BacklogDTO {
  id?: number;
  titre: string;
  description: string;
  etat: string;
  projetId: number;
}

export interface UserStoryDTO {
  id?: number;
  description: string;
  priority: string;
  backlogId: number;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class BacklogUserStoryService {
  private backlogApiUrl = 'http://localhost:8080/api/backlogs';
  private userStoryApiUrl = 'http://localhost:8080/api/userstories';

  constructor(private http: HttpClient) { }

  getAllBacklogs(page: number = 0, size: number = 10): Observable<Page<BacklogDTO>> {
    return this.http.get<Page<BacklogDTO>>(`${this.backlogApiUrl}?page=${page}&size=${size}`);
  }

  getBacklogsByProjectId(projectId: number, page: number = 0, size: number = 10): Observable<Page<BacklogDTO>> {
    return this.http.get<Page<BacklogDTO>>(`${this.backlogApiUrl}/project/${projectId}?page=${page}&size=${size}`)
      .pipe(
        map(response => {
          console.log('Response from getBacklogsByProjectId:', response);
          return response;
        })
      );
  }

  getBacklogById(id: number): Observable<BacklogDTO> {
    return this.http.get<BacklogDTO>(`${this.backlogApiUrl}/${id}`);
  }

  createBacklog(backlog: BacklogDTO): Observable<BacklogDTO> {
    return this.http.post<BacklogDTO>(this.backlogApiUrl, backlog, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  updateBacklog(id: number, backlog: BacklogDTO): Observable<BacklogDTO> {
    return this.http.put<BacklogDTO>(`${this.backlogApiUrl}/${id}`, backlog, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  deleteBacklog(id: number): Observable<void> {
    return this.http.delete<void>(`${this.backlogApiUrl}/${id}`);
  }

  getAllUserStories(): Observable<UserStoryDTO[]> {
    return this.http.get<UserStoryDTO[]>(this.userStoryApiUrl);
  }

  getUserStoryById(id: number): Observable<UserStoryDTO> {
    return this.http.get<UserStoryDTO>(`${this.userStoryApiUrl}/${id}`);
  }

  createUserStory(userStory: UserStoryDTO): Observable<UserStoryDTO> {
    return this.http.post<UserStoryDTO>(this.userStoryApiUrl, userStory, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  updateUserStory(id: number, userStory: UserStoryDTO): Observable<UserStoryDTO> {
    return this.http.put<UserStoryDTO>(`${this.userStoryApiUrl}/${id}`, userStory, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  deleteUserStory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.userStoryApiUrl}/${id}`);
  }

  getUserStoriesByBacklogId(backlogId: number, page: number = 0, size: number = 10): Observable<Page<UserStoryDTO>> {
    return this.http.get<Page<UserStoryDTO>>(`${this.userStoryApiUrl}/backlog/${backlogId}?page=${page}&size=${size}`);
  }
}
