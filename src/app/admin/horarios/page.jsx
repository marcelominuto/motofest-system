"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CreateHorarioModal from "@/components/admin/CreateHorarioModal";
import DeleteHorarioButton from "@/components/admin/DeleteHorarioButton";

export default function HorariosPage() {
  const [horarios, setHorarios] = useState([]);

  const fetchHorarios = async () => {
    try {
      const res = await fetch("/api/horarios");
      const data = await res.json();
      setHorarios(data);
    } catch {
      toast.error("Erro ao carregar horários");
    }
  };

  useEffect(() => {
    fetchHorarios();
  }, []);

  const gerarHorariosPadroes = async () => {
    try {
      const horarios = [];
      for (let h = 10; h <= 17; h++) {
        horarios.push(`${String(h).padStart(2, "0")}:00`);
        horarios.push(`${String(h).padStart(2, "0")}:30`);
      }
      horarios.push("18:00");

      await Promise.all(
        horarios.map((hora) =>
          fetch("/api/horarios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ hora }),
          })
        )
      );

      toast.success("Horários padrões gerados com sucesso!");
      fetchHorarios();
    } catch {
      toast.error("Erro ao gerar horários padrões");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        {horarios.length === 0 ? (
          <Button
            onClick={gerarHorariosPadroes}
            className="bg-black text-white"
          >
            Gerar horários padrões
          </Button>
        ) : (
          <CreateHorarioModal onCreated={fetchHorarios} />
        )}
        <h1 className="text-2xl font-bold">Horários</h1>
      </div>

      <div className="bg-white shadow rounded overflow-hidden border">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2 border-b">Horário</th>
              <th className="text-left p-2 border-b">Ações</th>
            </tr>
          </thead>
          <tbody>
            {horarios.map((h) => (
              <tr key={h.id} className="border-b">
                <td className="p-2">{h.hora}</td>
                <td className="p-2">
                  <DeleteHorarioButton id={h.id} onDeleted={fetchHorarios} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
