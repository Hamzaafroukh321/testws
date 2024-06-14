import { Component, OnInit } from '@angular/core';
import { ManageUsersService, UserDTO } from '../../services/manage-users.service';
import { Modal } from 'flowbite';
import { catchError, of } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit {
  selectedUser: UserDTO | null = null;
  updateModal: Modal | null = null;
  deleteModal: Modal | null = null;
  createModal: Modal | null = null;

  availableRoles: string[] = ['ADMIN', 'MANAGER', 'PROJECT_MANAGER', 'TEAM_MEMBER'];

  users: UserDTO[] = [];
  filteredUsers: UserDTO[] = [];

  searchTerm: string = '';
  currentPage: number = 1;
  pageSize: number = 4;
  totalUsers: number = 0;
  totalPages: number = 0;
  pages: number[] = [];

  newUser: UserDTO = {
    matricule: 0,
    nom: '',
    prenom: '',
    departement: '',
    emailpersonnel: '',
    roles: [],
    email: '',
    tel: ''
  };

  searchNom: string = '';
  searchPrenom: string = '';
  searchMatricule: number | null = null;

  userForm!: FormGroup;
  showRolesDropdown: boolean = false;
  dropdownStates: { [key: number]: boolean } = {}; // New property for managing dropdown states

  constructor(private manageUsersService: ManageUsersService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.loadUsers();
    this.getTotalUsers();
    this.initModals();

    this.userForm = this.fb.group({
      nom: ['', [Validators.required]],
      prenom: ['', [Validators.required]],
      departement: ['', [Validators.required]],
      emailpersonnel: ['', [Validators.required, Validators.email]],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@dxc\.com$/)]],
      tel: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      roles: [[], [Validators.required]]
    });
  }

  initModals(): void {
    const updateModalElement = document.getElementById('updateModal');
    if (updateModalElement) {
      this.updateModal = new Modal(updateModalElement);
    }

    const deleteModalElement = document.getElementById('deleteModal');
    if (deleteModalElement) {
      this.deleteModal = new Modal(deleteModalElement);
    } else {
      console.error('Delete modal element not found');
    }

    const createModalElement = document.getElementById('createModal');
    if (createModalElement) {
      this.createModal = new Modal(createModalElement);
    }
  }

  toggleRolesDropdown(): void {
    this.showRolesDropdown = !this.showRolesDropdown;
  }

  toggleDropdown(matricule: number): void {
    this.dropdownStates[matricule] = !this.dropdownStates[matricule];
  }

  onRoleChange(event: any): void {
    const role = event.target.value;
    if (event.target.checked) {
      this.newUser.roles.push(role);
    } else {
      const index = this.newUser.roles.indexOf(role);
      if (index !== -1) {
        this.newUser.roles.splice(index, 1);
      }
    }
    this.userForm.controls['roles'].setValue(this.newUser.roles);
  }

  loadUsers(): void {
    this.manageUsersService.getUsersPage(this.currentPage, this.pageSize).pipe(
      catchError(error => {
        console.error('Error loading users:', error);
        return of({ content: [] });
      })
    ).subscribe(response => {
      this.users = response.content;
      this.filteredUsers = response.content;
    });
  }

  getTotalUsers(): void {
    this.manageUsersService.getTotalUsers().subscribe(
      totalUsers => {
        this.totalUsers = totalUsers;
        this.totalPages = Math.ceil(totalUsers / this.pageSize);
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
      },
      error => console.error('Error getting total users:', error)
    );
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  openCreateModal(): void {
    this.resetNewUser();
    if (this.createModal) {
      this.createModal.show();
    }
  }

  closeCreateModal(): void {
    if (this.createModal) {
      this.createModal.hide();
    }
    this.resetNewUser();
  }

  getRoleNames(roles: string[]): string {
    return roles ? roles.join(', ') : '';
  }

  createUser(): void {
    console.log('Attempting to create user with form values:', this.userForm.value);
    
    if (this.userForm.valid) {
        console.log('Form is valid. Proceeding with user creation.');
        
        this.manageUsersService.createUser(this.userForm.value).subscribe(
            createdUser => {
                console.log('User successfully created:', createdUser);
                
                this.users.push(createdUser);
                this.filteredUsers.push(createdUser);
                
                console.log('User added to users and filteredUsers arrays.');
                
                this.closeCreateModal();
                console.log('Create modal closed.');
                
                this.getTotalUsers();
                console.log('Total users reloaded.');
            },
            error => {
                console.error('Error creating user:', error);
                console.log('Error details:', error.message, error.status);
            }
        );
    } else {
        console.warn('Form is invalid. User creation aborted.');
        const invalidFields = Object.keys(this.userForm.controls).filter(field => this.userForm.controls[field].invalid);
        console.log('Invalid fields:', invalidFields);
    }
  }

  openUpdateModal(user: UserDTO): void {
    this.selectedUser = { ...user };
    const { matricule, ...userWithoutMatricule } = user;
    this.userForm.patchValue(userWithoutMatricule);
    if (this.updateModal) {
      this.updateModal.show();
    }
  }

  closeUpdateModal(): void {
    if (this.updateModal) {
      this.updateModal.hide();
    }
    this.selectedUser = null;
  }

  updateUser(): void {
    console.log('updateUser() called'); // Log initial
  
    if (this.userForm.valid && this.selectedUser) {
      console.log('Form is valid and selectedUser is set');
      console.log('Selected User:', this.selectedUser); // Log du user sélectionné
      console.log('Form Value:', this.userForm.value); // Log des valeurs du formulaire
  
      this.manageUsersService.updateUser(this.selectedUser.matricule, this.userForm.value).subscribe(
        updatedUser => {
          console.log('User updated successfully:', updatedUser); // Log de la réponse réussie
  
          const index = this.users.findIndex(user => user.matricule === updatedUser.matricule);
          if (index !== -1) {
            console.log('Updating user in users array at index:', index); // Log de l'index trouvé
            this.users[index] = updatedUser;
            this.filteredUsers[index] = updatedUser;
          } else {
            console.log('User not found in users array'); // Log si l'utilisateur n'est pas trouvé
          }
  
          this.closeUpdateModal();
        },
        error => {
          console.error('Error updating user:', error); // Log de l'erreur
        }
      );
    } else {
      if (!this.userForm.valid) {
        console.log('Form is invalid'); // Log si le formulaire n'est pas valide
      }
      if (!this.selectedUser) {
        console.log('No user selected'); // Log si aucun utilisateur n'est sélectionné
      }
    }
  }

  openDeleteModal(user: UserDTO): void {
    this.selectedUser = user;
    if (this.deleteModal) {
      this.deleteModal.show();
    } else {
      console.error('Delete modal not initialized');
    }
  }

  closeDeleteModal(): void {
    if (this.deleteModal) {
      this.deleteModal.hide();
    }
    this.selectedUser = null;
  }

  deleteUser(): void {
    if (this.selectedUser) {
      this.manageUsersService.deleteUserByMatricule(this.selectedUser.matricule).subscribe(
        () => {
          const index = this.users.findIndex(user => user.matricule === this.selectedUser?.matricule);
          if (index !== -1) {
            this.users.splice(index, 1);
            this.filteredUsers.splice(index, 1);
          }
          this.closeDeleteModal();
          this.getTotalUsers();
        },
        error => {
          console.error('Error deleting user:', error);
        }
      );
    } else {
      console.error('No user selected for deletion');
    }
  }

  resetNewUser(): void {
    this.newUser = {
      matricule: 0,
      nom: '',
      prenom: '',
      departement: '',
      emailpersonnel: '',
      roles: [],
      email: '',
      tel: ''
    };
    this.userForm.reset();
  }

  searchUsers(): void {
    const searchTerm = this.searchTerm.trim();
    let nom: string | null = null;
    let prenom: string | null = null;
    let matricule: number | null = null;

    if (this.isNumeric(searchTerm)) {
      matricule = parseInt(searchTerm, 10);
    } else {
      const nameParts = searchTerm.split(' ');
      if (nameParts.length === 1) {
        nom = searchTerm;
        prenom = null;
      } else {
        nom = nameParts[0];
        prenom = nameParts[1];
      }
    }

    this.manageUsersService.searchUsers(nom, prenom, matricule, this.currentPage, this.pageSize)
      .subscribe(
        (response: HttpResponse<any>) => {
          this.filteredUsers = response.body.content;
          this.totalUsers = response.body.totalElements;
          this.totalPages = response.body.totalPages;
          this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        },
        error => {
          console.error('Error during search:', error);
        }
      );
  }

  isNumeric(value: string): boolean {
    return /^\d+$/.test(value);
  }
}
