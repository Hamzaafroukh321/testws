import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Input, Ripple, initTWE } from 'tw-elements';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  ngOnInit(): void {
    initTWE({ Input, Ripple });
  }
  loginForm = {
    email: '',
    password: ''
  };

  constructor(private authService: AuthService, private router: Router) { }

  onSubmit() {
    const { email, password } = this.loginForm;
    this.authService.login(email, password).subscribe(
      (response: any) => {
        
        const firstTime = response.firstTime;
        if (firstTime) {
          this.router.navigate(['/reset-password']);
        } else {
          this.router.navigate(['/admin']);
        }
      },
      (error) => {
        // Gérer les erreurs de l'API
        console.error(error);
        // Afficher un message d'erreur à l'utilisateur
        alert('Invalid credentials. Please try again.');
      }
    );
  }
}