export default function OperatorMessage({content} : OperatorMessageProps) {
    return (<>
        <div className="chat chat-end">
            <div className="chat-bubble text-black bg-base-200">{content}</div>
        </div>
    </>)
}

interface OperatorMessageProps extends React.HTMLProps<'div'> {
   content : string,
}