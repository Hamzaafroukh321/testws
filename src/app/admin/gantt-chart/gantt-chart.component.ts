import { Component, OnInit, AfterViewInit, OnDestroy, Input, ElementRef, ViewChild } from '@angular/core';
import 'dhtmlx-gantt'; // Ensure this import is present to use gantt

declare let gantt: any; // Declare the gantt variable

@Component({
  selector: 'app-gantt-chart',
  template: '<div #ganttContainer style="width: 100%; height: 500px;"></div>',
})
export class GanttChartComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() tasks: any[] = [];
  @ViewChild('ganttContainer', { static: true }) ganttContainer!: ElementRef;

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    gantt.init(this.ganttContainer.nativeElement);

    const data = {
      data: this.tasks,
      links: [],
    };

    gantt.parse(data);
  }

  ngOnDestroy() {
    gantt.clearAll();
  }
}
