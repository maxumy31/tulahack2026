export default function WaitingMessage(
    { 
        content = "Пользователь ожидает вашего ответа"
    }: WaitingMessageProps) {
    return (<>

        <div className="text-center">
            {content}
        </div>

    </>)
}

interface WaitingMessageProps extends React.HTMLProps<'div'> {
    content? : string
}