"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  Bike,
  AlertTriangle,
  CheckCircle,
  XCircle,
  CalendarDays,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function DisponibilidadePage() {
  // Estados para filtros
  const [data, setData] = useState("");
  const [marcaSelecionada, setMarcaSelecionada] = useState("");
  const [modeloSelecionado, setModeloSelecionado] = useState("");
  const [tipoIngressoSelecionado, setTipoIngressoSelecionado] = useState("");

  // Estados para dados
  const [evento, setEvento] = useState(null);
  const [datasEvento, setDatasEvento] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [motos, setMotos] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [tiposIngresso, setTiposIngresso] = useState([]);
  const [disponibilidade, setDisponibilidade] = useState([]);
  const [carregando, setCarregando] = useState(false);

  // Estados para UI
  const [horarioExpandido, setHorarioExpandido] = useState(null);

  // Buscar dados iniciais
  useEffect(() => {
    const fetchDados = async () => {
      try {
        const [motosRes, marcasRes, ingressosRes, eventoRes] =
          await Promise.all([
            fetch("/api/motos"),
            fetch("/api/marcas"),
            fetch("/api/ingressos"),
            fetch("/api/eventos/ativo"),
          ]);

        const motosData = await motosRes.json();
        const marcasData = await marcasRes.json();
        const ingressosData = await ingressosRes.json();
        const eventoData = await eventoRes.json();

        setMotos(motosData);
        setMarcas(marcasData);
        setTiposIngresso(ingressosData);
        setEvento(eventoData);

        // Gerar array de datas do evento
        if (eventoData && eventoData.dataInicio && eventoData.dataFim) {
          const inicio = new Date(eventoData.dataInicio);
          const fim = new Date(eventoData.dataFim);
          const datas = [];

          for (let d = new Date(inicio); d <= fim; d.setDate(d.getDate() + 1)) {
            datas.push(new Date(d).toISOString().split("T")[0]);
          }

          setDatasEvento(datas);
          // Não selecionar data automaticamente - usuário deve escolher
          // if (datas.length > 0) {
          //   setData(datas[0]);
          // }
        }
      } catch (error) {
        toast.error("Erro ao carregar dados");
      }
    };

    fetchDados();
  }, []);

  // Buscar disponibilidade
  const buscarDisponibilidade = async () => {
    if (!data) {
      toast.error("Selecione uma data para continuar");
      return;
    }

    setCarregando(true);
    try {
      console.log("Buscando disponibilidade para data:", data);
      const response = await fetch(
        `/api/disponibilidade/detalhada?data=${data}`
      );

      console.log("Response status:", response.status);
      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (response.ok) {
        setDisponibilidade(responseData.disponibilidade || []);
        console.log(
          "Disponibilidade carregada:",
          responseData.disponibilidade?.length || 0,
          "itens"
        );
      } else {
        console.error("Erro na API:", responseData.error);
        toast.error(responseData.error || "Erro ao buscar disponibilidade");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      toast.error("Erro ao buscar disponibilidade");
    } finally {
      setCarregando(false);
    }
  };

  // Filtrar modelos baseado na marca selecionada
  useEffect(() => {
    if (marcaSelecionada) {
      const modelosFiltrados = motos
        .filter((moto) => moto.marca?.nome === marcaSelecionada)
        .map((moto) => moto.nome);
      setModelos([...new Set(modelosFiltrados)]);
    } else {
      setModelos([]);
    }
    setModeloSelecionado("");
  }, [marcaSelecionada, motos]);

  // Resetar filtros
  const resetarFiltros = () => {
    setMarcaSelecionada("");
    setModeloSelecionado("");
    setTipoIngressoSelecionado("");
  };

  // Buscar automaticamente quando a data mudar
  useEffect(() => {
    if (data) {
      buscarDisponibilidade();
    } else {
      // Limpar dados quando não há data selecionada
      setDisponibilidade([]);
    }
  }, [data]);

  // Fechar popover quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (horarioExpandido && !event.target.closest(".horario-card")) {
        setHorarioExpandido(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [horarioExpandido]);

  // Processar dados para grid
  const processarDadosGrid = () => {
    if (!disponibilidade.length) return [];

    // Agrupar por horário
    const dadosPorHorario = {};
    disponibilidade.forEach((item) => {
      const horarioId = item.horario.id;
      if (!dadosPorHorario[horarioId]) {
        dadosPorHorario[horarioId] = {
          id: horarioId,
          hora: item.horario.hora,
          motos: [],
        };
      }

      // Aplicar filtros
      let incluirMoto = true;

      // Filtrar apenas motos de test ride
      const isTestRide =
        item.moto.ingresso &&
        (item.moto.ingresso.toLowerCase().includes("test") ||
          item.moto.ingresso.toLowerCase().includes("ride") ||
          item.moto.ingresso.toLowerCase().includes("trail"));

      if (!isTestRide) {
        incluirMoto = false;
      }

      if (marcaSelecionada && item.moto.marca !== marcaSelecionada) {
        incluirMoto = false;
      }

      if (modeloSelecionado && item.moto.nome !== modeloSelecionado) {
        incluirMoto = false;
      }

      if (
        tipoIngressoSelecionado &&
        item.moto.ingresso !== tipoIngressoSelecionado
      ) {
        incluirMoto = false;
      }

      if (incluirMoto) {
        dadosPorHorario[horarioId].motos.push({
          id: item.moto.id,
          nome: item.moto.nome,
          marca: item.moto.marca,
          categoria: item.moto.categoria,
          ingresso: item.moto.ingresso,
          disponivel: item.disponivel,
          total: item.moto.quantidade,
          agendados: item.agendados,
          esgotado: item.esgotado,
          baixoEstoque: item.baixoEstoque,
        });
      }
    });

    return Object.values(dadosPorHorario).sort((a, b) =>
      a.hora.localeCompare(b.hora)
    );
  };

  // Calcular cor do card baseado na disponibilidade
  const getCardColor = (motos) => {
    if (!motos.length) return "bg-white border-gray-300 hover:bg-gray-50";

    const totalDisponivel = motos.reduce(
      (sum, moto) => sum + moto.disponivel,
      0
    );
    const totalGeral = motos.reduce((sum, moto) => sum + moto.total, 0);
    const percentual =
      totalGeral > 0 ? (totalDisponivel / totalGeral) * 100 : 0;

    if (percentual > 50) return "bg-white border-green-400 hover:bg-green-50";
    if (percentual > 0) return "bg-white border-yellow-400 hover:bg-yellow-50";
    return "bg-white border-red-400 hover:bg-red-50";
  };

  // Calcular badge de status
  const getStatusBadge = (motos) => {
    if (!motos.length)
      return { text: "Sem dados", color: "bg-gray-100 text-gray-600" };

    const totalDisponivel = motos.reduce(
      (sum, moto) => sum + moto.disponivel,
      0
    );
    const totalGeral = motos.reduce((sum, moto) => sum + moto.total, 0);
    const percentual =
      totalGeral > 0 ? (totalDisponivel / totalGeral) * 100 : 0;

    if (percentual > 50)
      return { text: "Disponível", color: "bg-green-100 text-green-700" };
    if (percentual > 0)
      return { text: "Baixo estoque", color: "bg-yellow-100 text-yellow-700" };
    return { text: "Esgotado", color: "bg-red-100 text-red-700" };
  };

  const dadosGrid = processarDadosGrid();

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <CalendarDays className="w-8 h-8 text-red-600" />
          Verificar Horários
        </h1>
      </div>

      {/* Barra de Filtros */}
      <Card className="mb-6 shadow-lg border-0">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            {/* Marca */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Marca</Label>
              <select
                value={marcaSelecionada}
                onChange={(e) => setMarcaSelecionada(e.target.value)}
                className="mt-1 w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:outline-none"
              >
                <option value="">Todas as marcas</option>
                {marcas.map((marca) => (
                  <option key={marca.id} value={marca.nome}>
                    {marca.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Modelo */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Modelo
              </Label>
              <select
                value={modeloSelecionado}
                onChange={(e) => setModeloSelecionado(e.target.value)}
                disabled={!marcaSelecionada}
                className="mt-1 w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:outline-none disabled:bg-gray-100"
              >
                <option value="">Todos os modelos</option>
                {modelos.map((modelo) => (
                  <option key={modelo} value={modelo}>
                    {modelo}
                  </option>
                ))}
              </select>
            </div>

            {/* Data */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Data</Label>
              <select
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="mt-1 w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:outline-none"
              >
                <option value="">Selecione uma data</option>
                {datasEvento.map((dataItem) => {
                  const dataObj = new Date(dataItem + "T00:00:00");
                  const diasSemana = [
                    "Dom",
                    "Seg",
                    "Ter",
                    "Qua",
                    "Qui",
                    "Sex",
                    "Sáb",
                  ];
                  const diaSemana = diasSemana[dataObj.getDay()];
                  return (
                    <option key={dataItem} value={dataItem}>
                      {format(dataObj, "dd/MM/yyyy")} - {diaSemana}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Tipo de Ingresso */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Tipo de Ingresso
              </Label>
              <select
                value={tipoIngressoSelecionado}
                onChange={(e) => setTipoIngressoSelecionado(e.target.value)}
                className="mt-1 w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:outline-none"
              >
                <option value="">Todos os tipos</option>
                {tiposIngresso
                  .filter(
                    (tipo) =>
                      tipo.tipo.toLowerCase().includes("test") ||
                      tipo.tipo.toLowerCase().includes("ride") ||
                      tipo.tipo.toLowerCase().includes("trail")
                  )
                  .map((tipo) => (
                    <option key={tipo.id} value={tipo.tipo}>
                      {tipo.tipo}
                    </option>
                  ))}
              </select>
            </div>

            {/* Botão Resetar */}
            <div>
              <Button
                onClick={resetarFiltros}
                variant="outline"
                className="w-full h-10"
              >
                Resetar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Horários */}
      {dadosGrid.length > 0 && (
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {dadosGrid.map((horario) => {
                const statusBadge = getStatusBadge(horario.motos);
                return (
                  <div key={horario.id} className="relative horario-card">
                    <div
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${getCardColor(horario.motos)}`}
                      onClick={() =>
                        setHorarioExpandido(
                          horarioExpandido === horario.id ? null : horario.id
                        )
                      }
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-lg">
                          {horario.hora}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${statusBadge.color}`}>
                            {statusBadge.text}
                          </Badge>
                          {horarioExpandido === horario.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Popover com posicionamento absoluto */}
                    {horarioExpandido === horario.id && (
                      <div className="absolute top-full left-0 right-0 z-10 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-h-80 overflow-y-auto">
                        <div className="space-y-2">
                          {horario.motos.length > 0 ? (
                            horario.motos.map((moto) => {
                              const isDisponivel = moto.disponivel > 0;
                              const disponibilidadeText = isDisponivel
                                ? `${moto.disponivel} disponível${moto.disponivel > 1 ? "eis" : ""}`
                                : "Indisponível";
                              const disponibilidadeColor = isDisponivel
                                ? "text-green-600"
                                : "text-red-600";

                              return (
                                <div
                                  key={moto.id}
                                  className={`flex items-center justify-between p-3 rounded-lg border ${
                                    isDisponivel
                                      ? "bg-green-50 border-green-200"
                                      : "bg-red-50 border-red-200"
                                  }`}
                                >
                                  <div>
                                    <div className="font-medium text-sm">
                                      {moto.nome}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {moto.marca} • {moto.ingresso}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div
                                      className={`text-sm font-semibold ${disponibilidadeColor}`}
                                    >
                                      {disponibilidadeText}
                                    </div>
                                    {isDisponivel && (
                                      <div className="text-xs text-gray-500">
                                        de {moto.total} total
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-center text-gray-500 py-4">
                              Nenhuma moto disponível
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado sem data selecionada */}
      {!data && (
        <Card className="shadow-lg border-0">
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center">
              <Calendar className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Selecione uma data
              </h3>
              <p className="text-gray-500">
                Escolha uma data no filtro acima para ver os horários
                disponíveis.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado vazio */}
      {dadosGrid.length === 0 && data && !carregando && (
        <Card className="shadow-lg border-0">
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center">
              <Bike className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Nenhum horário encontrado
              </h3>
              <p className="text-gray-500">
                Não há horários disponíveis para a data selecionada ou os
                filtros aplicados.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado de carregamento */}
      {carregando && (
        <Card className="shadow-lg border-0">
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
              <p className="text-gray-600">Carregando disponibilidade...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
