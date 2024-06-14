import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SprintService } from '../../services/sprint.service';
import { TaskService, Task, TaskStatus } from '../../services/task.service';
import { Sprint } from '../../services/sprint.service';
import { BacklogUserStoryService, BacklogDTO, UserStoryDTO, Page } from '../../services/backlog-userstory.service';
import { ManageProjetService, UserDTO } from '../../services/manage-projet.service';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-sprint',
  templateUrl: './sprint.component.html',
  styleUrls: ['./sprint.component.css']
})
export class SprintComponent implements OnInit {
  sprints: Sprint[] = [];
  selectedSprint: Sprint | null = null;
  tasks: Task[] = [];
  projectBacklogs: BacklogDTO[] = [];
  backlogUserStories: UserStoryDTO[] = [];
  teamMembers: UserDTO[] = [];
  sprintForm: FormGroup;
  taskForm: FormGroup;
  isSprintModalOpen = false;
  isSprintTasksModalOpen = false;
  isTaskModalOpen = false;
  isEditTaskModalOpen = false;
  modalTitle = 'Add Sprint';
  projectId: number;
  page: number = 0;
  size: number = 10;
  totalElements: number = 0;
  taskStatuses = Object.values(TaskStatus);
  isEditingTask = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private sprintService: SprintService,
    private taskService: TaskService,
    private backlogUserStoryService: BacklogUserStoryService,
    private manageProjetService: ManageProjetService
  ) {
    this.projectId = +this.route.snapshot.paramMap.get('id')!;

    this.sprintForm = this.fb.group({
      id: [null],
      nom: ['', [Validators.required, Validators.minLength(3)]],
      dateDebut: ['', [Validators.required]],
      dateFin: ['', [Validators.required, this.dateAfterStartDateValidator()]],
      projetId: [this.projectId, Validators.required]
    });

    this.taskForm = this.fb.group({
      id: [null],
      description: ['', Validators.required],
      status: [TaskStatus.TODO, Validators.required],
      sprintId: [null, Validators.required],
      assignedToEmail: ['', Validators.required],
      assignedToMatricule: [''] // Ensure this is included
    });
    
  }

  ngOnInit(): void {
    this.loadSprints();
    this.loadProjectBacklogs();
    this.loadTeamMembers();
  }

  loadSprints(): void {
    this.sprintService.getSprintsByProjetId(this.projectId, this.page, this.size).subscribe((data) => {
      this.sprints = data.content;
      this.totalElements = data.totalElements;
    });
  }

  loadProjectBacklogs(): void {
    this.backlogUserStoryService.getBacklogsByProjectId(this.projectId, this.page, this.size).subscribe((data) => {
      this.projectBacklogs = data.content;
    });
  }

  loadTeamMembers(): void {
    this.manageProjetService.getTeamMembersByProjetId(this.projectId).subscribe((data) => {
      this.teamMembers = data;
      console.log('Loaded Team Members:', this.teamMembers); // Log to check if members are loaded correctly
    });
  }

  onBacklogChange(event: Event): void {
    const selectedBacklogId = (event.target as HTMLSelectElement).value;
    this.loadBacklogUserStories(+selectedBacklogId);
  }

  loadBacklogUserStories(backlogId: number): void {
    this.backlogUserStoryService.getUserStoriesByBacklogId(backlogId, this.page, this.size).subscribe((data) => {
      this.backlogUserStories = data.content;
    });
  }

  onUserStoryChange(event: Event): void {
    const selectedUserStoryId = (event.target as HTMLSelectElement).value;
    const selectedUserStory = this.backlogUserStories.find(us => us.id === +selectedUserStoryId);
    if (selectedUserStory) {
      this.taskForm.patchValue({ description: selectedUserStory.description });
    }
  }

  selectSprint(sprint: Sprint): void {
    this.selectedSprint = sprint;
    this.loadTasks(sprint.id);
    this.isSprintTasksModalOpen = true;
  }

  loadTasks(sprintId: number): void {
    this.taskService.getTasksBySprintId(sprintId, this.page, this.size).subscribe((data) => {
      this.tasks = data.content;
    });
  }

  openSprintModal(): void {
    this.isSprintModalOpen = true;
    this.modalTitle = 'Add Sprint';
    this.sprintForm.reset();
    this.sprintForm.patchValue({ projetId: this.projectId });
  }

  closeSprintModal(): void {
    this.isSprintModalOpen = false;
  }

  closeSprintTasksModal(): void {
    this.isSprintTasksModalOpen = false;
    this.selectedSprint = null;
    this.tasks = [];
  }

  openTaskModal(): void {
    this.isTaskModalOpen = true;
    this.taskForm.reset();
    if (this.selectedSprint) {
      this.taskForm.patchValue({ sprintId: this.selectedSprint.id });
    }
    this.isEditingTask = false;
  }

  closeTaskModal(): void {
    this.isTaskModalOpen = false;
    this.isEditingTask = false;
  }

  onEmailChange(event: Event): void {
    const selectedEmail = (event.target as HTMLSelectElement).value;
    const selectedMember = this.teamMembers.find(member => member.email === selectedEmail);
    if (selectedMember) {
      this.taskForm.patchValue({ assignedToMatricule: selectedMember.matricule });
      console.log('Assigned To Matricule:', selectedMember.matricule); // Log to check if it's properly set
    } else {
      this.taskForm.patchValue({ assignedToMatricule: null });
    }
  }
  

  saveSprint(): void {
    if (this.sprintForm.invalid) {
      this.sprintForm.markAllAsTouched();
      return;
    }

    const sprint = this.sprintForm.value;

    if (sprint.id) {
      this.sprintService.updateSprint(sprint.id, sprint).subscribe(() => {
        this.loadSprints();
        this.closeSprintModal();
      });
    } else {
      this.sprintService.createSprint(sprint).subscribe(() => {
        this.loadSprints();
        this.closeSprintModal();
      });
    }
  }

  editSprint(sprint: Sprint, event: Event): void {
    event.stopPropagation();
    this.isSprintModalOpen = true;
    this.modalTitle = 'Edit Sprint';
    this.sprintForm.patchValue(sprint);
  }

  deleteSprint(id: number, event: Event): void {
    event.stopPropagation();
    this.sprintService.deleteSprint(id).subscribe(() => {
      this.loadSprints();
      this.selectedSprint = null;
    });
  }

  saveTask(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }
  
    // Ensure sprintId and assignedToMatricule are set correctly
    const task = this.taskForm.getRawValue(); // Use getRawValue() to get the value of disabled fields
  
    // Check and log the required values
    console.log('Sprint ID:', task.sprintId);
    console.log('Assigned To Matricule:', task.assignedToMatricule);
  
    if (!task.sprintId || !task.assignedToMatricule) {
      console.error('Sprint ID and User Matricule must not be null');
      return;
    }
  
    console.log('Task to be saved:', task); // Log the task to be saved
  
    if (task.id) {
      this.taskService.updateTask(task.id, task).subscribe(
        (updatedTask) => {
          console.log('Updated Task:', updatedTask); // Log the updated task from the backend
          this.loadTasks(task.sprintId);
          this.closeTaskModal();
          this.closeEditTaskModal();
        },
        (error) => {
          console.error('Error updating task:', error);
        }
      );
    } else {
      this.taskService.createTask(task).subscribe(
        (newTask) => {
          console.log('Created Task:', newTask); // Log the created task from the backend
          this.loadTasks(task.sprintId);
          this.closeTaskModal();
        },
        (error) => {
          console.error('Error creating task:', error);
        }
      );
    }
  }
  

  editTask(task: Task, event: Event): void {
    event.stopPropagation();
    console.log('Edit Task Clicked:', task); // Log when edit is clicked
    this.isEditTaskModalOpen = true;
    this.isEditingTask = true;
    this.taskForm.patchValue({
      id: task.id,
      description: task.description,
      status: task.status,
      sprintId: task.sprintId,
      assignedToMatricule: task.assignedToMatricule
    });
    console.log('Task Form Values after patch:', this.taskForm.getRawValue()); // Log the values being patched
  }

  closeEditTaskModal(): void {
    this.isEditTaskModalOpen = false;
    this.isEditingTask = false;
  }

  deleteTask(id: number, event: Event): void {
    event.stopPropagation();
    this.taskService.deleteTask(id).subscribe(() => {
      if (this.selectedSprint) {
        this.loadTasks(this.selectedSprint.id);
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex;
    this.size = event.pageSize;
    this.loadSprints();
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'TODO':
        return 'bg-red-200 text-red-800 px-2 py-1 rounded-full';
      case 'IN_PROGRESS':
        return 'bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full';
      case 'DONE':
        return 'bg-green-200 text-green-800 px-2 py-1 rounded-full';
      default:
        return '';
    }
  }

  dateNotInPastValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const today = new Date();
      const selectedDate = new Date(control.value);
      return selectedDate < today ? { dateNotInPast: true } : null;
    };
  }

  dateAfterStartDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const startDate = new Date(this.sprintForm?.get('dateDebut')?.value);
      const endDate = new Date(control.value);
      return endDate < startDate ? { dateAfterStartDate: true } : null;
    };
  }
}
