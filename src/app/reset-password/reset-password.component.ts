// reset-password.component.ts
import { Component } from '@angular/core';
import { ResetPasswordService } from '../services/reset-password.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  resetPasswordForm = {
    email: '',
    password: '',
    confirmPassword: ''
  };

  constructor(private resetPasswordService: ResetPasswordService, private router: Router) { }

  onSubmit() {
    const { email, password } = this.resetPasswordForm;

    this.resetPasswordService.resetPassword(email, password).subscribe(
      () => {
        alert('Password reset successfully. Please login with your new password.');
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error(error);
        alert('An error occurred while resetting the password. Please try again.');
      }
    );
  }

  isPasswordStrong(password: string): boolean {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  }

  passwordsMatch(): boolean {
    return this.resetPasswordForm.password === this.resetPasswordForm.confirmPassword;
  }

  checkPasswordStrength() {
    const password = this.resetPasswordForm.password;
    const passwordStrengthElement = document.getElementById('password-strength');
    
    if (passwordStrengthElement) {
      if (this.isPasswordStrong(password)) {
        passwordStrengthElement.textContent = '';
      } else {
        passwordStrengthElement.textContent = 'Password is not strong enough. Please choose a stronger password.';
      }
    }
  }

  checkPasswordMatch() {
    const password = this.resetPasswordForm.password;
    const confirmPassword = this.resetPasswordForm.confirmPassword;
    const passwordMatchElement = document.getElementById('password-match');
    
    if (passwordMatchElement) {
      if (password === confirmPassword) {
        passwordMatchElement.textContent = '';
      } else {
        passwordMatchElement.textContent = 'Passwords do not match. Please try again.';
      }
    }
  }
}