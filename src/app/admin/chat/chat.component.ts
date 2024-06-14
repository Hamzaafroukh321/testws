import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChatService, ChatMessageDTO } from '../../services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: ChatMessageDTO[] = [];
  archivedConversations: { userId: number }[] = [];
  newMessage: string = '';
  recipientId: number | null = null;
  userMatricule: number = 0;
  private subscriptions: Subscription[] = [];

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.userMatricule = +localStorage.getItem('matricule')!;
    console.log('User matricule:', this.userMatricule);

    this.subscriptions.push(
      this.chatService.messages$.subscribe(messages => {
        this.messages = messages;
        console.log('Received messages:', messages);
      })
    );

    this.loadArchivedConversations();
  }

  ngOnDestroy() {
    console.log('Cleaning up subscriptions');
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  loadArchivedConversations() {
    console.log('Loading archived conversations');
    const subscription = this.chatService.getUniqueConversations(this.userMatricule).subscribe(
      conversations => {
        this.archivedConversations = conversations.map(userId => ({ userId }));
        console.log('Archived conversations:', this.archivedConversations);
      },
      error => {
        console.error('Error loading archived conversations:', error);
      }
    );
    this.subscriptions.push(subscription);
  }

  selectRecipient(recipientId: number) {
    console.log('Selecting recipient:', recipientId);
    this.recipientId = recipientId;
    this.unsubscribeFromRecipientMessages();
    console.log('Unsubscribed from previous recipient messages');
    this.loadMessages();
    this.subscribeToRecipientMessages(recipientId);
    console.log('Subscribed to new recipient messages');
  }

  loadMessages() {
    if (this.recipientId !== null) {
      console.log('Loading messages for recipient:', this.recipientId);
      const subscription = this.chatService.getChatHistory(this.userMatricule, this.recipientId).subscribe(
        messages => {
          this.messages = messages;
          console.log('Loaded messages:', this.messages);
        },
        error => {
          console.error('Error loading messages:', error);
        }
      );
      this.subscriptions.push(subscription);
    }
  }

  sendMessage() {
    if (this.newMessage.trim() && this.recipientId !== null) {
      console.log('Sending message to recipient:', this.recipientId);
      const message = new ChatMessageDTO(0, this.userMatricule, this.recipientId, this.newMessage, new Date(), true);
      this.chatService.sendMessage(message).subscribe({
        next: () => {
          console.log('Message sent successfully');
          this.newMessage = '';
          this.messages.push(message);
          this.messages = [...this.messages];
        },
        error: error => {
          console.error('Error sending message:', error);
        }
      });
    } else {
      console.warn('Message content is empty or recipient is not selected');
    }
  }

  trackByMessageId(index: number, message: ChatMessageDTO): number {
    return message.id;
  }

  private unsubscribeFromRecipientMessages() {
    const recipientMessageSubscriptionIndex = this.subscriptions.findIndex(
      subscription => subscription instanceof Subscription && subscription.closed === false
    );
    if (recipientMessageSubscriptionIndex !== -1) {
      this.subscriptions[recipientMessageSubscriptionIndex].unsubscribe();
      this.subscriptions.splice(recipientMessageSubscriptionIndex, 1);
    }
  }

  private subscribeToRecipientMessages(recipientId: number) {
    if (this.recipientId !== null) {
      console.log('Subscribing to recipient messages for:', recipientId);
      const subscription = this.chatService.subscribeToRecipientMessages(recipientId).subscribe(
        message => {
          this.messages.push(message);
          this.messages = [...this.messages];
          console.log('New message received:', message);
        },
        error => {
          console.error('Error receiving message:', error);
        }
      );
      this.subscriptions.push(subscription);
      console.log('Subscribed to recipient messages for:', recipientId);
    } else {
      console.log('No recipient selected');
    }
  }
}