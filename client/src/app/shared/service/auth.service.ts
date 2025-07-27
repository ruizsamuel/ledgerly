import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

const AUTH_URL = environment.apiBaseUrl + '/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  hasUsers(): Observable<boolean> {
    return this.http.get<{ hasUsers: boolean }>(`${AUTH_URL}/has-users`).pipe(
      map(res => res.hasUsers)
    );
  }
}
