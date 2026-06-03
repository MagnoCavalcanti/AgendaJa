"use client";

import { Pencil } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import type { EditingService } from "@/store/useUIStore";
import { Button } from "@/components/ui/button";

export function EditServiceButton({ service }: { service: EditingService }) {
  const openEditService = useUIStore((s) => s.openEditService);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Editar serviço"
      onClick={() => openEditService(service)}
    >
      <Pencil className="h-4 w-4" />
    </Button>
  );
}
