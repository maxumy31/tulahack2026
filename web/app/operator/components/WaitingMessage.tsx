export default function WaitingMessage({ }: WaitingMessageProps) {
    return (<>

        <div className="text-center">
            Пользователь ожидает вашего ответа
        </div>

    </>)
}

interface WaitingMessageProps extends React.HTMLProps<'div'> {
}