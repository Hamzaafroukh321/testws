import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ManageProjetService } from '../../services/manage-projet.service';
import { ManageUsersService } from '../../services/manage-users.service';
import * as XLSX from 'xlsx';

export interface ProjetDTO {
  id?: number;
  nom: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  mode: string;
  status: string;
  chefMatricule: number;
  teamMembersMatricules: number[];
}

@Component({
  selector: 'app-manage-projet',
  templateUrl: './manage-projet.component.html',
  styleUrls: ['./manage-projet.component.css']
})
export class ManageProjetComponent implements OnInit {
  projets: ProjetDTO[] = [];
  matricules: number[] = [];
  filteredChefMatricules: Observable<number[]>;
  filteredTeamMembersMatricules: Observable<number[]>;
  projetForm: FormGroup;
  editForm: FormGroup;
  selectedProjet: ProjetDTO | null = null;
  errorMessage: string = ''; // Propriété pour gérer le message d'erreur
  chefMatriculeErrorMessage: string = '';
  teamMembersErrorMessage: string = '';

  constructor(
    private manageProjetService: ManageProjetService,
    private manageUsersService: ManageUsersService,
    private fb: FormBuilder
  ) {
    this.projetForm = this.fb.group({
      nom: ['', Validators.required],
      description: ['', Validators.required],
      dateDebut: ['', [Validators.required]],
      dateFin: ['', [Validators.required, this.dateValidator]],
      mode: ['', Validators.required],
      status: ['', Validators.required],
      chefMatricule: ['', Validators.required],
      teamMembersMatricules: ['', Validators.required]
    }, { validator: this.dateRangeValidator });

    
    this.editForm = this.fb.group({
      mode: ['', Validators.required],
      status: ['', Validators.required],
      dateFin: ['', [Validators.required, this.dateValidator]],
      chefMatricule: ['', Validators.required],
      teamMembersMatricules: ['', Validators.required]
    }, { validator: this.dateRangeValidator });

    this.filteredChefMatricules = this.projetForm.get('chefMatricule')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterMatricules(value))
    );

    this.filteredTeamMembersMatricules = this.projetForm.get('teamMembersMatricules')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterMatricules(value))
    );
  }

  ngOnInit(): void {
    this.getProjets();
    this.loadMatricules();
  }

  getProjets(): void {
    this.manageProjetService.getAllProjets().subscribe(projets => {
      this.projets = projets;
      console.log('Loaded Projects:', this.projets); // Log des projets chargés
    });
  }

  loadMatricules(): void {
    this.manageUsersService.getAllUsersMatricules().subscribe(matricules => {
      this.matricules = matricules;
      console.log('Loaded Matricules:', this.matricules);  // Log des matricules chargés
    });
  }

  onSubmit(): void {
    if (this.projetForm.valid) {
      const chefMatricule = parseInt(this.projetForm.value.chefMatricule, 10);
      const teamMembersMatricules = this.projetForm.value.teamMembersMatricules.split(',').map((matricule: string) => parseInt(matricule.trim(), 10));

      if (this.checkMatriculesExist(chefMatricule, teamMembersMatricules)) {
        const projet: ProjetDTO = {
          ...this.projetForm.value,
          teamMembersMatricules: teamMembersMatricules
        };
        this.manageProjetService.createProjet(projet).subscribe({
          next: newProjet => {
            this.projets.push(newProjet);
            this.closeModal('add');
            this.errorMessage = ''; // Réinitialise le message d'erreur en cas de succès
          },
          error: err => {
            this.errorMessage = err.error.message || 'Une erreur s\'est produite';
            console.error('Error creating project:', err);  // Log de l'erreur
          }
        });
      } else {
        this.errorMessage = 'Un ou plusieurs matricules sont invalides.';
      }
    }
  }

  onEditSubmit(): void {
    if (this.editForm.valid && this.selectedProjet) {
      const chefMatricule = parseInt(this.editForm.value.chefMatricule, 10);
      const teamMembersMatricules = this.editForm.value.teamMembersMatricules.split(',').map((matricule: string) => parseInt(matricule.trim(), 10));

      if (this.checkMatriculesExist(chefMatricule, teamMembersMatricules)) {
        const updatedProjet: Partial<ProjetDTO> = {
          ...this.editForm.value,
          chefMatricule: chefMatricule,
          teamMembersMatricules: teamMembersMatricules
        };
        if (this.selectedProjet.id !== undefined) {
          this.manageProjetService.updateProjetPartially(this.selectedProjet.id, updatedProjet).subscribe({
            next: updated => {
              const index = this.projets.findIndex(p => p.id === this.selectedProjet!.id);
              if (index !== -1) {
                this.projets[index] = { ...this.projets[index], ...updated };
              }
              this.closeModal('edit');
              this.errorMessage = ''; // Réinitialise le message d'erreur en cas de succès
            },
            error: err => {
              this.errorMessage = err.error.message || 'Une erreur s\'est produite';
              console.error('Error updating project:', err);  // Log de l'erreur
            }
          });
        }
      } else {
        this.errorMessage = 'Un ou plusieurs matricules sont invalides.';
      }
    }
  }

  checkMatriculesExist(chefMatricule: number | null, teamMembersMatricules: number[]): boolean {
    if (chefMatricule !== null && !this.matricules.includes(chefMatricule)) {
      this.chefMatriculeErrorMessage = 'Le matricule du chef de projet est invalide.';
      return false;
    }
    const invalidTeamMembers = teamMembersMatricules.filter(matricule => !this.matricules.includes(matricule));
    if (invalidTeamMembers.length > 0) {
      this.teamMembersErrorMessage = 'Un ou plusieurs matricules de membres de l\'équipe sont invalides.';
      return false;
    }
    this.chefMatriculeErrorMessage = '';
    this.teamMembersErrorMessage = '';
    return true;
  }

  openModal(type: 'add' | 'edit'): void {
    const modal = document.getElementById(`modal-${type}`);
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  closeModal(type: 'add' | 'edit'): void {
    const modal = document.getElementById(`modal-${type}`);
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  editProjet(projet: ProjetDTO): void {
    this.selectedProjet = projet;
    this.editForm.patchValue({
      mode: projet.mode,
      status: projet.status,
      dateFin: projet.dateFin,
      chefMatricule: projet.chefMatricule,
      teamMembersMatricules: projet.teamMembersMatricules.join(', ')
    });
    this.openModal('edit');
  }

  private _filterMatricules(value: string): number[] {
    console.log('Filtering matricules for value:', value);  // Log de la valeur saisie
    if (typeof value !== 'string') {
      console.log('Value is not a string:', value);  // Log si la valeur n'est pas une chaîne de caractères
      return this.matricules;
    }
    const filterValue = value.toLowerCase();
    const filtered = this.matricules.filter(matricule => matricule.toString().includes(filterValue));
    console.log('Filtered matricules:', filtered);  // Log des matricules filtrés
    return filtered;
  }

  dateValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (control.value) {
      const date = new Date(control.value);
      if (date < new Date()) {
        return { 'invalidDate': true };
      }
    }
    return null;
  }

  dateRangeValidator(group: FormGroup): { [key: string]: boolean } | null {
    const dateDebut = group.controls['dateDebut']?.value;
    const dateFin = group.controls['dateFin']?.value;
    if (dateDebut && dateFin && new Date(dateFin) < new Date(dateDebut)) {
      return { 'invalidDateRange': true };
    }
    return null;
  }

  exportToExcel(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.projets.map(projet => ({
      'Nom': projet.nom,
      'Description': projet.description,
      'Date de Début': projet.dateDebut,
      'Date de Fin': projet.dateFin,
      'Mode': projet.mode,
      'Status': projet.status,
      'Chef Matricule': projet.chefMatricule,
      'Membres de l\'équipe': projet.teamMembersMatricules.join(', ')
    })));

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Projets');

    XLSX.writeFile(wb, 'Projets.xlsx');
  }
}