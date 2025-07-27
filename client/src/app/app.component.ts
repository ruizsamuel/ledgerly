import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './shared/service/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <router-outlet/>
  `
})
export class AppComponent implements OnInit{

  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    this.getHasUsers();
  }

  async getHasUsers() {
    const response = await firstValueFrom(this.authService.hasUsers());
    if (response == false) {
      this.router.navigateByUrl('/admin/create-admin');
    }
  }
}
