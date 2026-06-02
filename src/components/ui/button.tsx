// ============================================================================
// COMPONENTE UI: BUTTON (estratégia copy-paste do ShadCN/UI)
// Botão acessível e estilizável por variantes, usando class-variance-authority
// (CVA) para mapear "variant" e "size" em classes Tailwind.
// ============================================================================

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Define as variações visuais do botão. "base" são as classes sempre aplicadas.
const buttonVariants = cva(
  // Classes base: layout, foco acessível, transição e estado desabilitado.
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      // Estilos de cor.
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      // Tamanhos.
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    // Variações usadas quando nenhuma é informada.
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Props = atributos nativos de <button> + as variantes definidas acima.
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

// forwardRef permite que componentes pais acessem o elemento <button> real.
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        // cn() junta as classes das variantes com classes extras passadas via prop.
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button"; // Nome amigável para o React DevTools.

export { Button, buttonVariants };
