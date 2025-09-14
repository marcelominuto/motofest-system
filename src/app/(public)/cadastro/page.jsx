"use client";

import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";

// Pega a URL do webhook do Discord do .env
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// Função para formatar CPF
function formatarCPF(cpf) {
  return cpf
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

// Função para formatar telefone
function formatarTelefone(tel) {
  return tel
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
}

export default function CadastroPage() {
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
  });
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [erro, setErro] = useState("");
  const [nomeExibido, setNomeExibido] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === "cpf") val = formatarCPF(val.replace(/\D/g, "").slice(0, 11));
    if (name === "telefone") val = formatarTelefone(val);
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  // Função para validar CPF
  const validarCPF = (cpf) => {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/\D/g, "");

    // Verifica se tem 11 dígitos
    return cpf.length === 11;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // VALIDAÇÃO DE CPF
    if (!validarCPF(form.cpf)) {
      alert("CPF inválido. Por favor, verifique o número informado.");
      return;
    }

    setLoading(true);
    setErro("");
    try {
      // Cria cliente via API
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          cpf: form.cpf,
          email: form.email,
          telefone: form.telefone,
          cnh: "",
        }),
      });
      let cliente;
      let novoCadastro = false;
      if (res.ok) {
        cliente = await res.json();
        novoCadastro = true;
        setNomeExibido(cliente.nome); // nome do novo cadastro
      } else {
        // Se erro, tenta buscar cliente existente pelo CPF
        const busca = await fetch(
          `/api/clientes?cpf=${encodeURIComponent(form.cpf)}`
        );
        if (busca.ok) {
          const data = await busca.json();
          let clienteEncontrado = null;
          if (Array.isArray(data)) {
            clienteEncontrado = data.find(
              (c) =>
                c.cpf &&
                c.cpf.replace(/\D/g, "") === form.cpf.replace(/\D/g, "")
            );
          } else if (data && data.cpf) {
            clienteEncontrado =
              data.cpf.replace(/\D/g, "") === form.cpf.replace(/\D/g, "")
                ? data
                : null;
          }
          if (clienteEncontrado) {
            cliente = clienteEncontrado;
            setNomeExibido(cliente.nome); // nome do cliente já cadastrado
            setErro(
              "Cadastro já existente! Apresente o QR code abaixo na bilheteria."
            );
          } else {
            setErro("CPF não cadastrado.");
            throw new Error("CPF não cadastrado");
          }
        } else {
          throw new Error("Erro ao cadastrar cliente");
        }
      }
      // Só envia webhook se for novo cadastro
      if (novoCadastro) {
        const discordPayload = {
          content: "",
          tts: false,
          embeds: [
            {
              title: "NOVO CADASTRO DE DESCONTO!",
              color: 12930047,
              timestamp: new Date().toISOString(),
              fields: [
                { id: 477098321, name: "Nome", value: form.nome, inline: true },
                { id: 531816709, name: "CPF", value: form.cpf },
                { id: 980485366, name: "E-mail", value: form.email },
                {
                  id: 104269543,
                  name: "Telefone",
                  value: `${form.telefone}\n[Whatsapp](<https://wa.me/55${form.telefone.replace(/\D/g, "")}>)`,
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
      }
      setQrValue(
        `SMF-DESCONTO|NOME:${cliente.nome || form.nome} | CPF:${cliente.cpf || form.cpf}`
      );
      setEnviado(true);
    } catch (err) {
      setErro("Erro ao cadastrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-2 py-12">
      <h1
        className="text-4xl md:text-5xl font-extrabold text-white text-center mb-4 mt-2"
        style={{ fontFamily: "Anton, sans-serif", letterSpacing: 1 }}
      >
        Garanta seu Desconto Exclusivo no MotoFest!
      </h1>
      <p className="text-lg md:text-xl text-gray-200 text-center mb-8 px-2 max-w-2xl font-sans mx-auto">
        Aproveite a oportunidade de participar do maior evento de motos do sul
        do Brasil com{" "}
        <span className="text-red-500 font-bold">50% de desconto</span> no
        ingresso presencial. Basta preencher o formulário abaixo, apresentar o
        QR code gerado na bilheteria e garantir seu desconto na hora!
        <br className="hidden md:block" />
        Não perca essa chance de viver experiências incríveis, conhecer
        lançamentos, curtir shows e muito mais. Faça seu cadastro agora mesmo!
      </p>
      <div className="w-full max-w-md bg-[#18181b] border border-red-700 rounded-2xl shadow-lg p-4 md:p-8 flex flex-col items-center">
        {enviado ? (
          <div className="flex flex-col items-center gap-4 py-8 w-full">
            <div
              id="qr-card"
              className="flex flex-col items-center justify-center rounded-xl bg-[#222] p-6 shadow"
              style={{ background: "#18181b" }}
            >
              <span className="text-white text-xl font-bold block mb-1">
                {nomeExibido || form.nome}
              </span>
              <span className="text-gray-300 text-base font-mono tracking-wider mb-4">
                {form.cpf}
              </span>
              <QRCodeCanvas
                id="qr-canvas"
                value={qrValue}
                size={180}
                bgColor="#18181b"
                fgColor="#fff"
                includeMargin={true}
              />
              <div className="text-white text-center mt-4 text-base font-semibold">
                Apresente este QR Code na bilheteria para garantir seu desconto!
              </div>
            </div>
            <span className="text-xs text-gray-400 mt-4">tire print ou:</span>
            <button
              className="mt-0 px-4 py-2 border border-white text-white rounded bg-transparent hover:bg-red-600 transition text-sm font-bold cursor-pointer"
              onClick={async () => {
                // Gera QR code como dataURL
                const qrCanvas = document.getElementById("qr-canvas");
                let qrDataUrl = "";
                if (qrCanvas) {
                  qrDataUrl = qrCanvas.toDataURL("image/png");
                }
                const doc = new jsPDF({
                  orientation: "portrait",
                  unit: "pt",
                  format: [320, 420],
                });
                doc.setFillColor("#18181b");
                doc.rect(0, 0, 320, 420, "F");
                doc.setTextColor("#fff");
                doc.setFontSize(18);
                doc.setFont(undefined, "bold");
                doc.text(nomeExibido || form.nome, 160, 60, {
                  align: "center",
                });
                doc.setFontSize(14);
                doc.setFont(undefined, "normal");
                doc.setTextColor("#ccc");
                doc.text(form.cpf, 160, 85, { align: "center" });
                if (qrDataUrl) {
                  doc.addImage(qrDataUrl, "PNG", 70, 110, 180, 180);
                }
                doc.setFontSize(13);
                doc.setTextColor("#fff");
                doc.setFont(undefined, "bold");
                doc.text("Apresente este QR Code na bilheteria", 160, 320, {
                  align: "center",
                });
                doc.setFontSize(11);
                doc.setFont(undefined, "normal");
                doc.setTextColor("#ccc");
                doc.text("para garantir seu desconto!", 160, 340, {
                  align: "center",
                });
                doc.save(
                  `sfm-desconto-${form.cpf.replace(/\D/g, "") || "codigo"}.pdf`
                );
              }}
            >
              Salvar (PDF)
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
            <div>
              <label className="block text-white font-semibold mb-1">
                Nome completo
              </label>
              <input
                type="text"
                name="nome"
                required
                value={form.nome}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-[#222] text-white border border-gray-700 focus:border-red-500 focus:outline-none"
                placeholder="Seu nome"
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-1">CPF</label>
              <input
                type="text"
                name="cpf"
                required
                value={form.cpf}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-[#222] text-white border border-gray-700 focus:border-red-500 focus:outline-none"
                placeholder="000.000.000-00"
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-1">
                E-mail
              </label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-[#222] text-white border border-gray-700 focus:border-red-500 focus:outline-none"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-1">
                Telefone
              </label>
              <input
                type="tel"
                name="telefone"
                required
                value={form.telefone}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-[#222] text-white border border-gray-700 focus:border-red-500 focus:outline-none"
                placeholder="(51) 99999-9999"
                inputMode="numeric"
              />
            </div>
            {erro && (
              <div className="text-yellow-400 text-center text-sm font-semibold">
                {erro}
              </div>
            )}
            <button
              type="submit"
              className="mt-2 px-8 py-3 border-2 border-white text-white font-bold rounded-lg text-lg bg-[#222] hover:bg-red-600 hover:text-white transition-all outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Cadastrar"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
