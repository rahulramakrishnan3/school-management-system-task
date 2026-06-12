import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../auth/auth.service';

interface DemoCredential {
  readonly name: string;
  readonly role: 'Admin' | 'User';
  readonly email: string;
  readonly password: string;
}

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  // OnPush pairs with signal form states so only explicit loading/error changes trigger checks.
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly demoCredentials: readonly DemoCredential[] = [
    { name: 'Aarav Sharma', role: 'Admin', email: 'aarav.admin@product.test', password: 'Admin@123' },
    { name: 'Meera Patel', role: 'Admin', email: 'meera.admin@product.test', password: 'Admin@456' },
    { name: 'Kabir Singh', role: 'User', email: 'kabir.user@product.test', password: 'User@123' },
    { name: 'Ananya Rao', role: 'User', email: 'ananya.user@product.test', password: 'User@456' },
  ];

  readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  useCredentials(credentials: DemoCredential): void {
    this.loginForm.setValue({
      email: credentials.email,
      password: credentials.password,
    });
    this.errorMessage.set(null);
  }

  submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);

    this.authService
      .login(this.loginForm.getRawValue())
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (user) => void this.router.navigate([user.role === 'admin' ? '/admin' : '/products']),
        error: (error: Error) => this.errorMessage.set(error.message),
      });
  }
}
