import { cn } from "@/lib/cn";
import { Button, type ButtonProps } from "./button";

export function IconButton({ className, children, ...props }: ButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={cn("text-text-tertiary hover:text-text-secondary", className)}
      {...props}
    >
      {children}
    </Button>
  );
}
