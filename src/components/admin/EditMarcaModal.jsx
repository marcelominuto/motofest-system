"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EditMarcaModal({ open, onClose, marca, onUpdated }) {
  const [nome, setNome] = useState("");

  useEffect(() => {
    if (marca) setNome(marca.nome);
  }, [marca]);

  const handleSubmit = async () => {
    if (!nome.trim()) return toast.error("Digite o nome");

    try {
      const res = await fetch(`/api/marcas/${marca.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar marca");

      toast.success("Marca atualizada com sucesso!");
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!marca) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Marca</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label className="py-2">Nome</Label>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
