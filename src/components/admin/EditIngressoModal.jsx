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
    link: "",
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
        link: ingresso.link ?? "",
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
        if (form.link) payload.link = form.link;
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
            <select
              value={form.categoria}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, categoria: e.target.value }))
              }
              className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
            >
              <option value="">Selecione a categoria</option>
              <option value="normal">Normal</option>
              <option value="test ride">Test Ride</option>
            </select>
          </div>

          {form.categoria === "normal" && (
            <>
              <div>
                <Label className="py-2">Valor (R$)</Label>
                <Input
                  name="valor"
                  type="number"
                  value={form.valor}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label className="py-2">Link para compra (opcional)</Label>
                <Input
                  name="link"
                  type="url"
                  value={form.link}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
            </>
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
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
