"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FAQPage() {
  const [openAccordion, setOpenAccordion] = useState(null);

  const toggleAccordion = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const faqs = [
    {
      question: "O que é o Salão Moto Fest?",
      answer:
        "O Salão Moto Fest é um evento exclusivo que reúne as principais marcas de motocicletas para você experimentar as melhores motos do mercado. É uma oportunidade única de fazer test rides em motos de alta performance em um ambiente seguro e controlado.",
    },
    {
      question: "Como funciona o test ride?",
      answer:
        "O test ride é uma experiência guiada onde você pode pilotar diferentes motos por um circuito específico. Cada sessão dura aproximadamente 15-20 minutos, incluindo briefing de segurança, equipamento e pilotagem supervisionada por instrutores experientes.",
    },
    {
      question: "Quais documentos preciso levar?",
      answer:
        "Você precisa apresentar: CNH válida categoria A, documento de identidade (RG ou CPF), e o comprovante de pagamento (email de confirmação). É obrigatório ter CNH há pelo menos 2 anos para participar dos test rides.",
    },
    {
      question: "Que equipamentos de segurança são obrigatórios?",
      answer:
        "São obrigatórios: capacete fechado (fornecido pelo evento), jaqueta de manga longa, calça comprida, calçado fechado e luvas (recomendado). A organização fornece capacetes certificados, mas você pode trazer o seu próprio se preferir.",
    },
    {
      question: "Posso participar mesmo sem experiência?",
      answer:
        "Sim! O evento é aberto para pilotos de todos os níveis de experiência. Nossos instrutores fazem um briefing completo sobre cada moto e acompanham toda a experiência. Para iniciantes, recomendamos começar com motos de menor cilindrada.",
    },
    {
      question: "Quantas motos posso experimentar?",
      answer:
        "O número de motos depende do tipo de ingresso escolhido. O Ride Pass permite experimentar 2 motos diferentes, enquanto o Fest Pass oferece acesso a todas as motos disponíveis durante o evento. Cada sessão é agendada previamente.",
    },
    {
      question: "O que acontece em caso de chuva?",
      answer:
        "O evento acontece mesmo com chuva leve, mas pode ser cancelado ou adiado em caso de chuva forte por questões de segurança. Em caso de cancelamento, você será reembolsado ou poderá reagendar para nova data.",
    },
    {
      question: "Posso levar acompanhantes?",
      answer:
        "Sim! Acompanhantes são bem-vindos e podem assistir aos test rides de áreas específicas. Eles não precisam de ingresso, mas não podem participar dos test rides. O evento oferece área de convivência com food trucks e exposição de motos.",
    },
    {
      question: "Há limite de idade para participar?",
      answer:
        "Sim, é necessário ter pelo menos 18 anos e CNH válida categoria A há pelo menos 2 anos. Não há limite máximo de idade, desde que o participante esteja em condições físicas adequadas para pilotar.",
    },
    {
      question: "Como faço para cancelar ou reagendar?",
      answer:
        "Para cancelamentos ou reagendamentos, entre em contato conosco pelo WhatsApp (51) 99248-5757 ou email contato@motofest.com.br com pelo menos 48h de antecedência. Reembolsos seguem nossa política de cancelamento.",
    },
    {
      question: "O evento é seguro?",
      answer:
        "Absolutamente! Segurança é nossa prioridade. Todos os circuitos são projetados para test rides, com instrutores experientes, equipamentos de segurança certificados, e procedimentos rigorosos. O evento segue todas as normas de segurança.",
    },
    {
      question: "Posso comprar ingressos no local?",
      answer:
        "Sim, mas recomendamos comprar antecipadamente para garantir sua vaga e aproveitar descontos. Ingressos no local terão preço maior e disponibilidade limitada. Para garantir sua experiência, compre online!",
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Conteúdo principal */}
      <section className="w-full bg-black py-12 px-4 md:px-0">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1
              className="text-4xl md:text-6xl font-bold text-white mb-4"
              style={{ fontFamily: "Anton, sans-serif" }}
            >
              DÚVIDAS FREQUENTES
            </h1>
            <p className="text-gray-300 text-lg">
              Encontre respostas para as principais dúvidas sobre o Salão Moto
              Fest
            </p>
          </div>

          {/* Accordion FAQ */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-[#222] border border-gray-700 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-[#333] transition-colors duration-200"
                >
                  <span className="text-white font-semibold text-lg">
                    {faq.question}
                  </span>
                  {openAccordion === index ? (
                    <ChevronUp className="text-red-500 w-6 h-6 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="text-red-500 w-6 h-6 flex-shrink-0" />
                  )}
                </button>

                {openAccordion === index && (
                  <div className="px-6 pb-4">
                    <div className="border-t border-gray-700 pt-4">
                      <p className="text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
