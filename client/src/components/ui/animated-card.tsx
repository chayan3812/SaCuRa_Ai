import { forwardRef } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
  animation?: "slide-up" | "slide-down" | "slide-left" | "slide-right" | "zoom" | "fade";
  hoverEffect?: "scale" | "lift" | "glow" | "none";
}

const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, delay = 0, animation = "fade", hoverEffect = "lift", children, ...props }, ref) => {
    const animationClasses = {
      "slide-up": "animate-in slide-in-from-bottom",
      "slide-down": "animate-in slide-in-from-top", 
      "slide-left": "animate-in slide-in-from-right",
      "slide-right": "animate-in slide-in-from-left",
      "zoom": "animate-in zoom-in",
      "fade": "animate-in fade-in"
    };

    const hoverClasses = {
      "scale": "hover:scale-105 transition-transform duration-300",
      "lift": "hover:shadow-xl hover:-translate-y-1 transition-all duration-300",
      "glow": "hover:shadow-lg hover:shadow-primary/25 transition-shadow duration-300",
      "none": ""
    };

    const delayClass = delay > 0 ? `delay-${delay}` : "";

    return (
      <Card
        ref={ref}
        className={cn(
          animationClasses[animation],
          hoverClasses[hoverEffect],
          "duration-500 cursor-pointer",
          delayClass,
          className
        )}
        {...props}
      >
        {children}
      </Card>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";

export { AnimatedCard };