export enum WebSocketMessageType {
    NOTIFICATION        = 'notification',
    NOTIFICATION_UPDATE = 'notification_update',
    NOTIFICATION_READ   = 'notification_read',
    NOTIFICATION_DELETE = 'notification_delete',
    INTERVIEW_REMINDER  = 'interview_reminder',
    SYSTEM_MESSAGE      = 'system_message'
}

export interface WebSocketMessage {
    type: WebSocketMessageType
    data: any
}