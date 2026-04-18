export default function OperatorMessage({content} : OperatorMessageProps) {
    return (<>
        <div className="chat chat-end">
            <div className="chat-bubble bg-primary text-primary-content shadow-lg hover:shadow-xl transition-shadow duration-200">
                {content}
            </div>
        </div>
    </>)
}

interface OperatorMessageProps extends React.HTMLProps<'div'> {
   content : string,
}