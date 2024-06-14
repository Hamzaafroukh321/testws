// admin-sidebar.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ManageProjetService, ProjetDTO } from '../../services/manage-projet.service';

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css']
})
export class AdminSidebarComponent implements OnInit {
  permissions: string[] = [];
  projects: ProjetDTO[] = [];

  constructor(private authService: AuthService, private projectService: ManageProjetService) {}

  ngOnInit(): void {
    this.permissions = this.authService.getUserPermissions();
    if (this.canViewProjects()) {
      const chefMatricule = this.authService.getUserMatricule();
      if (chefMatricule) {
        this.projectService.getProjectsByChefMatricule(chefMatricule).subscribe(
          (projects) => {
            // Filter out projects with a status of "terminé"
            this.projects = projects.filter(project => project.status.toLowerCase() !== 'terminé');
          },
          (error) => {
            console.error('Error fetching projects', error);
          }
        );
      }
    }
  }

  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  canViewProjects(): boolean {
    return this.hasPermission('VIEW_PROJECT');
  }
}
