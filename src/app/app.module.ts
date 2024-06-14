import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin/admin.component';
import { AdminNavbarComponent } from './admin/admin-navbar/admin-navbar.component';
import { AdminSidebarComponent } from './admin/admin-sidebar/admin-sidebar.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ManageUsersComponent } from './admin/manage-users/manage-users.component';
import { AuditComponent } from './admin/audit/audit.component';
import { ManagePermissionsComponent } from './admin/manage-permissions/manage-permissions.component';
import { ManageProjetComponent } from './admin/manage-projet/manage-projet.component';
import { RequestLeaveComponent } from './admin/request-leave/request-leave.component';
import { ManageLeaveRequestComponent } from './admin/manage-leave-request/manage-leave-request.component';
import { BacklogComponent } from './admin/backlog/backlog.component';
import { ProjetComponent } from './admin/projet/projet.component';
import { SprintComponent } from './admin/sprint/sprint.component';

import { AuthInterceptor } from './auth.interceptor';

import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { GanttChartComponent } from './admin/gantt-chart/gantt-chart.component';
import { TaskComponent } from './admin/task/task.component';
import { ChatComponent } from './admin/chat/chat.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdminComponent,
    AdminNavbarComponent,
    AdminSidebarComponent,
    ResetPasswordComponent,
    ManageUsersComponent,
    AuditComponent,
    ManagePermissionsComponent,
    ManageProjetComponent,
    RequestLeaveComponent,
    ManageLeaveRequestComponent,
    BacklogComponent,
    ProjetComponent,
    SprintComponent,
    GanttChartComponent,
    TaskComponent,
    ChatComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgApexchartsModule,
    NgxChartsModule
   
    
    
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
