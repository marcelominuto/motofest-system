"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export default function CreateClienteModal({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    cpf: "",
    cnh: "",
    telefone: "",
  });

  const formatarCPF = (valor) => {
    return valor
      .replace(/\D/g, "")
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4")
      .slice(0, 14);
  };

  const formatarTelefone = (valor) => {
    return valor
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "cpf") {
      setForm((prev) => ({ ...prev, cpf: formatarCPF(value) }));
    } else if (name === "telefone") {
      setForm((prev) => ({ ...prev, telefone: formatarTelefone(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.error || "Erro ao cadastrar cliente");
      }

      toast.success("Cliente criado com sucesso!");
      setForm({
        nome: "",
        email: "",
        cpf: "",
        cnh: "",
        telefone: "",
      });
      setOpen(false);
      onCreated();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="ml-auto mb-4 bg-red-600 hover:bg-red-700">
          + Novo Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Cliente</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div>
            <Label className="py-2">Nome</Label>
            <Input name="nome" value={form.nome} onChange={handleChange} />
          </div>
          <div>
            <Label className="py-2">CPF</Label>
            <Input
              name="cpf"
              value={form.cpf}
              onChange={handleChange}
              maxLength={14}
            />
          </div>
          <div>
            <Label className="py-2">CNH (opcional)</Label>
            <Input name="cnh" value={form.cnh} onChange={handleChange} />
          </div>
          <div>
            <Label className="py-2">E-mail (opcional)</Label>
            <Input name="email" value={form.email} onChange={handleChange} />
          </div>
          <div>
            <Label className="py-2">Telefone (opcional)</Label>
            <Input
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              maxLength={15}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSubmit} className="bg-green-600 text-white">
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
