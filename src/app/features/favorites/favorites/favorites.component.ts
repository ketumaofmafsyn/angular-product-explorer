import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../../core/models/core/models/product.model';
import { FavoritesService } from '../../../core/services/favorites.service';
import { CatalogService } from '../../catalog/catalog.service';
import { Observable, map, tap, finalize } from 'rxjs';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss'],
})
export class FavoritesComponent implements OnInit {
  products: Product[] = [];
  loading = true;

  constructor(
    private catalogService: CatalogService,
    public favoritesService: FavoritesService
  ) {}

  ngOnInit(): void {
    this.catalogService.getProducts()
      .pipe(
        // Filter products that are in favorites
        map(products => products.filter(p => 
          this.favoritesService.isFavorite(p.id)
        )),
        // Update the products array
        tap(filteredProducts => {
          this.products = filteredProducts;
        }),
        // Set loading to false when complete (whether success or error)
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        error: (err) => {
          console.error('Error loading products:', err);
          this.loading = false;
        }
      });
  }
}