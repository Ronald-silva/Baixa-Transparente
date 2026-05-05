export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export function createNotification(
  message: string,
  type: 'success' | 'error' | 'info' = 'info'
): Notification {
  return {
    id: Math.random().toString(36).substr(2, 9),
    message,
    type
  };
}
