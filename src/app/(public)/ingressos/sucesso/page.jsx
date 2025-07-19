import { Suspense } from "react";

function SucessoIngressoPageContent() {
  "use client";
  import { useRouter, useSearchParams } from "next/navigation";
  import { useEffect, useState } from "react";
  import { CheckCircle } from "lucide-react";

  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [pedido, setPedido] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function fetchPedido() {
      setLoading(true);
      setErro("");
      const sessionId = searchParams.get("session_id");
      if (!sessionId) {
        setErro("Sessão não encontrada.");
        setLoading(false);
        return;
      }
      let tentativas = 0;
      let pedidoEncontrado = null;
      while (tentativas < 5 && !pedidoEncontrado) {
        try {
          // Buscar o PaymentIntent pelo session_id
          const resSession = await fetch(`/api/stripe/session/${sessionId}`);
          if (!resSession.ok) throw new Error("Sessão não encontrada");
          const session = await resSession.json();
          const paymentIntentId = session.payment_intent;
          if (!paymentIntentId) throw new Error("PaymentIntent não encontrado");
          // Buscar pedido pelo paymentIntentId
          const resPedido = await fetch(
            `/api/pedidos?paymentIntentId=${paymentIntentId}`
          );
          if (!resPedido.ok) throw new Error("Pedido não encontrado");
          const pedidos = await resPedido.json();
          if (pedidos && pedidos.length > 0) {
            pedidoEncontrado = pedidos[0];
            setPedido(pedidoEncontrado);
            break;
          }
        } catch (err) {
          // aguarda 1s antes de tentar de novo
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        tentativas++;
      }
      if (!pedidoEncontrado) setErro("Não foi possível localizar seu pedido.");
      setLoading(false);
    }
    fetchPedido();
  }, [searchParams]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Carregando...
      </div>
    );
  if (erro)
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        {erro}
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-neutral-900">
      <div className="bg-neutral-800 rounded-xl shadow p-6 mb-6 w-full max-w-xl border border-neutral-700 flex flex-col items-center">
        <CheckCircle className="text-green-500 w-20 h-20 mb-4" />
        <h1 className="text-3xl font-bold mb-2 text-green-400">
          Compra realizada com sucesso!
        </h1>
        {pedido && (
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg shadow p-4 mb-4 w-full">
            <div className="mb-2 text-lg font-bold text-red-500">
              Código do Pedido:{" "}
              <span className="font-mono">{pedido.codigo}</span>
            </div>
            <div className="mb-2 text-gray-200">
              <b>Status:</b>{" "}
              <span
                className={
                  pedido.status === "pago"
                    ? "text-green-400"
                    : "text-orange-400"
                }
              >
                {pedido.status}
              </span>
            </div>
            <div className="mb-2 text-gray-200">
              <b>Valor:</b> R${" "}
              {Number(pedido.valor).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </div>
            <div className="mb-2 text-gray-200">
              <b>Método de pagamento:</b>{" "}
              {pedido.metodoPagamento
                ? pedido.metodoPagamento.toUpperCase()
                : "-"}
            </div>
            <div className="mb-2 text-gray-200">
              <b>Resumo:</b>
            </div>
            <ul className="list-disc pl-6 text-gray-300">
              {pedido.agendamentos?.map((a) => (
                <li key={a.id}>
                  {a.moto?.nome || "-"} ({a.moto?.marca?.nome || "-"}) -{" "}
                  {(() => {
                    if (!a.data) return "-";
                    if (typeof a.data === "string" && a.data.length === 10) {
                      const [year, month, day] = a.data.split("-");
                      return `${day}/${month}/${year}`;
                    }
                    if (typeof a.data === "string" && a.data.length > 10) {
                      const [year, month, day] = a.data
                        .split("T")[0]
                        .split("-");
                      return `${day}/${month}/${year}`;
                    }
                    const d = new Date(a.data);
                    if (!isNaN(d)) {
                      return `${String(d.getUTCDate()).padStart(
                        2,
                        "0"
                      )}/${String(d.getUTCMonth() + 1).padStart(
                        2,
                        "0"
                      )}/${d.getUTCFullYear()}`;
                    }
                    return "-";
                  })()}{" "}
                  às {a.horario?.hora || "-"}
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="text-lg text-gray-300 mb-4 text-center max-w-xl">
          Obrigado por adquirir seu ingresso para o Moto Fest Tarumã!
          <br />
          Você receberá um e-mail com as instruções e detalhes do seu
          agendamento.
          <br />
          <span className="font-semibold text-white">
            Leve seu documento e o comprovante de pagamento no dia do evento.
          </span>
        </p>
        <button
          className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg font-bold text-lg hover:bg-red-700 transition"
          onClick={() => router.push("/")}
        >
          Voltar para a Home
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <SucessoIngressoPageContent />
    </Suspense>
  );
}
