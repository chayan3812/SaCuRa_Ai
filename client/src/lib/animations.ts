import { cn } from "@/lib/utils";

// Animation utility classes for consistent animations across the dashboard
export const animations = {
  // Entrance animations
  fadeIn: "animate-in fade-in duration-500",
  slideUp: "animate-in slide-in-from-bottom duration-500",
  slideDown: "animate-in slide-in-from-top duration-500",
  slideLeft: "animate-in slide-in-from-right duration-500",
  slideRight: "animate-in slide-in-from-left duration-500",
  zoomIn: "animate-in zoom-in duration-500",
  
  // Hover effects
  lift: "hover:shadow-xl hover:-translate-y-1 transition-all duration-300",
  scale: "hover:scale-105 transition-transform duration-300",
  glow: "hover:shadow-lg hover:shadow-primary/25 transition-shadow duration-300",
  
  // Interactive states
  buttonPress: "active:scale-95 transition-transform duration-150",
  cardHover: "hover:shadow-md transition-shadow duration-200",
  
  // Loading states
  pulse: "animate-pulse",
  spin: "animate-spin",
  bounce: "animate-bounce",
  
  // Delays
  delay100: "delay-100",
  delay200: "delay-200",
  delay300: "delay-300",
  delay500: "delay-500",
  delay700: "delay-700",
} as const;

// Staggered animation helper
export function getStaggeredAnimation(index: number, baseAnimation: string = "animate-in fade-in duration-500") {
  const delay = index * 100;
  return cn(baseAnimation, `delay-${delay}`);
}

// Card animation preset
export function getCardAnimation(delay: number = 0) {
  return cn(
    "animate-in slide-in-from-bottom duration-500",
    "hover:shadow-lg hover:-translate-y-1 transition-all duration-300",
    delay > 0 && `delay-${delay}`
  );
}

// Button animation preset
export function getButtonAnimation() {
  return cn(
    "transform transition-all duration-200",
    "hover:scale-105 active:scale-95",
    "hover:shadow-lg hover:shadow-primary/25"
  );
}

// Floating animation for special elements
export function getFloatingAnimation() {
  return "animate-bounce";
}

// Notification animation preset
export function getNotificationAnimation(index: number = 0) {
  return cn(
    "animate-in slide-in-from-right duration-300",
    "hover:scale-105 transition-transform duration-200",
    `delay-${index * 150}`
  );
}