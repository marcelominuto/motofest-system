"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CreateMarcaModal from "@/components/admin/CreateMarcaModal";
import EditMarcaModal from "@/components/admin/EditMarcaModal";
import DeleteMarcaButton from "@/components/admin/DeleteMarcaButton";

export default function MarcasPage() {
  const [marcas, setMarcas] = useState([]);
  const [marcaSelecionada, setMarcaSelecionada] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  const fetchMarcas = async () => {
    try {
      const res = await fetch("/api/marcas");
      const data = await res.json();
      setMarcas(data);
    } catch {
      toast.error("Erro ao buscar marcas");
    }
  };

  useEffect(() => {
    fetchMarcas();
  }, []);

  const columns = [
    {
      accessorKey: "nome",
      header: "Nome",
    },
    {
      id: "acoes",
      header: "Ações",
      cell: ({ row }) => {
        const marca = row.original;
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                setMarcaSelecionada(marca);
                setModalAberto(true);
              }}
            >
              Editar
            </Button>
            <DeleteMarcaButton id={marca.id} onDeleted={fetchMarcas} />
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      <CreateMarcaModal onCreated={fetchMarcas} />
      <h1 className="text-2xl font-bold mb-6">Marcas</h1>
      <DataTable
        columns={columns}
        data={marcas}
        searchPlaceholder="Buscar por nome da marca..."
      />

      <EditMarcaModal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        marca={marcaSelecionada}
        onUpdated={fetchMarcas}
      />
    </div>
  );
}
