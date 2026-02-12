export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: Date;
}

export interface Provider {
  id: string;
  name: string;
  icon?: string;
  models: Model[];
}

export interface Model {
  id: string;
  name: string;
  providerId: string;
  description?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  provider: string;
  model: string;
  createdAt: number;
  updatedAt: number;
}
