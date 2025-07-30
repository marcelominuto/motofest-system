"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function DetalheIngressoPage() {
  const { tipo } = useParams();
  const router = useRouter();
  const [ingresso, setIngresso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  // Estados do formulário
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    quantidadeMotos: 1,
    motos: [
      { data: "", marcaId: "", motoId: "", horarioId: "" },
      { data: "", marcaId: "", motoId: "", horarioId: "" },
      { data: "", marcaId: "", motoId: "", horarioId: "" },
    ],
    aceiteTermos: false,
  });

  // Estados para dados dinâmicos
  const [marcas, setMarcas] = useState([]);
  const [motos, setMotos] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [datas, setDatas] = useState([]);
  const [eventoAtivo, setEventoAtivo] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [horariosIndisponiveis, setHorariosIndisponiveis] = useState({});
  // Remover o estado showTermos e o modal

  useEffect(() => {
    async function fetchIngresso() {
      setLoading(true);
      setErro("");
      try {
        const res = await fetch(`/api/ingressos`);
        if (!res.ok) throw new Error("Erro ao buscar ingresso");
        const data = await res.json();
        const found = data.find(
          (i) => i.tipo.replace(/\s+/g, "-").toLowerCase() === tipo
        );
        if (!found || found.categoria !== "test ride") {
          setErro(
            "Ingresso não encontrado ou não disponível para compra online."
          );
        } else {
          setIngresso(found);
        }
      } catch (err) {
        setErro("Não foi possível carregar o ingresso.");
      } finally {
        setLoading(false);
      }
    }
    if (tipo) fetchIngresso();
  }, [tipo]);

  // Carregar dados dinâmicos
  useEffect(() => {
    if (ingresso) {
      setLoadingData(true);
      Promise.all([
        fetch("/api/marcas").then((res) => res.json()),
        fetch("/api/motos").then((res) => res.json()),
        fetch("/api/horarios").then((res) => res.json()),
        fetch("/api/eventos/ativo").then((res) => res.json()),
      ])
        .then(([marcasData, motosData, horariosData, eventoData]) => {
          // Filtrar motos pelo ingresso específico
          const motosFiltradas = motosData.filter(
            (moto) => moto.ingressoId === ingresso.id
          );
          setMotos(motosFiltradas);
          // Filtrar marcas que tenham pelo menos uma moto desse ingresso
          const marcaIdsDasMotos = new Set(
            motosFiltradas.map((m) => m.marcaId)
          );
          const marcasFiltradas = marcasData.filter((marca) =>
            marcaIdsDasMotos.has(marca.id)
          );
          setMarcas(marcasFiltradas);
          setHorarios(horariosData);
          setEventoAtivo(eventoData);
          // Gerar datas do evento
          if (eventoData?.dataInicio && eventoData?.dataFim) {
            const inicio = new Date(eventoData.dataInicio);
            const fim = new Date(eventoData.dataFim);
            const dias = [];
            for (
              let d = new Date(inicio);
              d <= fim;
              d.setDate(d.getDate() + 1)
            ) {
              dias.push(new Date(d));
            }
            setDatas(dias);
          }
        })
        .catch((err) => {
          console.error("Erro ao carregar dados:", err);
        })
        .finally(() => {
          setLoadingData(false);
        });
    }
  }, [ingresso]);

  // Buscar horários indisponíveis quando moto e data mudarem
  useEffect(() => {
    const buscarHorariosIndisponiveis = async () => {
      const novosHorariosIndisponiveis = {};

      for (let i = 0; i < formData.quantidadeMotos; i++) {
        const moto = formData.motos[i];
        if (moto.motoId && moto.data) {
          try {
            const res = await fetch(
              `/api/disponibilidade/todos?motoId=${moto.motoId}&data=${moto.data}`
            );
            if (res.ok) {
              const data = await res.json();
              novosHorariosIndisponiveis[`${moto.motoId}-${moto.data}`] =
                data.horariosIndisponiveis.map((h) => h.horarioId);
            }
          } catch (err) {
            novosHorariosIndisponiveis[`${moto.motoId}-${moto.data}`] = [];
          }
        }
      }

      setHorariosIndisponiveis(novosHorariosIndisponiveis);
    };

    buscarHorariosIndisponiveis();
  }, [formData.motos, formData.quantidadeMotos]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMotoChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      motos: prev.motos.map((moto, i) => {
        if (i === index) {
          // Se mudou a marca, limpar modelo
          if (field === "marcaId") {
            return { ...moto, [field]: value, motoId: "" };
          }
          // Se mudou a moto ou data, limpar horário
          if (field === "motoId" || field === "data") {
            return { ...moto, [field]: value, horarioId: "" };
          }
          return { ...moto, [field]: value };
        }
        return moto;
      }),
    }));
  };

  // Calcular valor baseado na quantidade de motos
  const calcularValor = () => {
    if (!ingresso) return 0;

    const valores = [ingresso.valor1, ingresso.valor2, ingresso.valor3]
      .map((v) => (v ? Number(v) : 0))
      .filter((v) => v > 0);

    if (valores.length === 0) return 0;

    // Retorna o valor correspondente à quantidade de motos (1, 2 ou 3)
    const index = Math.min(formData.quantidadeMotos - 1, valores.length - 1);
    return valores[index];
  };

  // Função para cadastrar/buscar cliente
  const cadastrarOuBuscarCliente = async () => {
    function extrairCliente(data) {
      if (!data) return null;
      if (data.id) return data;
      if (data.cliente && data.cliente.id) return data.cliente;
      if (Array.isArray(data) && data[0] && data[0].id) return data[0];
      return null;
    }
    try {
      // Tenta buscar cliente pelo CPF
      const resBusca = await fetch(
        `/api/clientes?cpf=${encodeURIComponent(formData.cpf)}`
      );
      if (resBusca.ok) {
        const data = await resBusca.json();
        const cliente = extrairCliente(data);
        if (cliente && cliente.id) return cliente; // Cliente já existe
      }
    } catch {}
    // Se não existe, cadastra
    const resCadastro = await fetch("/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: formData.nome,
        email: formData.email,
        cpf: formData.cpf,
        telefone: formData.telefone,
        cnh: "", // pode ser ajustado se necessário
      }),
    });
    if (resCadastro.ok) {
      const data = await resCadastro.json();
      const cliente = extrairCliente(data);
      if (cliente && cliente.id) return cliente;
    } else if (resCadastro.status === 409) {
      // Se já existe, busca novamente e retorna
      const resBusca = await fetch(
        `/api/clientes?cpf=${encodeURIComponent(formData.cpf)}`
      );
      if (resBusca.ok) {
        const data = await resBusca.json();
        const cliente = extrairCliente(data);
        if (cliente && cliente.id) return cliente;
      }
    }
    throw new Error("Erro ao cadastrar cliente");
  };

  const getMotoNome = (id) => {
    const moto = motos.find((m) => m.id === Number(id));
    return moto ? moto.nome : id;
  };
  const getMarcaNome = (id) => {
    const moto = motos.find((m) => m.id === Number(id));
    if (!moto) return "";
    const marca = marcas.find((marca) => marca.id === moto.marcaId);
    return marca ? marca.nome : "";
  };
  const getHorarioLabel = (id) => {
    const horario = horarios.find((h) => h.id === Number(id));
    return horario ? horario.hora : id;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.aceiteTermos) {
      alert("Você deve aceitar os termos para continuar.");
      return;
    }
    setSubmitting(true);
    try {
      // 1. Cadastrar/buscar cliente
      const cliente = await cadastrarOuBuscarCliente();
      if (!cliente || !cliente.id) throw new Error("Cliente não cadastrado");

      // Montar detalhes do agendamento
      const detalhesAgendamento = formData.motos
        .slice(0, formData.quantidadeMotos)
        .map(
          (m, idx) =>
            `Moto ${idx + 1}: ${getMotoNome(m.motoId)}, Data: ` +
            (m.data && m.data.length === 10
              ? (() => {
                  const [year, month, day] = m.data.split("-");
                  return `${day}/${month}/${year}`;
                })()
              : m.data) +
            `, Horário: ${getHorarioLabel(m.horarioId)}`
        )
        .join(" | ");

      // ENVIAR WEBHOOK PARA DISCORD
      const motosString = formData.motos
        .slice(0, formData.quantidadeMotos)
        .map((m, idx) => {
          const marca = getMarcaNome(m.motoId);
          const modelo = getMotoNome(m.motoId);
          const data =
            m.data && m.data.length === 10
              ? (() => {
                  const [year, month, day] = m.data.split("-");
                  return `${day}/${month}/${year}`;
                })()
              : m.data;
          const horario = getHorarioLabel(m.horarioId);
          return `${marca} ${modelo} - ${data} - ${horario}`;
        })
        .join("\n");
      const discordPayload = {
        content: "",
        tts: false,
        embeds: [
          {
            title: "COMPRA INICIADA!",
            color: 1618943,
            timestamp: new Date().toISOString(),
            fields: [
              {
                id: 477098321,
                name: "Nome",
                value: formData.nome,
                inline: true,
              },
              { id: 531816709, name: "CPF", value: formData.cpf },
              { id: 980485366, name: "E-mail", value: formData.email },
              {
                id: 104269543,
                name: "Telefone",
                value: `${formData.telefone}\n[Whatsapp](<https://wa.me/${formData.telefone.replace(/\D/g, "")}>)`,
              },
              { id: 979321908, name: "Motos", value: motosString },
              { id: 123456789, name: "Tipo de Ingresso", value: ingresso.tipo },
              {
                id: 987654321,
                name: "Valor",
                value: `R$ ${calcularValor().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
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
        // Não bloqueia o fluxo se o Discord falhar
        console.error("Erro ao enviar webhook para Discord:", err);
      }

      // 2. Criar sessão de checkout Stripe
      const valor = calcularValor();
      const agendamentoDetalhado = formData.motos
        .slice(0, formData.quantidadeMotos)
        .map((m) => ({
          ...m,
          data:
            typeof m.data === "string" && m.data.length === 10
              ? m.data
              : m.data
                ? m.data.split("T")[0]
                : "",
          modelo: `${getMarcaNome(m.motoId)} ${getMotoNome(m.motoId)}`.trim(),
          horario: getHorarioLabel(m.horarioId),
        }));
      const response = await fetch("/api/pagarme/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          cpf: formData.cpf, // <-- Adicionado cpf
          telefone: formData.telefone, // <-- Adicionado telefone
          valor,
          quantidade: formData.quantidadeMotos,
          ingressoId: ingresso.id,
          tipo: ingresso.tipo,
          descricao: ingresso.descricao,
          detalhesAgendamento,
          agendamento: agendamentoDetalhado,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.url)
        throw new Error(data.error || "Erro ao criar sessão de pagamento");
      // 3. Redirecionar para Stripe
      window.location.href = data.url;
    } catch (error) {
      alert(
        "Erro ao processar cadastro/pagamento. Tente novamente.\n" +
          (error.message || error)
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatarCPF = (value) => {
    const v = value.replace(/\D/g, "");
    return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatarTelefone = (value) => {
    const v = value.replace(/\D/g, "");
    return v.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  // Função auxiliar para horários já escolhidos no mesmo dia (exceto o campo atual)
  function horariosJaEscolhidosNoMesmoDia(indexAtual, dataAtual) {
    return formData.motos
      .map((m, idx) =>
        idx !== indexAtual && m.data === dataAtual ? m.horarioId : null
      )
      .filter((h) => h);
  }

  if (loading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">
          Carregando detalhes do ingresso...
        </div>
      </div>
    );

  if (erro)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500 text-center py-12 text-xl">{erro}</div>
      </div>
    );

  if (!ingresso) return null;

  const valorCalculado = calcularValor();

  return (
    <div className="min-h-screen bg-black">
      {/* Banner */}
      <section className="relative w-full h-[220px] md:h-[350px] flex items-stretch overflow-hidden bg-black m-0 p-0">
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
          <h1
            className="titulo-banner text-4xl md:text-6xl font-extrabold text-white tracking-wider"
            style={{ fontFamily: "Anton, sans-serif" }}
          >
            {ingresso.tipo.toUpperCase()}
          </h1>
        </div>
        <img
          src={`/${ingresso.tipo.toLowerCase().replace(/\s+/g, "-")}.jpg`}
          alt={`Banner ${ingresso.tipo}`}
          className="object-cover w-full h-full max-w-full select-none pointer-events-none"
          draggable={false}
          onError={(e) => {
            // Fallback para imagem padrão se a específica não existir
            e.target.src = "/banner1.png";
          }}
        />
      </section>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto py-8 px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Bloco de texto à esquerda */}
        <div className="bg-[#222] rounded-lg shadow-lg p-6 flex flex-col gap-4 text-white">
          <h2
            className="text-3xl font-extrabold text-red-600 mb-2"
            style={{ fontFamily: "Anton, sans-serif" }}
          >
            {ingresso.tipo.toUpperCase()}
          </h2>
          <h3 className="text-lg font-bold uppercase text-white">
            EXPERIÊNCIA REAL NA LENDÁRIA PISTA DE TARUMÃ
          </h3>
          <p className="text-white leading-relaxed">
            {ingresso.descricao || "Descrição não disponível."}
          </p>

          <h3 className="font-bold mt-6 text-white">O que está incluso:</h3>
          <ul className="list-none space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-green-600 text-xl">✓</span>
              <span className="text-white">
                Test ride de até 3 motos na pista de Tarumã
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600 text-xl">✓</span>
              <span className="text-white">
                Acesso à área de exposição com as principais marcas e
                lançamentos do mercado
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600 text-xl">✓</span>
              <span className="text-white">
                Apresentações radicais de freestyle, manobras de wheeling e show
                da equipe Só Zerinho
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600 text-xl">✓</span>
              <span className="text-white">Pista de Mobilidade Urbana</span>
            </li>
          </ul>

          <h3 className="font-bold mt-6 text-white">
            Acesso aos shows musicais:
          </h3>
          <ul className="list-none space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-red-600 text-xl">🎵</span>
              <span className="text-white">Quinta: QNOME | Os Daltons</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-red-600 text-xl">🎵</span>
              <span className="text-white">Sexta: Classic Riders</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-red-600 text-xl">🎵</span>
              <span className="text-white">Sábado: QNOME | Os Daltons</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-red-600 text-xl">🎵</span>
              <span className="text-white">
                Domingo: QNOME | Classic Riders
              </span>
            </li>
          </ul>

          <p className="text-sm text-gray-300 mt-4 italic">
            *O Ride Pass garante a possibilidade de participar do test ride na
            pista de mobilidade urbana, mediante disponibilidade.
          </p>

          <div className="bg-[#222] p-4 rounded-lg mt-4">
            <h4 className="font-bold text-white mb-2">
              Horário de funcionamento:
            </h4>
            <p className="text-sm text-white">
              <strong>Geral:</strong> 10h às 22h | Entrada limite até as 21h
              <br />
              <strong>Test rides:</strong> 10h às 18h
            </p>
          </div>
        </div>

        {/* Formulário à direita */}
        <div className="bg-[#333] rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-2xl font-bold mb-6 text-center text-white">
            AGENDE SEU TEST RIDE!
          </h3>

          {loadingData ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-white">Carregando opções...</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Dados pessoais */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-1">
                    Nome completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => handleInputChange("nome", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#222] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-1">
                    CPF *
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    required
                    value={formData.cpf}
                    onChange={(e) =>
                      handleInputChange("cpf", formatarCPF(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#222] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="000.000.000-00"
                    maxLength="14"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-1">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#222] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-1">
                    Telefone (com DDD) *
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    required
                    value={formData.telefone}
                    onChange={(e) =>
                      handleInputChange(
                        "telefone",
                        formatarTelefone(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#222] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="(51) 99999-9999"
                    maxLength="15"
                  />
                </div>
              </div>

              {/* Seleção de motos */}
              <div>
                <label className="block text-sm font-semibold text-white mb-1">
                  Quantas motos deseja testar? *
                </label>
                <select
                  value={formData.quantidadeMotos}
                  onChange={(e) =>
                    handleInputChange(
                      "quantidadeMotos",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#222] text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value={1}>1 moto</option>
                  <option value={2}>2 motos</option>
                  <option value={3}>3 motos</option>
                </select>
              </div>

              {/* Campos dinâmicos para cada moto */}
              {formData.motos
                .slice(0, formData.quantidadeMotos)
                .map((moto, index) => (
                  <div
                    key={index}
                    className="border border-gray-600 rounded-lg p-4 bg-[#222]"
                  >
                    <h4 className="font-semibold text-white mb-3">
                      Moto {index + 1}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-white mb-1">
                          Data *
                        </label>
                        <select
                          required
                          value={moto.data}
                          onChange={(e) =>
                            handleMotoChange(index, "data", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#333] text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                        >
                          <option value="">Escolha a data</option>
                          {datas.map((data, i) => (
                            <option
                              key={i}
                              value={data.toISOString().split("T")[0]}
                            >
                              {data.toLocaleDateString("pt-BR", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-white mb-1">
                          Marca *
                        </label>
                        <select
                          required
                          value={moto.marcaId}
                          onChange={(e) =>
                            handleMotoChange(index, "marcaId", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#333] text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                        >
                          <option value="">Escolha a marca</option>
                          {marcas.map((marca) => (
                            <option key={marca.id} value={marca.id}>
                              {marca.nome}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-white mb-1">
                          Modelo *
                        </label>
                        <select
                          required
                          value={moto.motoId}
                          onChange={(e) =>
                            handleMotoChange(index, "motoId", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#333] text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                          disabled={!moto.marcaId}
                        >
                          <option value="">Escolha o modelo</option>
                          {motos
                            .filter((m) => m.marcaId === parseInt(moto.marcaId))
                            .map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.nome}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-white mb-1">
                          Horário *
                        </label>
                        <select
                          required
                          value={moto.horarioId}
                          onChange={(e) =>
                            handleMotoChange(index, "horarioId", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#333] text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                          disabled={!moto.motoId || !moto.data}
                        >
                          <option value="">Escolha o horário</option>
                          {horarios.map((h) => {
                            // Chave igual ao modal: motoId-data
                            const chaveIndisponiveis =
                              moto.motoId && moto.data
                                ? `${moto.motoId}-${moto.data}`
                                : null;
                            const indisponiveis = chaveIndisponiveis
                              ? horariosIndisponiveis[chaveIndisponiveis] || []
                              : [];
                            // Já escolhido pelo usuário para outra moto no mesmo dia
                            const isOcupado =
                              horariosJaEscolhidosNoMesmoDia(
                                index,
                                moto.data
                              ).includes(h.id.toString()) ||
                              horariosJaEscolhidosNoMesmoDia(
                                index,
                                moto.data
                              ).includes(h.id);
                            // Esgotado para esta moto e data (checa ambos tipos)
                            const isIndisponivel =
                              indisponiveis.includes(h.id) ||
                              indisponiveis.includes(h.id.toString());
                            // Desabilitado se qualquer um dos dois
                            const isDesabilitado = isOcupado || isIndisponivel;
                            return (
                              <option
                                key={h.id}
                                value={h.id}
                                disabled={isDesabilitado}
                              >
                                {h.hora}
                                {isOcupado ? " — Indisponível" : ""}
                                {isIndisponivel && !isOcupado
                                  ? " — Esgotado"
                                  : ""}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}

              {/* Termos de participação sempre visíveis, acima do botão */}
              <div className="bg-[#222] border border-gray-600 rounded-lg p-4 text-xs text-white mb-2 max-h-48 overflow-y-auto">
                <strong>TERMOS DE PARTICIPAÇÃO – SALÃO MOTO FEST 2025</strong>
                <br />
                Os participantes farão sua adesão ao EVENTO "SALÃO MOTO FEST
                2025", mediante o cadastro nesta página, fornecendo os dados
                solicitados corretamente, e desde que aceitas as condições
                abaixo para participação no EVENTO.
                <br />
                Não serão aceitos cadastros com dados faltantes.
                <br />
                <br />
                <strong>COMPRAS ONLINE</strong>
                <br />
                1. A compra de ingressos poderá ser realizada através do site
                oficial do evento, com pagamento via cartão de crédito, Pix ou
                outros meios disponibilizados na plataforma.
                <br />
                2. A confirmação da compra estará sujeita à validação do
                pagamento. O participante receberá por e-mail um comprovante com
                seu número de pedido e instruções para participação no evento.
                <br />
                3. A não finalização do pagamento, por qualquer motivo,
                resultará no cancelamento automático do pedido. A vaga somente
                estará garantida após a confirmação do pagamento.
                <br />
                4. Em caso de arrependimento da compra, o participante poderá
                solicitar o cancelamento e reembolso em até 7 (sete) dias
                corridos após a confirmação do pagamento, desde que o pedido
                seja feito com pelo menos 72 horas de antecedência ao início do
                evento, conforme previsto no Código de Defesa do Consumidor.
                <br />
                5. Após esse prazo, não serão aceitos pedidos de reembolso,
                exceto em casos de cancelamento integral do evento pela
                organização.
                <br />
                <br />
                <strong>CONDIÇÕES GERAIS</strong>
                <br />
                1. O participante, no ato da adesão, autoriza a organizadora do
                evento a armazenar em banco de dados as informações contidas no
                cadastro.
                <br />
                2. O participante, no ato da adesão, autoriza a organizadora do
                evento a utilizar as informações contidas no cadastro para uso
                futuro em possíveis ações comerciais ligadas diretamente à
                organizadora ou às empresas parceiras conforme sua necessidade e
                conveniência.
                <br />
                3. A participação neste evento implica aceitação total de todas
                as condições gerais, que poderão ser alteradas pela empresa
                promotora mediante divulgação aos participantes, inclusive ao
                longo do evento.
                <br />
                4. A organizadora não se responsabiliza, sob nenhuma hipótese,
                por ingressos adquiridos fora dos canais oficiais: site oficial
                (via Sympla) e bilheteria no local do evento.
                <br />
                5. A finalização da compra dos ingressos está sujeita à
                disponibilidade no estoque e deve ser aprovada diretamente com a
                organizadora do evento.
                <br />
                6. Todas as despesas com deslocamento, hospedagem e alimentação
                são de responsabilidade do participante, bem como quaisquer
                outras despesas necessárias para sua participação no evento.
                <br />
                <br />
                <strong>TEST RIDE E CONDIÇÕES DE PILOTAGEM</strong>
                <br />
                1. Para participação no Test Ride, o motociclista deverá possuir
                CNH categoria A, com no mínimo três anos de emissão. Para
                pilotar motos da categoria Esportivas (Sport Pass), são exigidos
                5 anos de experiência. A falta da habilitação adequada impede a
                realização do Test Ride e não gera reembolso.
                <br />
                2. A aquisição do Test Ride dá direito à escolha de 1 a 3 motos.
                Cada moto pode ser pilotada por três voltas completas no
                autódromo, totalizando cerca de 9 km por moto.
                <br />
                3. O acesso à área de Test Ride é permitido mediante
                apresentação da credencial, entregue no evento. A credencial é
                pessoal, intransferível e contém a lista das motos escolhidas.
                Por segurança, não é permitido levar garupa.
                <br />
                4. O participante do Test Ride deverá se apresentar com
                equipamento de segurança adequado: macacão ou jaqueta e calça
                comprida de couro ou cordura, calçado fechado, luvas e capacete
                fechado. Serão aceitas roupas de equipamentos de segurança para
                pilotagem, não podendo usar: capacete aberto, roupas de moletom,
                corta vento, legging e jeans desfiado ou com aberturas. A falta
                de qualquer dos equipamentos de segurança em questão implicará a
                não participação do mesmo no Test Ride. O fornecimento do
                equipamento de segurança não é de responsabilidade da
                Organização do evento. Caso o participante não possa efetuar o
                Test Ride devido à ausência do equipamento de segurança, não
                será realizada a devolução da inscrição.
                <br />
                <br />
                <strong>PISTA OFF-ROAD</strong>
                <br />
                1. O evento contará com uma área de Test Ride em pista off-road,
                com percurso específico para motos de uso misto e aventureiras.
                <br />
                2. Para participação na pista off-road, aplicam-se as mesmas
                exigências de habilitação e uso de equipamentos de segurança da
                pista on-road.
                <br />
                3. A organização se reserva o direito de limitar o número de
                participantes na pista off-road por questões de segurança e
                estrutura. A escolha desta modalidade será feita no momento da
                inscrição, de acordo com a disponibilidade.
                <br />
                <br />
                <strong>REGRAS DE CONDUTA E SEGURANÇA</strong>
                <br />
                1. Em caso de chuva extrema ou outras condições adversas, a
                organização e os instrutores avaliarão a segurança da atividade.
                Se julgado inseguro, o Test Ride pode ser cancelado.
                <br />
                2. O participante deve seguir todas as regras de segurança e
                conduta dos instrutores. Em caso de desobediência, poderá ser
                retirado do Test Ride. A participação no briefing é obrigatória.
                <br />
                3. Durante o Test Ride, não será tolerado o consumo de bebida
                alcoólica ou qualquer outra substância ilícita ou não condizente
                com o ato de pilotar. O participante só será aceito na pista
                após passar pelo teste do bafômetro.
                <br />
                4. No caso de perdas e danos decorrentes de acidente, os mesmos
                correrão por conta exclusiva do participante, que desde já
                isenta a empresa organizadora e seus patrocinadores de quaisquer
                responsabilidades.
                <br />
                5. É de responsabilidade exclusiva do convidado zelar por sua
                segurança e por seus pertences pessoais.
                <br />
                6. O não comparecimento ao evento na data e horário marcados
                acarretará a perda da inscrição, sem possibilidade de
                transferência ou devolução.
                <br />
                <br />
                <strong>USO DE IMAGEM E ALTERAÇÕES DO EVENTO</strong>
                <br />
                1. O participante autoriza, de forma irrevogável e irretratável,
                a divulgação de seu nome, imagem, som de voz e demais registros
                pessoais pela empresa organizadora e seus parceiros, em
                quaisquer mídias e formatos, sem qualquer ônus.
                <br />
                2. A organização pode cancelar ou alterar o evento sem aviso
                prévio. Inscritos serão informados por e-mail.
                <br />
                3. O participante declara expressamente, de forma irrevogável e
                irretratável, que tem ciência e está de acordo com todas as
                condições acima, assim como isenta a empresa promotora por
                eventuais danos e/ou prejuízos decorrentes do evento, qualquer
                que seja a causa.
              </div>

              {/* Checkbox de aceite */}
              <div className="flex items-start gap-2 mt-2">
                <input
                  type="checkbox"
                  id="termos"
                  checked={formData.aceiteTermos}
                  onChange={(e) =>
                    handleInputChange("aceiteTermos", e.target.checked)
                  }
                  className="mt-1"
                />
                <label
                  htmlFor="termos"
                  className="text-xs text-white leading-relaxed"
                >
                  Li e concordo com os{" "}
                  <strong>Termos de Participação – Salão Moto Fest 2025</strong>
                  .
                </label>
              </div>

              {/* Botões */}
              <div className="space-y-3 mt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-red-600 text-white font-bold py-3 rounded-lg text-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? "Processando..."
                    : `COMPRAR INGRESSO - R$ ${valorCalculado.toLocaleString(
                        "pt-BR",
                        { minimumFractionDigits: 2 }
                      )}`}
                </button>

                <p className="text-xs text-center text-gray-300">
                  *Após a compra, você receberá instruções por e-mail para
                  confirmar seu agendamento.
                </p>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
