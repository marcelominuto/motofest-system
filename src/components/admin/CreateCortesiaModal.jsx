"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function CreateCortesiaModal({
  open,
  onClose,
  onCreated,
  marcas,
}) {
  const [marcaId, setMarcaId] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!quantidade || quantidade < 1) {
      toast.error("Informe uma quantidade válida");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/cortesias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        marcaId: marcaId === "org" ? null : marcaId,
        quantidade: Number(quantidade),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error || "Erro ao criar cortesias");
      return;
    }
    toast.success("Cortesias criadas com sucesso!");
    onClose();
    onCreated();
    setMarcaId("");
    setQuantidade(1);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Cortesia</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div>
            <Label className="mb-1">Marca</Label>
            <select
              value={marcaId}
              onChange={(e) => setMarcaId(e.target.value)}
              className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive"
            >
              <option value="">Selecione uma marca</option>
              <option value="org">Organização</option>
              {marcas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="mb-1">Quantidade de códigos</Label>
            <Input
              type="number"
              min={1}
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              className="h-9 text-base"
            />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white px-8 h-11 text-lg"
            disabled={loading}
          >
            Criar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
