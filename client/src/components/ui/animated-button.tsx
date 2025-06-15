import { forwardRef } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps extends ButtonProps {
  animation?: "pulse" | "bounce" | "shake" | "glow" | "ripple";
  isLoading?: boolean;
}

const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, animation = "glow", isLoading = false, children, ...props }, ref) => {
    const animationClasses = {
      pulse: "hover:animate-pulse",
      bounce: "hover:animate-bounce",
      shake: "hover:animate-pulse active:animate-pulse",
      glow: "hover:shadow-lg hover:shadow-primary/25 transition-all duration-300",
      ripple: "relative overflow-hidden active:scale-95 transition-transform duration-150"
    };

    const loadingClass = isLoading ? "animate-pulse opacity-70 pointer-events-none" : "";

    return (
      <Button
        ref={ref}
        className={cn(
          animationClasses[animation],
          "transform transition-all duration-200 hover:scale-105 active:scale-95",
          loadingClass,
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <span className={isLoading ? "opacity-0" : ""}>{children}</span>
      </Button>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";

export { AnimatedButton };