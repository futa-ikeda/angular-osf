import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

import { STORAGE_KEYS } from '@core/constants/storage-keys.const';
import { UserModel } from '@osf/shared/models/user/user.model';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly platformId = inject(PLATFORM_ID);

  getCachedUser(): UserModel | null {
    return this.getJson<UserModel>(STORAGE_KEYS.currentUser);
  }

  setCachedUser(user: UserModel): void {
    this.setJson(STORAGE_KEYS.currentUser, user);
  }

  getCachedActiveFlags(): string[] {
    return this.getJson<string[]>(STORAGE_KEYS.activeFlags) ?? [];
  }

  setCachedActiveFlags(flags: string[]): void {
    this.setJson(STORAGE_KEYS.activeFlags, flags);
  }

  clearSession(): void {
    this.removeItem(STORAGE_KEYS.currentUser);
    this.removeItem(STORAGE_KEYS.activeFlags);
  }

  private getItem(key: string): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return window.localStorage.getItem(key);
    }

    return null;
  }

  private setItem(key: string, value: string): void {
    if (isPlatformBrowser(this.platformId)) {
      window.localStorage.setItem(key, value);
    }
  }

  private removeItem(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      window.localStorage.removeItem(key);
    }
  }

  private getJson<T>(key: string): T | null {
    const raw = this.getItem(key);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      this.removeItem(key);
      return null;
    }
  }

  private setJson<T>(key: string, value: T): void {
    this.setItem(key, JSON.stringify(value));
  }
}
