import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { TaskService, Task, TaskStatus, Page } from '../../services/task.service';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  taskStatuses = Object.values(TaskStatus);
  statusControl: FormControl;
  userMatricule: number = 0;
  currentPage = 0;
  pageSize = 5;
  totalElements = 0;

  constructor(
    private taskService: TaskService,
    private fb: FormBuilder
  ) {
    this.statusControl = this.fb.control('');
  }

  ngOnInit(): void {
    const matricule = localStorage.getItem('matricule');
    if (matricule) {
      this.userMatricule = +matricule;
      this.loadTasks();
    }

    this.statusControl.valueChanges.subscribe(status => {
      this.filterTasks(status);
    });
  }

  loadTasks(): void {
    this.taskService.getTasksByMatricule(this.userMatricule, this.currentPage, this.pageSize).subscribe((data: Page<Task>) => {
      console.log('Loaded tasks:', data.content); // Log loaded tasks
      this.tasks = data.content;
      this.totalElements = data.totalElements;
      this.filterTasks(this.statusControl.value);
    });
  }

  filterTasks(status: string | null): void {
    if (status) {
      this.filteredTasks = this.tasks.filter(task => task.status === status);
    } else {
      this.filteredTasks = this.tasks;
    }
    console.log('Filtered tasks:', this.filteredTasks); // Log filtered tasks
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadTasks();
  }

  getStatusClass(status: string): string {
    switch (status) {
        case 'TODO':
            return 'bg-red-200 text-red-800 px-1 py-0.5 text-sm rounded-full';
        case 'IN_PROGRESS':
            return 'bg-yellow-200 text-yellow-800 px-1 py-0.5 text-sm rounded-full';
        case 'DONE':
            return 'bg-green-200 text-green-800 px-1 py-0.5 text-sm rounded-full';
        default:
            return '';
    }
}



  updateTaskStatus(taskId: number, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const status = selectElement.value as TaskStatus;
    console.log('Updating task status:', taskId, status); // Log status update
    this.taskService.updateTaskStatus(taskId, status).subscribe({
      next: (updatedTask) => {
        console.log('Updated task:', updatedTask); // Log updated task
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
          this.tasks[taskIndex].status = status;
        }
        this.filterTasks(this.statusControl.value);
      },
      error: (error) => {
        console.error('Error updating task status:', error);
      }
    });
  }

  
}
