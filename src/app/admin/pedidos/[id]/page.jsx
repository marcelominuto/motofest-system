"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function PedidoDetalhePage() {
  const { id } = useParams();
  const router = useRouter();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [cancelando, setCancelando] = useState(false);
  const [modalCancelar, setModalCancelar] = useState(false);
  const [enviandoEmail, setEnviandoEmail] = useState(false);

  useEffect(() => {
    async function fetchPedido() {
      setLoading(true);
      setErro("");
      try {
        const res = await fetch(`/api/pedidos/${id}`);
        if (!res.ok) throw new Error("Erro ao buscar pedido");
        const data = await res.json();
        setPedido(data);
      } catch (err) {
        setErro("Não foi possível carregar o pedido.");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchPedido();
  }, [id]);

  const handleCancelar = async () => {
    setCancelando(true);
    try {
      const res = await fetch(`/api/pedidos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao cancelar pedido");
      setPedido((prev) =>
        prev ? { ...prev, status: "cancelado", agendamentos: [] } : prev
      );
      setModalCancelar(false);
      toast.success("Pedido cancelado com sucesso!");
    } catch (err) {
      setModalCancelar(false);
      toast.error("Erro ao cancelar pedido");
    } finally {
      setCancelando(false);
    }
  };

  const handleEnviarEmail = async () => {
    setEnviandoEmail(true);
    try {
      const res = await fetch(`/api/pedidos/${id}/enviar-email`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao enviar email");
      }

      toast.success("Email de confirmação enviado com sucesso!");
    } catch (err) {
      toast.error(err.message || "Erro ao enviar email");
    } finally {
      setEnviandoEmail(false);
    }
  };

  if (loading) return <div className="p-6">Carregando...</div>;
  if (erro) return <div className="p-6 text-red-600">{erro}</div>;
  if (!pedido) return <div className="p-6">Pedido não encontrado.</div>;

  const badgeClass =
    pedido.status === "pago"
      ? "capitalize border-green-600 text-green-700"
      : "capitalize border-orange-500 text-orange-600";

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        className="mb-4 text-blue-700 hover:underline text-sm"
        onClick={() => router.back()}
      >
        ← Voltar
      </button>
      <h1 className="text-2xl font-bold mb-2">Pedido {pedido.codigo}</h1>
      <div className="mb-4 flex items-center gap-4">
        <Badge variant="outline" className={badgeClass}>
          {pedido.status}
        </Badge>
        <span className="font-mono text-xs text-gray-500">
          {pedido.createdAt
            ? format(new Date(pedido.createdAt), "dd/MM/yyyy HH:mm")
            : "-"}
        </span>
      </div>
      <div className="mb-6 bg-gray-50 rounded-lg p-4 border">
        <div className="mb-2 font-semibold">Cliente</div>
        <div>
          <b>Nome:</b> {pedido.cliente?.nome || "-"}
        </div>
        <div>
          <b>Email:</b> {pedido.cliente?.email || "-"}
        </div>
        <div>
          <b>CPF:</b> {pedido.cliente?.cpf || "-"}
        </div>
      </div>
      <div className="mb-6">
        <div className="mb-2 font-semibold">Valor total</div>
        <div className="text-lg font-bold text-red-700">
          R${" "}
          {Number(pedido.valor).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}
        </div>
        <div className="mt-2 text-sm text-gray-700">
          <b>Método de pagamento:</b>{" "}
          {pedido.metodoPagamento ? pedido.metodoPagamento.toUpperCase() : "-"}
        </div>
      </div>
      <div className="mb-6 flex gap-2">
        <Button
          onClick={handleEnviarEmail}
          disabled={
            pedido.status === "cancelado" ||
            enviandoEmail ||
            !pedido.cliente?.email
          }
          className="bg-green-600 hover:bg-green-700"
        >
          {enviandoEmail ? "Enviando..." : "📧 Enviar Email de Confirmação"}
        </Button>

        <Dialog open={modalCancelar} onOpenChange={setModalCancelar}>
          <DialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={pedido.status === "cancelado"}
            >
              Cancelar pedido
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancelar pedido</DialogTitle>
            </DialogHeader>
            <div className="mb-4">
              Tem certeza que deseja cancelar este pedido? Todos os agendamentos
              vinculados serão excluídos, mas o pedido permanecerá com status{" "}
              <b>cancelado</b>.
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setModalCancelar(false)}
                disabled={cancelando}
              >
                Não cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelar}
                disabled={cancelando}
              >
                {cancelando ? "Cancelando..." : "Cancelar pedido"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div>
        <div className="mb-2 font-semibold">Agendamentos</div>
        {pedido.agendamentos?.length === 0 ? (
          <div className="text-gray-500">Nenhum agendamento vinculado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border bg-white rounded-lg shadow-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Moto</th>
                  <th className="px-4 py-2 text-left">Marca</th>
                  <th className="px-4 py-2 text-left">Data</th>
                  <th className="px-4 py-2 text-left">Horário</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {pedido.agendamentos.map((a) => (
                  <tr key={a.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{a.moto?.nome || "-"}</td>
                    <td className="px-4 py-2">{a.moto?.marca?.nome || "-"}</td>
                    <td className="px-4 py-2">
                      {(() => {
                        if (!a.data) return "-";
                        // Se vier só a data (YYYY-MM-DD)
                        if (
                          typeof a.data === "string" &&
                          a.data.length === 10
                        ) {
                          const [year, month, day] = a.data.split("-");
                          return `${day}/${month}/${year}`;
                        }
                        // Se vier ISO, extrai só a parte da data
                        if (typeof a.data === "string" && a.data.length > 10) {
                          const [year, month, day] = a.data
                            .split("T")[0]
                            .split("-");
                          return `${day}/${month}/${year}`;
                        }
                        // Se vier objeto Date
                        const d = new Date(a.data);
                        if (!isNaN(d)) {
                          return `${String(d.getUTCDate()).padStart(
                            2,
                            "0"
                          )}/${String(d.getUTCMonth() + 1).padStart(
                            2,
                            "0"
                          )}/${d.getUTCFullYear()}`;
                        }
                        return "-";
                      })()}
                    </td>
                    <td className="px-4 py-2">{a.horario?.hora || "-"}</td>
                    <td className="px-4 py-2">
                      <Badge
                        variant="outline"
                        className={
                          a.status === "pago"
                            ? "border-green-600 text-green-700"
                            : "border-orange-500 text-orange-600"
                        }
                      >
                        {a.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
