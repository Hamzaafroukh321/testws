import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject, throwError } from 'rxjs';
import * as Stomp from 'stompjs';
import SockJS from 'sockjs-client';
import { catchError, shareReplay, switchMap, tap } from 'rxjs/operators';

export class ChatMessageDTO {
  constructor(
    public id: number,
    public senderId: number,
    public recipientId: number,
    public content: string,
    public timestamp: Date,
    public isPrivate: boolean
  ) {}
}

@Injectable({
  providedIn: 'root'
})
export class ChatService implements OnDestroy {
  private apiUrl = 'http://localhost:8080';
  private stompClient: Stomp.Client | null = null;
  private messagesSubject = new BehaviorSubject<ChatMessageDTO[]>([]);
  public messages$ = this.messagesSubject.asObservable().pipe(shareReplay(1));
  private isConnected = new BehaviorSubject<boolean>(false);
  private messageSubject = new Subject<ChatMessageDTO>();
  private messageSubscription?: Stomp.Subscription;

  constructor(private http: HttpClient) {
    this.connectWebSocket();
  }

  private connectWebSocket(): void {
    const socket = new SockJS(`${this.apiUrl}/ws`);
    this.stompClient = Stomp.over(socket);
    this.stompClient.connect({}, () => {
      this.isConnected.next(true);
      this.initializeSubscriptions();
      console.log('WebSocket connected');
    }, error => {
      console.error('WebSocket connection error: ', error);
      this.isConnected.next(false);
    });
  }

  private initializeSubscriptions(): void {
    const userMatricule = localStorage.getItem('matricule');
    if (userMatricule && this.stompClient) {
      this.messageSubscription = this.stompClient.subscribe(`/user/${userMatricule}/queue/messages`, message => {
        const newMessage = JSON.parse(message.body) as ChatMessageDTO;
        this.messagesSubject.next([...this.messagesSubject.getValue(), newMessage]);
        this.messageSubject.next(newMessage);
        console.log('Received new message:', newMessage);
      });
    }
  }

  ngOnDestroy(): void {
    this.disconnectWebSocket();
  }

  public sendMessage(message: ChatMessageDTO): Observable<void> {
    if (!this.isConnected.value || !this.stompClient) {
      return throwError(() => new Error('WebSocket is not connected')) as Observable<void>;
    }
    return new Observable<void>(observer => {
      this.stompClient!.send('/app/chat.sendMessage', {}, JSON.stringify(message));
      observer.next();
      observer.complete();
    }).pipe(
      catchError(this.handleError<void>('sendMessage'))
    );
  }

  public getChatHistory(senderId: number, recipientId: number): Observable<ChatMessageDTO[]> {
    const params = new HttpParams().set('senderId', senderId.toString()).set('recipientId', recipientId.toString());
    return this.http.get<ChatMessageDTO[]>(`${this.apiUrl}/api/chat/history`, { params }).pipe(
      catchError(this.handleError<ChatMessageDTO[]>('getChatHistory', []))
    );
  }

  public getUniqueConversations(userMatricule: number): Observable<number[]> {
    const params = new HttpParams().set('userMatricule', userMatricule.toString());
    return this.http.get<number[]>(`${this.apiUrl}/api/chat/unique-conversations`, { params }).pipe(
      catchError(this.handleError<number[]>('getUniqueConversations', []))
    );
  }

  public subscribeToRecipientMessages(recipientId: number): Observable<ChatMessageDTO> {
    return this.messageSubject.asObservable().pipe(
      switchMap(message => {
        if (message.recipientId === recipientId) {
          return new Observable<ChatMessageDTO>(observer => {
            observer.next(message);
            observer.complete();
          });
        } else {
          return new Observable<ChatMessageDTO>();
        }
      })
    );
  }

  private disconnectWebSocket(): void {
    if (this.stompClient) {
      this.stompClient.disconnect(() => {
        console.log('WebSocket disconnected');
        this.isConnected.next(false);
      });
      this.stompClient = null;
    }
    this.messageSubscription?.unsubscribe();
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return throwError(() => new Error(`${operation} failed: ${error.message}`)) as Observable<T>;
    };
  }
}
