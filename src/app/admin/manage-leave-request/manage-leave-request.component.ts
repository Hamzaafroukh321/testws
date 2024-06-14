import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ManageCongeesService, CongeDTO, Page } from '../../services/managecongees.service';

@Component({
  selector: 'app-manage-leave-request',
  templateUrl: './manage-leave-request.component.html',
  styleUrls: ['./manage-leave-request.component.css']
})
export class ManageLeaveRequestComponent implements OnInit {

  congeesPage: Page<CongeDTO> = {
    content: [],
    pageable: {
      sort: { sorted: false, unsorted: true, empty: true },
      pageNumber: 0,
      pageSize: 0,
      offset: 0,
      paged: false,
      unpaged: true
    },
    totalPages: 0,
    totalElements: 0,
    last: true,
    size: 0,
    number: 0,
    sort: { sorted: false, unsorted: true, empty: true },
    first: true,
    numberOfElements: 0,
    empty: true
  };
  currentPage = 0;
  pageSize = 10;
  sort = ['id', 'desc'];
  searchMatricule!: number;
  congees: CongeDTO[] = [];
  rejectForm!: FormGroup;
  errorMessage: string = '';
  remplacantMatriculeErrorMessage: string = '';
  filteredRemplacantMatricules!: Observable<number[]>;
  rejectCongeId?: number;

  constructor(private congeesService: ManageCongeesService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.loadCongees();
    this.rejectForm = this.fb.group({
      motif: ['', [Validators.required]]
    });

    this.filteredRemplacantMatricules = this.rejectForm.get('motif')!.valueChanges
      .pipe(
        startWith(''),
        map(value => this.filterMatricules(value))
      );
  }

  loadCongees(): void {
    this.congeesService.getAllCongees(this.currentPage, this.pageSize, this.sort)
      .subscribe(data => {
        this.congeesPage = data;
        this.congees = data.content.reverse(); // Renverser l'ordre pour afficher le dernier en premier
      });
  }

  searchByMatricule(): void {
    if (this.searchMatricule && !isNaN(this.searchMatricule)) {
      this.congeesService.getCongeesByRequestedByMatricule(this.searchMatricule)
        .subscribe(data => {
          this.congees = data.reverse();
        });
    } else {
      this.loadCongees();
    }
  }

  approveCongees(id?: number): void {
    if (id !== undefined) {
      const approverMatricule = this.getLoggedUserMatricule();
      this.congeesService.approveCongees(id, approverMatricule)
        .subscribe(() => {
          this.updateCongeStatus(id, 'APPROVED', approverMatricule);
        });
    }
  }

  openRejectModal(id?: number): void {
    if (id !== undefined) {
      this.rejectCongeId = id;
      document.getElementById('modal-reject')?.classList.remove('hidden');
    }
  }

  closeRejectModal(): void {
    this.rejectCongeId = undefined;
    document.getElementById('modal-reject')?.classList.add('hidden');
  }

  onRejectSubmit(): void {
    if (this.rejectForm.valid && this.rejectCongeId !== undefined) {
      const approverMatricule = this.getLoggedUserMatricule();
      const motif = this.rejectForm.value.motif;
      this.congeesService.rejectCongees(this.rejectCongeId!, approverMatricule, motif)
        .subscribe(() => {
          this.updateCongeStatus(this.rejectCongeId!, 'REJECTED', approverMatricule);
          this.closeRejectModal();
        });
    }
  }

  updateCongeStatus(id: number, status: string, approverMatricule: number): void {
    const conge = this.congees.find(c => c.id === id);
    if (conge) {
      conge.status = status;
      conge.approvedOrRejectedByMatricule = approverMatricule;
    }
  }

  setPage(page: number): void {
    this.currentPage = page;
    this.loadCongees();
  }

  setPageSize(size: number): void {
    this.pageSize = size;
    this.loadCongees();
  }

  setSort(sort: string[]): void {
    this.sort = sort;
    this.loadCongees();
  }

  getLoggedUserMatricule(): number {
    const matricule = localStorage.getItem('matricule'); // Utiliser "matricule" au lieu de "userMatricule"
    if (matricule) {
      return Number(matricule);
    }
    throw new Error("Matricule de l'utilisateur non trouvé dans le localStorage");
  }

  filterMatricules(value: string): number[] {
    // Implémentez votre logique de filtrage ici
    return [];
  }

  getDateForDisplay(dateString: string): Date {
    return new Date(dateString);
  }
}
