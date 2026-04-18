interface ChatMessage {
    id: number,
    content : string,
    from: MessageOwner,
    time: Date,
    imageIds?: string[],
}

type MessageOwner = "client" | "operator" | "bot" | "system"