export default function UserMessage({content} : UserMessageProps) {
    return (<>
        <div className="chat chat-start">
            <div className="chat-bubble bg-slate-600 text-white shadow-lg hover:shadow-xl transition-shadow duration-200">
                {content}
            </div>
        </div>
    </>)
}

interface UserMessageProps extends React.HTMLProps<'div'> {
   content : string,
}