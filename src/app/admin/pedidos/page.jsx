"use client";
import { useEffect, useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [pedidoParaCancelar, setPedidoParaCancelar] = useState(null);

  useEffect(() => {
    async function fetchPedidos() {
      setLoading(true);
      setErro("");
      try {
        const res = await fetch("/api/pedidos");
        if (!res.ok) throw new Error("Erro ao buscar pedidos");
        const data = await res.json();
        setPedidos(data);
      } catch (err) {
        setErro("Não foi possível carregar os pedidos.");
      } finally {
        setLoading(false);
      }
    }
    fetchPedidos();
  }, []);

  const router = useRouter();

  const handleCancelar = async (pedidoId) => {
    console.log("Tentando cancelar pedido:", pedidoId);
    try {
      const res = await fetch(`/api/pedidos/${pedidoId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao cancelar pedido");
      const resAtualizado = await fetch("/api/pedidos");
      if (resAtualizado.ok) {
        const data = await resAtualizado.json();
        setPedidos(data);
      }
      setPedidoParaCancelar(null);
      toast.success("Pedido cancelado com sucesso!");
    } catch (err) {
      setPedidoParaCancelar(null);
      toast.error("Erro ao cancelar pedido");
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "codigo",
        header: "Código",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-blue-700">
            {row.original.codigo}
          </span>
        ),
      },
      {
        accessorKey: "cliente",
        header: "Cliente",
        cell: ({ row }) => row.original.cliente?.nome || "-",
      },
      {
        accessorKey: "valor",
        header: "Valor",
        cell: ({ row }) =>
          `R$ ${Number(row.original.valor).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}`,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          let badgeClass = "capitalize";
          if (status === "pago")
            badgeClass += " border-green-600 text-green-700";
          else badgeClass += " border-orange-500 text-orange-600";
          return (
            <Badge variant="outline" className={badgeClass}>
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: "metodoPagamento",
        header: "Método",
        cell: ({ row }) =>
          row.original.metodoPagamento
            ? row.original.metodoPagamento.toUpperCase()
            : "-",
      },
      {
        accessorKey: "createdAt",
        header: "Data",
        cell: ({ row }) =>
          row.original.createdAt
            ? format(new Date(row.original.createdAt), "dd/MM/yyyy HH:mm")
            : "-",
      },
      {
        id: "acoes",
        header: "Ações",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/admin/pedidos/${row.original.id}`)}
            >
              Visualizar
            </Button>
            <Dialog
              open={pedidoParaCancelar?.id === row.original.id}
              onOpenChange={(open) => {
                if (open)
                  console.log("Abrindo modal para cancelar", row.original.id);
                setPedidoParaCancelar(open ? row.original : null);
              }}
            >
              {row.original.status !== "cancelado" && (
                <DialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    Cancelar
                  </Button>
                </DialogTrigger>
              )}
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancelar pedido</DialogTitle>
                </DialogHeader>
                <div className="mb-4">
                  Tem certeza que deseja cancelar este pedido? Todos os
                  agendamentos vinculados serão excluídos, mas o pedido
                  permanecerá com status <b>cancelado</b>.
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setPedidoParaCancelar(null)}
                  >
                    Não cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      console.log(
                        "Cliquei no botão de cancelar do modal",
                        row.original.id
                      );
                      handleCancelar(row.original.id);
                    }}
                  >
                    Cancelar pedido
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Pedidos</h1>
      {loading ? (
        <div>Carregando...</div>
      ) : erro ? (
        <div className="text-red-600">{erro}</div>
      ) : (
        <DataTable
          columns={columns}
          data={pedidos}
          searchPlaceholder="Buscar por cliente ou código..."
        />
      )}
    </div>
  );
}
