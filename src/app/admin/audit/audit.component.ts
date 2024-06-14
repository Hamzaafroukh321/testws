import { Component, OnInit } from '@angular/core';
import { AuditService, AuditDTO, PagedResponse } from '../../services/audit.service';

@Component({
  selector: 'app-audit',
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.css']
})
export class AuditComponent implements OnInit {
  audits: AuditDTO[] = [];
  startDate: string = '';
  endDate: string = '';
  page: number = 0;
  size: number = 4;
  totalElements: number = 0;
  totalPages: number = 0;

  constructor(private auditService: AuditService) { }

  ngOnInit(): void {
    const today = new Date().toISOString().slice(0, 10);
    this.startDate = today;
    this.endDate = today;
    this.getAuditsByDateRange();
  }

  getAuditsByDateRange(): void {
    this.auditService.getAuditsByDateRange(this.startDate, this.endDate, this.page, this.size).subscribe(
      (response: PagedResponse<AuditDTO>) => {
        this.audits = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
      },
      error => console.error('Error fetching audits by date range:', error)
    );
  }

  onPageChange(page: number): void {
    this.page = page;
    this.getAuditsByDateRange();
  }

  onSizeChange(size: number): void {
    this.size = size;
    this.page = 0;
    this.getAuditsByDateRange();
  }
}
