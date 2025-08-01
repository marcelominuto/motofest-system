"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function AgendaPage() {
  const [openDay, setOpenDay] = useState(2); // Domingo aberto por padrão

  const toggleDay = (dayIndex) => {
    setOpenDay(openDay === dayIndex ? null : dayIndex);
  };

  const agenda = [
    {
      day: "SEXTA-FEIRA",
      date: "31 DE OUTUBRO",
      activities: [
        {
          time: "10:00 - 20:00",
          title: "EM BREVE",
          description: "Programação completa será divulgada em breve",
        },
      ],
    },
    {
      day: "SÁBADO",
      date: "01 DE NOVEMBRO",
      activities: [
        {
          time: "10:00 - 20:00",
          title: "EM BREVE",
          description: "Programação completa será divulgada em breve",
        },
      ],
    },
    {
      day: "DOMINGO",
      date: "02 DE NOVEMBRO",
      activities: [
        {
          time: "10:00 - 20:00",
          title: "EM BREVE",
          description: "Programação completa será divulgada em breve",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Conteúdo principal */}
      <section className="w-full bg-black py-12 px-4 md:px-0">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1
              className="text-4xl md:text-6xl font-bold text-white mb-4"
              style={{ fontFamily: "Anton, sans-serif" }}
            >
              AGENDA
            </h1>
            <p className="text-gray-300 text-lg">
              31 de Outubro a 02 de Novembro de 2025
            </p>
          </div>

          {/* Dias da agenda */}
          <div className="space-y-4">
            {agenda.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className="bg-[#222] border border-gray-700 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleDay(dayIndex)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-[#333] transition-colors duration-200"
                >
                  <span className="text-white font-semibold text-lg">
                    {day.day} | {day.date}
                  </span>
                  {openDay === dayIndex ? (
                    <ChevronUp className="text-red-500 w-6 h-6 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="text-red-500 w-6 h-6 flex-shrink-0" />
                  )}
                </button>

                {openDay === dayIndex && (
                  <div className="px-6 pb-6">
                    <div className="border-t border-gray-700 pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {day.activities.map((activity, activityIndex) => (
                          <div
                            key={activityIndex}
                            className="bg-[#333] border border-gray-600 rounded-lg p-6 hover:bg-[#444] transition-colors duration-200"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <span className="text-red-500 font-bold text-sm">
                                {activity.time}
                              </span>
                            </div>
                            <h3 className="text-white font-semibold text-lg mb-3">
                              {activity.title}
                            </h3>
                            <p className="text-gray-300 text-sm leading-relaxed">
                              {activity.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="mt-8 text-center">
            <p className="text-red-500 font-bold text-lg">
              PROGRAMAÇÃO SUJEITA À ALTERAÇÃO!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
