"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export default function CreateMarcaModal({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");

  const handleSubmit = async () => {
    if (!nome.trim()) return toast.error("Digite o nome da marca");

    try {
      const res = await fetch("/api/marcas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      });

      if (!res.ok) throw new Error("Erro ao criar marca");

      toast.success("Marca criada com sucesso!");
      setNome("");
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
          + Nova Marca
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Nova Marca</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label className="py-2">Nome</Label>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} />
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
