// የTelegram Bot API ክፍሎች፤ እኛ የምንጠቀምባቸው መስኮች ብቻ። https://core.telegram.org/bots/api

export type TgUser = {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
};

export type TgChat = {
  id: number;
  type: string;
  title?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
};

export type TgFile = { file_id: string; file_name?: string; mime_type?: string };

export type TgEntity = { type: string; offset: number; length: number; url?: string; user?: TgUser };

export type TgMessage = {
  message_id: number;
  from?: TgUser;
  chat: TgChat;
  date: number;
  edit_date?: number;
  business_connection_id?: string;
  sender_business_bot?: TgUser;
  text?: string;
  caption?: string;
  entities?: TgEntity[];
  caption_entities?: TgEntity[];
  photo?: TgFile[];
  document?: TgFile;
  video?: TgFile;
  video_note?: TgFile;
  voice?: TgFile;
  audio?: TgFile;
  sticker?: TgFile & { emoji?: string };
  contact?: { phone_number: string; first_name: string; last_name?: string; user_id?: number };
  location?: { latitude: number; longitude: number };
};

export type TgBusinessBotRights = { can_reply?: boolean };

export type TgBusinessConnection = {
  id: string;
  user: TgUser;
  user_chat_id: number;
  date: number;
  /** ከBot API 9.0 በፊት የነበረ መስክ፤ አሁን rights.can_reply ተክቶታል። */
  can_reply?: boolean;
  rights?: TgBusinessBotRights;
  is_enabled: boolean;
};

export type TgBusinessMessagesDeleted = {
  business_connection_id: string;
  chat: TgChat;
  message_ids: number[];
};

export type TgUpdate = {
  update_id: number;
  message?: TgMessage;
  business_connection?: TgBusinessConnection;
  business_message?: TgMessage;
  edited_business_message?: TgMessage;
  deleted_business_messages?: TgBusinessMessagesDeleted;
};

/** ቦቱ እንዲደርሰው የምንጠይቃቸው የupdate አይነቶች። setWebhook ላይ ይላካሉ። */
export const ALLOWED_UPDATES = [
  "message",
  "business_connection",
  "business_message",
  "edited_business_message",
  "deleted_business_messages",
] as const;
