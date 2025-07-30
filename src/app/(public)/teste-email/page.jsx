"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TesteEmailPage() {
  const [email, setEmail] = useState("");
  const [tipo, setTipo] = useState("confirmacao");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState("");

  const handleEnviarEmail = async () => {
    if (!email) {
      alert("Digite um email válido");
      return;
    }

    setLoading(true);
    setResultado("");

    try {
      const response = await fetch("/api/teste-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          tipo,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResultado("✅ Email enviado com sucesso!");
      } else {
        setResultado(`❌ Erro: ${data.error || "Erro desconhecido"}`);
      }
    } catch (error) {
      setResultado(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              🧪 Teste de Envio de Emails
            </CardTitle>
            <p className="text-gray-600 text-center">
              Teste diferentes tipos de emails sem precisar fazer o fluxo
              completo
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email de destino</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de email</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmacao">
                    ✅ Confirmação de Compra
                  </SelectItem>
                  <SelectItem value="cancelamento">
                    ❌ Cancelamento de Pedido
                  </SelectItem>
                  <SelectItem value="abertura-vendas">
                    🎫 Abertura de Vendas
                  </SelectItem>
                  <SelectItem value="teste">
                    🧪 Email de Teste Simples
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleEnviarEmail}
                disabled={loading || !email}
                className="w-full"
                size="lg"
              >
                {loading ? "Enviando..." : "📧 Enviar Email de Teste"}
              </Button>
            </div>

            {resultado && (
              <div
                className={`p-4 rounded-lg text-center font-medium ${
                  resultado.includes("✅")
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {resultado}
              </div>
            )}

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">
                ℹ️ Como usar:
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>
                  • <strong>Confirmação:</strong> Simula email de compra
                  confirmada
                </li>
                <li>
                  • <strong>Cancelamento:</strong> Simula email de pedido
                  cancelado
                </li>
                <li>
                  • <strong>Abertura de Vendas:</strong> Comunica início da
                  venda de ingressos
                </li>
                <li>
                  • <strong>Teste:</strong> Email simples para verificar
                  configuração
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
