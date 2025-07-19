"use client";

import { useEffect, useState, useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";
import CreateAgendamentoModal from "@/components/admin/CreateAgendamentoModal";
import EditAgendamentoModal from "@/components/admin/EditAgendamentoModal";
import DeleteAgendamentoModal from "@/components/admin/DeleteAgendamentoModal";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";

export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [excluindo, setExcluindo] = useState(null);
  // Filtros
  const [filtroData, setFiltroData] = useState("");
  const [filtroHorario, setFiltroHorario] = useState("");
  const [filtroMoto, setFiltroMoto] = useState("");
  const [filtroMarca, setFiltroMarca] = useState("");
  const [filtroCheckin, setFiltroCheckin] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [buscaCliente, setBuscaCliente] = useState("");

  // Opções únicas para filtros
  const opcoesData = useMemo(
    () =>
      Array.from(
        new Set(
          agendamentos
            .map((a) =>
              typeof a.data === "string" ? a.data.split("T")[0] : ""
            )
            .filter((v) => v && v !== "undefined" && v !== "null")
        )
      ).sort(),
    [agendamentos]
  );
  const opcoesHorario = useMemo(
    () =>
      Array.from(
        new Set(
          agendamentos
            .map((a) => a.horario?.hora)
            .filter(
              (v) => v !== null && v !== undefined && String(v).trim() !== ""
            )
        )
      ).sort(),
    [agendamentos]
  );
  const opcoesMarca = useMemo(
    () =>
      Array.from(
        new Set(
          agendamentos
            .map((a) => a.moto?.marca?.nome)
            .filter(
              (v) => v !== null && v !== undefined && String(v).trim() !== ""
            )
        )
      ).sort(),
    [agendamentos]
  );
  const opcoesMoto = useMemo(() => {
    let motos = agendamentos.map((a) => a.moto).filter(Boolean);
    if (filtroMarca) {
      motos = motos.filter((m) => m.marca?.nome === filtroMarca);
    }
    return Array.from(
      new Set(
        motos
          .map((m) => m.nome)
          .filter(
            (v) => v !== null && v !== undefined && String(v).trim() !== ""
          )
      )
    ).sort();
  }, [agendamentos, filtroMarca]);

  // Filtro aplicado
  const agendamentosFiltrados = useMemo(() => {
    return agendamentos.filter((a) => {
      if (buscaCliente) {
        const busca = buscaCliente.toLowerCase();
        const nome = a.cliente?.nome?.toLowerCase() || "";
        const cpf = a.cliente?.cpf?.replace(/\D/g, "") || "";
        if (!nome.includes(busca) && !cpf.includes(busca.replace(/\D/g, "")))
          return false;
      }
      if (
        filtroData &&
        (typeof a.data !== "string" || a.data.split("T")[0] !== filtroData)
      )
        return false;
      if (filtroHorario && a.horario?.hora !== filtroHorario) return false;
      if (filtroMarca && a.moto?.marca?.nome !== filtroMarca) return false;
      if (filtroMoto && a.moto?.nome !== filtroMoto) return false;
      if (filtroCheckin === "feitos" && !a.checkin) return false;
      if (filtroCheckin === "nao-feitos" && a.checkin) return false;
      if (filtroStatus === "pago" && a.status !== "pago") return false;
      if (filtroStatus === "cortesia" && a.status !== "cortesia") return false;
      return true;
    });
  }, [
    agendamentos,
    filtroData,
    filtroHorario,
    filtroMoto,
    filtroMarca,
    filtroCheckin,
    filtroStatus,
    buscaCliente,
  ]);

  const agendamentosOrdenados = [...agendamentosFiltrados].sort((a, b) => {
    // Ordena por data (asc), depois por horário (asc)
    const dataA = a.data;
    const dataB = b.data;
    if (dataA < dataB) return -1;
    if (dataA > dataB) return 1;
    // Se datas iguais, ordena por horário
    const horaA = a.horario?.hora || "";
    const horaB = b.horario?.hora || "";
    if (horaA < horaB) return -1;
    if (horaA > horaB) return 1;
    return 0;
  });

  const fetchAgendamentos = async () => {
    try {
      const res = await fetch("/api/agendamentos");
      const data = await res.json();
      setAgendamentos(data);
    } catch (err) {
      toast.error("Erro ao buscar agendamentos");
    }
  };

  useEffect(() => {
    fetchAgendamentos();
  }, []);

  const columns = [
    {
      accessorKey: "cliente",
      header: "Cliente",
      cell: ({ row }) => row.original.cliente?.nome || "-",
    },
    {
      accessorKey: "cpf",
      header: "CPF",
      cell: ({ row }) => row.original.cliente?.cpf || "-",
    },
    {
      accessorKey: "marca",
      header: "Marca",
      cell: ({ row }) => row.original.moto?.marca?.nome || "-",
    },
    {
      accessorKey: "moto",
      header: "Moto",
      cell: ({ row }) => row.original.moto?.nome || "-",
    },
    {
      accessorKey: "data",
      header: "Data",
      cell: ({ row }) => {
        const d = row.original.data;
        if (!d) return "-";
        // Extrai só a parte da data (YYYY-MM-DD)
        const dateStr = typeof d === "string" ? d.split("T")[0] : "";
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return "-";
        return format(new Date(dateStr + "T00:00:00"), "dd/MM/yy");
      },
    },
    {
      accessorKey: "horario",
      header: "Horário",
      cell: ({ row }) => row.original.horario?.hora || "-",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        let badgeClass = "capitalize";
        if (status === "pago") badgeClass += " border-green-600 text-green-700";
        else if (status === "cortesia")
          badgeClass += " border-orange-500 text-orange-600";
        return (
          <Badge variant="outline" className={badgeClass}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "checkin",
      header: "Check-in",
      cell: ({ row }) =>
        row.original.checkin ? (
          <CheckCircle
            className="text-green-600 h-5 w-5"
            title="Check-in realizado"
          />
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="text-green-700 border-green-400 hover:bg-green-50"
            onClick={async () => {
              await fetch(`/api/agendamentos/${row.original.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...row.original,
                  checkin: true,
                  clienteId: row.original.clienteId,
                  ingressoId: row.original.ingressoId,
                  motoId: row.original.motoId,
                  horarioId: row.original.horarioId,
                }),
              });
              fetchAgendamentos();
            }}
            title="Fazer check-in"
          >
            Fazer check-in
          </Button>
        ),
    },
    {
      accessorKey: "pedido",
      header: "Pedido",
      cell: ({ row }) => {
        const pedido = row.original.pedido;
        if (!pedido) return "-";
        return (
          <Badge
            variant="outline"
            className="border-blue-600 text-blue-700 font-mono text-xs px-2 py-0.5"
          >
            {pedido.codigo}
          </Badge>
        );
      },
    },
    {
      id: "acoes",
      header: "Ações",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setEditando(row.original)}
          >
            Editar
          </Button>
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => setExcluindo(row.original)}
          >
            Excluir
          </Button>
        </div>
      ),
    },
  ];

  const opcoesDataValidas = opcoesData.filter(
    (d) => d !== null && d !== undefined && String(d).trim() !== ""
  );
  const filtroDataSeguro =
    filtroData === "" || opcoesDataValidas.includes(filtroData)
      ? filtroData
      : "";
  const opcoesHorarioValidas = opcoesHorario.filter(
    (h) => h !== null && h !== undefined && String(h).trim() !== ""
  );
  const filtroHorarioSeguro =
    filtroHorario === "" || opcoesHorarioValidas.includes(filtroHorario)
      ? filtroHorario
      : "";
  const opcoesMarcaValidas = opcoesMarca.filter(
    (m) => m !== null && m !== undefined && String(m).trim() !== ""
  );
  const filtroMarcaSeguro =
    filtroMarca === "" || opcoesMarcaValidas.includes(filtroMarca)
      ? filtroMarca
      : "";
  const opcoesMotoValidas = opcoesMoto.filter(
    (m) => m !== null && m !== undefined && String(m).trim() !== ""
  );
  const filtroMotoSeguro =
    filtroMoto === "" || opcoesMotoValidas.includes(filtroMoto)
      ? filtroMoto
      : "";

  return (
    <div className="p-6">
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogTrigger asChild>
          <Button className="ml-auto mb-4 bg-red-600 hover:bg-red-700">
            + Novo Agendamento
          </Button>
        </DialogTrigger>
        <CreateAgendamentoModal
          open={modalAberto}
          onClose={() => setModalAberto(false)}
          onCreated={fetchAgendamentos}
        />
      </Dialog>

      <h1 className="text-2xl font-bold mb-6">Agendamentos</h1>

      {/* Filtros ao lado do input de busca do DataTable */}
      <DataTable
        columns={columns}
        data={agendamentosOrdenados}
        searchPlaceholder="Buscar por cliente, moto ou horário..."
        filters={
          <>
            {opcoesDataValidas.length === 0 ? null : (
              <div className="flex flex-col">
                <Label className="mb-1">Data</Label>
                <select
                  value={filtroData}
                  onChange={(e) => setFiltroData(e.target.value)}
                  className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                >
                  <option value="">Todas</option>
                  {opcoesDataValidas.map((d) => (
                    <option key={d} value={d}>
                      {/^\d{4}-\d{2}-\d{2}$/.test(d)
                        ? format(new Date(d + "T00:00:00"), "dd/MM/yy")
                        : d}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {opcoesHorarioValidas.length === 0 ? null : (
              <div className="flex flex-col">
                <Label className="mb-1">Horário</Label>
                <select
                  value={filtroHorario}
                  onChange={(e) => setFiltroHorario(e.target.value)}
                  className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                >
                  <option value="">Todos</option>
                  {opcoesHorarioValidas.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {opcoesMarcaValidas.length === 0 ? null : (
              <div className="flex flex-col">
                <Label className="mb-1">Marca</Label>
                <select
                  value={filtroMarca}
                  onChange={(e) => {
                    setFiltroMarca(e.target.value);
                    setFiltroMoto("");
                  }}
                  className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                >
                  <option value="">Todas</option>
                  {opcoesMarcaValidas.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {opcoesMotoValidas.length === 0 ? null : (
              <div className="flex flex-col">
                <Label className="mb-1">Moto</Label>
                <select
                  value={filtroMoto}
                  onChange={(e) => setFiltroMoto(e.target.value)}
                  className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive"
                >
                  <option value="">Todas</option>
                  {opcoesMotoValidas.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex flex-col">
              <Label className="mb-1">Status</Label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
              >
                <option value="">Todos</option>
                <option value="pago">Pago</option>
                <option value="cortesia">Cortesia</option>
              </select>
            </div>
            <div className="flex flex-col">
              <Label className="mb-1">Check-in</Label>
              <select
                value={filtroCheckin}
                onChange={(e) => setFiltroCheckin(e.target.value)}
                className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive"
              >
                <option value="">Todos</option>
                <option value="feitos">Feitos</option>
                <option value="nao-feitos">Não feitos</option>
              </select>
            </div>
          </>
        }
      />

      <EditAgendamentoModal
        open={!!editando}
        onClose={() => setEditando(null)}
        agendamento={editando}
        onUpdated={fetchAgendamentos}
      />
      <DeleteAgendamentoModal
        open={!!excluindo}
        onClose={() => setExcluindo(null)}
        agendamento={excluindo}
        onDeleted={fetchAgendamentos}
      />
    </div>
  );
}
