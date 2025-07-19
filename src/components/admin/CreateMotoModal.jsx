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
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CreateMotoModal({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [marcas, setMarcas] = useState([]);
  const [ingressos, setIngressos] = useState([]);
  const [form, setForm] = useState({
    nome: "",
    marcaId: "",
    ingressoId: "",
    quantidade: "",
    categoria: "",
  });

  useEffect(() => {
    if (open) {
      Promise.all([
        fetch("/api/marcas").then((res) => res.json()),
        fetch("/api/ingressos").then((res) => res.json()),
      ]).then(([marcasData, ingressosData]) => {
        setMarcas(marcasData);
        setIngressos(ingressosData);
      });
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (
      !form.nome ||
      !form.marcaId ||
      !form.ingressoId ||
      !form.quantidade ||
      !form.categoria
    ) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      const res = await fetch("/api/motos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          quantidade: parseInt(form.quantidade),
          marcaId: parseInt(form.marcaId),
          ingressoId: parseInt(form.ingressoId),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao cadastrar moto");
      }

      toast.success("Moto cadastrada com sucesso!");
      setOpen(false);
      setForm({
        nome: "",
        marcaId: "",
        ingressoId: "",
        quantidade: "",
        categoria: "",
      });
      onCreated();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4 bg-red-600 hover:bg-red-700">
          + Nova Moto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Moto</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label className="py-2">Marca</Label>
            <select
              name="marcaId"
              className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
              value={form.marcaId}
              onChange={handleChange}
            >
              <option value="">Selecione</option>
              {marcas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="py-2">Ingresso</Label>
            <select
              name="ingressoId"
              className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
              value={form.ingressoId}
              onChange={handleChange}
            >
              <option value="">Selecione</option>
              {ingressos.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.tipo} ({i.categoria})
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="py-2">Modelo</Label>
            <Input name="nome" value={form.nome} onChange={handleChange} />
          </div>

          <div>
            <Label className="py-2">Quantidade</Label>
            <Input
              name="quantidade"
              type="number"
              value={form.quantidade}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label className="py-2">Categoria</Label>
            <select
              name="categoria"
              className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
              value={form.categoria}
              onChange={handleChange}
            >
              <option value="">Selecione</option>
              <option value="pista">Pista</option>
              <option value="scooter">Scooter</option>
              <option value="elétrica">Elétrica</option>
              <option value="off-road">Off-road</option>
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
