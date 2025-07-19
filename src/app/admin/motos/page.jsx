"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CreateMotoModal from "@/components/admin/CreateMotoModal";
import EditMotoModal from "@/components/admin/EditMotoModal";
import DeleteMotoButton from "@/components/admin/DeleteMotoButton";

export default function MotosPage() {
  const [motos, setMotos] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [motoSelecionada, setMotoSelecionada] = useState(null);

  const fetchMotos = async () => {
    try {
      const res = await fetch("/api/motos");
      const data = await res.json();
      setMotos(data);
    } catch {
      toast.error("Erro ao buscar motos");
    }
  };

  useEffect(() => {
    fetchMotos();
  }, []);

  const columns = [
    {
      accessorKey: "marca",
      header: "Marca",
      cell: ({ row }) => row.original.marca?.nome || "-",
    },
    {
      accessorKey: "nome",
      header: "Modelo",
    },
    {
      accessorKey: "ingresso",
      header: "Ingresso",
      cell: ({ row }) => row.original.ingresso?.tipo || "-",
    },
    {
      accessorKey: "categoria",
      header: "Categoria",
    },
    {
      accessorKey: "quantidade",
      header: "Qtd disponível",
    },
    {
      id: "acoes",
      header: "Ações",
      cell: ({ row }) => {
        const moto = row.original;
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                setMotoSelecionada(moto);
                setModalAberto(true);
              }}
            >
              Editar
            </Button>
            <DeleteMotoButton id={moto.id} onDeleted={fetchMotos} />
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-4">
        <CreateMotoModal onCreated={fetchMotos} />
        <h1 className="text-2xl font-bold mb-6">Motos</h1>
      </div>

      <DataTable
        columns={columns}
        data={motos}
        searchPlaceholder="Buscar por marca, modelo, categoria ou ingresso..."
      />

      <EditMotoModal
        open={modalAberto}
        moto={motoSelecionada}
        onClose={() => setModalAberto(false)}
        onUpdated={fetchMotos}
      />
    </div>
  );
}
