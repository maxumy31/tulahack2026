import clsx from "clsx"

export default function Button(
    {
        buttonType = "ghost", 
        children,
        className,
        ...props
    } : ButtonProps) {
    return(
    <>
        <button 
        {...props} 
        className={clsx(
            className,
            "btn border-primary rounded-[20px] py-4 h-16",
            "transition-all duration-500 ease-in-out font-weight-[400]",
            "text-primary hover:text-primary-content hover:bg-primary",
            buttonType === "ghost" ? "btn-ghost" : ""
        )}
        >
            {children}
        </button>
    </>)
}

export interface ButtonProps extends React.ComponentProps<'button'> {
    buttonType? : ButtonType,
    children: React.ReactNode
}

type ButtonType = "ghost"