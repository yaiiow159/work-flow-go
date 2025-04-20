import type { DialogApi, MessageApi, NotificationApi, LoadingBarApi } from 'naive-ui'

declare global {
  interface Window {
    $dialog: DialogApi
    $message: MessageApi
    $notification: NotificationApi
    $loadingBar: LoadingBarApi
  }
}
