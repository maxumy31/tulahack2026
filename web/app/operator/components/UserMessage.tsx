export default function UserMessage({content} : UserMessageProps) {
    return (<>
        <div className="chat chat-start">
            <div className="chat-bubble chat-bubble-primary">{content}</div>
        </div>
    </>)
}

interface UserMessageProps extends React.HTMLProps<'div'> {
   content : string,
}