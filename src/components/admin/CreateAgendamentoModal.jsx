"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { format } from "date-fns";

export default function CreateAgendamentoModal({ open, onClose, onCreated }) {
  const [clientes, setClientes] = useState([]);
  const [ingressos, setIngressos] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [motos, setMotos] = useState([]);
  const [datas, setDatas] = useState([]);
  const [buscaCliente, setBuscaCliente] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [usarCortesia, setUsarCortesia] = useState(false);
  const [horariosIndisponiveis, setHorariosIndisponiveis] = useState({});
  const [erroCortesia, setErroCortesia] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    ingressoId: "",
    agendamentos: [],
    cortesia: "",
    checkin: false,
  });

  const fetchBase = async () => {
    const [resClientes, resIngressos, resHorarios, resMotos, resEvento] =
      await Promise.all([
        fetch("/api/clientes").then((r) => r.json()),
        fetch("/api/ingressos").then((r) => r.json()),
        fetch("/api/horarios").then((r) => r.json()),
        fetch("/api/motos").then((r) => r.json()),
        fetch("/api/eventos/ativo").then((r) => r.json()),
      ]);

    setClientes(resClientes);
    setIngressos(resIngressos.filter((i) => i.categoria === "test ride"));
    setHorarios(resHorarios);

    const inicio = new Date(resEvento.dataInicio);
    const fim = new Date(resEvento.dataFim);
    const dias = [];
    for (let d = new Date(inicio); d <= fim; d.setDate(d.getDate() + 1)) {
      dias.push(new Date(d));
    }

    setDatas(dias);
    setMotos(resMotos);
  };

  useEffect(() => {
    if (open) {
      fetchBase();
      setForm({
        ingressoId: "",
        agendamentos: [],
        cortesia: "",
        checkin: false,
      });
      setBuscaCliente("");
      setClienteSelecionado(null);
      setUsarCortesia(false);
      setHorariosIndisponiveis({});
      setErroCortesia("");
    }
  }, [open]);

  const addMoto = () => {
    if (form.agendamentos.length >= 3) return;
    setForm((prev) => ({
      ...prev,
      agendamentos: [
        ...prev.agendamentos,
        { marcaId: "", motoId: "", data: "", horarioId: "" },
      ],
    }));
  };

  // Função para buscar horários indisponíveis para uma moto
  const buscarHorariosIndisponiveis = async (motoId, data) => {
    if (!motoId || !data) return;

    try {
      const response = await fetch(
        `/api/disponibilidade/todos?motoId=${motoId}&data=${data}`
      );
      if (response.ok) {
        const data = await response.json();
        setHorariosIndisponiveis((prev) => ({
          ...prev,
          [`${motoId}-${data.data.split("T")[0]}`]:
            data.horariosIndisponiveis.map((h) => h.horarioId),
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar horários indisponíveis:", error);
    }
  };

  const handleSubmit = async () => {
    if (loading) return;
    if (
      !clienteSelecionado ||
      !form.ingressoId ||
      form.agendamentos.length === 0 ||
      form.agendamentos.some(
        (a) => !a.marcaId || !a.motoId || !a.data || !a.horarioId
      )
    ) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    if (usarCortesia && !form.cortesia.trim()) {
      setErroCortesia("Preencha o código de cortesia");
      toast.error("Preencha o código de cortesia");
      return;
    } else {
      setErroCortesia("");
    }
    setLoading(true);
    try {
      const res = await fetch("/api/agendamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId: clienteSelecionado.id,
          ingressoId: form.ingressoId,
          cortesia: usarCortesia ? form.cortesia || null : null,
          agendamentos: form.agendamentos.map((a) => ({
            ...a,
            checkin: form.checkin,
          })),
          checkin: form.checkin,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        if (err.error && err.error.toLowerCase().includes("cortesia")) {
          setErroCortesia(err.error);
        }
        throw new Error(err.error || "Erro ao criar agendamento");
      }
      toast.success("Agendamento criado com sucesso!");
      onClose();
      onCreated();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[800px] !max-w-[800px] max-h-[95vh] overflow-y-auto bg-white border border-gray-200 shadow-xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-6 text-center">
            Novo Agendamento
          </DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col gap-8 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {/* Bloco Cliente */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col gap-3">
            <h3 className="text-lg font-bold mb-2 text-blue-700">
              Cliente <span className="text-red-500">*</span>
            </h3>
            <Label className="mb-1 text-base">
              Buscar Cliente (nome ou CPF)
            </Label>
            <Input
              className="h-11 text-base mb-2"
              value={buscaCliente}
              onChange={(e) => setBuscaCliente(e.target.value)}
              placeholder="Digite para buscar..."
            />
            {buscaCliente && (
              <div className="border p-2 rounded max-h-40 overflow-y-auto bg-white shadow text-base">
                {clientes
                  .filter(
                    (c) =>
                      c.nome
                        .toLowerCase()
                        .includes(buscaCliente.toLowerCase()) ||
                      c.cpf
                        .replace(/\D/g, "")
                        .includes(buscaCliente.replace(/\D/g, ""))
                  )
                  .map((c) => (
                    <div
                      key={c.id}
                      className="cursor-pointer hover:bg-gray-100 p-2 text-base"
                      onClick={() => {
                        setClienteSelecionado(c);
                        setBuscaCliente("");
                      }}
                    >
                      {c.nome} - {c.cpf}
                    </div>
                  ))}
              </div>
            )}
            {clienteSelecionado && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                <Input
                  readOnly
                  value={clienteSelecionado.nome}
                  className="h-10 text-base"
                />
                <Input
                  readOnly
                  value={clienteSelecionado.cpf}
                  className="h-10 text-base"
                />
                <Input
                  readOnly
                  value={clienteSelecionado.email || ""}
                  className="h-10 text-base"
                />
                <Input
                  readOnly
                  value={clienteSelecionado.telefone || ""}
                  className="h-10 text-base"
                />
              </div>
            )}
          </div>
          {/* Bloco Ingresso */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col gap-3">
            <h3 className="text-lg font-bold mb-2 text-blue-700">
              Ingresso <span className="text-red-500">*</span>
            </h3>
            <Label className="mb-1 text-base">Ingresso</Label>
            <select
              className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive mb-2"
              value={form.ingressoId}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, ingressoId: e.target.value }))
              }
              required
            >
              <option value="">Selecione um ingresso</option>
              {ingressos.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.tipo} — R$ {i.valor1} / {i.valor2} / {i.valor3}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-3 mt-2">
              <Switch
                checked={usarCortesia}
                onCheckedChange={setUsarCortesia}
              />
              <Label className="text-base">Usar código de cortesia</Label>
            </div>
            {usarCortesia && (
              <div className="mt-2">
                <Label className="mb-1 text-base">
                  Código de Cortesia <span className="text-red-500">*</span>
                </Label>
                <Input
                  className={`h-10 text-base ${
                    erroCortesia ? "border-red-500" : ""
                  }`}
                  value={form.cortesia}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, cortesia: e.target.value }));
                    setErroCortesia("");
                  }}
                />
                {erroCortesia && (
                  <div className="text-red-500 text-sm mt-1">
                    {erroCortesia}
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Bloco Motos */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col gap-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-blue-700">
                Motos Selecionadas <span className="text-red-500">*</span>
              </h3>
              <Button
                size="sm"
                onClick={addMoto}
                className="h-9 px-4 text-base bg-blue-600 text-white hover:bg-blue-700"
                type="button"
                disabled={form.agendamentos.length >= 3}
              >
                + Adicionar Moto
              </Button>
            </div>
            <div className="flex flex-col gap-5">
              {form.agendamentos.map((a, idx) => {
                const horariosOcupados = form.agendamentos
                  .filter(
                    (other, i) =>
                      i !== idx &&
                      other.data &&
                      a.data &&
                      other.data === a.data &&
                      other.horarioId
                  )
                  .map((h) => parseInt(h.horarioId));
                const motosFiltradas = a.marcaId
                  ? motos.filter((m) => m.marcaId === parseInt(a.marcaId))
                  : [];
                const chaveIndisponiveis =
                  a.motoId && a.data ? `${a.motoId}-${a.data}` : null;
                const horariosIndisponiveisMoto = chaveIndisponiveis
                  ? horariosIndisponiveis[chaveIndisponiveis] || []
                  : [];
                const horariosDesabilitados = [
                  ...new Set([
                    ...horariosOcupados,
                    ...horariosIndisponiveisMoto,
                  ]),
                ];
                return (
                  <div
                    key={idx}
                    className="relative bg-white border border-gray-300 rounded-xl shadow p-4 grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setForm((prev) => {
                          const ags = [...prev.agendamentos];
                          ags.splice(idx, 1);
                          return { ...prev, agendamentos: ags };
                        });
                      }}
                      className="absolute top-2 right-2 text-red-600 hover:text-red-800 font-bold text-xl leading-none z-10 bg-transparent border-none p-0 m-0"
                      title="Remover moto"
                    >
                      ×
                    </button>
                    <div>
                      <Label className="mb-1 text-base">
                        Marca <span className="text-red-500">*</span>
                      </Label>
                      <select
                        className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                        value={a.marcaId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm((prev) => {
                            const ags = [...prev.agendamentos];
                            ags[idx].marcaId = val;
                            ags[idx].motoId = "";
                            return { ...prev, agendamentos: ags };
                          });
                        }}
                        required
                      >
                        <option value="">Selecione</option>
                        {Array.from(
                          new Map(
                            motos
                              .filter((m) => m.marca && m.marca.id)
                              .map((m) => [m.marca.id, m.marca])
                          ).values()
                        ).map((marca) => (
                          <option key={marca.id} value={marca.id}>
                            {marca.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="mb-1 text-base">
                        Moto <span className="text-red-500">*</span>
                      </Label>
                      <select
                        className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                        value={a.motoId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm((prev) => {
                            const ags = [...prev.agendamentos];
                            ags[idx].motoId = val;
                            return { ...prev, agendamentos: ags };
                          });
                          if (val && a.data) {
                            buscarHorariosIndisponiveis(val, a.data);
                          }
                        }}
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
                      <Label className="mb-1 text-base">
                        Data <span className="text-red-500">*</span>
                      </Label>
                      <select
                        className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                        value={a.data}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm((prev) => {
                            const ags = [...prev.agendamentos];
                            ags[idx].data = val;
                            ags[idx].horarioId = "";
                            return { ...prev, agendamentos: ags };
                          });
                          if (val && a.motoId) {
                            buscarHorariosIndisponiveis(a.motoId, val);
                          }
                        }}
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
                      <Label className="mb-1 text-base">
                        Horário <span className="text-red-500">*</span>
                      </Label>
                      <select
                        className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                        value={a.horarioId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm((prev) => {
                            const ags = [...prev.agendamentos];
                            ags[idx].horarioId = val;
                            return { ...prev, agendamentos: ags };
                          });
                        }}
                        disabled={!a.data}
                        required
                      >
                        <option value="">Selecione</option>
                        {horarios.map((h) => {
                          const isOcupado = horariosOcupados.includes(h.id);
                          const isIndisponivel =
                            horariosIndisponiveisMoto.includes(h.id);
                          const isDesabilitado = horariosDesabilitados.includes(
                            h.id
                          );
                          return (
                            <option
                              key={h.id}
                              value={h.id}
                              disabled={isDesabilitado}
                            >
                              {h.hora}
                              {isOcupado ? " — Indisponível" : ""}
                              {isIndisponivel && !isOcupado
                                ? " — Esgotado"
                                : ""}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Check-in automático */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-4 flex items-center gap-3">
            <input
              type="checkbox"
              id="checkin-create"
              checked={form.checkin}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, checkin: e.target.checked }))
              }
              className="w-5 h-5 accent-green-600 border-2 border-gray-400 rounded focus:ring-2 focus:ring-green-400"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 text-green-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
            <Label
              htmlFor="checkin-create"
              className="text-base font-medium select-none cursor-pointer"
            >
              Fazer check-in automaticamente neste agendamento
            </Label>
          </div>
          {/* Resumo do agendamento */}
          <div className="bg-gray-100 border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col gap-2">
            <h3 className="text-lg font-bold mb-2 text-blue-700">
              Resumo do Agendamento
            </h3>
            <div>
              <b>Cliente:</b>{" "}
              {clienteSelecionado ? (
                clienteSelecionado.nome
              ) : (
                <span className="text-red-500">Não selecionado</span>
              )}
            </div>
            <div>
              <b>Ingresso:</b>{" "}
              {ingressos.find((i) => i.id == form.ingressoId)?.tipo || (
                <span className="text-red-500">Não selecionado</span>
              )}
            </div>
            <div>
              <b>Motos:</b>{" "}
              {form.agendamentos.length === 0 ? (
                <span className="text-red-500">Nenhuma selecionada</span>
              ) : (
                form.agendamentos.map((a, idx) => {
                  const moto = motos.find((m) => m.id == a.motoId);
                  const marca = moto?.marca?.nome;
                  // Formatar data para dd/mm/yyyy
                  let dataFormatada = "";
                  if (a.data && /^\d{4}-\d{2}-\d{2}$/.test(a.data)) {
                    const [y, m, d] = a.data.split("-");
                    dataFormatada = `${d}/${m}/${y}`;
                  }
                  return (
                    <div key={idx} className="ml-2">
                      {marca ? marca + " - " : ""}
                      {moto ? moto.nome : ""}{" "}
                      {dataFormatada ? `em ${dataFormatada}` : ""}{" "}
                      {a.horarioId
                        ? `às ${
                            horarios.find((h) => h.id == a.horarioId)?.hora
                          }`
                        : ""}
                    </div>
                  );
                })
              )}
            </div>
          </div>
          {/* Botão de salvar */}
          <div className="flex justify-end pt-8">
            <Button
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700 text-white h-14 text-xl px-12 rounded-2xl shadow-lg flex items-center gap-3 font-bold"
              type="submit"
              disabled={
                loading ||
                !clienteSelecionado ||
                !form.ingressoId ||
                form.agendamentos.length === 0 ||
                form.agendamentos.some(
                  (a) => !a.marcaId || !a.motoId || !a.data || !a.horarioId
                ) ||
                (usarCortesia && !form.cortesia.trim())
              }
            >
              {loading ? "Agendando..." : "Agendar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
