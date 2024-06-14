import { Component, OnInit } from '@angular/core';
import { UserRoleService } from '../../services/user-role.service';
import { PermissionService } from '../../services/permission.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-manage-permissions',
  templateUrl: './manage-permissions.component.html',
  styleUrls: ['./manage-permissions.component.css']
})
export class ManagePermissionsComponent implements OnInit {
  roles: any[] = [];
  permissions: any[] = [];
  loading: boolean = true;  // Add a loading state

  constructor(
    private userRoleService: UserRoleService,
    private permissionService: PermissionService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.fetchPermissions();
  }

  fetchPermissions() {
    this.permissionService.getPermissions().subscribe(
      (response: any[]) => {
        this.permissions = response;
        console.log('Fetched permissions:', this.permissions);
        this.fetchRoles();
      },
      (error) => {
        console.error('Error fetching permissions:', error);
        this.loading = false;
      }
    );
  }

  fetchRoles() {
    this.userRoleService.getUserRoles().subscribe(
      (response: any[]) => {
        this.roles = response;
        console.log('Fetched roles:', this.roles);
        // Initialize 'checked' property for each permission of each role
        this.roles.forEach(role => {
          role.permissions = this.permissions.map(permission => ({
            ...permission,
            checked: role.permissions.some((p: any) => p.name === permission.name)
          }));
        });
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching roles:', error);
        this.loading = false;
      }
    );
  }

  savePermissions() {
    const updatedRoles = this.roles.map(role => ({
      name: role.name,
      permissionNames: role.permissions
        .filter((permission: any) => permission.checked)
        .map((permission: any) => permission.name)
    }));

    console.log('Updated roles:', updatedRoles);

    const saveRequests = updatedRoles.map(role =>
      this.userRoleService.updateUserRolePermissions(role.name, role.permissionNames).toPromise()
    );

    Promise.all(saveRequests)
      .then(() => {
        console.log('Permissions updated successfully');
        this.snackBar.open('Permissions saved successfully', 'Close', {
          duration: 3000,
          panelClass: 'success-snackbar'
        });
      })
      .catch(error => {
        console.error('Error updating permissions:', error);
        this.snackBar.open('Failed to save permissions', 'Close', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });
      });
  }
}
