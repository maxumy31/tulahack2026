import clsx from "clsx"

export default function Button(
    {
        buttonType = "ghost", 
        children,
        className,
        size,
        isInverted,
        ...props
    } : ButtonProps) {

    return(
    <>
        <button 
        {...props} 
        className={clsx(
            className,
            "btn border-primary rounded-[20px]",
            size === "lg" || size == null ? "py-4 h-16" : "",
            size === "md" ? "py-2 h-8" : "",
            "transition-all duration-500 ease-in-out font-weight-[400]",
            isInverted 
            ? "text-primary-content hover:text-primary hover:bg-primary-content"
            : "text-primary hover:text-primary-content hover:bg-primary",
            buttonType === "ghost" ? "btn-ghost" : ""
        )}
        >
            {children}
        </button>
    </>)
}

export interface ButtonProps extends React.ComponentProps<'button'> {
    buttonType? : ButtonType,
    size?: ButtonSize,
    isInverted?: boolean,
    children: React.ReactNode
}

type ButtonSize = "lg" | "md"
type ButtonType = "ghost"