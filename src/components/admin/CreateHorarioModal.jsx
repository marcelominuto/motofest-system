"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export default function CreateHorarioModal({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [horaSelecionada, setHoraSelecionada] = useState("");
  const [minutoSelecionado, setMinutoSelecionado] = useState("");

  const handleSubmit = async () => {
    if (!horaSelecionada || !minutoSelecionado) {
      toast.error("Selecione hora e minuto.");
      return;
    }

    const hora = `${horaSelecionada}:${minutoSelecionado}`;

    try {
      const res = await fetch("/api/horarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hora }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao criar horário");
      }

      toast.success("Horário criado com sucesso!");
      setHoraSelecionada("");
      setMinutoSelecionado("");
      setOpen(false);
      onCreated();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4 bg-red-600 hover:bg-red-700">
          + Novo Horário
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Horário</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Label className="py-2">Selecione o horário</Label>
          <div className="flex gap-2">
            <select
              className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
              value={horaSelecionada}
              onChange={(e) => setHoraSelecionada(e.target.value)}
            >
              <option value="">Hora</option>
              {[...Array(10)].map((_, i) => {
                const h = (10 + i).toString().padStart(2, "0");
                return (
                  <option key={h} value={h}>
                    {h}
                  </option>
                );
              })}
            </select>

            <select
              className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
              value={minutoSelecionado}
              onChange={(e) => setMinutoSelecionado(e.target.value)}
            >
              <option value="">Minuto</option>
              <option value="00">00</option>
              <option value="30">30</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSubmit} className="bg-black text-white">
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
