"use client";
import { useRouter } from "next/navigation";

export default function IngressoCard({
  ingresso,
  descricaoClass = "",
  valorBtnClass = "",
}) {
  const router = useRouter();

  // Separar label e valor
  let label = "";
  let valor = ingresso.valorLabel || "-";
  if (valor.startsWith("A partir de ")) {
    label = "A partir de ";
    valor = valor.replace("A partir de ", "");
  }
  // Nome do ingresso com quebra de linha entre palavras
  const nomeFormatado = (ingresso.tipo || "")
    .split(" ")
    .join("<br />")
    .toUpperCase();

  const handleComprarClick = () => {
    if (ingresso.esgotado) return;

    // Verificar se é um ingresso do tipo test-ride
    const isTestRide = ingresso.categoria === "test ride";

    if (isTestRide) {
      // Redirecionar para a página dinâmica do ingresso
      router.push(
        `/ingressos/${ingresso.tipo.toLowerCase().replace(/\s+/g, "-")}`
      );
    } else {
      // Para outros tipos de ingresso, redirecionar para link específico salvo
      if (ingresso.link) {
        const url = /^https?:\/\//.test(ingresso.link)
          ? ingresso.link
          : `https://${ingresso.link}`;
        window.open(url, "_blank");
      }
    }
  };

  return (
    <div
      className={`bg-[#222] overflow-hidden rounded p-2 md:p-4 flex flex-col gap-2 md:gap-0 md:grid`}
      style={
        typeof window !== "undefined" && window.innerWidth >= 768
          ? {
              gridTemplateColumns: "1fr 1fr 2fr auto",
              alignItems: "center",
              gap: "1rem",
            }
          : undefined
      }
    >
      {/* Título */}
      <div className="w-full flex items-center justify-center px-0 min-h-[56px] md:min-h-0">
        <span
          className="text-3xl md:text-5xl font-extrabold text-white leading-tight text-center w-full"
          style={{ fontFamily: "Anton, sans-serif" }}
          dangerouslySetInnerHTML={{ __html: nomeFormatado }}
        />
      </div>
      {/* Descrição */}
      <div
        className={`w-full flex items-center justify-center px-0 md:px-4 py-0 min-w-0 ${descricaoClass}`}
      >
        <span className="text-white text-sm md:text-sm font-normal break-words w-full min-w-0 overflow-hidden text-center md:text-left">
          {ingresso.descricao || "Sem descrição"}
        </span>
      </div>
      {/* Valor */}
      <div className="w-full flex flex-col items-center md:items-end px-0 md:px-4">
        {label && (
          <span className="text-xs md:text-sm font-sans text-white mb-0.5">
            {label}
          </span>
        )}
        <span className="text-3xl md:text-5xl font-bold text-white font-sans text-center md:text-right">
          {valor}
        </span>
      </div>
      {/* Botão */}
      <div className="w-full flex items-center justify-center md:justify-end px-0 md:px-4 md:w-auto mt-2">
        {ingresso.esgotado ? (
          <span className="w-full md:min-w-[140px] text-center text-white font-bold py-2 rounded border-2 border-white opacity-60 cursor-not-allowed font-sans">
            ESGOTADO!
          </span>
        ) : (
          <button
            onClick={handleComprarClick}
            className="w-full border-2 border-white text-white font-bold font-sans uppercase p-2 rounded transition bg-transparent hover:bg-red-600 hover:text-white max-w-xs cursor-pointer"
          >
            COMPRAR INGRESSO
          </button>
        )}
      </div>
    </div>
  );
}
