"use client";

import { useEffect, useState } from "react";

export default function AdminEventosPage() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingEvento, setEditingEvento] = useState(null);
  const [form, setForm] = useState({ nome: "", dataInicio: "", dataFim: "" });

  const fetchEventos = async () => {
    const res = await fetch("/api/eventos");
    const data = await res.json();
    setEventos(data);
  };

  const ativarEvento = async (id, eventoData) => {
    setLoading(true);
    try {
      await fetch(`/api/eventos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...eventoData,
          ativo: true,
        }),
      });
      fetchEventos();
    } catch (err) {
      alert("Erro ao ativar evento");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (evento) => {
    setEditingEvento(evento);
    setForm({
      nome: evento.nome,
      dataInicio: evento.dataInicio.split("T")[0],
      dataFim: evento.dataFim.split("T")[0],
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!editingEvento) return;
    try {
      await fetch(`/api/eventos/${editingEvento.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ativo: editingEvento.ativo }),
      });
      setEditingEvento(null);
      fetchEventos();
    } catch (err) {
      alert("Erro ao salvar");
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Eventos</h1>
      <table className="min-w-full border text-sm">
        <thead className="bg-gray-100 dark:bg-neutral-800 text-black dark:text-white">
          <tr className="bg-gray-100">
            <th className="border p-2">Nome</th>
            <th className="border p-2">Início</th>
            <th className="border p-2">Fim</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {eventos.map((evento) => (
            <tr
              key={evento.id}
              className="bg-white dark:bg-neutral-900 text-black dark:text-white"
            >
              <td className="border p-2">{evento.nome}</td>
              <td className="border p-2">{evento.dataInicio.split("T")[0]}</td>
              <td className="border p-2">{evento.dataFim.split("T")[0]}</td>
              <td className="border p-2">
                {evento.ativo ? (
                  <span className="text-green-600">Ativo</span>
                ) : (
                  "Inativo"
                )}
              </td>
              <td className="border p-2 space-x-2">
                <button
                  onClick={() => openEditModal(evento)}
                  className="px-2 py-1 bg-gray-200 dark:bg-neutral-700 dark:text-white rounded"
                >
                  Editar
                </button>
                {!evento.ativo && (
                  <button
                    onClick={() => ativarEvento(evento.id, evento)}
                    disabled={loading}
                    className="px-3 py-1 bg-black text-white rounded text-sm"
                  >
                    Ativar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {editingEvento && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Editar Evento</h2>
            <input
              name="nome"
              value={form.nome}
              onChange={handleChange}
              placeholder="Nome"
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="date"
              name="dataInicio"
              value={form.dataInicio}
              onChange={handleChange}
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="date"
              name="dataFim"
              value={form.dataFim}
              onChange={handleChange}
              className="w-full mb-2 p-2 border rounded"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditingEvento(null)}
                className="px-4 py-2 border rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-black text-white rounded"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
