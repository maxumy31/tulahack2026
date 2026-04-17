export default function WaitingMessage({ }: WaitingMessageProps) {
    return (<>

        <div className="chat chat-start">
            <div className="chat-bubble chat-bubble-primary">Пожалуйста, подождите. Сейчас вам ответят 
                <span className="loading loading-dots loading-sm mx-2">
            </span></div>
        </div>

    </>)
}

interface WaitingMessageProps extends React.HTMLProps<'div'> {
}