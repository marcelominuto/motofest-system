"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Music, Car, Zap, Flame } from "lucide-react";

export default function AtracoesPage() {
  const atracoes = [
    {
      id: 1,
      title: "EXPOSIÇÕES",
      description:
        "As principais marcas de motocicletas se reúnem para mostrar modelos icônicos, lançamentos exclusivos e inovações que representam o futuro das duas rodas. De design a performance, tudo sobre experiências.",
      icon: Car,
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-red-600 to-red-800",
    },
    {
      id: 2,
      title: "SHOWS",
      description:
        "O ritmo do Moto Fest Tarumã também estará no palco! Shows ao vivo com bandas que trazem atitude, energia e personalidade durante os quatro dias. 'Os Daltons', 'Classic Riders' e 'QNOME' prometem uma mistura de rock, clássico e música autoral para completar a 'vibe acelerada' do evento.",
      icon: Music,
      image: "/shows.jpeg",
      color: "bg-gradient-to-br from-purple-600 to-purple-800",
    },
    {
      id: 3,
      title: "PISTA DE TARUMÃ",
      description:
        "A lendária pista Tarumã oferece uma experiência além da velocidade. Acelere como nunca antes, sinta cada curva e viva o verdadeiro espírito das pistas. Uma chance única de pilotar em uma das pistas mais emblemáticas do país, no ritmo do maior evento motociclístico do ano.",
      icon: Zap,
      image: "/pista.jpg",
      color: "bg-gradient-to-br from-blue-600 to-blue-800",
    },
    {
      id: 4,
      title: "PISTA OFF-ROAD",
      description:
        "Prepare-se para desafios off-road! A pista off-road do Moto Fest Tarumã foi projetada para entusiastas da aventura testarem seus limites em terrenos irregulares, subidas, descidas e obstáculos naturais. Uma experiência imersiva que conecta diretamente com a essência crua, suja, intensa e cheia de adrenalina do motociclismo.",
      icon: Flame,
      image: "/trail-pass.jpg",
      color: "bg-gradient-to-br from-green-600 to-green-800",
    },
    {
      id: 5,
      title: "MOBILIDADE URBANA",
      description:
        "Tecnologia, praticidade e uma nova forma de se mover. A pista de mobilidade urbana é o espaço ideal para experimentar motocicletas e scooters elétricos em um percurso projetado para simular o trajeto diário pelas ruas. Uma oportunidade de conhecer soluções que estão transformando o trânsito urbano com conforto, silêncio e sustentabilidade.",
      icon: Zap,
      image: "/pista-mobilidade.jpg",
      color: "bg-gradient-to-br from-teal-600 to-teal-800",
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
              ATRAÇÕES
            </h1>
            <p className="text-gray-300 text-lg">
              Descubra todas as experiências incríveis do Moto Fest Tarumã
            </p>
          </div>

          {/* Grid de Atrações */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {atracoes.map((atracao) => {
              const IconComponent = atracao.icon;
              return (
                <Card
                  key={atracao.id}
                  className="bg-[#222] border border-gray-700 hover:border-red-500 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 overflow-hidden group"
                >
                  <div
                    className={`h-48 ${atracao.color} relative overflow-hidden`}
                    style={{
                      backgroundImage: `url(${atracao.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all duration-300"></div>
                    <div className="absolute bottom-4 left-4">
                      <h3
                        className="text-white font-bold text-2xl"
                        style={{ fontFamily: "Anton, sans-serif" }}
                      >
                        {atracao.title}
                      </h3>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {atracao.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <div className="bg-[#222] border border-gray-700 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                Não perca essa experiência única!
              </h2>
              <p className="text-gray-300 mb-6">
                Garanta seu ingresso e participe do maior evento motociclístico
                do ano
              </p>
              <a
                href="/ingressos"
                className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                COMPRAR INGRESSOS
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
