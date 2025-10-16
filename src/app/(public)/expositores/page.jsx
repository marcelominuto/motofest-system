"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bike, Building, MapPin, Users, MessageCircle } from "lucide-react";

export default function ExpositoresPage() {
  // Marcas de moto (primeiro grupo)
  const marcasMoto = [
    {
      id: 1,
      title: "HONDA",
      description:
        "Conheça a linha completa de motocicletas Honda, desde as scooters urbanas até as esportivas de alta performance.",
      category: "Marca de Moto",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-red-600 to-red-800",
    },
    {
      id: 2,
      title: "YAMAHA",
      description:
        "Descubra a tecnologia e inovação das motos Yamaha, com foco em performance e confiabilidade.",
      category: "Marca de Moto",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-blue-600 to-blue-800",
    },
    {
      id: 3,
      title: "KAWASAKI",
      description:
        "Explore a linha Kawasaki com suas motocicletas esportivas e de aventura, conhecidas pela agressividade e tecnologia.",
      category: "Marca de Moto",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-green-600 to-green-800",
    },
    {
      id: 4,
      title: "SUZUKI",
      description:
        "Conheça as motocicletas Suzuki, combinando tradição japonesa com inovação tecnológica.",
      category: "Marca de Moto",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-yellow-600 to-orange-600",
    },
  ];

  // Demais expositores
  const demaisExpositores = [
    {
      id: 5,
      title: "ACESSÓRIOS MOTOCICLÍSTICOS",
      description:
        "Equipamentos de segurança, capacetes, luvas, jaquetas e acessórios para pilotos e motociclistas.",
      category: "Acessórios",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-purple-600 to-purple-800",
    },
    {
      id: 6,
      title: "PNEUS E RODAS",
      description:
        "Especialistas em pneus para motocicletas, rodas esportivas e acessórios para personalização.",
      category: "Pneus",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-gray-600 to-gray-800",
    },
    {
      id: 7,
      title: "SEGUROS E FINANCIAMENTOS",
      description:
        "Soluções em seguros para motocicletas e opções de financiamento para sua próxima moto.",
      category: "Serviços",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-teal-600 to-teal-800",
    },
    {
      id: 8,
      title: "PERSONALIZAÇÃO E TUNING",
      description:
        "Serviços de personalização, tuning e customização para deixar sua moto única.",
      category: "Customização",
      image: "/exposicoes.jpeg",
      color: "bg-gradient-to-br from-pink-600 to-pink-800",
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

          {/* Mapa/Planta do Evento */}
          <div className="mb-16">
            <Card className="bg-[#222] border border-gray-700 hover:border-red-500 transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-8 h-8 text-red-500" />
                  <h2
                    className="text-3xl font-bold text-white"
                    style={{ fontFamily: "Anton, sans-serif" }}
                  >
                    MAPA DO EVENTO
                  </h2>
                </div>
                <div className="bg-gray-800 rounded-lg p-8 text-center">
                  <div className="w-full h-64 bg-gray-700 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg">
                        Mapa/Planta do evento será adicionado aqui
                      </p>
                      <p className="text-gray-500 text-sm mt-2">
                        Dimensões recomendadas: 1200x800px
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-300"></div>
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

          {/* Demais Expositores */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Building className="w-8 h-8 text-blue-500" />
              <h2
                className="text-3xl font-bold text-white"
                style={{ fontFamily: "Anton, sans-serif" }}
              >
                DEMAIS EXPOSITORES
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {demaisExpositores.map((expositor) => {
                return (
                  <Card
                    key={expositor.id}
                    className="bg-[#222] border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 overflow-hidden group"
                  >
                    <div
                      className={`h-32 ${expositor.color} relative overflow-hidden flex items-center justify-center`}
                      style={{
                        backgroundImage: `url(${expositor.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-300"></div>
                      <div className="relative z-10 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <h3
                          className="text-white font-bold text-lg"
                          style={{ fontFamily: "Anton, sans-serif" }}
                        >
                          {expositor.title}
                        </h3>
                      </div>
                    </div>
                  </Card>
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
