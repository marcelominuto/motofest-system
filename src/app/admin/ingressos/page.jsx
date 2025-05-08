"use client";

import { useEffect, useState } from "react";
import CreateIngressoModal from "@/components/admin/CreateIngressoModal";
import EditIngressoModal from "@/components/admin/EditIngressoModal";
import DeleteIngressoButton from "@/components/admin/DeleteIngressoButton";

export default function IngressosPage() {
  const [ingressos, setIngressos] = useState([]);

  const fetchIngressos = async () => {
    const res = await fetch("/api/ingressos");
    const data = await res.json();
    setIngressos(data);
  };

  useEffect(() => {
    fetchIngressos();
  }, []);

  const [modalAberto, setModalAberto] = useState(false);
  const [ingressoSelecionado, setIngressoSelecionado] = useState(null);

  return (
    <div>
      <CreateIngressoModal onCreated={fetchIngressos} />
      <h1 className="text-2xl font-bold mb-6">Ingressos</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Evento</th>
              <th className="border p-2">Tipo</th>
              <th className="border p-2">Categoria</th>
              <th className="border p-2">Valor</th>
              <th className="border p-2">Limite</th>
              <th className="border p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {ingressos.map((i) => (
              <tr key={i.id}>
                <td className="border p-2">{i.evento?.nome}</td>
                <td className="border p-2">{i.tipo}</td>
                <td className="border p-2">{i.categoria}</td>
                <td className="border p-2">
                  {i.categoria === "test ride"
                    ? `R$ ${i.valor1} / ${i.valor2} / ${i.valor3}`
                    : `R$ ${parseFloat(i.valor).toFixed(2)}`}
                </td>
                <td className="border p-2">{i.limite ?? "∞"}</td>
                <td className="border p-2">
                  <button
                    className="text-blue-600 hover:underline text-xs mr-3"
                    onClick={() => {
                      setIngressoSelecionado(i);
                      setModalAberto(true);
                    }}
                  >
                    Editar
                  </button>

                  <DeleteIngressoButton id={i.id} onDeleted={fetchIngressos} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EditIngressoModal
        open={modalAberto}
        ingresso={ingressoSelecionado}
        onClose={() => setModalAberto(false)}
        onUpdated={fetchIngressos}
      />
    </div>
  );
}
