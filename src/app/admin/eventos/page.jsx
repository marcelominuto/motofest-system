"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import EditEventoModal from "@/components/admin/EditEventoModal";
import DeleteEventoButton from "@/components/admin/DeleteEventoButton";

export default function AdminEventosPage() {
  const [eventos, setEventos] = useState([]);
  const [editingEvento, setEditingEvento] = useState(null);
  const [form, setForm] = useState({
    nome: "",
    dataInicio: null,
    dataFim: null,
  });
  const [loading, setLoading] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);

  const fetchEventos = async () => {
    const res = await fetch("/api/eventos");
    const data = await res.json();
    setEventos(data);
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/eventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          dataInicio: form.dataInicio?.toISOString(),
          dataFim: form.dataFim?.toISOString(),
        }),
      });

      if (!res.ok) throw new Error();

      toast.success("Evento criado com sucesso!");
      setForm({ nome: "", dataInicio: null, dataFim: null });
      setModalAberto(false);
      fetchEventos();
    } catch {
      toast.error("Erro ao criar evento");
    }
  };

  const ativarEvento = async (id, eventoData) => {
    setLoading(true);
    try {
      await fetch(`/api/eventos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...eventoData, ativo: true }),
      });
      toast.success("Evento ativado");
      fetchEventos();
    } catch {
      toast.error("Erro ao ativar evento");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      accessorKey: "nome",
      header: "Nome",
    },
    {
      accessorKey: "dataInicio",
      header: "Início",
      cell: ({ row }) => row.original.dataInicio.split("T")[0],
    },
    {
      accessorKey: "dataFim",
      header: "Fim",
      cell: ({ row }) => row.original.dataFim.split("T")[0],
    },
    {
      accessorKey: "ativo",
      header: "Status",
      cell: ({ row }) =>
        row.original.ativo ? (
          <span className="text-green-600">Ativo</span>
        ) : (
          "Inativo"
        ),
    },
    {
      id: "acoes",
      header: "Ações",
      cell: ({ row }) => {
        const evento = row.original;
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setEditingEvento(evento)}
            >
              Editar
            </Button>
            {!evento.ativo && (
              <Button
                size="sm"
                className="bg-green-600 text-white"
                disabled={loading}
                onClick={() => ativarEvento(evento.id, evento)}
              >
                Ativar
              </Button>
            )}
            <DeleteEventoButton id={evento.id} onDeleted={fetchEventos} />
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogTrigger asChild>
          <Button className="mb-4 bg-red-600 hover:bg-red-700">
            + Novo Evento
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Novo Evento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Nome do evento"
              value={form.nome}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, nome: e.target.value }))
              }
            />
            <div>
              <label className="block text-sm mb-1">Data de Início</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    {form.dataInicio
                      ? format(form.dataInicio, "dd/MM/yyyy")
                      : "Selecionar..."}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0">
                  <Calendar
                    mode="single"
                    selected={form.dataInicio}
                    onSelect={(date) =>
                      setForm((prev) => ({ ...prev, dataInicio: date }))
                    }
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="block text-sm mb-1">Data de Fim</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    {form.dataFim
                      ? format(form.dataFim, "dd/MM/yyyy")
                      : "Selecionar..."}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0">
                  <Calendar
                    mode="single"
                    selected={form.dataFim}
                    onSelect={(date) =>
                      setForm((prev) => ({ ...prev, dataFim: date }))
                    }
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              className="bg-green-600 text-white hover:bg-green-700"
              onClick={handleCreate}
            >
              Criar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <h1 className="text-2xl font-bold mb-6">Eventos</h1>
      <DataTable
        columns={columns}
        data={eventos}
        searchPlaceholder="Buscar por nome do evento..."
      />

      <EditEventoModal
        evento={editingEvento}
        open={!!editingEvento}
        onClose={() => setEditingEvento(null)}
        onUpdated={fetchEventos}
      />
    </div>
  );
}
