"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import CreateClienteModal from "@/components/admin/CreateClienteModal";
import EditClienteModal from "@/components/admin/EditClienteModal";
import DeleteClienteButton from "@/components/admin/DeleteClienteButton";

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  const fetchClientes = async () => {
    const res = await fetch("/api/clientes");
    const data = await res.json();
    setClientes(data);
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const columns = [
    {
      accessorKey: "nome",
      header: "Nome",
      enableSorting: true,
    },
    {
      accessorKey: "cpf",
      header: "CPF",
      enableSorting: true,
    },
    {
      accessorKey: "cnh",
      header: "CNH",
    },
    {
      accessorKey: "email",
      header: "E-mail",
      cell: ({ row }) => row.original.email || "-",
    },
    {
      accessorKey: "telefone",
      header: "Telefone",
      cell: ({ row }) => row.original.telefone || "-",
    },
    {
      id: "acoes",
      header: "Ações",
      cell: ({ row }) => {
        const cliente = row.original;
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="text-xs text-blue-600 hover:underline p-0"
              onClick={() => {
                setClienteSelecionado(cliente);
                setModalAberto(true);
              }}
            >
              Editar
            </Button>
            <DeleteClienteButton id={cliente.id} onDeleted={fetchClientes} />
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <CreateClienteModal onCreated={fetchClientes} />
      <h1 className="text-2xl font-bold mb-6">Clientes</h1>

      <DataTable columns={columns} data={clientes} />

      <EditClienteModal
        open={modalAberto}
        cliente={clienteSelecionado}
        onClose={() => setModalAberto(false)}
        onUpdated={fetchClientes}
      />
    </div>
  );
}
