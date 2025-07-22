"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

export default function MobilidadeUrbanaPage() {
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    cnh: "",
  });
  const [marcas, setMarcas] = useState([]);
  const [marcasSelecionadas, setMarcasSelecionadas] = useState([]);
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [clienteId, setClienteId] = useState(null);
  const [resumo, setResumo] = useState(null);

  useEffect(() => {
    fetch("/api/marcas")
      .then((res) => res.json())
      .then((data) => setMarcas(data))
      .catch(() => setMarcas([]));
  }, []);

  function formatarCPF(cpf) {
    return cpf
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  function formatarTelefone(tel) {
    return tel
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === "cpf") val = formatarCPF(val.replace(/\D/g, "").slice(0, 11));
    if (name === "telefone") val = formatarTelefone(val);
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  const handleMarcaChange = (id) => {
    setMarcasSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro("");
    try {
      // 1. Cadastrar ou buscar cliente
      let idCliente = clienteId;
      let clienteResumo = { ...form };
      if (!idCliente) {
        const res = await fetch("/api/clientes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: form.nome,
            email: form.email,
            telefone: form.telefone,
            cpf: form.cpf,
            cnh: form.cnh,
          }),
        });
        if (res.ok) {
          const cliente = await res.json();
          idCliente = cliente.id;
          setClienteId(cliente.id);
          clienteResumo = cliente;
        } else if (res.status === 409) {
          const busca = await fetch(
            `/api/clientes?cpf=${encodeURIComponent(form.cpf)}`
          );
          if (busca.ok) {
            const cliente = await busca.json();
            idCliente = cliente.id;
            setClienteId(cliente.id);
            clienteResumo = cliente;
          } else {
            setErro("Erro ao buscar cliente existente.");
            setLoading(false);
            return;
          }
        } else {
          setErro("Erro ao cadastrar cliente.");
          setLoading(false);
          return;
        }
      }
      // 2. Enviar mobilidade
      const nomesMarcas = marcas
        .filter((m) => marcasSelecionadas.includes(m.id))
        .map((m) => m.nome);
      const resMob = await fetch("/api/mobilidade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clienteId: idCliente, marcas: nomesMarcas }),
      });
      if (!resMob.ok) {
        const data = await resMob.json();
        setErro(data.error || "Erro ao cadastrar mobilidade");
        setLoading(false);
        return;
      }
      setResumo({
        ...clienteResumo,
        marcas: nomesMarcas,
      });
      setEnviado(true);
      setForm({ nome: "", cpf: "", email: "", telefone: "", cnh: "" });
      setMarcasSelecionadas([]);
      setClienteId(null);
    } catch (error) {
      setErro("Erro ao cadastrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-2 py-12">
      <h1
        className="text-4xl md:text-5xl font-extrabold text-white text-center mb-4 mt-2"
        style={{ fontFamily: "Anton, sans-serif", letterSpacing: 1 }}
      >
        Mobilidade Urbana
      </h1>
      <p className="text-lg md:text-xl text-gray-200 text-center mb-8 px-2 max-w-2xl font-sans mx-auto">
        Cadastre-se para participar das atividades de mobilidade urbana.
        Preencha o formulário abaixo e selecione as marcas de seu interesse!
      </p>
      <div className="w-full max-w-md bg-[#18181b] border border-red-700 rounded-2xl shadow-lg p-4 md:p-8 flex flex-col items-center">
        {enviado && resumo ? (
          <div className="flex flex-col items-center gap-4 py-8 w-full">
            <CheckCircle size={64} className="text-green-500 mb-2" />
            <h2 className="text-white text-2xl font-bold mb-2">
              Cadastro realizado com sucesso!
            </h2>
            <p className="text-gray-300 mb-4">
              Mostre esta tela para que possamos confirmar sua participação.
            </p>
            <div className="bg-[#222] rounded-xl p-6 shadow w-full max-w-sm mx-auto text-left">
              <div className="mb-2">
                <span className="text-gray-400 font-semibold">Nome:</span>
                <span className="text-white ml-2">{resumo.nome}</span>
              </div>
              <div className="mb-2">
                <span className="text-gray-400 font-semibold">CPF:</span>
                <span className="text-white ml-2">{resumo.cpf}</span>
              </div>
              <div className="mb-2">
                <span className="text-gray-400 font-semibold">E-mail:</span>
                <span className="text-white ml-2">{resumo.email}</span>
              </div>
              <div className="mb-2">
                <span className="text-gray-400 font-semibold">Telefone:</span>
                <span className="text-white ml-2">{resumo.telefone}</span>
              </div>
              <div className="mb-2">
                <span className="text-gray-400 font-semibold">CNH:</span>
                <span className="text-white ml-2">{resumo.cnh}</span>
              </div>
              <div className="mb-2">
                <span className="text-gray-400 font-semibold">
                  Marcas de interesse:
                </span>
                <span className="text-white ml-2">
                  {resumo.marcas && resumo.marcas.length > 0
                    ? resumo.marcas.join(", ")
                    : "-"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
            <div>
              <label className="block text-white font-semibold mb-1">
                Nome completo
              </label>
              <input
                type="text"
                name="nome"
                required
                value={form.nome}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-[#222] text-white border border-gray-700 focus:border-red-500 focus:outline-none"
                placeholder="Seu nome"
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-1">CPF</label>
              <input
                type="text"
                name="cpf"
                required
                value={form.cpf}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-[#222] text-white border border-gray-700 focus:border-red-500 focus:outline-none"
                placeholder="000.000.000-00"
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-1">
                E-mail
              </label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-[#222] text-white border border-gray-700 focus:border-red-500 focus:outline-none"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-1">
                Telefone
              </label>
              <input
                type="tel"
                name="telefone"
                required
                value={form.telefone}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-[#222] text-white border border-gray-700 focus:border-red-500 focus:outline-none"
                placeholder="(51) 99999-9999"
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-1">CNH</label>
              <input
                type="text"
                name="cnh"
                required
                value={form.cnh}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-[#222] text-white border border-gray-700 focus:border-red-500 focus:outline-none"
                placeholder="Número da CNH"
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-2">
                Marcas de interesse
              </label>
              <div className="flex flex-wrap gap-2">
                {marcas.map((marca) => (
                  <label
                    key={marca.id}
                    className="flex items-center gap-2 bg-gray-800 rounded px-2 py-1 cursor-pointer text-white"
                  >
                    <input
                      type="checkbox"
                      checked={marcasSelecionadas.includes(marca.id)}
                      onChange={() => handleMarcaChange(marca.id)}
                      className="accent-red-600"
                    />
                    <span>{marca.nome}</span>
                  </label>
                ))}
              </div>
            </div>
            {erro && (
              <div className="text-yellow-400 text-center text-sm font-semibold">
                {erro}
              </div>
            )}
            <button
              type="submit"
              className="mt-2 px-8 py-3 border-2 border-white text-white font-bold rounded-lg text-lg bg-[#222] hover:bg-red-600 hover:text-white transition-all outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Cadastrar"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
