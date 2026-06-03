"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { X } from "lucide-react";
import { updateService } from "@/app/dashboard/services/actions";
import { useUIStore } from "@/store/useUIStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : "Salvar alterações"}
    </Button>
  );
}

export function EditServiceModal() {
  const editingService = useUIStore((s) => s.editingService);
  const closeEditService = useUIStore((s) => s.closeEditService);
  const formRef = useRef<HTMLFormElement>(null);

  if (!editingService) return null;

  const { id, name, description, durationMin, price } = editingService;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={closeEditService}
    >
      <div
        className="w-full max-w-md rounded-lg bg-card p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Editar serviço</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeEditService}
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form
          ref={formRef}
          key={id}
          action={async (formData) => {
            await updateService(id, formData);
            closeEditService();
          }}
          className="grid gap-4"
        >
          <div>
            <Label htmlFor="edit-name">Nome do serviço</Label>
            <Input
              id="edit-name"
              name="name"
              defaultValue={name}
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-description">Descrição</Label>
            <Input
              id="edit-description"
              name="description"
              defaultValue={description}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="edit-durationMin">Duração (min)</Label>
              <Input
                id="edit-durationMin"
                name="durationMin"
                type="number"
                min={5}
                defaultValue={durationMin}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-price">Preço (R$)</Label>
              <Input
                id="edit-price"
                name="price"
                type="number"
                min={0}
                step="0.01"
                defaultValue={price}
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <SubmitButton />
            <Button type="button" variant="outline" onClick={closeEditService}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
