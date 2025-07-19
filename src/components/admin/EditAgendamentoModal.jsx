import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function EditAgendamentoModal({
  open,
  onClose,
  agendamento,
  onUpdated,
}) {
  const [form, setForm] = useState({
    marcaId: "",
    motoId: "",
    horarioId: "",
    data: "",
    status: "",
    checkin: false,
  });
  const [marcas, setMarcas] = useState([]);
  const [motos, setMotos] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [datas, setDatas] = useState([]);
  const [horariosIndisponiveis, setHorariosIndisponiveis] = useState([]);

  useEffect(() => {
    if (agendamento) {
      setForm({
        marcaId: agendamento.moto?.marcaId?.toString() || "",
        motoId: agendamento.motoId?.toString() || "",
        horarioId: agendamento.horarioId?.toString() || "",
        data: agendamento.data ? agendamento.data.split("T")[0] : "",
        checkin: agendamento.checkin || false,
      });
    }
  }, [agendamento]);

  useEffect(() => {
    if (open) {
      fetch("/api/marcas")
        .then((res) => res.json())
        .then(setMarcas);
      fetch("/api/motos")
        .then((res) => res.json())
        .then(setMotos);
      fetch("/api/horarios")
        .then((res) => res.json())
        .then(setHorarios);
      fetch("/api/eventos/ativo")
        .then((res) => res.json())
        .then((evento) => {
          if (evento?.dataInicio && evento?.dataFim) {
            const inicio = new Date(evento.dataInicio);
            const fim = new Date(evento.dataFim);
            const dias = [];
            for (
              let d = new Date(inicio);
              d <= fim;
              d.setDate(d.getDate() + 1)
            ) {
              dias.push(new Date(d));
            }
            setDatas(dias);
          }
        });
    }
  }, [open]);

  // Buscar horários indisponíveis sempre que motoId e data mudarem
  useEffect(() => {
    const buscarHorariosIndisponiveis = async () => {
      if (form.motoId && form.data) {
        try {
          const res = await fetch(
            `/api/disponibilidade/todos?motoId=${form.motoId}&data=${form.data}`
          );
          if (res.ok) {
            const data = await res.json();
            setHorariosIndisponiveis(
              data.horariosIndisponiveis.map((h) => h.horarioId)
            );
          }
        } catch (err) {
          setHorariosIndisponiveis([]);
        }
      } else {
        setHorariosIndisponiveis([]);
      }
    };
    buscarHorariosIndisponiveis();
  }, [form.motoId, form.data]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      // Se mudar a marca, limpa a moto
      if (name === "marcaId") {
        return { ...prev, marcaId: value, motoId: "" };
      }
      return {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/agendamentos/${agendamento.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          motoId: parseInt(form.motoId, 10),
          horarioId: parseInt(form.horarioId, 10),
          data: form.data, // já está no formato yyyy-MM-dd
          clienteId: agendamento.clienteId,
          ingressoId: agendamento.ingressoId,
        }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar agendamento");
      toast.success("Agendamento atualizado com sucesso!");
      onUpdated && onUpdated();
      onClose();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!agendamento) return null;

  // Filtra motos pela marca selecionada
  const motosFiltradas = form.marcaId
    ? motos.filter((m) => m.marcaId === parseInt(form.marcaId))
    : [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Agendamento</DialogTitle>
        </DialogHeader>
        <form className="grid gap-4 py-4" onSubmit={handleSubmit}>
          <div>
            <Label className="mb-1">Cliente</Label>
            <Input value={agendamento.cliente?.nome || ""} disabled />
          </div>
          <div>
            <Label className="mb-1">Marca</Label>
            <select
              name="marcaId"
              className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
              value={form.marcaId}
              onChange={handleChange}
              required
            >
              <option value="">Selecione</option>
              {marcas.map((marca) => (
                <option key={marca.id} value={marca.id}>
                  {marca.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="mb-1">Moto</Label>
            <select
              name="motoId"
              className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
              value={form.motoId}
              onChange={handleChange}
              required
            >
              <option value="">Selecione</option>
              {motosFiltradas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="mb-1">Data</Label>
            <select
              name="data"
              className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
              value={form.data}
              onChange={handleChange}
              required
            >
              <option value="">Selecione</option>
              {datas.map((d) => {
                const f = format(d, "dd/MM/yyyy");
                const iso = d.toISOString().split("T")[0];
                return (
                  <option key={iso} value={iso}>
                    {f}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <Label className="mb-1">Horário</Label>
            <select
              name="horarioId"
              className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
              value={form.horarioId}
              onChange={handleChange}
              required
              disabled={!form.data || !form.motoId}
            >
              <option value="">Selecione</option>
              {horarios.map((h) => {
                const isIndisponivel = horariosIndisponiveis.includes(h.id);
                return (
                  <option key={h.id} value={h.id} disabled={isIndisponivel}>
                    {h.hora}
                    {isIndisponivel ? " — Esgotado" : ""}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="checkin"
              checked={form.checkin}
              onChange={handleChange}
              id="checkin-edit"
            />
            <Label htmlFor="checkin-edit">Check-in realizado</Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
