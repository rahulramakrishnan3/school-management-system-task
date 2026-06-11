import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { defer, Observable, switchMap, timer } from 'rxjs';
import { MOCK_USERS, UserRole } from '../data/mock-users';

const SESSION_TOKEN_KEY = 'product-management-token';
const NETWORK_DELAY_MS = 600;

export interface AuthUser {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly role: UserRole;
}

export interface LoginCredentials {
  readonly email: string;
  readonly password: string;
}

interface TokenPayload extends AuthUser {
  readonly issuedAt: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly currentUserState = signal<AuthUser | null>(this.hydrateSession());

  readonly currentUser = this.currentUserState.asReadonly();
  readonly role = computed(() => this.currentUserState()?.role ?? null);
  readonly isAuthenticated = computed(() => this.currentUserState() !== null);

  login(credentials: LoginCredentials): Observable<AuthUser> {
    return timer(NETWORK_DELAY_MS).pipe(switchMap(() => defer(() => this.authenticate(credentials))));
  }

  logout(): void {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    this.currentUserState.set(null);
    void this.router.navigate(['/login']);
  }

  private async authenticate(credentials: LoginCredentials): Promise<AuthUser> {
    const passwordHash = await this.hashPassword(credentials.password);
    const matchedUser = MOCK_USERS.find(
      (user) =>
        user.email.toLowerCase() === credentials.email.trim().toLowerCase() &&
        user.passwordHash === passwordHash,
    );

    if (!matchedUser) {
      throw new Error('The email or password you entered is incorrect.');
    }

    const user: AuthUser = {
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      role: matchedUser.role,
    };

    const payload: TokenPayload = { ...user, issuedAt: Date.now() };
    sessionStorage.setItem(SESSION_TOKEN_KEY, this.createMockToken(payload));
    this.currentUserState.set(user);
    return user;
  }

  private hydrateSession(): AuthUser | null {
    const token = sessionStorage.getItem(SESSION_TOKEN_KEY);

    if (!token) {
      return null;
    }

    try {
      const payload = this.decodeToken(token);
      const matchedUser = MOCK_USERS.find(
        (user) =>
          user.id === payload.id &&
          user.email === payload.email &&
          user.name === payload.name &&
          user.role === payload.role,
      );

      if (!matchedUser) {
        throw new Error('Session user is invalid.');
      }

      return {
        id: matchedUser.id,
        name: matchedUser.name,
        email: matchedUser.email,
        role: matchedUser.role,
      };
    } catch {
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
      return null;
    }
  }

  private createMockToken(payload: TokenPayload): string {
    const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    return `${header}.${body}.mock-signature`;
  }

  private decodeToken(token: string): TokenPayload {
    const segments = token.split('.');

    if (segments.length !== 3) {
      throw new Error('Session token is malformed.');
    }

    return JSON.parse(atob(segments[1])) as TokenPayload;
  }

  private async hashPassword(password: string): Promise<string> {
    const bytes = new TextEncoder().encode(password);
    const digest = await crypto.subtle.digest('SHA-256', bytes);

    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }
}
