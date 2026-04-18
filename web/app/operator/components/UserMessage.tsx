export default function UserMessage({content} : UserMessageProps) {
    return (<>
        <div className="chat chat-start">
            <div className="chat-bubble text-black bg-base-200">{content}</div>
        </div>
    </>)
}

interface UserMessageProps extends React.HTMLProps<'div'> {
   content : string,
}