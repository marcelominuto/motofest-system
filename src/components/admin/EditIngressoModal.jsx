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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EditIngressoModal({
  open,
  onClose,
  ingresso,
  onUpdated,
}) {
  const [form, setForm] = useState({
    tipo: "",
    categoria: "",
    valor: "",
    valor1: "",
    valor2: "",
    valor3: "",
    limite: "",
    descricao: "",
  });

  useEffect(() => {
    if (ingresso) {
      setForm({
        tipo: ingresso.tipo,
        categoria: ingresso.categoria,
        valor: ingresso.valor ?? "",
        valor1: ingresso.valor1 ?? "",
        valor2: ingresso.valor2 ?? "",
        valor3: ingresso.valor3 ?? "",
        limite: ingresso.limite ?? "",
        descricao: ingresso.descricao ?? "",
      });
    }
  }, [ingresso]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        tipo: form.tipo,
        categoria: form.categoria,
        descricao: form.descricao || null,
        limite: form.limite ? parseInt(form.limite) : null,
      };

      if (form.categoria === "normal") {
        payload.valor = parseFloat(form.valor);
      } else {
        payload.valor1 = parseFloat(form.valor1);
        payload.valor2 = parseFloat(form.valor2);
        payload.valor3 = parseFloat(form.valor3);
      }

      const res = await fetch(`/api/ingressos/${ingresso.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao atualizar ingresso");

      toast.success("Ingresso atualizado com sucesso!");
      onUpdated();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar ingresso");
    }
  };

  if (!ingresso) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Ingresso</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div>
            <Label className="py-2">Tipo</Label>
            <Input name="tipo" value={form.tipo} onChange={handleChange} />
          </div>

          <div>
            <Label className="py-2">Categoria</Label>
            <Select
              value={form.categoria}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, categoria: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="test ride">Test Ride</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.categoria === "normal" && (
            <div>
              <Label className="py-2">Valor (R$)</Label>
              <Input
                name="valor"
                type="number"
                value={form.valor}
                onChange={handleChange}
              />
            </div>
          )}

          {form.categoria === "test ride" && (
            <>
              <div>
                <Label className="py-2">Valor para 1 moto</Label>
                <Input
                  name="valor1"
                  type="number"
                  value={form.valor1}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label className="py-2">Valor para 2 motos</Label>
                <Input
                  name="valor2"
                  type="number"
                  value={form.valor2}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label className="py-2">Valor para 3 motos</Label>
                <Input
                  name="valor3"
                  type="number"
                  value={form.valor3}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <div>
            <Label className="py-2">Limite (opcional)</Label>
            <Input
              name="limite"
              type="number"
              value={form.limite}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label className="py-2">Descrição</Label>
            <Input
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
