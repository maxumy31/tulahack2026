export default function OperatorMessage({ content }: OperatorMessageProps) {
    return (<>
        <div className="chat chat-start">
            <div className="chat-bubble chat-bubble-primary">{content}</div>
        </div>
    </>)
}

interface OperatorMessageProps extends React.HTMLProps<'div'> {
    content: string,
}