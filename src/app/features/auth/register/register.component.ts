import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  fullName = signal('');
  email = signal('');
  password = signal('');
  phone = signal('');
  errorMessage = signal('');
  isLoading = signal(false);

  onSubmit() {
    if (!this.fullName() || !this.email() || !this.password()) {
      this.errorMessage.set('Zəhmət olmasa bütün sahələri doldurun.');
      return;
    }

    if (this.password().length < 8) {
      this.errorMessage.set('Parol ən azı 8 simvol olmalıdır.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.register(this.fullName(), this.email(), this.password(), this.phone()).subscribe({
      next: (response) => {
        this.authService.setSession(response);
        this.isLoading.set(false);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.error || 'Qeydiyyat zamanı xəta baş verdi.');
      }
    });
  }
}