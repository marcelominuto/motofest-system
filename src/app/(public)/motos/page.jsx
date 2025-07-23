"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Zap, Gauge } from "lucide-react";

export default function MotosPage() {
  const [motos, setMotos] = useState([]);
  const [ingressos, setIngressos] = useState([]);
  const [eventoAtivo, setEventoAtivo] = useState(null);
  const [filtroIngresso, setFiltroIngresso] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [motosRes, ingressosRes, eventoRes] = await Promise.all([
          fetch("/api/motos"),
          fetch("/api/ingressos"),
          fetch("/api/eventos/ativo"),
        ]);

        const motosData = await motosRes.json();
        const ingressosData = await ingressosRes.json();
        const eventoData = await eventoRes.json();

        console.log("Motos carregadas:", motosData);
        setMotos(motosData);
        setIngressos(ingressosData);
        if (eventoData && eventoData.dataInicio && eventoData.dataFim) {
          setEventoAtivo(eventoData);
        }
      } catch (error) {
        toast.error("Erro ao carregar motos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar motos por ingresso
  const motosFiltradas = filtroIngresso
    ? motos.filter((moto) => moto.ingresso?.tipo === filtroIngresso)
    : motos;

  const motosFiltradasPorMarca = motosFiltradas.reduce((acc, moto) => {
    const marcaNome = moto.marca?.nome || "Sem marca";
    if (!acc[marcaNome]) {
      acc[marcaNome] = [];
    }
    acc[marcaNome].push(moto);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-white">Carregando motos...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Título */}
      <section className="w-full flex justify-center bg-black pt-8 pb-4">
        <div className="text-center">
          <h1
            className="text-6xl font-bold text-white mb-4"
            style={{ fontFamily: "Anton, sans-serif" }}
          >
            NOSSAS MOTOS
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto px-4">
            Descubra nossa frota completa de motos para test ride. Escolha sua
            preferida e agende sua experiência única.
          </p>
        </div>
      </section>

      {/* Filtros */}
      <section className="w-full flex justify-center bg-black py-4">
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            variant={filtroIngresso === "" ? "default" : "outline"}
            onClick={() => setFiltroIngresso("")}
            className={
              filtroIngresso === ""
                ? "bg-red-600 hover:bg-red-700 text-white border-red-600"
                : "border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
            }
          >
            Todas
          </Button>
          {ingressos.map((ingresso) => (
            <Button
              key={ingresso.id}
              variant={filtroIngresso === ingresso.tipo ? "default" : "outline"}
              onClick={() => setFiltroIngresso(ingresso.tipo)}
              className={
                filtroIngresso === ingresso.tipo
                  ? "bg-red-600 hover:bg-red-700 text-white border-red-600"
                  : "border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
              }
            >
              {ingresso.tipo}
            </Button>
          ))}
        </div>
      </section>

      {/* Lista de motos por marca */}
      <section className="w-full flex flex-col items-center bg-black flex-1 min-h-[calc(100vh-160px)] pb-8">
        <div className="w-full max-w-7xl flex flex-col gap-12 px-2 md:px-0 flex-1">
          {Object.keys(motosFiltradasPorMarca).length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center text-white text-lg opacity-60">
              Nenhuma moto encontrada para o filtro selecionado.
            </div>
          ) : (
            Object.entries(motosFiltradasPorMarca).map(
              ([marca, motosMarca]) => (
                <div key={marca} className="w-full">
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold text-white mb-2 text-center">
                      {marca}
                    </h2>
                    <Separator className="bg-red-600" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {motosMarca.map((moto) => (
                      <MotoCard key={moto.id} moto={moto} />
                    ))}
                  </div>
                </div>
              )
            )
          )}
        </div>
      </section>
    </>
  );
}

function MotoCard({ moto }) {
  const getCategoriaColor = (categoria) => {
    if (!categoria) return "bg-gradient-to-r from-gray-500 to-gray-600";

    // Mapeamento dinâmico de cores baseado no nome da categoria
    const categoriaLower = categoria.toLowerCase();

    // Cores específicas para categorias conhecidas
    const coresCategoria = {
      pista: "bg-gradient-to-r from-red-500 to-pink-500",
      scooter: "bg-gradient-to-r from-green-500 to-teal-500",
      elétrica: "bg-gradient-to-r from-blue-500 to-cyan-500",
      "off-road": "bg-gradient-to-r from-orange-500 to-yellow-500",
      naked: "bg-gradient-to-r from-purple-500 to-indigo-500",
      touring: "bg-gradient-to-r from-teal-500 to-blue-500",
      custom: "bg-gradient-to-r from-yellow-500 to-orange-500",
      sport: "bg-gradient-to-r from-red-500 to-orange-500",
      adventure: "bg-gradient-to-r from-green-500 to-blue-500",
    };

    // Retorna cor específica se existir, senão usa cor padrão baseada no hash do nome
    return (
      coresCategoria[categoriaLower] ||
      "bg-gradient-to-r from-gray-500 to-gray-600"
    );
  };

  const getCategoriaLabel = (categoria) => {
    if (!categoria) return "Geral";

    // Capitaliza a primeira letra e mantém o resto como está
    return categoria.charAt(0).toUpperCase() + categoria.slice(1);
  };

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-[#222] border border-gray-800">
      {/* Imagem */}
      <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900">
        {moto.foto ? (
          <img
            src={moto.foto}
            alt={moto.nome}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className={`w-full h-full flex items-center justify-center text-gray-500 ${
            moto.foto ? "hidden" : "flex"
          }`}
        >
          <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Badge de categoria */}
        <div className="absolute top-3 left-3">
          <Badge className={`${getCategoriaColor(moto.categoria)} text-white`}>
            {getCategoriaLabel(moto.categoria)}
          </Badge>
        </div>
      </div>

      {/* Conteúdo */}
      <CardContent className="p-4 pt-0">
        <h3 className="text-lg font-bold text-white mb-4">{moto.nome}</h3>

        {/* Especificações */}
        <div className="flex flex-col gap-2 mb-4">
          {moto.cvs && (
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-red-500" />
              <span className="text-sm text-gray-300">{moto.cvs} cv</span>
            </div>
          )}

          {moto.cilindradas && (
            <div className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-red-500" />
              <span className="text-sm text-gray-300">
                {moto.cilindradas}cc
              </span>
            </div>
          )}
        </div>

        {/* Botão */}
        <Button
          className="w-full bg-red-600 hover:bg-red-700 text-white"
          onClick={() => {
            // Redirecionar para a página de ingressos específica da moto
            const tipoIngresso = moto.ingresso?.tipo;

            if (tipoIngresso) {
              // Converter para kebab-case (lowercase com hífens)
              const tipoFormatado = tipoIngresso
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "");

              console.log(
                "Redirecionando para:",
                `/ingressos/${tipoFormatado}`
              );
              window.location.href = `/ingressos/${tipoFormatado}`;
            } else {
              // Fallback para página geral de ingressos
              window.location.href = "/ingressos";
            }
          }}
        >
          Agendar Test Ride
        </Button>
      </CardContent>
    </Card>
  );
}
