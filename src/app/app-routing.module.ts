import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { AdminComponent } from './admin/admin.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ManageUsersComponent } from './admin/manage-users/manage-users.component';
import { ManagePermissionsComponent } from './admin/manage-permissions/manage-permissions.component';
import { AuditComponent } from './admin/audit/audit.component';
import { ManageProjetComponent } from './admin/manage-projet/manage-projet.component';
import { RequestLeaveComponent } from './admin/request-leave/request-leave.component';
import { ManageLeaveRequestComponent } from './admin/manage-leave-request/manage-leave-request.component';
import { BacklogComponent } from './admin/backlog/backlog.component';
import { ProjetComponent } from './admin/projet/projet.component';
import { SprintComponent } from './admin/sprint/sprint.component';
import { TaskComponent } from './admin/task/task.component';
import { ChatComponent } from './admin/chat/chat.component';  // Import ChatComponent

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'manage-users',
        component: ManageUsersComponent,
        canActivate: [RoleGuard],
        data: { expectedRole: 'MANAGE_USERS' }
      },
      {
        path: 'manage-permissions',
        component: ManagePermissionsComponent,
        canActivate: [RoleGuard],
        data: { expectedRole: 'MANAGE_PERMISSIONS' }
      },
      {
        path: 'manage-audit',
        component: AuditComponent,
        canActivate: [RoleGuard],
        data: { expectedRole: 'MANAGE_AUDIT' }
      },
      {
        path: 'manage-projects',
        component: ManageProjetComponent,
        canActivate: [RoleGuard],
        data: { expectedRole: 'MANAGE_PROJECTS' }
      },
      {
        path: 'request-leave',
        component: RequestLeaveComponent,
        canActivate: [RoleGuard],
        data: { expectedRole: 'REQUEST_LEAVE' }
      },
      {
        path: 'manage-leave-request',
        component: ManageLeaveRequestComponent,
        canActivate: [RoleGuard],
        data: { expectedRole: 'MANAGE_REQUEST_LEAVE' }
      },
      {
        path: 'project/:id',
        component: ProjetComponent,
        canActivate: [RoleGuard],
        data: { expectedRole: 'VIEW_PROJECT' }
      },
      {
        path: 'project/:id/backlogs',
        component: BacklogComponent,
        canActivate: [RoleGuard],
        data: { expectedRole: 'MANAGE_TASKS' }
      },
      {
        path: 'project/:id/sprints',
        component: SprintComponent,
        canActivate: [RoleGuard],
        data: { expectedRole: 'MANAGE_TASKS' }
      },
      {
        path: 'manage-tasks',
        component: TaskComponent,
        canActivate: [RoleGuard],
        data: { expectedRole: 'MANAGE_TASKS' }
      },
      {
        path: 'chat',
        component: ChatComponent,
        canActivate: [RoleGuard],
        data: { expectedRole: 'CHAT_MESSAGE' }
      }
    ]
  },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
