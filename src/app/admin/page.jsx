"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function AdminDashboardPage() {
  const [dados, setDados] = useState({
    agendamentos: 0,
    checkins: 0,
    pedidos: 0,
    motos: 0,
    clientes: 0,
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
      ] = await Promise.all([
        fetch("/api/dashboard/checkin").then((res) => res.json()),
        fetch("/api/dashboard/test-rides").then((res) => res.json()),
        fetch("/api/dashboard/pedidos").then((res) => res.json()),
        fetch("/api/dashboard/motos").then((res) => res.json()),
        fetch("/api/dashboard/por-marca").then((res) => res.json()),
        fetch("/api/dashboard/por-dia").then((res) => res.json()),
        fetch("/api/dashboard/por-modelo").then((res) => res.json()),
        fetch("/api/dashboard/por-horario").then((res) => res.json()),
      ]);

      setDados({
        agendamentos: agendamentos.total,
        checkins: checkins.total,
        pedidos: pedidos.total,
        motos: motos.total,
        clientes: 112, // substitua futuramente por endpoint real
      });

      setPorMarca(marcas);
      setPorDia(dias);
      setPorModelo(modelos);
      setPorHorario(horarios);
    };

    fetchAll();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Agendamentos</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {dados.agendamentos}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Check-ins</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {dados.checkins}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Pedidos</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            R$ {dados.pedidos * 250}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Motos cadastradas</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {dados.motos}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Clientes únicos</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {dados.clientes}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico: Agendamentos por Dia */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4">Agendamentos por Dia</h2>
        <div className="bg-white rounded shadow p-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={porDia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="quantidade" fill="#dc2626" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico: Agendamentos por Marca */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4">Agendamentos por Marca</h2>
        <div className="bg-white rounded shadow p-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={porMarca}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="marca" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="quantidade" fill="#dc2626" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico: Agendamentos por Modelo */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4">Agendamentos por Modelo</h2>
        <div className="bg-white rounded shadow p-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={porModelo}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="modelo" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="quantidade" fill="#dc2626" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico: Agendamentos por Horário */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4">Agendamentos por Horário</h2>
        <div className="bg-white rounded shadow p-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={porHorario}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="horario" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="quantidade" fill="#dc2626" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
