"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EditEventoModal({ open, onClose, evento, onUpdated }) {
  const [form, setForm] = useState({
    nome: "",
    dataInicio: null,
    dataFim: null,
  });

  useEffect(() => {
    if (evento) {
      setForm({
        nome: evento.nome,
        dataInicio: new Date(evento.dataInicio),
        dataFim: new Date(evento.dataFim),
      });
    }
  }, [evento]);

  const handleSubmit = async () => {
    try {
      await fetch(`/api/eventos/${evento.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          dataInicio: form.dataInicio?.toISOString(),
          dataFim: form.dataFim?.toISOString(),
          ativo: evento.ativo,
        }),
      });

      toast.success("Evento atualizado com sucesso!");
      onUpdated();
      onClose();
    } catch {
      toast.error("Erro ao atualizar evento");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Evento</DialogTitle>
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
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
