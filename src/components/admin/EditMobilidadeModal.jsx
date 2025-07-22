"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function EditMobilidadeModal({
  open,
  onClose,
  onUpdated,
  mobilidade,
}) {
  const [marcas, setMarcas] = useState([]);
  const [marcasSelecionadas, setMarcasSelecionadas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetch("/api/marcas")
        .then((r) => r.json())
        .then(setMarcas);
      setMarcasSelecionadas(
        Array.isArray(mobilidade.marcas)
          ? mobilidade.marcas
          : mobilidade.marcas
            ? JSON.parse(mobilidade.marcas)
            : []
      );
    }
  }, [open, mobilidade]);

  const handleMarcaChange = (id) => {
    setMarcasSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (marcasSelecionadas.length === 0) {
      toast.error("Selecione pelo menos uma marca.");
      return;
    }
    setLoading(true);
    try {
      const nomesMarcas = marcas
        .filter((m) => marcasSelecionadas.includes(m.id))
        .map((m) => m.nome);
      const res = await fetch("/api/mobilidade", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: mobilidade.id, marcas: nomesMarcas }),
      });
      if (!res.ok) throw new Error();
      toast.success("Registro atualizado!");
      onClose();
      if (onUpdated) onUpdated();
    } catch {
      toast.error("Erro ao atualizar registro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg max-h-[95vh] overflow-y-auto bg-white border border-gray-200 shadow-xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-6 text-center">
            Editar Mobilidade
          </DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-8 py-4" onSubmit={handleSubmit}>
          {/* Cliente (fixo) */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col gap-3">
            <h3 className="text-lg font-bold mb-2 text-blue-700">Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
              <input
                readOnly
                value={mobilidade.cliente?.nome || ""}
                className="h-10 text-base bg-gray-100 rounded px-2"
              />
              <input
                readOnly
                value={mobilidade.cliente?.cpf || ""}
                className="h-10 text-base bg-gray-100 rounded px-2"
              />
              <input
                readOnly
                value={mobilidade.cliente?.email || ""}
                className="h-10 text-base bg-gray-100 rounded px-2"
              />
              <input
                readOnly
                value={mobilidade.cliente?.telefone || ""}
                className="h-10 text-base bg-gray-100 rounded px-2"
              />
              <input
                readOnly
                value={mobilidade.cliente?.cnh || ""}
                className="h-10 text-base bg-gray-100 rounded px-2"
              />
            </div>
          </div>
          {/* Marcas */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col gap-3">
            <h3 className="text-lg font-bold mb-2 text-blue-700">
              Marcas de Interesse <span className="text-red-500">*</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {marcas.map((marca) => (
                <label
                  key={marca.id}
                  className="flex items-center gap-2 bg-gray-100 rounded px-2 py-1 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={marcasSelecionadas.includes(marca.id)}
                    onChange={() => handleMarcaChange(marca.id)}
                    className="accent-red-600"
                  />
                  <span>{marca.nome}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end pt-8">
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white h-14 text-xl px-12 rounded-2xl shadow-lg flex items-center gap-3 font-bold"
              disabled={loading || marcasSelecionadas.length === 0}
            >
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
