// ============================================================================
// COMPONENTE UI: INPUT (campo de texto)
// Encapsula um <input> nativo com estilos consistentes do tema.
// ============================================================================

import * as React from "react";
import { cn } from "@/lib/utils";

// Aceita todos os atributos nativos de um <input>.
export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        // Classes de aparência + foco acessível; className permite ajustes pontuais.
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
