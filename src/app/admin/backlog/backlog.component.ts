import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BacklogUserStoryService, BacklogDTO, UserStoryDTO, Page } from '../../services/backlog-userstory.service';
import { ChangeDetectorRef } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-backlog',
  templateUrl: './backlog.component.html',
  styleUrls: ['./backlog.component.css']
})
export class BacklogComponent implements OnInit {
  backlogs: BacklogDTO[] = [];
  userStories: UserStoryDTO[] = [];
  selectedBacklog: BacklogDTO | null = null;
  backlogForm: FormGroup;
  userStoryForm: FormGroup;
  isModalOpen = false;
  modalTitle = 'Add Backlog';
  projectId: number;
  page: number = 0;
  size: number = 10;
  totalElements: number = 0;
  showUserStories: boolean = false;
  isUserStoryModalOpen: boolean = false; // State for User Story modal

  constructor(
    private backlogUserStoryService: BacklogUserStoryService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef
  ) {
    this.projectId = +this.route.snapshot.paramMap.get('id')!;

    this.backlogForm = this.fb.group({
      id: [null],
      titre: ['', Validators.required],
      description: ['', Validators.required],
      etat: ['', Validators.required],
      projetId: [this.projectId, Validators.required]
    });

    this.userStoryForm = this.fb.group({
      id: [null],
      description: ['', Validators.required],
      priority: ['', Validators.required],
      backlogId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadBacklogs();
  }

  loadBacklogs() {
    this.backlogUserStoryService.getBacklogsByProjectId(this.projectId, this.page, this.size).subscribe(
      (data: Page<BacklogDTO>) => {
        console.log('Full response:', data);
        this.backlogs = data.content;
        this.totalElements = data.totalElements;
        this.cd.detectChanges();
      },
      (error) => {
        console.error('Error loading backlogs', error);
      }
    );
  }

  loadUserStories(backlogId: number) {
    this.backlogUserStoryService.getUserStoriesByBacklogId(backlogId, this.page, this.size).subscribe(
      (data: Page<UserStoryDTO>) => {
        this.userStories = data.content;
        this.cd.detectChanges();
      },
      (error) => {
        console.error('Error loading user stories', error);
      }
    );
  }

  selectBacklog(backlog: BacklogDTO) {
    if (this.selectedBacklog && this.selectedBacklog.id === backlog.id) {
      this.showUserStories = !this.showUserStories;
    } else {
      this.selectedBacklog = backlog;
      this.showUserStories = true;
      this.loadUserStories(backlog.id!);
    }
    this.backlogForm.patchValue(backlog);
  }

  openModal() {
    this.isModalOpen = true;
    this.modalTitle = 'Add Backlog';
    this.backlogForm.reset();
    this.backlogForm.patchValue({ projetId: this.projectId });
  }

  closeModal() {
    this.isModalOpen = false;
  }

  openUserStoryModal() {
    this.isUserStoryModalOpen = true;
    this.userStoryForm.reset();
    this.userStoryForm.patchValue({ backlogId: this.selectedBacklog?.id });
  }

  closeUserStoryModal() {
    this.isUserStoryModalOpen = false;
  }

  saveBacklog() {
    const backlog = this.backlogForm.value;
    backlog.projetId = this.projectId;

    if (backlog.id) {
      this.backlogUserStoryService.updateBacklog(backlog.id, backlog).subscribe(
        (updatedBacklog) => {
          this.loadBacklogs();
          this.closeModal();
        },
        (error) => {
          console.error('Error updating backlog', error);
        }
      );
    } else {
      this.backlogUserStoryService.createBacklog(backlog).subscribe(
        (newBacklog) => {
          this.loadBacklogs();
          this.closeModal();
        },
        (error) => {
          console.error('Error creating backlog', error);
        }
      );
    }
  }

  editBacklog(backlog: BacklogDTO) {
    this.isModalOpen = true;
    this.modalTitle = 'Edit Backlog';
    this.backlogForm.patchValue(backlog);
  }

  saveUserStory() {
    const userStory = this.userStoryForm.value;
    userStory.backlogId = this.selectedBacklog?.id;

    if (userStory.id) {
      this.backlogUserStoryService.updateUserStory(userStory.id, userStory).subscribe(
        (updatedUserStory) => {
          this.loadUserStories(userStory.backlogId);
          this.userStoryForm.reset();
          this.closeUserStoryModal();
        },
        (error) => {
          console.error('Error updating user story', error);
        }
      );
    } else {
      this.backlogUserStoryService.createUserStory(userStory).subscribe(
        (newUserStory) => {
          this.loadUserStories(userStory.backlogId);
          this.userStoryForm.reset();
          this.closeUserStoryModal();
        },
        (error) => {
          console.error('Error creating user story', error);
        }
      );
    }
  }

  deleteBacklog(id: number) {
    this.backlogUserStoryService.deleteBacklog(id).subscribe(
      () => {
        this.loadBacklogs();
        this.selectedBacklog = null;
      },
      (error) => {
        console.error('Error deleting backlog', error);
      }
    );
  }

  deleteUserStory(id: number) {
    this.backlogUserStoryService.deleteUserStory(id).subscribe(
      () => {
        if (this.selectedBacklog) {
          this.loadUserStories(this.selectedBacklog.id!);
        }
      },
      (error) => {
        console.error('Error deleting user story', error);
      }
    );
  }

  selectUserStory(userStory: UserStoryDTO) {
    this.userStoryForm.patchValue(userStory);
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'TO_DO':
        return 'bg-red-200 text-red-800 px-2 py-1 rounded-full text-xs';
      case 'IN_PROGRESS':
        return 'bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs';
      case 'DONE':
        return 'bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs';
      default:
        return '';
    }
  }

  onPageChange(event: PageEvent) {
    this.page = event.pageIndex;
    this.size = event.pageSize;
    this.loadBacklogs();
  }
}
