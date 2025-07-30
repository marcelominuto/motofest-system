"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, Ticket } from "lucide-react";
import Link from "next/link";

export default function SucessoPage() {
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar dados do pedido da URL ou localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("order_id");

    if (orderId) {
      // Buscar dados do pedido
      fetch(`/api/pagarme/session/${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          setPedido(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Pagamento Confirmado!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-gray-600">
              Seu pagamento foi processado com sucesso!
            </p>
            {pedido && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="text-sm text-gray-500">Detalhes do pedido:</p>
                <p className="font-medium">{pedido.name}</p>
                <p className="text-sm text-gray-600">ID: {pedido.id}</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Link href="/ingressos" className="w-full">
              <Button className="w-full" variant="outline">
                <Ticket className="h-4 w-4 mr-2" />
                Comprar Mais Ingressos
              </Button>
            </Link>

            <Link href="/" className="w-full">
              <Button className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Voltar ao Início
              </Button>
            </Link>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Você receberá um email de confirmação em breve.</p>
            <p>Em caso de dúvidas, entre em contato conosco.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
