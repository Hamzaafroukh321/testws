import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private zone: NgZone) { }

  getNotifications(matricule: number): Observable<any> {
    return new Observable<any>(observer => {
      const eventSource = new EventSource(`http://localhost:8080/notifications/${matricule}`);

      eventSource.onmessage = (event: MessageEvent) => {
        this.zone.run(() => {
          observer.next(JSON.parse(event.data));
        });
      };

      eventSource.onerror = (error: Event) => {
        this.zone.run(() => {
          observer.error(error);
        });
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    });
  }
}
