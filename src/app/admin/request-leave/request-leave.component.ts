// request-leave.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ManageCongeesService, CongeDTO } from '../../services/managecongees.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-request-leave',
  templateUrl: './request-leave.component.html',
  styleUrls: ['./request-leave.component.css'],
  providers: [DatePipe]
})
export class RequestLeaveComponent implements OnInit {
  congees: CongeDTO[] = [];
  matricules: number[] = [];
  filteredRemplacantMatricules: Observable<number[]>;
  leaveForm: FormGroup;
  selectedConge: CongeDTO | null = null;
  errorMessage: string = ''; 
  remplacantMatriculeErrorMessage: string = '';
  currentUserMatricule: number | null;

  constructor(
    private manageCongeesService: ManageCongeesService,
    private fb: FormBuilder,
    private datePipe: DatePipe
  ) {
    this.currentUserMatricule = parseInt(localStorage.getItem('matricule') || '0', 10);

    this.leaveForm = this.fb.group({
      startDate: ['', [Validators.required, this.dateValidator]],
      endDate: ['', [Validators.required, this.dateValidator]],
      remplacantMatricule: ['', Validators.required]
    }, { validator: this.dateRangeValidator });

    this.filteredRemplacantMatricules = this.leaveForm.get('remplacantMatricule')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterMatricules(value))
    );
  }

  ngOnInit(): void {
    this.getCongees();
    this.loadMatricules();
  }

  getCongees(): void {
    if (this.currentUserMatricule) {
      this.manageCongeesService.getCongeesByMatricule(this.currentUserMatricule).subscribe(congees => {
        this.congees = congees;
      });
    } else {
      this.errorMessage = "Matricule utilisateur non trouvé dans le local storage.";
    }
  }

  loadMatricules(): void {
    this.manageCongeesService.getUserMatricules().subscribe(matricules => {
      this.matricules = matricules;
    });
  }

  onSubmit(): void {
    if (this.leaveForm.valid) {
      const remplacantMatricule = parseInt(this.leaveForm.value.remplacantMatricule, 10);

      if (this.checkMatriculesExist(remplacantMatricule)) {
        const conge: CongeDTO = {
          ...this.leaveForm.value,
          dateDebut: this.datePipe.transform(this.leaveForm.value.startDate, 'yyyy-MM-dd')!,
          dateFin: this.datePipe.transform(this.leaveForm.value.endDate, 'yyyy-MM-dd')!,
          status: 'PENDING',
          requestedByMatricule: this.currentUserMatricule!,
          remplacantMatricule: remplacantMatricule
        };
        this.manageCongeesService.createCongees(conge).subscribe({
          next: newConge => {
            this.congees.push(newConge);
            this.closeModal();
            this.errorMessage = '';
          },
          error: err => {
            this.errorMessage = err.error.message || 'Une erreur s\'est produite';
          }
        });
      } else {
        this.errorMessage = 'Le matricule du remplaçant est invalide.';
      }
    }
  }

  checkMatriculesExist(remplacantMatricule: number): boolean {
    if (!this.matricules.includes(remplacantMatricule)) {
      this.remplacantMatriculeErrorMessage = 'Le matricule du remplaçant est invalide.';
      return false;
    }
    this.remplacantMatriculeErrorMessage = '';
    return true;
  }

  openModal(): void {
    const modal = document.getElementById('modal-add');
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  closeModal(): void {
    const modal = document.getElementById('modal-add');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  private _filterMatricules(value: string): number[] {
    const filterValue = value.toLowerCase();
    return this.matricules.filter(matricule => matricule.toString().includes(filterValue));
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

  getDateForDisplay(date: string): Date | null {
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  }
  

  dateRangeValidator(group: FormGroup): { [key: string]: boolean } | null {
    const startDate = group.controls['startDate']?.value;
    const endDate = group.controls['endDate']?.value;
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      return { 'invalidDateRange': true };
    }
    return null;
  }
}
