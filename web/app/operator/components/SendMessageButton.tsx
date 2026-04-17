export default function SendMessageButton({ ...props }: SendMessageButtonProps) {
  return (
    <button 
      {...props} 
      className={`btn btn-primary text-primary-content group ${props.className || ''}`}
    >
      <svg 
        className="transition-transform duration-200 group-hover:scale-125" 
        xmlns="http://www.w3.org/2000/svg" 
        height="24px" 
        viewBox="0 -960 960 960" 
        width="24px" 
        fill="currentColor"
      >
        <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
      </svg>
    </button>
  );
}
interface SendMessageButtonProps extends React.ComponentProps<'button'> {
    
}