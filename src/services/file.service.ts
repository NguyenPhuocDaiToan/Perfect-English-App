
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class FileService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/files`; // Adjust based on your API

    uploadFile(file: File): Observable<{ url: string }> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<{ url: string }>(`${this.apiUrl}/upload`, formData);
    }
}
