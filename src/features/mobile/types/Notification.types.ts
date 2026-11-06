export type NotificationItem = {
  id: number;
  app: NotificationApp;
  title: string;
  body: string;
  time: string;
  chatId?: string;
};

export type NotificationApp = "messages" | "mail" | "calendar" | "general";
