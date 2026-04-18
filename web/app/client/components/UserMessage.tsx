export default function UserMessage({content} : UserMessageProps) {
    return (<>
        <div className="chat chat-end">
            <div className="chat-bubble bg-primary text-primary-content shadow-lg hover:shadow-xl transition-shadow duration-200">
                {content}
            </div>
        </div>
    </>)
}

interface UserMessageProps extends React.HTMLProps<'div'> {
   content : string,
}