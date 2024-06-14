// src/app/services/websocket.service.ts
import { Injectable } from '@angular/core';
import { Client, Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient!: Client;
  private chatMessageSubject = new BehaviorSubject<any>(null);
  chatMessage$ = this.chatMessageSubject.asObservable();

  constructor() {
    this.initializeWebSocketConnection();
  }

  initializeWebSocketConnection() {
    const serverUrl = 'http://localhost:8080/ws';
    const ws = new SockJS(serverUrl);
    this.stompClient = Stomp.over(ws);

    this.stompClient.onConnect = (frame) => {
      this.stompClient.subscribe('/topic/messages', (message) => {
        if (message.body) {
          this.chatMessageSubject.next(JSON.parse(message.body));
        }
      });
    };

    this.stompClient.activate();
  }

  sendMessage(message: any) {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: '/app/chat/messages',
        body: JSON.stringify(message)
      });
    }
  }
}
