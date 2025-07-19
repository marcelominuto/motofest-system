"use client";
import { useState, useEffect } from "react";
import ContadorEvento from "@/components/ContadorEvento";
import IngressoCard from "@/components/IngressoCard";

export default function IngressosPage() {
  const [ingressos, setIngressos] = useState([]);
  const [eventoAtivo, setEventoAtivo] = useState(null);

  useEffect(() => {
    fetch("/api/ingressos")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setIngressos(data);
        else if (data && Array.isArray(data.ingressos))
          setIngressos(data.ingressos);
        else setIngressos([]);
      });
    fetch("/api/eventos/ativo")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.dataInicio && data.dataFim) setEventoAtivo(data);
      });
  }, []);

  const alturaCard = "h-[160px]";

  return (
    <>
      {/* Título */}
      <section className="w-full flex justify-center bg-black pt-8 pb-4">
        <h1
          className="text-6xl font-bold text-white"
          style={{ fontFamily: "Anton, sans-serif" }}
        >
          INGRESSOS DISPONÍVEIS
        </h1>
      </section>
      {/* Contador funcional em card igual ao print */}
      <section className="w-full flex justify-center bg-black py-8">
        <ContadorEvento
          data={eventoAtivo ? new Date(eventoAtivo.dataInicio) : null}
          dataLabel={
            eventoAtivo
              ? {
                  inicio: new Date(eventoAtivo.dataInicio)
                    .getDate()
                    .toString()
                    .padStart(2, "0"),
                  mesInicio: `DE ${new Date(eventoAtivo.dataInicio)
                    .toLocaleString("pt-BR", { month: "short" })
                    .toUpperCase()}`,
                  fim: new Date(eventoAtivo.dataFim)
                    .getDate()
                    .toString()
                    .padStart(2, "0"),
                  mesFim: `DE ${new Date(eventoAtivo.dataFim)
                    .toLocaleString("pt-BR", { month: "short" })
                    .toUpperCase()}`,
                }
              : { inicio: "--", mesInicio: "", fim: "--", mesFim: "" }
          }
        />
      </section>
      {/* Cards de ingressos dinâmicos */}
      <section className="w-full flex flex-col items-center bg-black py-8">
        <div className="w-full max-w-5xl flex flex-col gap-8 px-2 md:px-0">
          {ingressos.filter((ingresso) => ingresso && ingresso.tipo).length ===
          0 ? (
            <div className="text-center text-white text-lg py-12 opacity-60">
              Nenhum ingresso disponível no momento.
            </div>
          ) : (
            ingressos
              .filter((ingresso) => ingresso && ingresso.tipo)
              .map((ingresso) => {
                // Lógica para valor: se houver valor1, valor2, valor3, mostrar o menor como 'A partir de XX'
                let valorLabel = "-";
                if (ingresso.valor1 || ingresso.valor2 || ingresso.valor3) {
                  const valores = [
                    ingresso.valor1,
                    ingresso.valor2,
                    ingresso.valor3,
                  ]
                    .map((v) => (v && !isNaN(Number(v)) ? Number(v) : null))
                    .filter((v) => v !== null);
                  if (valores.length > 0) {
                    const menor = Math.min(...valores);
                    valorLabel = `A partir de ${menor.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}`;
                  }
                } else if (ingresso.valor) {
                  valorLabel = Number(ingresso.valor).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  });
                }
                return (
                  <IngressoCard
                    key={ingresso.id}
                    ingresso={{ ...ingresso, valorLabel }}
                    altura={alturaCard}
                    descricaoClass="md:basis-2/5"
                    valorBtnClass="md:w-64"
                  />
                );
              })
          )}
        </div>
      </section>
    </>
  );
}
