"use client";

import { Card } from "@/components/ui/card";
import { Bike, Building, Users, MessageCircle, Utensils } from "lucide-react";

export default function ExpositoresPage() {
  // Marcas de moto (primeiro grupo)
  const marcasMoto = [
    {
      id: 1,
      title: "HONDA",
      description:
        "Conheça a linha completa de motocicletas Honda, desde as scooters urbanas até as esportivas de alta performance.",
      category: "Marca de Moto",
      image: "/expositores/honda.png",
      color: "bg-gradient-to-br from-red-600 to-red-800",
    },
    {
      id: 2,
      title: "BAJAJ",
      description:
        "Descubra a confiabilidade das motocicletas Bajaj, líder em vendas na Índia e presente no Brasil.",
      category: "Marca de Moto",
      image: "/expositores/bajaj.png",
      color: "bg-gradient-to-br from-yellow-600 to-orange-600",
    },
    {
      id: 3,
      title: "HARLEY-DAVIDSON",
      description:
        "Viva a liberdade e o estilo de vida Harley-Davidson com suas icônicas motocicletas customizadas.",
      category: "Marca de Moto",
      image: "/expositores/harley.png",
      color: "bg-gradient-to-br from-orange-600 to-orange-800",
    },
    {
      id: 4,
      title: "BMW",
      description:
        "Descubra a elegância e tecnologia das motocicletas BMW, conhecidas por sua engenharia alemã de precisão.",
      category: "Marca de Moto",
      image: "/expositores/bmw.png",
      color: "bg-gradient-to-br from-blue-600 to-blue-800",
    },
    {
      id: 5,
      title: "SHINERAY",
      description:
        "Conheça as motocicletas Shineray, combinando qualidade chinesa com preços acessíveis para o mercado brasileiro.",
      category: "Marca de Moto",
      image: "/expositores/shineray.png",
      color: "bg-gradient-to-br from-purple-600 to-purple-800",
    },
    {
      id: 6,
      title: "KAWASAKI",
      description:
        "Explore a linha Kawasaki com suas motocicletas esportivas e de aventura, conhecidas pela agressividade e tecnologia.",
      category: "Marca de Moto",
      image: "/expositores/kawasaki.png",
      color: "bg-gradient-to-br from-green-600 to-green-800",
    },
  ];

  // Motos Elétricas
  const motosEletricas = [
    {
      id: 7,
      title: "MOTOCHEFE",
      description:
        "Motos elétricas inovadoras para mobilidade urbana sustentável.",
      category: "Moto Elétrica",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-green-600 to-green-800",
    },
    {
      id: 8,
      title: "JOY",
      description: "Soluções em mobilidade elétrica para o futuro das cidades.",
      category: "Moto Elétrica",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-blue-600 to-blue-800",
    },
    {
      id: 9,
      title: "SUDU",
      description: "Tecnologia elétrica avançada para motocicletas do futuro.",
      category: "Moto Elétrica",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-purple-600 to-purple-800",
    },
    {
      id: 10,
      title: "WEHAWK",
      description: "Inovação em mobilidade elétrica para o mercado brasileiro.",
      category: "Moto Elétrica",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-teal-600 to-teal-800",
    },
    {
      id: 11,
      title: "PANDA/PD",
      description: "Motos elétricas compactas e eficientes para o dia a dia.",
      category: "Moto Elétrica",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-orange-600 to-orange-800",
    },
    {
      id: 12,
      title: "MUUV",
      description:
        "Mobilidade urbana elétrica com design moderno e sustentável.",
      category: "Moto Elétrica",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-cyan-600 to-cyan-800",
    },
    {
      id: 13,
      title: "TUI",
      description: "Tecnologia elétrica de ponta para motocicletas urbanas.",
      category: "Moto Elétrica",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-pink-600 to-pink-800",
    },
    {
      id: 14,
      title: "TRIBIKES TRICICLOS",
      description:
        "Triciclos elétricos para mobilidade alternativa e sustentável.",
      category: "Moto Elétrica",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-indigo-600 to-indigo-800",
    },
    {
      id: 15,
      title: "DUACT MOTO ELÉTRICA",
      description:
        "Inovação em motocicletas elétricas para o mercado nacional.",
      category: "Moto Elétrica",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-emerald-600 to-emerald-800",
    },
  ];

  // Expositores da Praça de Alimentação
  const praçaAlimentacao = [
    {
      id: 16,
      title: "CASAMATA 1",
      description: "Variedade de pratos e lanches para todos os gostos.",
      category: "Alimentação",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-orange-600 to-orange-800",
    },
    {
      id: 17,
      title: "CASAMATA 2",
      description: "Cardápio diversificado com opções para toda a família.",
      category: "Alimentação",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-red-600 to-red-800",
    },
    {
      id: 18,
      title: "CASAMATA 3",
      description: "Sabores únicos e pratos especiais do evento.",
      category: "Alimentação",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-yellow-600 to-yellow-800",
    },
    {
      id: 19,
      title: "JOHNNY BURGUERS",
      description: "Hambúrgueres artesanais e lanches gourmet.",
      category: "Alimentação",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-amber-600 to-amber-800",
    },
    {
      id: 20,
      title: "ANNA BISTRO",
      description: "Culinária refinada e pratos especiais.",
      category: "Alimentação",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-rose-600 to-rose-800",
    },
    {
      id: 21,
      title: "BRUTUS HAMBURGUERIA",
      description: "Hambúrgueres premium e combos especiais.",
      category: "Alimentação",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-red-700 to-red-900",
    },
    {
      id: 22,
      title: "CARVALHO EVENTOS",
      description: "Catering especializado para eventos motociclísticos.",
      category: "Alimentação",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-green-600 to-green-800",
    },
    {
      id: 23,
      title: "PASTELÃO DO MESTRE",
      description: "Pastéis artesanais e salgados tradicionais.",
      category: "Alimentação",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-yellow-700 to-yellow-900",
    },
  ];

  // Estandes diversos
  const estandesDiversos = [
    {
      id: 24,
      title: "FILTRALUB",
      description:
        "Especialistas em filtros e lubrificantes para motocicletas.",
      category: "Acessórios",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-blue-600 to-blue-800",
    },
    {
      id: 25,
      title: "PROMEC 4X4",
      description: "Equipamentos e acessórios para aventuras off-road.",
      category: "Acessórios",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-green-600 to-green-800",
    },
    {
      id: 26,
      title: "ROAD EXPLORER",
      description: "Aventuras e viagens motociclísticas pelo Brasil.",
      category: "Turismo",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-orange-600 to-orange-800",
    },
    {
      id: 27,
      title: "RUTA 40 MOTOTURISMO",
      description:
        "Especialistas em viagens motociclísticas pela América Latina.",
      category: "Turismo",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-red-600 to-red-800",
    },
    {
      id: 28,
      title: "ALLTRACKS",
      description: "Equipamentos e acessórios para trilhas e aventuras.",
      category: "Acessórios",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-purple-600 to-purple-800",
    },
    {
      id: 29,
      title: "MOTOBOLHAS",
      description: "Acessórios e equipamentos para motociclistas.",
      category: "Acessórios",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-cyan-600 to-cyan-800",
    },
    {
      id: 30,
      title: "GARAGEM PARA MOTOS",
      description: "Serviços de manutenção e reparos para motocicletas.",
      category: "Serviços",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-gray-600 to-gray-800",
    },
    {
      id: 31,
      title: "RIDE BRASIL",
      description: "Comunidade e eventos para motociclistas brasileiros.",
      category: "Comunidade",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-yellow-600 to-yellow-800",
    },
    {
      id: 32,
      title: "EKO 7",
      description: "Soluções sustentáveis para o setor motociclístico.",
      category: "Sustentabilidade",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-emerald-600 to-emerald-800",
    },
    {
      id: 33,
      title: "CEAT",
      description: "Pneus e soluções para motocicletas.",
      category: "Pneus",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-indigo-600 to-indigo-800",
    },
    {
      id: 34,
      title: "MOTUL",
      description:
        "Lubrificantes e produtos para motocicletas de alta performance.",
      category: "Lubrificantes",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-red-700 to-red-900",
    },
    {
      id: 35,
      title: "OFF RIDER",
      description: "Equipamentos e acessórios para pilotos off-road.",
      category: "Acessórios",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-orange-700 to-orange-900",
    },
    {
      id: 36,
      title: "CONFRARIA DA HAYABUSA",
      description: "Clube de proprietários da lendária Hayabusa.",
      category: "Comunidade",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-blue-700 to-blue-900",
    },
    {
      id: 37,
      title: "T-SHIRT",
      description: "Camisetas e produtos personalizados para motociclistas.",
      category: "Vestuário",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-pink-600 to-pink-800",
    },
  ];

  // Boutiques e multimarcas
  const boutiquesMultimarcas = [
    {
      id: 38,
      title: "SPINELLI BOUTIQUE",
      description:
        "Boutique especializada em acessórios e vestuário motociclístico.",
      category: "Boutique",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-purple-600 to-purple-800",
    },
    {
      id: 39,
      title: "MELVI MOTOS",
      description: "Multimarcas com variedade de motocicletas e acessórios.",
      category: "Multimarcas",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-green-600 to-green-800",
    },
    {
      id: 40,
      title: "HS CONSÓRCIOS",
      description: "Soluções em consórcio para aquisição de motocicletas.",
      category: "Financiamento",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-blue-600 to-blue-800",
    },
    {
      id: 41,
      title: "TERRASUL MOTOS",
      description: "Concessionária multimarcas com variedade de modelos.",
      category: "Concessionária",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-orange-600 to-orange-800",
    },
    {
      id: 42,
      title: "TOMI MOTOLAND",
      description: "Especialistas em motocicletas e acessórios diversos.",
      category: "Multimarcas",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-red-600 to-red-800",
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <section className="w-full bg-black py-12 px-4 md:px-0">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1
              className="text-4xl md:text-6xl font-bold text-white mb-4"
              style={{ fontFamily: "Anton, sans-serif" }}
            >
              EXPOSITORES
            </h1>
            <p className="text-gray-300 text-lg">
              Conheça as principais marcas e empresas do setor motociclístico
            </p>
          </div>

          {/* Marcas de Moto */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Bike className="w-8 h-8 text-red-500" />
              <h2
                className="text-3xl font-bold text-white"
                style={{ fontFamily: "Anton, sans-serif" }}
              >
                MARCAS DE MOTOCICLETAS
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {marcasMoto.map((marca) => {
                return (
                  <Card
                    key={marca.id}
                    className="bg-[#222] border border-gray-700 hover:border-red-500 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 overflow-hidden group"
                  >
                    <div
                      className={`h-32 ${marca.color} relative overflow-hidden flex items-center justify-center`}
                      style={{
                        backgroundImage: `url(${marca.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300"></div>
                      <div className="relative z-10 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <h3
                          className="text-white font-bold text-lg"
                          style={{ fontFamily: "Anton, sans-serif" }}
                        >
                          {marca.title}
                        </h3>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Motos Elétricas */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Bike className="w-8 h-8 text-green-500" />
              <h2
                className="text-3xl font-bold text-white"
                style={{ fontFamily: "Anton, sans-serif" }}
              >
                MOTOS ELÉTRICAS
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {motosEletricas.map((moto) => {
                return (
                  <div
                    key={moto.id}
                    className="bg-[#222] border border-gray-700 rounded-lg p-4 hover:border-green-500 transition-all duration-300"
                  >
                    <h3
                      className="text-white font-bold text-2xl"
                      style={{ fontFamily: "Anton, sans-serif" }}
                    >
                      {moto.title}
                    </h3>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Estandes Diversos */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Building className="w-8 h-8 text-blue-500" />
              <h2
                className="text-3xl font-bold text-white"
                style={{ fontFamily: "Anton, sans-serif" }}
              >
                ESTANDES DIVERSOS
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {estandesDiversos.map((expositor) => {
                return (
                  <div
                    key={expositor.id}
                    className="bg-[#222] border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-all duration-300"
                  >
                    <h3
                      className="text-white font-bold text-2xl"
                      style={{ fontFamily: "Anton, sans-serif" }}
                    >
                      {expositor.title}
                    </h3>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Boutiques e Multimarcas */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Users className="w-8 h-8 text-purple-500" />
              <h2
                className="text-3xl font-bold text-white"
                style={{ fontFamily: "Anton, sans-serif" }}
              >
                BOUTIQUES E MULTIMARCAS
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {boutiquesMultimarcas.map((expositor) => {
                return (
                  <div
                    key={expositor.id}
                    className="bg-[#222] border border-gray-700 rounded-lg p-4 hover:border-purple-500 transition-all duration-300"
                  >
                    <h3
                      className="text-white font-bold text-2xl"
                      style={{ fontFamily: "Anton, sans-serif" }}
                    >
                      {expositor.title}
                    </h3>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Praça de Alimentação */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Utensils className="w-8 h-8 text-orange-500" />
              <h2
                className="text-3xl font-bold text-white"
                style={{ fontFamily: "Anton, sans-serif" }}
              >
                PRAÇA DE ALIMENTAÇÃO
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {praçaAlimentacao.map((expositor) => {
                return (
                  <div
                    key={expositor.id}
                    className="bg-[#222] border border-gray-700 rounded-lg p-4 hover:border-orange-500 transition-all duration-300"
                  >
                    <h3
                      className="text-white font-bold text-2xl"
                      style={{ fontFamily: "Anton, sans-serif" }}
                    >
                      {expositor.title}
                    </h3>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-[#222] border border-gray-700 rounded-lg p-8">
              <h2
                className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight"
                style={{ fontFamily: "Anton, sans-serif" }}
              >
                QUER SER UM EXPOSITOR?
              </h2>
              <p className="text-gray-300 mb-6 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
                Entre em contato conosco e faça parte do maior evento
                motociclístico do Sul do Brasil. Uma oportunidade única de
                apresentar seus produtos e serviços para milhares de
                entusiastas.
              </p>
              <a
                href="https://wa.me/5551992485757?text=Ol%C3%A1%21%20Tenho%20interesse%20em%20ser%20expositor%20no%20Sal%C3%A3o%20Moto%20Fest%20Tarum%C3%A3.%20Gostaria%20de%20mais%20informa%C3%A7%C3%B5es."
                className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                <MessageCircle className="w-5 h-5" />
                ENTRE EM CONTATO
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
