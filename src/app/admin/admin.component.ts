import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  nom: string = '';
  prenom: string = '';
  role: string = '';
  matricule: number = 0;
  dropdownVisible: boolean = false;
  isModalOpen: boolean = false;
  notifications: any[] = [];
  hasNewNotification: boolean = false;

  constructor(private router: Router, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.loadUserDetails();
    this.subscribeToNotifications();
  }

  loadUserDetails(): void {
    const nom = localStorage.getItem('nom');
    const prenom = localStorage.getItem('prenom');
    const roles = localStorage.getItem('roles');
    const matricule = localStorage.getItem('matricule');

    if (nom && prenom && roles && matricule) {
      this.nom = nom;
      this.prenom = prenom;
      this.role = JSON.parse(roles)[0];
      this.matricule = parseInt(matricule, 10);
    }
  }

  subscribeToNotifications(): void {
    if (this.matricule) {
      this.notificationService.getNotifications(this.matricule).subscribe(
        notification => {
          this.notifications.push(notification);
          this.hasNewNotification = true;
        },
        error => {
          console.error('SSE error:', error);
        }
      );
    }
  }

  toggleDropdown(): void {
    this.dropdownVisible = !this.dropdownVisible;
    if (this.dropdownVisible) {
      this.hasNewNotification = false;
    }
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('#dropdown-user') && !target.closest('button[aria-expanded="false"]')) {
      this.dropdownVisible = false;
    }
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  toggleNotificationDropdown(): void {
    this.dropdownVisible = !this.dropdownVisible;
    if (this.dropdownVisible) {
      this.hasNewNotification = false;
    }
  }
}
