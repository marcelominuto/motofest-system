"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EditMotoModal({ open, onClose, moto, onUpdated }) {
  const [form, setForm] = useState({
    nome: "",
    marcaId: "",
    ingressoId: "",
    quantidade: "",
    categoria: "",
    foto: "",
    cvs: "",
    cilindradas: "",
  });
  const [marcas, setMarcas] = useState([]);
  const [ingressos, setIngressos] = useState([]);

  useEffect(() => {
    if (moto) {
      setForm({
        nome: moto.nome,
        marcaId: moto.marcaId,
        ingressoId: moto.ingressoId,
        quantidade: moto.quantidade,
        categoria: moto.categoria,
        foto: moto.foto || "",
        cvs: moto.cvs || "",
        cilindradas: moto.cilindradas || "",
      });
    }
  }, [moto]);

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
    try {
      const res = await fetch(`/api/motos/${moto.id}`, {
        method: "PUT",
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
        throw new Error(err.error || "Erro ao atualizar moto");
      }

      toast.success("Moto atualizada com sucesso!");
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!moto) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Moto</DialogTitle>
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
              <option value="custom">Custom</option>
              <option value="scooter">Scooter</option>
              <option value="elétrica">Elétrica</option>
              <option value="trail">Trail</option>
              <option value="big trail">Big Trail</option>
              <option value="naked">Naked</option>
              <option value="street">Street</option>
              <option value="esportiva">Esportiva</option>
              <option value="super esportiva">Super Esportiva</option>
              <option value="touring">Touring</option>
            </select>
          </div>

          <div>
            <Label className="py-2">Link da Foto</Label>
            <Input
              name="foto"
              value={form.foto}
              onChange={handleChange}
              placeholder="https://exemplo.com/foto.jpg"
            />
          </div>

          <div>
            <Label className="py-2">CVS</Label>
            <Input
              name="cvs"
              value={form.cvs}
              onChange={handleChange}
              placeholder="Ex: 125cv"
            />
          </div>

          <div>
            <Label className="py-2">Cilindradas</Label>
            <Input
              name="cilindradas"
              value={form.cilindradas}
              onChange={handleChange}
              placeholder="Ex: 150cc"
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
