import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Observable, Subject } from 'rxjs';

export interface NotificationPayload {
  title: string;
  message: string;
  type: 'LeaveApproved' | 'AttendanceUpdated' | 'PayrollGenerated' | 'AssetAssigned' | 'DepartmentUpdated' | 'EmployeeCreated' | string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class SignalRNotificationService {
  private hubConnection!: signalR.HubConnection;
  private notificationSubject = new Subject<NotificationPayload>();

  public notifications$: Observable<NotificationPayload> = this.notificationSubject.asObservable();

  constructor() {
    this.initSignalRConnection();
  }

  private initSignalRConnection(): void {
    const token = localStorage.getItem('token') || '';

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5159/hubs/notifications', {
        accessTokenFactory: () => token,
        withCredentials: true,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.startConnection();
    this.registerNotificationListener();
  }

  private startConnection(): void {
    if (this.hubConnection.state === signalR.HubConnectionState.Disconnected) {
      this.hubConnection
        .start()
        .then(() => console.log('SignalR Notification Hub connected.'))
        .catch((err: unknown) => {
          console.warn('SignalR Hub connection pending backend server launch:', err);
        });
    }
  }

  private registerNotificationListener(): void {
    this.hubConnection.on('ReceiveNotification', (notification: NotificationPayload) => {
      console.log('Real-time notification received via SignalR:', notification);
      this.notificationSubject.next(notification);
    });
  }

  public stopConnection(): void {
    if (this.hubConnection && this.hubConnection.state !== signalR.HubConnectionState.Disconnected) {
      this.hubConnection.stop();
    }
  }
}
