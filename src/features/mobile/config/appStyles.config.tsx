import type { ReactNode } from "react";
import type { NotificationApp } from "../types/Notification.types";
import { Bell, Calendar, Mail, MessageCircle } from "lucide-react";

export const appStyle: Record<NotificationApp, { bg: string; icon: ReactNode }> = {
  messages: { bg: "bg-[#30D158]", icon: <MessageCircle size={18} /> },
  mail: { bg: "bg-[#0A84FF]", icon: <Mail size={18} /> },
  calendar: { bg: "bg-[#FF453A]", icon: <Calendar size={18} /> },
  general: { bg: "bg-[#BF5AF2]", icon: <Bell size={18} /> },
};