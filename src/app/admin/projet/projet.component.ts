import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ManageProjetService, TaskDTO, UserDTO } from '../../services/manage-projet.service';
import { SprintService, Sprint, Page } from '../../services/sprint.service';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexFill,
  ApexLegend,
  ApexPlotOptions,
  ApexResponsive,
  ApexTooltip
} from 'ng-apexcharts';

export type ChartOptions = {
  series: number[];
  chart: ApexChart;
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  labels: string[];
  legend: ApexLegend;
  tooltip: ApexTooltip;
  responsive: ApexResponsive[];
};

@Component({
  selector: 'app-projet',
  templateUrl: './projet.component.html',
  styleUrls: ['./projet.component.css']
})
export class ProjetComponent implements OnInit {
  tasks: TaskDTO[] = [];
  totalTasks: number = 0;
  tasksToDo: number = 0;
  tasksInProgress: number = 0;
  tasksDone: number = 0;
  teamMembers: UserDTO[] = [];
  teamMemberFilter: string = '';
  sprints: Sprint[] = [];
  ganttData: any[] = [];
  public chartOptions: ChartOptions;

  // Gantt chart settings
  view: [number, number] = [700, 400];
  legend: boolean = true;
  showGridLines: boolean = true;
  innerPadding: number = 10;
  barPadding: number = 8;
  tooltipDisabled: boolean = false;
  yAxis: boolean = true;
  xAxis: boolean = true;
  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };
  ganttScale = 'hour';

  constructor(
    private projectService: ManageProjetService,
    private sprintService: SprintService,
    private route: ActivatedRoute
  ) {
    this.chartOptions = {
      series: [0, 0, 0],
      chart: {
        height: 350,
        type: 'radialBar'
      },
      plotOptions: {
        radialBar: {
          dataLabels: {
            total: {
              show: true,
              label: 'Total',
              formatter: () => `${this.totalTasks}`
            }
          }
        }
      },
      labels: ['To do', 'In progress', 'Done'],
      fill: {
        colors: ['#f97316', '#14b8a6', '#1d4ed8']
      },
      legend: {
        show: true,
        position: 'bottom'
      },
      tooltip: {
        enabled: true
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 300
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      ]
    };
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const projectId = params.get('id');
      if (projectId) {
        this.fetchProjectData(Number(projectId));
      }
    });
  }

  fetchProjectData(projectId: number): void {
    this.projectService.getTasksByProjetId(projectId).subscribe((tasks) => {
      this.tasks = tasks;
      this.calculateTaskStatistics();
      this.updateChartOptions();
    });

    this.projectService.getTeamMembersByProjetId(projectId).subscribe((members) => {
      this.teamMembers = members;
    });

    this.sprintService.getSprintsByProjetId(projectId, 0, 10).subscribe((page: Page<Sprint>) => {
      this.sprints = page.content;
      this.updateGanttData();
    });
  }

  calculateTaskStatistics(): void {
    this.totalTasks = this.tasks.length;
    this.tasksToDo = this.tasks.filter(task => task.status === 'TODO').length;
    this.tasksInProgress = this.tasks.filter(task => task.status === 'IN_PROGRESS').length;
    this.tasksDone = this.tasks.filter(task => task.status === 'DONE').length;
  }

  updateChartOptions(): void {
    this.chartOptions.series = [this.tasksToDo, this.tasksInProgress, this.tasksDone];
  }

  updateGanttData(): void {
    this.ganttData = this.sprints.map(sprint => ({
      id: sprint.id,
      text: sprint.nom,
      start_date: sprint.dateDebut,
      end_date: sprint.dateFin
    }));
  }

  get filteredTeamMembers(): UserDTO[] {
    if (!this.teamMemberFilter) {
      return this.teamMembers;
    }
    const filter = this.teamMemberFilter.toLowerCase();
    return this.teamMembers.filter(member =>
      member.nom.toLowerCase().includes(filter) ||
      member.prenom.toLowerCase().includes(filter) ||
      member.matricule.toString().includes(filter) ||
      member.email.toLowerCase().includes(filter)
    );
  }
}
