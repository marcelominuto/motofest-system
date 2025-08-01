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
      question: "Quando e onde será realizado o Salão Moto Fest 2025?",
      answer:
        "Salão Moto Fest 2025 será realizado durante três dias, de 31 de Outubro a 02 de Novembro, no Autódromo de Tarumã.<br><br><strong>HORÁRIO DE FUNCIONAMENTO</strong><br>31/10 a 02/11 (sexta-feira, sábado e domingo):<br>• Funcionamento de 10h às 20h<br>• Entrada limite até 19h",
    },
    {
      question: "Como adquirir os ingressos para o evento?",
      answer:
        "Online: Acesse <a href='https://www.salaomotofest.com.br/ingressos' target='_blank' rel='noopener noreferrer' class='text-red-500 hover:text-red-400 underline'>https://www.salaomotofest.com.br/ingressos</a> para informações sobre os tipos de ingressos disponíveis para o Salão Moto Fest 2025.<br><br>Ponto de Venda Físico (venda disponível somente durante os dias 31 de Outubro a 02 de Novembro): Autódromo de Tarumã.<br><br>Não nos responsabilizamos por ingressos adquiridos fora dos pontos oficiais de venda.",
    },
    {
      question: "Posso comprar ingressos no local?",
      answer:
        "Sim, será possível comprar ingressos presencialmente no dia do evento.<br><br>No entanto, recomendamos fortemente a compra antecipada para garantir sua vaga e evitar filas.<br><br><strong>Quer desconto na hora?</strong><br>Cadastre-se no link <a href='https://salaomotofest.com.br/cadastro' target='_blank' rel='noopener noreferrer' class='text-red-500 hover:text-red-400 underline'>salaomotofest.com.br/cadastro</a> e ganhe 50% de desconto na compra do ingresso FEST PASS no local.<br>Basta apresentar o QR Code gerado no momento do cadastro.<br><br><strong>Importante:</strong> o desconto é válido apenas para o ingresso FEST PASS e somente para compras realizadas presencialmente.",
    },
    {
      question: "Quais são as formas de pagamento para compra dos ingressos?",
      answer:
        "Para as compras realizadas através do site oficial do evento <a href='https://www.salaomotofest.com.br/ingressos' target='_blank' rel='noopener noreferrer' class='text-red-500 hover:text-red-400 underline'>https://www.salaomotofest.com.br/ingressos</a> serão aceitos:<br><br>• Cartão de crédito<br>• PIX",
    },
    {
      question: "Qual a classificação etária?",
      answer:
        "<strong>Classificação Etária: Livre*</strong><br><br><strong>Regras de acesso:</strong><br>• <strong>0 a 10 anos:</strong> Entrada gratuita<br>• <strong>11 a 17 anos:</strong> Necessário apresentar ingresso (Meia-Entrada)<br>• <strong>18 anos ou mais:</strong> Entrada permitida desacompanhado<br><br><strong>Observações importantes:</strong><br>• Menores de idade devem estar acompanhados pelos pais ou responsáveis legais<br>• A classificação etária e as condições de acesso podem ser alteradas a qualquer momento pelo Juiz de Direito da Vara da Infância, da Juventude e do Idoso",
    },
    {
      question: "Haverá estacionamento no local do evento?",
      answer:
        "Sim, haverá estacionamento disponível no evento.<br><br><strong>VALORES:</strong><br>• <strong>Motos:</strong> Entrada gratuita<br>• <strong>Carros:</strong> R$ 20,00<br><br><strong>IMPORTANTE:</strong><br>• As vagas são limitadas e sujeitas à disponibilidade<br>• Recomendamos chegar cedo para garantir vaga<br>• O pagamento é feito no local do evento",
    },
    {
      question: "O evento é seguro?",
      answer:
        "Absolutamente! Segurança é nossa prioridade. Todos os circuitos são projetados para test rides, com instrutores experientes e procedimentos rigorosos. O evento segue todas as normas de segurança.",
    },
    {
      question: "Quem poderá participar do test ride?",
      answer:
        'Os participantes farão sua adesão ao EVENTO "SALÃO MOTO FEST 2025", mediante o cadastro nesta página, fornecendo os dados solicitados corretamente, e desde que aceitas as condições abaixo para participação no EVENTO.<br><br>Não serão aceitos cadastros com dados faltantes.<br><br><strong>CONDIÇÕES GERAIS</strong><br>1. O participante, no ato da adesão, autoriza a organizadora do evento a armazenar em banco de dados as informações contidas no cadastro.<br><br>2. O participante, no ato da adesão, autoriza a organizadora do evento a utilizar as informações contidas no cadastro, para uso futuro em possíveis ações comerciais ligadas diretamente à organizadora ou às empresas parceiras conforme sua necessidade e conveniência.<br><br>3. A participação neste evento implica aceitação total de todas as condições gerais, que poderão ser alteradas pela empresa promotora, mediante divulgação aos participantes, inclusive ao longo do evento a ser ministrado.<br><br>4. A organizadora não se responsabiliza, sob hipótese nenhuma, por ingressos adquiridos fora dos canais de venda oficiais: site oficial (via Sympla) e bilheteria no local do evento.<br><br>5. A finalização da compra dos ingressos está sujeita à disponibilidade no estoque, bem como à aprovação por parte da organizadora.<br><br>6. O cliente é o único responsável por averiguar os dados do pedido (evento, data, cidade de realização, preço, horários, classificação etária) antes da finalização da compra.<br><br>7. O cliente é o único responsável por manter o cadastro atualizado (endereço de e-mail, telefones de contato), pois somente assim poderá receber a confirmação do pedido, bem como demais informações importantes.<br><br>8. Todas as despesas com deslocamento, hospedagem e alimentação são de responsabilidade do participante, assim como quaisquer outras despesas que se façam necessárias para sua participação no evento.<br><br><strong>TEST RIDE E CONDIÇÕES DE PILOTAGEM</strong><br>9. Para participação no Test Ride, o motociclista deverá possuir habilitação em motocicletas, categoria A, com no mínimo três anos de emissão. Caso o motociclista queira pilotar motos da categoria Esportiva (Sport Pass), será necessária experiência mínima de cinco anos. A ausência de habilitação válida, conforme o tipo de ingresso, impossibilita a participação e não gera direito a reembolso.<br><br>10. A aquisição do Test Ride dá direito ao motociclista escolher de uma a três motos. Cada moto poderá ser pilotada por três voltas completas no autódromo, totalizando aproximadamente 9 km por moto.<br><br>11. O acesso à área de Test Ride será permitido mediante a apresentação da credencial oficial, entregue ao motociclista no evento. Esta credencial é pessoal e intransferível, contendo a lista das motos escolhidas. É permitida a participação de apenas uma pessoa por motocicleta, sendo proibido, por questões de segurança, levar garupa.<br><br>12. O participante do Ride Pass deverá se apresentar com equipamento de segurança adequado: capacete fechado, macacão ou jaqueta, calça comprida (jeans grosso, couro ou cordura), luvas e calçado fechado. Não será permitida a participação com: capacete aberto, moletom, corta vento, legging, jeans rasgado ou com aberturas. A ausência de qualquer item de segurança impedirá a participação, sem devolução do valor pago. O fornecimento do equipamento não é de responsabilidade da organização.<br><br>13. O participante do Sport Pass deverá se apresentar com equipamento de segurança adequado: capacete fechado, macacão ou jaqueta e calça comprida de couro ou cordura, luvas e calçado fechado. Não será permitida a participação com: capacete aberto, roupas de moletom, jeans, corta vento, legging ou jeans desfiado/aberto. A ausência de qualquer item de segurança impedirá a participação, sem devolução do valor pago. O fornecimento do equipamento não é de responsabilidade da organização.<br><br><strong>CONDIÇÕES CLIMÁTICAS E SEGURANÇA</strong><br>14. Em caso de chuva extrema ou qualquer outra condição que comprometa a segurança na pista, os instrutores poderão cancelar os testes. A prioridade será sempre a integridade física dos participantes.<br><br>15. O participante deverá obedecer a todas as regras de segurança e orientações dos instrutores. O não cumprimento implicará em retirada imediata do Test Ride. A participação no briefing de segurança é obrigatória.<br><br>16. Durante o Test Ride, não será tolerado o consumo de bebida alcoólica ou qualquer substância ilícita ou não condizente com a pilotagem. O participante somente será autorizado a entrar na pista após ser submetido ao teste do bafômetro.<br><br>17. Em caso de perdas ou danos decorrentes de acidentes, estes serão de responsabilidade exclusiva do participante, que desde já isenta a empresa organizadora e seus patrocinadores de quaisquer obrigações civis ou financeiras.<br><br>18. É de responsabilidade do participante zelar por sua própria segurança e pelos seus bens pessoais, tais como capacetes, jaquetas, luvas, mochilas, etc.<br><br>19. O não comparecimento ao evento na data e horário agendados será considerado desistência da inscrição, sem possibilidade de reembolso ou remarcação.<br><br><strong>DADOS PESSOAIS, IMAGEM E ALTERAÇÕES DO EVENTO</strong><br>20. O participante autoriza o uso de seus dados pessoais para a realização e contratação de seguro coletivo voltado aos inscritos no Test Ride.<br><br>21. O participante autoriza, de forma gratuita, irrevogável e irretratável, o uso de seu nome, imagem e voz pela organização, patrocinadores e expositores, em qualquer mídia física ou digital, para fins promocionais, institucionais e comerciais relacionados ao evento, sem necessidade de pagamento ou autorização posterior.<br><br>22. A empresa organizadora poderá, a seu critério, alterar ou cancelar o evento sem aviso prévio. Quaisquer alterações relevantes serão comunicadas aos participantes via e-mail cadastrado.<br><br>23. O participante declara, de forma irrevogável e irretratável, que leu, compreendeu e está de acordo com todas as condições acima, isentando a organização de qualquer responsabilidade civil, penal ou financeira decorrente da participação no evento.',
    },
    {
      question: "Quais as opções de pistas disponíveis para test rides?",
      answer:
        "Três pistas estarão em atividade dentro do Autódromo de Tarumã durante os três dias do Salão Moto Fest 2025.<br><br><strong>PISTA DO AUTÓDROMO DE TARUMÃ</strong><br>Viva a emoção de acelerar modelos de média e alta cilindrada em um dos circuitos mais tradicionais do Brasil. Com curvas de alta velocidade e retas desafiadoras, o traçado de Tarumã proporciona uma experiência real de pilotagem esportiva. Guiado por instrutores experientes, você poderá explorar o desempenho das motos em condições controladas e seguras, no verdadeiro palco da velocidade.<br><br><strong>PISTA OFF-ROAD</strong><br>Aventure-se fora do asfalto na pista especialmente preparada para motos trail, big trail e modelos de uso misto. Com trechos de terra, obstáculos e curvas sinuosas, essa área oferece uma experiência autêntica para quem busca testar a performance das motos em terrenos irregulares. Uma dose extra de adrenalina em meio à natureza do complexo de Tarumã.<br><br><strong>ÁREA DE MOBILIDADE URBANA</strong><br>Teste scooters e modelos de baixa cilindrada em um circuito que simula situações do tráfego urbano. O trajeto conta com curvas fechadas e trechos técnicos que ajudam a avaliar a agilidade, ergonomia e conforto das motos no uso diário. Ideal para quem está em busca da primeira moto ou de uma alternativa prática para a mobilidade na cidade.<br><br><strong>PARTICIPAÇÃO POR TIPO DE INGRESSO</strong><br><br><strong>Pista do Autódromo de Tarumã:</strong><br>• Ingresso necessário: <strong>RIDE PASS</strong> ou <strong>SPORT PASS</strong><br>• Permite agendamento antecipado para até 3 motos diferentes<br>• 3 voltas completas por moto<br><br><strong>Pista Off-road:</strong><br>• Ingresso necessário: <strong>TRAIL PASS</strong><br>• Agendamento antecipado de motos específicas para este circuito<br>• Sujeito à disponibilidade e regras do evento<br><br><strong>Área de Mobilidade Urbana:</strong><br>• Agendamento presencial durante a visita ao evento<br>• Vagas limitadas diariamente<br>• Não pode ser agendado antecipadamente",
    },
    {
      question: "Quais documentos preciso levar?",
      answer:
        "Você precisa apresentar: CNH válida categoria A, documento de identidade (RG ou CPF), e o comprovante de pagamento (email de confirmação). É obrigatório ter CNH há pelo menos 3 anos para participar dos test rides.",
    },
    {
      question: "Que equipamentos de segurança são obrigatórios?",
      answer:
        "São obrigatórios: capacete fechado, jaqueta de manga longa, calça comprida, calçado fechado e luvas (recomendado). O equipamento de segurança é responsabilidade do participante.",
    },
    {
      question: "Comprei meu ingresso no site, posso realizar trocas?",
      answer:
        "Após a conclusão de uma compra, não há possibilidade de troca de ingressos, seja o tipo do ingresso, moto, data ou horário.",
    },
    {
      question:
        "COMPREI PELO SITE E GOSTARIA DE CANCELAR MEU INGRESSO. COMO PROCEDER?",
      answer:
        "Se realizou uma compra no site e por motivos particulares deseja o cancelamento do pedido, siga com as regras expressas abaixo:<br><br>Conforme determinado pelo Código de Defesa do Consumidor, o cancelamento do ingresso deverá ser, obrigatoriamente, solicitado em até 07 (sete) dias corridos, contados a partir da data da efetivação da compra. Para ingressos adquiridos em prazo inferior a 07 (sete) dias da realização do evento, o prazo máximo de cancelamento é de 48 horas antes da realização do mesmo. Cancelamentos solicitados no dia da realização do evento não serão aceitos.<br><br>Para solicitar o cancelamento da sua compra realizada por meio do site, encaminhe um e-mail para o endereço indicado abaixo, informando o número do pedido, nome e CPF e confirmando a ciência das regras de estorno: <a href='mailto:contato@salaomotofest.com.br' class='text-red-500 hover:text-red-400 underline'>contato@salaomotofest.com.br</a>.<br><br><strong>REGRAS DE CANCELAMENTO:</strong><br><br>• O cancelamento é efetuado em sua totalidade.<br>• Não há cancelamento parcial da compra.<br>• O cancelamento deverá ser realizado por meio do mesmo canal de compra.<br>• Após a compra, recebimento ou retirada do ingresso, o mesmo encontra-se sob total responsabilidade do comprador, não sendo passível de ressarcimento ou reimpressão em caso de perda, roubo ou ingressos danificados.<br>• Após a ocorrência do evento, não há possibilidade de cancelamento e/ou ressarcimento do ingresso. A organização do evento não se responsabiliza pelo não comparecimento do cliente ao evento, seja por motivo de força maior, tais como chuvas, tempestades, alagamentos, congestionamentos, acidentes, doenças, etc. ou por desistência por parte do titular da compra.<br>• Solicitações de cancelamento por conta da impossibilidade de acessar o evento por motivo de atraso não serão aceitas.<br>• Direcionamos a solicitação do cancelamento ao banco emissor do cartão de crédito. Se no período que o cancelamento foi solicitado a fatura do seu cartão foi emitida e a compra do ingresso lançada, o valor pago será estornado no próximo mês, conforme prazos e regras das administradoras dos cartões de crédito.",
    },
    {
      question:
        "Comprei meu ingresso no site e já passou mais de 7 dias, posso cancelar?",
      answer:
        "Conforme determinado pelo Código de Defesa do Consumidor, o cancelamento do ingresso deverá ser solicitado, obrigatoriamente, em até 07 (sete) dias corridos, contados a partir da data da efetivação da compra. Para eventos adquiridos em prazo inferior a 07 (sete) dias da realização do evento, o prazo máximo de cancelamento é de 48 horas antes da realização do mesmo. Cancelamentos solicitados no dia da realização do evento não serão aceitos.",
    },
    {
      question:
        "CANCELEI MEU PEDIDO, QUANTO TEMPO DEMORA PARA IDENTIFICAR O ESTORNO EM MINHA FATURA?",
      answer:
        "Quando efetuamos o cancelamento de um pedido, enviamos automaticamente a solicitação de reembolso ao banco emissor do cartão de crédito utilizado.<br><br>O prazo para visualizar o estorno pode levar até duas faturas, conforme data de fechamento de seu cartão. Ou seja, se a fatura que está com a compra do ingresso lançada estiver fechada ou em processo de fechamento, o valor será estornado no próximo mês, conforme prazos e regras da administradora do cartão de crédito.",
    },
    {
      question: "QUAL A SEGURANÇA QUE TENHO EM FORNECER MEU DADOS NO SITE?",
      answer:
        "A Pagar.me adota diversas tecnologias de segurança em linha com padrões internacionais de segurança de dados. Todas as informações de clientes são tratadas de forma confidencial. A Pagar.me só utiliza os dados de seu cartão utilizado para pagamento para o processamento da compra. O número de seu cartão de crédito não é armazenado pela Pagar.me após o processo de compra ser efetivado.",
    },
    {
      question: "NÃO RECEBI O EMAIL DE CONFIRMAÇÃO DE COMPRA, O QUE FAZER?",
      answer:
        "Se você não recebeu o ingresso por e-mail, siga os passos abaixo para acessá-lo:<br><br>Envie um e-mail para <a href='mailto:contato@salaomotofest.com.br' class='text-red-500 hover:text-red-400 underline'>contato@salaomotofest.com.br</a> com os dados da sua compra (nome completo, e-mail utilizado na compra e número do pedido, se possível).<br><br>Nossa equipe localizará sua inscrição e reenviará as informações rapidamente.<br><br>Caso ainda tenha dúvidas ou dificuldades, entre em contato com nosso atendimento pelo <a href='https://wa.me/5551994239596' target='_blank' rel='noopener noreferrer' class='text-red-500 hover:text-red-400 underline'>WhatsApp (51) 99423-9596</a>. Estamos aqui pra te ajudar!",
    },
    {
      question:
        "MINHA COMPRA NÃO FOI APROVADA PELA OPERADORA DE CARTÃO DE CRÉDITO, COMO PROCEDER?",
      answer:
        "Entre em contato com a operadora de cartão de crédito ou utilize outro cartão de crédito para efetuar a compra dos seus ingressos.",
    },
    {
      question: "POSSO PAGAR COM MAIS DE UM CARTÃO DE CRÉDITO NA MESMA COMPRA?",
      answer:
        "Não, em cada compra só é possível utilizar um cartão de crédito.",
    },
    {
      question: "O QUE É A LEI GERAL DE PROTEÇÃO DE DADOS (LGPD)?",
      answer:
        "A LGPD (Lei geral de Proteção de Dados Pessoais) é uma lei criada para proteger e garantir a privacidade dos dados pessoais dos cidadãos (pessoas físicas) no caso de qualquer tratamento destes dados, incluindo aqueles armazenados por empresas em acervos digitais, por meio regras de coleta, armazenamento e uso dos dados pessoais dos usuários A lei dá direito aos usuários de acesso aos seus dados pessoais armazenados e compartilhados em bancos de dados digitais das empresas, além de outros direitos garantidos aos usuários, bem como define obrigações de tais empresas, além de instituir procedimentos para garantir a segurança dos dados. A Lei também prevê a possibilidade do usuário solicitar informações sobre os dados armazenados e solicitar que seus dados sejam deletados dos acervos digitais das empresas (deste que seja aplicável nos termos da LGPD). Sites, produtos e serviços de terceiros (parceiros) possuem termos de uso e políticas de privacidade próprios, sendo necessário solicitar seus direitos diretamente com esses terceiros.",
    },
    {
      question: "QUAL É O OBJETIVO DA LEI GERAL DE PROTEÇÃO DE DADOS (LGPD) ?",
      answer:
        "De acordo com o texto da Lei, ela visa proteger os direitos fundamentais de liberdade e de privacidade e o livre desenvolvimento da personalidade da pessoa natural. O objetivo é também regulamentar qualquer atividade (uso, coleta, armazenamento, compartilhamento etc., que a lei chama de tratamento) de dados pessoais.",
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
                  <span
                    className="text-white font-semibold text-3xl uppercase"
                    style={{ fontFamily: "Anton, sans-serif" }}
                  >
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
                      <div
                        className="text-gray-300 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                      />
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
