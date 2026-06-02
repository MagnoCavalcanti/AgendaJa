// ============================================================================
// COMPONENTE UI: LABEL (rótulo de formulário)
// Pequeno wrapper sobre <label> para manter tipografia consistente.
// ============================================================================

import * as React from "react";
import { cn } from "@/lib/utils";

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none mb-1.5 block",
      className
    )}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };
