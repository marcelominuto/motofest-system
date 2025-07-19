"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CreateCortesiaModal from "@/components/admin/CreateCortesiaModal";
import DeleteCortesiaButton from "@/components/admin/DeleteCortesiaButton";
import { Label } from "@/components/ui/label";

export default function CortesiasPage() {
  const [cortesias, setCortesias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [filtroMarca, setFiltroMarca] = useState("");
  const [filtroUtilizado, setFiltroUtilizado] = useState("");
  const [modalAberto, setModalAberto] = useState(false);

  const fetchCortesias = async () => {
    const params = [];
    if (filtroMarca) params.push(`marcaId=${filtroMarca}`);
    if (filtroUtilizado) params.push(`utilizado=${filtroUtilizado}`);
    const res = await fetch(
      `/api/cortesias${params.length ? "?" + params.join("&") : ""}`
    );
    const data = await res.json();
    setCortesias(data);
  };

  const fetchMarcas = async () => {
    const res = await fetch("/api/marcas");
    const data = await res.json();
    setMarcas(data);
  };

  useEffect(() => {
    fetchMarcas();
  }, []);

  useEffect(() => {
    fetchCortesias();
    // eslint-disable-next-line
  }, [filtroMarca, filtroUtilizado]);

  return (
    <div className="p-6">
      <div className="mb-4">
        <Button
          className="bg-red-600 text-white hover:bg-red-700"
          onClick={() => setModalAberto(true)}
        >
          + Nova Cortesia
        </Button>
      </div>
      <h1 className="text-2xl font-bold mb-6">Cortesias</h1>
      <div className="flex gap-4 mb-4">
        <div className="flex flex-col">
          <Label className="mb-1">Marca</Label>
          <select
            value={filtroMarca}
            onChange={(e) => setFiltroMarca(e.target.value)}
            className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-48 min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive"
          >
            <option value="">Todas</option>
            <option value="org">Organização</option>
            {marcas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <Label className="mb-1">Utilizado</Label>
          <select
            value={filtroUtilizado}
            onChange={(e) => setFiltroUtilizado(e.target.value)}
            className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-32 min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive"
          >
            <option value="">Todos</option>
            <option value="false">Não utilizados</option>
            <option value="true">Utilizados</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Código</th>
              <th className="border p-2">Marca</th>
              <th className="border p-2">Utilizado</th>
              <th className="border p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {cortesias.map((c) => (
              <tr key={c.id}>
                <td className="border p-2 font-mono">{c.codigo}</td>
                <td className="border p-2">
                  {c.marca ? (
                    c.marca.nome
                  ) : (
                    <span className="italic text-gray-500">Organização</span>
                  )}
                </td>
                <td className="border p-2">
                  {c.utilizado ? (
                    <Badge
                      className="border-green-600 text-green-700"
                      variant="outline"
                    >
                      Sim
                    </Badge>
                  ) : (
                    <Badge
                      className="border-orange-500 text-orange-600"
                      variant="outline"
                    >
                      Não
                    </Badge>
                  )}
                </td>
                <td className="border p-2">
                  <DeleteCortesiaButton id={c.id} onDeleted={fetchCortesias} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CreateCortesiaModal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        onCreated={fetchCortesias}
        marcas={marcas}
      />
    </div>
  );
}
