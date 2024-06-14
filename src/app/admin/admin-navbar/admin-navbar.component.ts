import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-navbar',
  templateUrl: './admin-navbar.component.html',
  styleUrls: ['./admin-navbar.component.css']
})
export class AdminNavbarComponent implements OnInit {
  nom: string = '';
  prenom: string = '';
  role: string = '';
  dropdownVisible: boolean = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.loadUserDetails();
  }

  loadUserDetails(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.nom = user.nom;
      this.prenom = user.email; // Assuming email is used as the prenom (first name)
      this.role = user.roles[0]; // Assuming roles is an array and we take the first role
    }
  }

  toggleDropdown(): void {
    this.dropdownVisible = !this.dropdownVisible;
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
}
