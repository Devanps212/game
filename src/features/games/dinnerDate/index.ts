import type { GameConfig } from "../../chat/types/chat.types";
import { SAMPLES } from "../../mobile";

export const dinnerDate: GameConfig = {
  id: "dinner-date",
  title: "Dinner Date",
  wallpaper: "/user/mobile/mobile-bg.avif",
  notifications: SAMPLES,
  chats: [
    {
      id: "hannah",
      name: "Hannah",
      initials: "H",
      avatarClass: "bg-blue-400/90",
      time: "12:30 PM",
      unread: 2,
      initialMessages: [
        { id: 1, from: "them", text: "Hey, how are you?" },
        { id: 2, from: "me", text: "Hey Hannah! I'm good, you?" },
        { id: 3, from: "me", text: "Just wrapping up some work" },
        {
          id: 4,
          from: "them",
          text: "Nice! Are we still on for dinner tonight?",
        },
        { id: 5, from: "them", text: "I was thinking that new Italian place" },
        { id: 6, from: "me", text: "Yes, sounds perfect 🍝" },
        { id: 7, from: "them", text: "Great! What time works for you?" },
      ],
      steps: [
        {
          options: [
            { text: "7:00 PM works for me", reply: "Perfect, see you at 7!" },
            { text: "Can we do 8:00 PM?", reply: "8 works, I'll book a table" },
            { text: "I'm free any time", reply: "Great, I'll book for 7:30" },
          ],
          followUp: "Want me to pick you up?",
        },
        {
          options: [
            { text: "Yes please", reply: "On my way at 6:30!" },
            { text: "I'll drive", reply: "Cool, see you there!" },
            {
              text: "Let's meet there",
              reply: "Sounds good, I'll send the address",
            },
          ],
        },
      ],
      fallbackOptions: [
        { text: "Thanks!", reply: "Anytime 😊" },
        { text: "See you soon 👋", reply: "See you! 👋" },
        { text: "Can't wait!", reply: "Me too! 🎉" },
      ],
    },
    {
      id: "madison",
      name: "Madison Omn",
      initials: "MO",
      avatarClass: "bg-orange-400/80",
      time: "12:30 PM",
      initialMessages: [{ id: 1, from: "them", text: "Hey, how are you?" }],
      steps: [
        {
          options: [
            { text: "Doing great, you?", reply: "Good! Free this weekend?" },
            { text: "Busy week honestly", reply: "Same. Let's catch up soon." },
          ],
        },
      ],
    },
  ],
};
