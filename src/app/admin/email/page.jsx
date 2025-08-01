"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Mail, Send, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export default function AdminEmailPage() {
  const [email, setEmail] = useState("");
  const [tipoIndividual, setTipoIndividual] = useState("abertura-vendas");
  const [tipoLote, setTipoLote] = useState("abertura-vendas");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [listaEmails, setListaEmails] = useState("");
  const [modoEnvio, setModoEnvio] = useState("todos"); // "todos" ou "lista"

  const tiposEmail = [
    {
      value: "abertura-vendas",
      label: "Abertura de Vendas",
      description: "Email anunciando que as vendas de ingressos estão abertas",
    },
    {
      value: "confirmacao",
      label: "Confirmação de Pedido",
      description: "Email de confirmação após compra de ingressos",
    },
    {
      value: "cancelamento",
      label: "Cancelamento de Pedido",
      description: "Email de cancelamento de pedido",
    },
    {
      value: "teste",
      label: "Email de Teste",
      description: "Email simples para testar a configuração",
    },
  ];

  const listasPredefinidas = [
    {
      id: "lista1",
      nome: "Lista 1 (50 emails)",
      emails: [
        "email1@exemplo.com",
        "email2@exemplo.com",
        "email3@exemplo.com",
        // Adicione aqui os 50 emails da lista 1
      ],
    },
    {
      id: "lista2",
      nome: "Lista 2 (50 emails)",
      emails: [
        "email51@exemplo.com",
        "email52@exemplo.com",
        "email53@exemplo.com",
        // Adicione aqui os 50 emails da lista 2
      ],
    },
    {
      id: "lista3",
      nome: "Lista 3 (50 emails)",
      emails: [
        "email101@exemplo.com",
        "email102@exemplo.com",
        "email103@exemplo.com",
        // Adicione aqui os 50 emails da lista 3
      ],
    },
    {
      id: "lista4",
      nome: "Lista 4 (50 emails)",
      emails: [
        "email151@exemplo.com",
        "email152@exemplo.com",
        "email153@exemplo.com",
        // Adicione aqui os 50 emails da lista 4
      ],
    },
  ];

  const handleEnviarEmail = async () => {
    if (!email || !tipoIndividual) {
      setResult({
        type: "error",
        message: "Por favor, preencha todos os campos",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/email/individual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, tipo: tipoIndividual }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          type: "success",
          message: data.message,
        });
        setEmail("");
      } else {
        setResult({
          type: "error",
          message: data.error || "Erro ao enviar email",
        });
      }
    } catch (error) {
      setResult({
        type: "error",
        message: "Erro de conexão. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarLote = async () => {
    if (!tipoLote) {
      setResult({
        type: "error",
        message: "Por favor, selecione o tipo de email",
      });
      return;
    }

    let emailsParaEnviar = [];

    if (modoEnvio === "lista") {
      if (listaEmails.trim()) {
        // Usar lista manual de emails
        emailsParaEnviar = listaEmails
          .split("\n")
          .map((email) => email.trim())
          .filter((email) => email && email.includes("@"));
      } else {
        setResult({
          type: "error",
          message:
            "Por favor, insira a lista de emails ou selecione uma lista predefinida",
        });
        return;
      }
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/email/lote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: tipoLote,
          listaEmails: modoEnvio === "lista" ? emailsParaEnviar : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          type: "success",
          message: `Email enviado com sucesso para ${data.quantidade} destinatários`,
        });
        if (modoEnvio === "lista") {
          setListaEmails("");
        }
      } else {
        setResult({
          type: "error",
          message: data.error || "Erro ao enviar emails em lote",
        });
      }
    } catch (error) {
      setResult({
        type: "error",
        message: "Erro de conexão. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelecionarLista = (listaId) => {
    const lista = listasPredefinidas.find((l) => l.id === listaId);
    if (lista) {
      setListaEmails(lista.emails.join("\n"));
      setModoEnvio("lista");
    }
  };

  const emailSelecionado = tiposEmail.find((t) => t.value === tipoIndividual);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Gerenciamento de Emails</h1>
        <p className="text-gray-600">
          Disparar emails para clientes e anunciar eventos
        </p>
      </div>

      <div className="space-y-6">
        {/* Email Individual */}
        <div className="border rounded-lg p-6 bg-white">
          <div className="flex items-center mb-4">
            <Send className="h-5 w-5 mr-2" />
            <h2 className="text-lg font-semibold">Email Individual</h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email do Destinatário</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="tipo">Tipo de Email</Label>
              <Select value={tipoIndividual} onValueChange={setTipoIndividual}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o tipo de email" />
                </SelectTrigger>
                <SelectContent>
                  {tiposEmail.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleEnviarEmail}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Email
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Email em Lote */}
        <div className="border rounded-lg p-6 bg-white">
          <div className="flex items-center mb-4">
            <Mail className="h-5 w-5 mr-2" />
            <h2 className="text-lg font-semibold">Email em Lote</h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="tipo-lote">Tipo de Email</Label>
              <Select value={tipoLote} onValueChange={setTipoLote}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o tipo de email" />
                </SelectTrigger>
                <SelectContent>
                  {tiposEmail.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Modo de Envio</Label>
              <div className="flex space-x-4 mt-1">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="todos"
                    checked={modoEnvio === "todos"}
                    onChange={(e) => setModoEnvio(e.target.value)}
                    className="text-blue-600"
                  />
                  <span className="text-sm">Todos os clientes</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="lista"
                    checked={modoEnvio === "lista"}
                    onChange={(e) => setModoEnvio(e.target.value)}
                    className="text-blue-600"
                  />
                  <span className="text-sm">Lista específica</span>
                </label>
              </div>
            </div>

            {modoEnvio === "lista" && (
              <>
                <div>
                  <Label>Listas Predefinidas</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {listasPredefinidas.map((lista) => (
                      <Button
                        key={lista.id}
                        size="sm"
                        onClick={() => handleSelecionarLista(lista.id)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300"
                      >
                        {lista.nome}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="lista-emails">
                    Lista de Emails (um por linha)
                  </Label>
                  <textarea
                    id="lista-emails"
                    value={listaEmails}
                    onChange={(e) => setListaEmails(e.target.value)}
                    placeholder="email1@exemplo.com&#10;email2@exemplo.com&#10;email3@exemplo.com"
                    className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Insira um email por linha ou selecione uma lista predefinida
                    acima
                  </p>
                </div>
              </>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                <div>
                  <h4 className="font-medium text-yellow-800">Atenção</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    {modoEnvio === "todos"
                      ? "O envio em lote será feito para todos os clientes cadastrados no sistema. Esta ação não pode ser desfeita."
                      : "O envio será feito apenas para os emails da lista especificada. Verifique se os emails estão corretos."}
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleEnviarLote}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando em Lote...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  {modoEnvio === "todos"
                    ? "Enviar para Todos"
                    : "Enviar para Lista"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Resultado */}
      {result && (
        <div className="mt-6">
          <div
            className={`p-4 rounded-lg border ${
              result.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center">
              {result.type === "success" ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <AlertCircle className="h-4 w-4 mr-2" />
              )}
              {result.message}
            </div>
          </div>
        </div>
      )}

      <Separator className="my-6" />

      {/* Informações dos Tipos de Email */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Tipos de Email Disponíveis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tiposEmail.map((tipo) => (
            <div key={tipo.value} className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-2">{tipo.label}</h4>
              <p className="text-sm text-gray-600">{tipo.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
