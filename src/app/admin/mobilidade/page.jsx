"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import CreateMobilidadeModal from "@/components/admin/CreateMobilidadeModal";
import EditMobilidadeModal from "@/components/admin/EditMobilidadeModal";
import DeleteMobilidadeButton from "@/components/admin/DeleteMobilidadeButton";
import * as XLSX from "xlsx";

export default function MobilidadeAdminPage() {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [editId, setEditId] = useState(null);
  const [editMarcas, setEditMarcas] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [tableRef, setTableRef] = useState(null);

  async function fetchDados() {
    setLoading(true);
    setErro("");
    try {
      const res = await fetch("/api/mobilidade", { credentials: "include" });
      if (!res.ok) throw new Error("Erro ao buscar dados");
      const data = await res.json();
      setDados(Array.isArray(data) ? data : data.mobilidades || []);
    } catch (err) {
      setErro("Erro ao carregar dados de mobilidade");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDados();
  }, []);

  const handleEdit = (row) => {
    setEditId(row.id);
    setEditMarcas(
      Array.isArray(row.marcas)
        ? row.marcas.join(", ")
        : row.marcas
          ? JSON.parse(row.marcas).join(", ")
          : ""
    );
  };

  const handleSave = async (row) => {
    const marcasArr = editMarcas
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    try {
      const res = await fetch("/api/mobilidade", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: row.id, marcas: marcasArr }),
      });
      if (!res.ok) throw new Error();
      toast.success("Registro atualizado!");
      setEditId(null);
      fetchDados();
    } catch {
      toast.error("Erro ao atualizar registro");
    }
  };

  function exportarParaExcel(table) {
    const rows = table.getFilteredRowModel().rows;
    if (!rows.length) return;
    const dataExport = rows.map((row) => ({
      Nome: row.original.cliente?.nome || "-",
      CPF: row.original.cliente?.cpf || "-",
      CNH: row.original.cliente?.cnh || "-",
      Marcas: Array.isArray(row.original.marcas)
        ? row.original.marcas.join(", ")
        : row.original.marcas
          ? JSON.parse(row.original.marcas).join(", ")
          : "-",
    }));
    const ws = XLSX.utils.json_to_sheet(dataExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mobilidade");
    XLSX.writeFile(wb, "mobilidade.xlsx");
  }

  const columns = [
    {
      accessorKey: "cliente.nome",
      header: "Nome",
      cell: ({ row }) => row.original.cliente?.nome || "-",
    },
    {
      accessorKey: "cliente.cpf",
      header: "CPF",
      cell: ({ row }) => row.original.cliente?.cpf || "-",
    },
    {
      accessorKey: "cliente.cnh",
      header: "CNH",
      cell: ({ row }) => row.original.cliente?.cnh || "-",
    },
    {
      accessorKey: "marcas",
      header: "Marcas",
      cell: ({ row }) =>
        editId === row.original.id ? (
          <Input
            value={editMarcas}
            onChange={(e) => setEditMarcas(e.target.value)}
            className="w-56"
          />
        ) : Array.isArray(row.original.marcas) ? (
          row.original.marcas.join(", ")
        ) : row.original.marcas ? (
          JSON.parse(row.original.marcas).join(", ")
        ) : (
          "-"
        ),
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditRow(row.original);
              setEditOpen(true);
            }}
          >
            Editar
          </Button>
          <DeleteMobilidadeButton id={row.original.id} onDeleted={fetchDados} />
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-wrap gap-2 justify-between items-center">
        <Button
          className="bg-red-600 hover:bg-red-700 text-white"
          onClick={() => setCreateOpen(true)}
        >
          + Nova Mobilidade
        </Button>
      </div>
      <h1 className="text-2xl font-bold mb-6">Mobilidade Urbana</h1>
      {loading ? (
        <div>Carregando...</div>
      ) : erro ? (
        <div className="text-red-600">{erro}</div>
      ) : (
        <DataTable
          columns={columns}
          data={dados}
          searchPlaceholder="Buscar por nome, CPF, CNH ou marca..."
          extraActions={(table) => (
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => exportarParaExcel(table)}
            >
              Exportar Planilha
            </Button>
          )}
        />
      )}
      <CreateMobilidadeModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={fetchDados}
      />
      {editRow && (
        <EditMobilidadeModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onUpdated={fetchDados}
          mobilidade={editRow}
        />
      )}
    </div>
  );
}
