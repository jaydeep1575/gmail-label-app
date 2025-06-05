import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }

  get<T>(url: string) {
    return this.http.get<T>(url);
  }

  post<T>(url: string, data: any) {
    return this.http.post<T>(url, data);
  }

  put<T>(url: string, data: any) {
    return this.http.put<T>(url, data);
  }

  delete<T>(url: string) {
    return this.http.delete<T>(url);
  }
}
