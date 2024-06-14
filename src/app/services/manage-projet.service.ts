import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProjetDTO {
  id?: number;
  nom: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  mode: string;
  status: string;
  chefMatricule: number; // Change to string
  teamMembersMatricules: number[]; // Change to string array
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

export interface TaskDTO {
  id: number;
  description: string;
  status: string;
  sprintId: number;
  assignedToMatricule: number;
}

@Injectable({
  providedIn: 'root'
})
export class ManageProjetService {
  private apiUrl = 'http://localhost:8080/api/projets';
  private userApiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) { }

  getAllProjets(): Observable<ProjetDTO[]> {
    return this.http.get<ProjetDTO[]>(this.apiUrl);
  }

  getProjetById(id: number): Observable<ProjetDTO> {
    return this.http.get<ProjetDTO>(`${this.apiUrl}/${id}`);
  }

  createProjet(projet: ProjetDTO): Observable<ProjetDTO> {
    return this.http.put<ProjetDTO>(this.apiUrl, projet, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  updateProjetPartially(id: number, updates: Partial<ProjetDTO>): Observable<ProjetDTO> {
    console.log('Sending PUT request to update project:', updates); // Log pour vérifier l'envoi de la requête
    return this.http.put<ProjetDTO>(`${this.apiUrl}/${id}/partial`, updates, {
      
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  getAllUsers(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(this.userApiUrl);
  }
  
  getProjectsByChefMatricule(chefMatricule: number): Observable<ProjetDTO[]> {
    return this.http.get<ProjetDTO[]>(`${this.apiUrl}/chef/${chefMatricule}`);
  }

  getTeamMembersByProjetId(projetId: number): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.apiUrl}/${projetId}/team-members`);
  }

  getTasksByProjetId(projetId: number): Observable<TaskDTO[]> {
    return this.http.get<TaskDTO[]>(`${this.apiUrl}/${projetId}/tasks`);
  }
}
