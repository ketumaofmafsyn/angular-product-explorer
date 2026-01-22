import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly STORAGE_KEY = 'favorite_product_ids';

  // store only product IDs
  private favoritesSignal = signal<number[]>(this.loadFromStorage());

  favorites$ = this.favoritesSignal.asReadonly();

  constructor() {
    // persist whenever favorites change
    effect(() => {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(this.favoritesSignal())
      );
    });
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
