/// <reference types="vite/client" />

// Add global to Window interface for SockJS compatibility
interface Window {
  global: typeof globalThis;
  $message: any;
  $dialog: any;
  $notification: any;
  $loadingBar: any;
}
