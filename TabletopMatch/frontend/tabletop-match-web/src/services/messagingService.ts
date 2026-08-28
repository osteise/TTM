import type {
  Conversation,
  ConversationMessage,
  PagedMessagesResponse,
  SendMessageRequest,
  StartDirectConversationRequest,
} from "../types/Messaging";

const MESSAGING_API_URL =
  "http://localhost:5252/api/conversations";

type ApiErrorResponse = {
  message?: string;
  errors?: string[] | Record<string, string[]>;
};

async function getErrorMessage(
  response: Response,
): Promise<string> {
  try {
    const data = (await response.json()) as ApiErrorResponse;

    if (typeof data.message === "string") {
      return data.message;
    }

    if (Array.isArray(data.errors)) {
      return data.errors.join(" ");
    }

    if (data.errors) {
      const messages = Object.values(data.errors).reduce<
        string[]
      >((allMessages, currentMessages) => {
        return allMessages.concat(currentMessages);
      }, []);

      if (messages.length > 0) {
        return messages.join(" ");
      }
    }
  } catch {
    // The response did not contain JSON.
  }

  return "Something went wrong.";
}

export async function startDirectConversation(
  participantProfileId: number,
): Promise<Conversation> {
  const request: StartDirectConversationRequest = {
    participantProfileId,
  };

  const response = await fetch(`${MESSAGING_API_URL}/direct`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function getConversations(): Promise<
  Conversation[]
> {
  const response = await fetch(MESSAGING_API_URL, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function getMessages(
  conversationId: string,
  beforeMessageId?: number,
  pageSize = 50,
): Promise<PagedMessagesResponse> {
  const query = new URLSearchParams({
    pageSize: pageSize.toString(),
  });

  if (beforeMessageId !== undefined) {
    query.set(
      "beforeMessageId",
      beforeMessageId.toString(),
    );
  }

  const response = await fetch(
    `${MESSAGING_API_URL}/${encodeURIComponent(
      conversationId,
    )}/messages?${query.toString()}`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function sendMessage(
  conversationId: string,
  content: string,
): Promise<ConversationMessage> {
  const request: SendMessageRequest = {
    content,
  };

  const response = await fetch(
    `${MESSAGING_API_URL}/${encodeURIComponent(
      conversationId,
    )}/messages`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}