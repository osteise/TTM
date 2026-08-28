export type ConversationType = "Direct" | "Group";

export type ConversationParticipant = {
  profileId: number;
  displayName: string;
};

export type ConversationMessage = {
  id: number;
  conversationId: string;
  senderProfileId: number;
  senderDisplayName: string;
  content: string;
  sentAt: string;
};

export type Conversation = {
  id: string;
  type: ConversationType;
  createdAt: string;
  lastActivityAt: string;
  participants: ConversationParticipant[];
  lastMessage: ConversationMessage | null;
};

export type PagedMessagesResponse = {
  items: ConversationMessage[];
  nextCursor: number | null;
  hasMore: boolean;
};

export type StartDirectConversationRequest = {
  participantProfileId: number;
};

export type SendMessageRequest = {
  content: string;
};