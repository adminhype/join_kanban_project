import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  public sharedService = inject(SharedService);

  email: string = '';
  password: string = '';
  errorMessage: string = '';
  showPassword: boolean = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    this.errorMessage = '';
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter your email and password.';
      return;
    }

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigateByUrl('/summary');
      },
      error: () => {
        this.errorMessage = 'Email or password is incorrect!';
      }
    });
  }

  guestLogIn(): void {
    this.authService.login('guestlogin@join.com', 'guest123').subscribe({
      next: () => {
        this.router.navigateByUrl('/summary');
      },
    });
  }
}

