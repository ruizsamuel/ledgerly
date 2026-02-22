import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Settings } from "../models/settings.model";
import { Response } from "../../../core/models/response.model";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";

const SETTINGS_URL = environment.apiBaseUrl + '/settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private http = inject(HttpClient);

  getSettings(): Observable<Response<Settings>> {
    return this.http.get<Response<Settings>>(SETTINGS_URL);
  }

  updateSettings(settings: Settings): Observable<Response<Settings>> {
    return this.http.put<Response<Settings>>(SETTINGS_URL, settings);
  }
}
