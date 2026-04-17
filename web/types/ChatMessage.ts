interface ChatMessage {
    id: number,
    content : string,
    from: MessageOwner,
    time: Date,
}

type MessageOwner = "client" | "operator" | "bot"