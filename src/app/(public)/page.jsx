"use client";
import { useState, useEffect } from "react";
import ContadorEvento from "@/components/ContadorEvento";
import IngressoCard from "@/components/IngressoCard";

const [eventoAtivo, setEventoAtivo] = [null, null]; // placeholder, será ajustado abaixo

function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate));
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);
  return timeLeft;
}
function getTimeLeft(targetDate) {
  const now = new Date();
  const diff = Math.max(0, targetDate - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export default function HomePage() {
  // Banner
  const banners = [
    { id: 1, desktop: "/banner1.png", mobile: "/banner1-mobile.png" },
    { id: 2, desktop: "/banner2.png", mobile: "/banner2-mobile.png" },
    { id: 3, desktop: "/banner3.png", mobile: "/banner3-mobile.png" },
  ];
  const [current, setCurrent] = useState(0);
  const nextSlide = () => setCurrent((prev) => (prev + 1) % banners.length);
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);

  // Auto-play do slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Muda a cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  // Contador
  // const countdown = useCountdown(EVENT_START);

  // Ingressos
  const [ingressos, setIngressos] = useState([]);
  useEffect(() => {
    fetch("/api/ingressos")
      .then((res) => res.json())
      .then((data) => {
        console.log("API /api/ingressos resposta:", data);
        if (Array.isArray(data)) setIngressos(data);
        else if (data && Array.isArray(data.ingressos))
          setIngressos(data.ingressos);
        else setIngressos([]);
      });
  }, []);

  const alturaCard = "h-[160px]";
  const dataEvento = new Date("2024-10-31T00:00:00-03:00");
  const dataLabel = {
    inicio: "31",
    mesInicio: "DE OUT",
    fim: "02",
    mesFim: "DE NOV",
  };

  const [eventoAtivo, setEventoAtivo] = useState(null);
  useEffect(() => {
    fetch("/api/eventos/ativo")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.dataInicio && data.dataFim) setEventoAtivo(data);
      });
  }, []);

  return (
    <>
      {/* Banner Slideshow - corrigido para evitar scroll horizontal */}
      <section className="relative w-full h-[220px] md:h-[350px] lg:h-[400px] flex items-stretch overflow-hidden bg-black m-0 p-0 overflow-x-hidden">
        <picture className="w-full h-full">
          {/* Desktop */}
          <source
            media="(min-width: 768px)"
            srcSet={banners[current].desktop}
          />
          {/* Mobile */}
          <img
            src={banners[current].mobile}
            alt={`Banner Principal ${banners[current].id}`}
            className="object-cover w-full h-full max-w-full select-none pointer-events-none"
            draggable={false}
          />
        </picture>
        {/* Setas de navegação - chevrons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-0 bg-transparent border-none outline-none cursor-pointer"
          aria-label="Anterior"
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            className="fill-red-600 opacity-80 hover:opacity-100"
            style={{ display: "block" }}
          >
            <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-0 bg-transparent border-none outline-none cursor-pointer"
          aria-label="Próximo"
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            className="fill-red-600 opacity-80 hover:opacity-100"
            style={{ display: "block" }}
          >
            <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z" />
          </svg>
        </button>
        {/* Indicadores (opcional) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {banners.map((_, idx) => (
            <span
              key={idx}
              className={`w-2 h-2 rounded-full ${
                idx === current ? "bg-white" : "bg-gray-500"
              }`}
            />
          ))}
        </div>
      </section>
      {/* Banner das marcas - corrigido para não causar scroll horizontal */}
      <section className="w-full flex justify-center items-center bg-black m-0 py-8 overflow-x-hidden">
        <img
          src="/marcas.png"
          alt="Banner Marcas"
          className="object-contain max-w-full h-20 md:h-32 lg:h-40 select-none pointer-events-none"
          draggable={false}
        />
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

      {/* Chamada para cadastro com desconto - visual sóbrio e integrado */}
      <section className="w-full flex justify-center bg-black pb-12 px-2 md:px-0">
        <div
          className="w-full max-w-5xl flex flex-col items-center gap-4 bg-black border border-red-700 rounded-xl shadow-lg p-6 md:p-10 mx-auto"
          style={{ boxShadow: "0 0 24px 0 rgba(220, 38, 38, 0.10)" }}
        >
          <h2
            className="text-2xl md:text-3xl font-extrabold text-white text-center mb-1"
            style={{ fontFamily: "Anton, sans-serif" }}
          >
            Garanta <span className="text-red-500">50% de desconto</span> no
            Fest Pass
          </h2>
          <p className="text-base md:text-lg text-gray-200 text-center font-sans mb-2 px-4 md:px-12">
            Cadastre-se agora e aproveite o desconto exclusivo para quem vai
            comprar o ingresso presencialmente, na hora do evento.
          </p>
          <a
            href="/cadastro"
            className="mt-2 px-8 py-3 border-2 border-white text-white font-bold rounded-lg text-lg bg-transparent hover:bg-red-600 hover:text-white transition-all outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
          >
            QUERO MEU DESCONTO
          </a>
        </div>
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
