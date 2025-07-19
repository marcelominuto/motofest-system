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

export default function EditClienteModal({
  open,
  onClose,
  cliente,
  onUpdated,
}) {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    cpf: "",
    cnh: "",
    telefone: "",
  });

  useEffect(() => {
    if (cliente) {
      setForm({
        nome: cliente.nome,
        email: cliente.email || "",
        cpf: formatarCPF(cliente.cpf),
        cnh: cliente.cnh || "",
        telefone: formatarTelefone(cliente.telefone || ""),
      });
    }
  }, [cliente]);

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
      const res = await fetch(`/api/clientes/${cliente.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.error || "Erro ao atualizar cliente");
      }

      toast.success("Cliente atualizado com sucesso!");
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!cliente) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
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
            <Label className="py-2">CNH</Label>
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
