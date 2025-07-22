"use client";

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
import { useEffect, useState } from "react";

export default function CreateMobilidadeModal({ open, onClose, onCreated }) {
  const [clientes, setClientes] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [buscaCliente, setBuscaCliente] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [marcasSelecionadas, setMarcasSelecionadas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetch("/api/clientes")
        .then((r) => r.json())
        .then(setClientes);
      fetch("/api/marcas")
        .then((r) => r.json())
        .then(setMarcas);
      setBuscaCliente("");
      setClienteSelecionado(null);
      setMarcasSelecionadas([]);
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clienteSelecionado || marcasSelecionadas.length === 0) {
      toast.error("Selecione um cliente e pelo menos uma marca.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/mobilidade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          clienteId: clienteSelecionado.id,
          marcas: marcasSelecionadas.map((id) => {
            const m = marcas.find((x) => x.id === id);
            return m ? m.nome : id;
          }),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Cadastro de mobilidade criado!");
      onClose();
      onCreated();
    } catch {
      toast.error("Erro ao criar cadastro de mobilidade");
    } finally {
      setLoading(false);
    }
  };

  const handleMarcaChange = (id) => {
    setMarcasSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg max-h-[95vh] overflow-y-auto bg-white border border-gray-200 shadow-xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-6 text-center">
            Nova Mobilidade
          </DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-8 py-4" onSubmit={handleSubmit}>
          {/* Bloco Cliente */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col gap-3">
            <h3 className="text-lg font-bold mb-2 text-blue-700">
              Cliente <span className="text-red-500">*</span>
            </h3>
            <Label className="mb-1 text-base">
              Buscar Cliente (nome ou CPF)
            </Label>
            <Input
              className="h-11 text-base mb-2"
              value={buscaCliente}
              onChange={(e) => setBuscaCliente(e.target.value)}
              placeholder="Digite para buscar..."
            />
            {buscaCliente && (
              <div className="border p-2 rounded max-h-40 overflow-y-auto bg-white shadow text-base">
                {clientes
                  .filter(
                    (c) =>
                      c.nome
                        .toLowerCase()
                        .includes(buscaCliente.toLowerCase()) ||
                      c.cpf
                        .replace(/\D/g, "")
                        .includes(buscaCliente.replace(/\D/g, ""))
                  )
                  .map((c) => (
                    <div
                      key={c.id}
                      className="cursor-pointer hover:bg-gray-100 p-2 text-base"
                      onClick={() => {
                        setClienteSelecionado(c);
                        setBuscaCliente("");
                      }}
                    >
                      {c.nome} - {c.cpf}
                    </div>
                  ))}
              </div>
            )}
            {clienteSelecionado && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                <Input
                  readOnly
                  value={clienteSelecionado.nome}
                  className="h-10 text-base"
                />
                <Input
                  readOnly
                  value={clienteSelecionado.cpf}
                  className="h-10 text-base"
                />
                <Input
                  readOnly
                  value={clienteSelecionado.email || ""}
                  className="h-10 text-base"
                />
                <Input
                  readOnly
                  value={clienteSelecionado.telefone || ""}
                  className="h-10 text-base"
                />
                <Input
                  readOnly
                  value={clienteSelecionado.cnh || ""}
                  className="h-10 text-base"
                />
              </div>
            )}
          </div>
          {/* Bloco Marcas */}
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
          {/* Botão de salvar */}
          <div className="flex justify-end pt-8">
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white h-14 text-xl px-12 rounded-2xl shadow-lg flex items-center gap-3 font-bold"
              disabled={
                loading ||
                !clienteSelecionado ||
                marcasSelecionadas.length === 0
              }
            >
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
