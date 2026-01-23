import { Injectable, signal, effect, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly STORAGE_KEY = 'favorite_product_ids';

  // Initialize as empty array during SSR; will hydrate from localStorage in browser
  private favoritesSignal = signal<number[]>([]);

  favorites$ = this.favoritesSignal.asReadonly();

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    // Only load from localStorage if we're in the browser
    if (this.isBrowser) {
      this.favoritesSignal.set(this.loadFromStorage());

      // Persist changes to localStorage (only in browser)
      effect(() => {
        localStorage.setItem(
          this.STORAGE_KEY,
          JSON.stringify(this.favoritesSignal())
        );
      });
    }
  }

  private loadFromStorage(): number[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  isFavorite(productId: number): boolean {
    return this.favoritesSignal().includes(productId);
  }

  toggleFavorite(productId: number): void {
    this.favoritesSignal.update(ids =>
      ids.includes(productId)
        ? ids.filter(id => id !== productId)
        : [...ids, productId]
    );
  }

  getFavorites(): number[] {
    return this.favoritesSignal();
  }

  getFavoritesCount(): number {
    return this.favorites$().length;
  }

  clear(): void {
    this.favoritesSignal.set([]);
  }
}
