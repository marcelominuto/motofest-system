"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Trophy,
  Users,
  MapPin,
  Clock,
  Droplets,
  MessageCircle,
  User,
} from "lucide-react";

export default function OffRoadPage() {
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
              ENDURO PARK TARUMÃ
            </h1>
            <p className="text-gray-300 text-lg mb-6">
              Qualificação para pilotagem OFF Road
            </p>
            <p className="text-gray-400 text-base max-w-3xl mx-auto">
              Desenvolva técnicas básicas e reconhecidas mundialmente para
              tornar a sua pilotagem mais segura e prazerosa!
            </p>
          </div>

          {/* Informações Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="bg-[#222] border border-gray-700 hover:border-red-500 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-red-500" />
                  <h3 className="text-xl font-bold text-white">Local</h3>
                </div>
                <p className="text-gray-300">
                  Salão Moto Fest Tarumã - Viamão/RS
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#222] border border-gray-700 hover:border-red-500 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-red-500" />
                  <h3 className="text-xl font-bold text-white">Organização</h3>
                </div>
                <div className="flex flex-col gap-2">
                  <a
                    href="https://www.instagram.com/offriderbr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-500 hover:text-red-400 transition-colors font-semibold"
                  >
                    OFF Rider
                  </a>
                  <a
                    href="https://www.instagram.com/roadexplorerbrazil/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-500 hover:text-red-400 transition-colors font-semibold"
                  >
                    Road Explorer
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Treinamento */}
          <Card className="bg-[#222] border border-gray-700 hover:border-red-500 transition-all duration-300 mb-8">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-8 h-8 text-red-500" />
                <h2
                  className="text-3xl font-bold text-white"
                  style={{ fontFamily: "Anton, sans-serif" }}
                >
                  TREINAMENTO OFF ROAD
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-red-600 text-white">
                      31/10 a 01/11
                    </Badge>
                    <Badge className="bg-gray-600 text-white">
                      8h às 12h / 14h às 18h
                    </Badge>
                  </div>

                  <p className="text-gray-300 mb-6">
                    Ao longo de 4 horas serão desenvolvidos exercícios e
                    transferidas técnicas que habilitarão o participante a
                    pilotar no OFF Road com confiança e tranquilidade.
                  </p>

                  <h3 className="text-xl font-bold text-white mb-4">
                    Exercícios abordados:
                  </h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Posicionamento sobre a motocicleta
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Setup e ajustes
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Equilíbrio e controle em manobras de baixa velocidade
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Frenagem no OFF Road
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Aclive e declive
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Transposição de terrenos instáveis (areia e brita)
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    Investimento:
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-[#333] rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-semibold">
                          1º lote (10 primeiros)
                        </span>
                        <span className="text-green-500 font-bold text-xl">
                          R$ 390,00
                        </span>
                      </div>
                    </div>
                    <div className="bg-[#333] rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-semibold">
                          2º lote
                        </span>
                        <span className="text-red-500 font-bold text-xl">
                          R$ 440,00
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 text-cyan-400">
                    <Droplets className="w-5 h-5" />
                    <span className="text-sm">Hidratação inclusa</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Torneio */}
          <Card className="bg-[#222] border border-gray-700 hover:border-red-500 transition-all duration-300 mb-8">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-8 h-8 text-yellow-500" />
                <h2
                  className="text-3xl font-bold text-white"
                  style={{ fontFamily: "Anton, sans-serif" }}
                >
                  TORNEIO DE HABILIDADES
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-yellow-600 text-white">02/11/25</Badge>
                    <Badge className="bg-gray-600 text-white">10h às 13h</Badge>
                  </div>

                  <p className="text-gray-300 mb-4">
                    Motos Trail e Big Trail (a partir de 450cc)
                  </p>

                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span className="text-white font-semibold">
                      Premiação para os participantes
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-cyan-400">
                    <Droplets className="w-5 h-5" />
                    <span className="text-sm">Hidratação inclusa</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    Investimento:
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-[#333] rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-semibold">
                          Inscrição até 30/10
                        </span>
                        <span className="text-green-500 font-bold text-xl">
                          R$ 250,00
                        </span>
                      </div>
                    </div>
                    <div className="bg-[#333] rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-semibold">
                          A partir de 31/10
                        </span>
                        <span className="text-red-500 font-bold text-xl">
                          R$ 290,00
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instrutores */}
          <Card className="bg-[#222] border border-gray-700 hover:border-red-500 transition-all duration-300 mb-8">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-8 h-8 text-red-500" />
                <h2
                  className="text-3xl font-bold text-white"
                  style={{ fontFamily: "Anton, sans-serif" }}
                >
                  INSTRUTORES
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-[#333] rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <User className="w-10 h-10 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Alexandre Kracik
                  </h3>
                  <p className="text-gray-400 text-sm">(Penélope)</p>
                </div>

                <div className="text-center">
                  <div className="bg-[#333] rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <User className="w-10 h-10 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Daniel Goulart
                  </h3>
                </div>

                <div className="text-center">
                  <div className="bg-[#333] rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <User className="w-10 h-10 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Leandro Krug</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center space-y-8">
            {/* Seção WhatsApp */}
            <div className="bg-[#222] border border-gray-700 rounded-lg p-8">
              <h2
                className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight"
                style={{ fontFamily: "Anton, sans-serif" }}
              >
                SAUDAÇÕES ESTRADEIRAS
                <br className="md:hidden" />
                <span className="hidden md:inline"> E </span>
                <span className="md:hidden">E</span>
                <br className="md:hidden" />
                BONS HORIZONTES!
              </h2>
              <p className="text-gray-300 mb-6">
                A partir das técnicas desenvolvidas no treinamento, o
                participante desenvolverá habilidade necessária para percorrer
                caminhos e desbravar horizontes que antes pareciam um desafio
                distante.
              </p>

              {/* Botão WhatsApp */}
              <button
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200"
                onClick={async () => {
                  // Enviar webhook para Discord
                  const discordPayload = {
                    content: "",
                    tts: false,
                    embeds: [
                      {
                        title: "NOVA INSCRIÇÃO OFF ROAD!",
                        color: 16750848,
                        timestamp: new Date().toISOString(),
                        fields: [
                          {
                            id: 477098321,
                            name: "Tipo",
                            value: "Treinamento OFF Road",
                            inline: true,
                          },
                          {
                            id: 531816709,
                            name: "Evento",
                            value: "Enduro Park Tarumã",
                            inline: true,
                          },
                          {
                            id: 980485366,
                            name: "Data",
                            value: "31/10 a 01/11",
                            inline: true,
                          },
                          {
                            id: 104269543,
                            name: "Horário",
                            value: "8h às 12h / 14h às 18h",
                            inline: true,
                          },
                        ],
                      },
                    ],
                    components: [],
                    actions: {},
                    flags: 0,
                    username: "SALÃO MOTO FEST",
                    avatar_url: "https://i.ibb.co/YBC3HZtG/LOGO.png",
                  };

                  try {
                    await fetch("/api/discord", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(discordPayload),
                    });
                  } catch (err) {
                    console.error("Erro ao enviar webhook para Discord:", err);
                  }

                  // Redirecionar para WhatsApp após enviar webhook
                  window.open(
                    "https://wa.me/5551999440999?text=Ol%C3%A1%21%20Gostaria%20de%20me%20inscrever%20no%20treinamento%20OFF%20Road%20do%20Enduro%20Park%20Tarum%C3%A3.%20Qual%20o%20pr%C3%B3ximo%20passo%3F",
                    "_blank"
                  );
                }}
              >
                FAZER INSCRIÇÃO
              </button>
              <p className="text-gray-400 text-sm mt-2 italic">
                Inscrição realizada via WhatsApp
              </p>
            </div>

            {/* Seção Trail Pass */}
            <div
              className="bg-gradient-to-br from-[#222] to-[#333] border-2 border-red-600 rounded-xl p-8 shadow-2xl"
              style={{ boxShadow: "0 0 32px 0 rgba(220, 38, 38, 0.20)" }}
            >
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 text-center md:text-left">
                  <h3
                    className="text-4xl md:text-5xl font-bold text-white mb-4"
                    style={{ fontFamily: "Anton, sans-serif" }}
                  >
                    TRAIL PASS
                  </h3>
                  <p className="text-gray-300 mb-4 text-lg">
                    Experimente a adrenalina pura testando motos no nosso
                    circuito OFF Road exclusivo. Uma experiência única que
                    combina aventura, técnica e diversão em um ambiente
                    controlado e seguro.
                  </p>
                  <p className="text-gray-400 text-sm">
                    Acesso completo ao circuito OFF Road para test rides com
                    diferentes modelos de motos.
                  </p>
                </div>

                <div className="flex-shrink-0">
                  <img
                    src="/trail-pass.jpg"
                    alt="Trail Pass"
                    className="w-48 h-48 md:w-56 md:h-56 object-cover rounded-lg"
                  />
                </div>
              </div>

              <div className="mt-6 text-center">
                <a
                  href="/ingressos/trail-pass"
                  className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200"
                >
                  COMPRAR TRAIL PASS
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
