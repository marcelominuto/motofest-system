"use client";
export const dynamic = "force-dynamic";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardContent,
  DashboardCardIcon,
  DashboardCardValue,
  DashboardCardSubtitle,
} from "@/components/ui/dashboard-card";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Users,
  Calendar,
  Bike,
  TrendingUp,
  CheckCircle,
  DollarSign,
  Activity,
  Car,
  Target,
  BarChart3,
  TrafficCone,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [dados, setDados] = useState({
    agendamentos: 0,
    checkins: 0,
    pedidos: 0,
    motos: 0,
    clientes: 0,
    faturamento: 0,
    agendamentosHoje: 0,
    agendamentosSemana: 0,
    agendamentosCriadosHoje: 0,
    taxaConversao: 0,
    motosPopulares: [],
    horariosPopulares: [],
    statusAgendamentos: [],
    faturamentoPeriodo: { hoje: 0, semana: 0, mes: 0 },
    projecaoReceita: {
      projecao: 0,
      diasRestantes: 0,
      faturamentoMedioDiario: 0,
    },
    mobilidade: 0,
    categoriasMotos: [],
  });

  const [porDia, setPorDia] = useState([]);
  const [porMarca, setPorMarca] = useState([]);
  const [porModelo, setPorModelo] = useState([]);
  const [porHorario, setPorHorario] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      const [
        checkins,
        agendamentos,
        pedidos,
        motos,
        marcas,
        dias,
        modelos,
        horarios,
        clientes,
        faturamento,
        agendamentosHoje,
        agendamentosCriadosSemana,
        agendamentosCriadosHoje,
        motosPopulares,
        horariosPopulares,
        statusAgendamentos,
        faturamentoPeriodo,
        projecaoReceita,
        mobilidade,
        categoriasMotos,
      ] = await Promise.all([
        fetch("/api/dashboard/checkin").then((res) => res.json()),
        fetch("/api/dashboard/test-rides").then((res) => res.json()),
        fetch("/api/dashboard/pedidos").then((res) => res.json()),
        fetch("/api/dashboard/motos").then((res) => res.json()),
        fetch("/api/dashboard/por-marca").then((res) => res.json()),
        fetch("/api/dashboard/por-dia").then((res) => res.json()),
        fetch("/api/dashboard/por-modelo").then((res) => res.json()),
        fetch("/api/dashboard/por-horario").then((res) => res.json()),
        fetch("/api/dashboard/clientes").then((res) => res.json()),
        fetch("/api/dashboard/faturamento").then((res) => res.json()),
        fetch("/api/dashboard/agendamentos-hoje").then((res) => res.json()),
        fetch("/api/dashboard/agendamentos-criados-semana").then((res) =>
          res.json()
        ),
        fetch("/api/dashboard/agendamentos-criados-hoje").then((res) =>
          res.json()
        ),
        fetch("/api/dashboard/motos-populares").then((res) => res.json()),
        fetch("/api/dashboard/horarios-populares").then((res) => res.json()),
        fetch("/api/dashboard/status-agendamentos").then((res) => res.json()),
        fetch("/api/dashboard/faturamento-periodo").then((res) => res.json()),
        fetch("/api/dashboard/projecao-receita").then((res) => res.json()),
        fetch("/api/dashboard/mobilidade").then((res) => res.json()),
        fetch("/api/dashboard/categorias-motos").then((res) => res.json()),
      ]);

      setDados({
        agendamentos: agendamentos.total,
        checkins: checkins.total,
        pedidos: pedidos.total,
        motos: motos.total,
        clientes: clientes.total,
        faturamento: faturamento.total || 0,
        agendamentosHoje: agendamentosHoje.total || 0,
        agendamentosSemana: agendamentosCriadosSemana.total || 0,
        agendamentosCriadosHoje: agendamentosCriadosHoje.total || 0,
        taxaConversao:
          clientes.total > 0
            ? ((agendamentos.total / clientes.total) * 100).toFixed(1)
            : 0,
        motosPopulares: motosPopulares || [],
        horariosPopulares: horariosPopulares || [],
        statusAgendamentos: statusAgendamentos || [],
        faturamentoPeriodo: faturamentoPeriodo || {
          hoje: 0,
          semana: 0,
          mes: 0,
        },
        projecaoReceita: projecaoReceita || {
          projecao: 0,
          diasRestantes: 0,
          faturamentoMedioDiario: 0,
        },
        mobilidade: mobilidade.total || 0,
        categoriasMotos: categoriasMotos.categorias || [],
      });

      setPorMarca(marcas);
      setPorDia(dias);
      setPorModelo(modelos);
      setPorHorario(horarios);
    };

    fetchAll();
  }, []);

  const COLORS = ["#dc2626", "#ea580c", "#ca8a04", "#16a34a", "#0891b2"];

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 text-sm sm:text-lg">
          Visão geral do Moto Fest
        </p>
      </div>

      {/* Cards Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <DashboardCard>
          <DashboardCardHeader>
            <div className="flex items-center justify-between">
              <DashboardCardTitle>Total Agendamentos</DashboardCardTitle>
              <DashboardCardIcon className="bg-red-100">
                <Calendar className="h-5 w-5 text-red-600" />
              </DashboardCardIcon>
            </div>
          </DashboardCardHeader>
          <DashboardCardContent>
            <DashboardCardValue>{dados.agendamentos}</DashboardCardValue>
            <DashboardCardSubtitle className="text-green-600">
              +{dados.agendamentosCriadosHoje} criados hoje
            </DashboardCardSubtitle>
          </DashboardCardContent>
        </DashboardCard>

        <DashboardCard>
          <DashboardCardHeader>
            <div className="flex items-center justify-between">
              <DashboardCardTitle>Check-ins</DashboardCardTitle>
              <DashboardCardIcon className="bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </DashboardCardIcon>
            </div>
          </DashboardCardHeader>
          <DashboardCardContent>
            <DashboardCardValue>{dados.checkins}</DashboardCardValue>
            <DashboardCardSubtitle className="text-gray-500">
              Participantes confirmados
            </DashboardCardSubtitle>
          </DashboardCardContent>
        </DashboardCard>

        <DashboardCard>
          <DashboardCardHeader>
            <div className="flex items-center justify-between">
              <DashboardCardTitle>Faturamento</DashboardCardTitle>
              <DashboardCardIcon className="bg-emerald-100">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </DashboardCardIcon>
            </div>
          </DashboardCardHeader>
          <DashboardCardContent>
            <DashboardCardValue>
              R$ {dados.faturamento.toLocaleString("pt-BR")}
            </DashboardCardValue>
            <DashboardCardSubtitle className="text-emerald-600">
              +{dados.pedidos} pedidos
            </DashboardCardSubtitle>
          </DashboardCardContent>
        </DashboardCard>

        <DashboardCard>
          <DashboardCardHeader>
            <div className="flex items-center justify-between">
              <DashboardCardTitle>Taxa de Conversão</DashboardCardTitle>
              <DashboardCardIcon className="bg-blue-100">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </DashboardCardIcon>
            </div>
          </DashboardCardHeader>
          <DashboardCardContent>
            <DashboardCardValue>{dados.taxaConversao}%</DashboardCardValue>
            <DashboardCardSubtitle className="text-blue-600">
              Agendamentos/Clientes
            </DashboardCardSubtitle>
          </DashboardCardContent>
        </DashboardCard>
      </div>

      {/* Cards Secundários */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <DashboardCard>
          <DashboardCardHeader>
            <div className="flex items-center justify-between">
              <DashboardCardTitle>Motos Cadastradas</DashboardCardTitle>
              <DashboardCardIcon className="bg-purple-100">
                <Bike className="h-5 w-5 text-purple-600" />
              </DashboardCardIcon>
            </div>
          </DashboardCardHeader>
          <DashboardCardContent>
            <DashboardCardValue>{dados.motos}</DashboardCardValue>
            <DashboardCardSubtitle className="text-purple-600">
              Disponíveis para test ride
            </DashboardCardSubtitle>
          </DashboardCardContent>
        </DashboardCard>

        <DashboardCard>
          <DashboardCardHeader>
            <div className="flex items-center justify-between">
              <DashboardCardTitle>Clientes Únicos</DashboardCardTitle>
              <DashboardCardIcon className="bg-indigo-100">
                <Users className="h-5 w-5 text-indigo-600" />
              </DashboardCardIcon>
            </div>
          </DashboardCardHeader>
          <DashboardCardContent>
            <DashboardCardValue>{dados.clientes}</DashboardCardValue>
            <DashboardCardSubtitle className="text-indigo-600">
              Cadastrados no sistema
            </DashboardCardSubtitle>
          </DashboardCardContent>
        </DashboardCard>

        <DashboardCard>
          <DashboardCardHeader>
            <div className="flex items-center justify-between">
              <DashboardCardTitle>Mobilidade Urbana</DashboardCardTitle>
              <DashboardCardIcon className="bg-orange-100">
                <TrafficCone className="h-5 w-5 text-orange-600" />
              </DashboardCardIcon>
            </div>
          </DashboardCardHeader>
          <DashboardCardContent>
            <DashboardCardValue>{dados.mobilidade}</DashboardCardValue>
            <DashboardCardSubtitle className="text-orange-600">
              Registros no sistema
            </DashboardCardSubtitle>
          </DashboardCardContent>
        </DashboardCard>
      </div>

      {/* Novos Cards de Métricas Financeiras */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <DashboardCard className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <DashboardCardHeader className="border-blue-400">
            <div className="flex items-center justify-between">
              <DashboardCardTitle className="text-blue-100">
                Faturamento Hoje
              </DashboardCardTitle>
              <DashboardCardIcon className="bg-blue-400">
                <DollarSign className="h-5 w-5 text-white" />
              </DashboardCardIcon>
            </div>
          </DashboardCardHeader>
          <DashboardCardContent>
            <DashboardCardValue className="text-white">
              R$ {dados.faturamentoPeriodo.hoje.toLocaleString("pt-BR")}
            </DashboardCardValue>
            <DashboardCardSubtitle className="text-blue-200">
              Receita do dia
            </DashboardCardSubtitle>
          </DashboardCardContent>
        </DashboardCard>

        <DashboardCard className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <DashboardCardHeader className="border-green-400">
            <div className="flex items-center justify-between">
              <DashboardCardTitle className="text-green-100">
                Faturamento Semana
              </DashboardCardTitle>
              <DashboardCardIcon className="bg-green-400">
                <BarChart3 className="h-5 w-5 text-white" />
              </DashboardCardIcon>
            </div>
          </DashboardCardHeader>
          <DashboardCardContent>
            <DashboardCardValue className="text-white">
              R$ {dados.faturamentoPeriodo.semana.toLocaleString("pt-BR")}
            </DashboardCardValue>
            <DashboardCardSubtitle className="text-green-200">
              Últimos 7 dias
            </DashboardCardSubtitle>
          </DashboardCardContent>
        </DashboardCard>

        <DashboardCard className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <DashboardCardHeader className="border-purple-400">
            <div className="flex items-center justify-between">
              <DashboardCardTitle className="text-purple-100">
                Projeção de Receita
              </DashboardCardTitle>
              <DashboardCardIcon className="bg-purple-400">
                <Target className="h-5 w-5 text-white" />
              </DashboardCardIcon>
            </div>
          </DashboardCardHeader>
          <DashboardCardContent>
            <DashboardCardValue className="text-white">
              R$ {dados.projecaoReceita.projecao.toLocaleString("pt-BR")}
            </DashboardCardValue>
            <DashboardCardSubtitle className="text-purple-200">
              {dados.projecaoReceita.diasRestantes} dias restantes
            </DashboardCardSubtitle>
          </DashboardCardContent>
        </DashboardCard>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
        {/* Agendamentos por Dia */}
        <Card className="bg-white shadow-xl border-0 rounded-xl">
          <CardHeader className="px-8 pt-6">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Agendamentos por Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={porDia}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="data" stroke="#6b7280" />
                <YAxis allowDecimals={false} stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="quantidade"
                  fill="#dc2626"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Agendamentos por Marca */}
        <Card className="bg-white shadow-xl border-0 rounded-xl">
          <CardHeader className="px-8 pt-6">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Agendamentos por Marca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={porMarca}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="marca" stroke="#6b7280" />
                <YAxis allowDecimals={false} stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="quantidade"
                  fill="#ea580c"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Adicionais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
        {/* Status dos Agendamentos */}
        <Card className="bg-white shadow-xl border-0 rounded-xl">
          <CardHeader className="px-8 pt-6">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Status dos Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dados.statusAgendamentos}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dados.statusAgendamentos.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Agendamentos por Modelo */}
        <Card className="bg-white shadow-xl border-0 rounded-xl">
          <CardHeader className="px-8 pt-6">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Agendamentos por Modelo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={porModelo}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="modelo" stroke="#6b7280" />
                <YAxis allowDecimals={false} stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="quantidade"
                  fill="#ca8a04"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Finais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
        {/* Agendamentos por Horário */}
        <Card className="bg-white shadow-xl border-0 rounded-xl">
          <CardHeader className="px-8 pt-6">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Agendamentos por Horário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={porHorario}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="horario" stroke="#6b7280" />
                <YAxis allowDecimals={false} stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="quantidade"
                  fill="#16a34a"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Motos Populares */}
        <Card className="bg-white shadow-xl border-0 rounded-xl">
          <CardHeader className="px-8 pt-6">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Motos Populares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dados.motosPopulares}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="moto" stroke="#6b7280" />
                <YAxis allowDecimals={false} stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="quantidade"
                  fill="#0891b2"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Categorias das Motos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
        {/* Agendamentos por Categoria */}
        <Card className="bg-white shadow-xl border-0 rounded-xl">
          <CardHeader className="px-8 pt-6">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Agendamentos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dados.categoriasMotos}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="categoria" stroke="#6b7280" />
                <YAxis allowDecimals={false} stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="quantidade"
                  fill="#0d9488"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detalhes das Categorias */}
        <Card className="bg-white shadow-xl border-0 rounded-xl">
          <CardHeader className="px-8 pt-6">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Detalhes por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {dados.categoriasMotos.map((categoria, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {categoria.categoria}
                    </h3>
                    <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-sm font-medium">
                      {categoria.quantidade} agendamentos
                    </span>
                  </div>
                  <div className="space-y-1">
                    {categoria.motos.map((moto, motoIndex) => (
                      <div
                        key={motoIndex}
                        className="flex items-center justify-between text-sm text-gray-600"
                      >
                        <span>
                          {moto.nome} ({moto.marca})
                        </span>
                        <span className="font-medium">{moto.quantidade}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
