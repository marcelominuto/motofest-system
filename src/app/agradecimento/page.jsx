"use client";

export default function AgradecimentoPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-4xl mx-auto text-center">
        {/* Logo */}
        <div className="mb-8">
          <img
            src="/logo-smf.png"
            alt="Salão Moto Fest"
            className="h-20 md:h-24 w-auto mx-auto"
          />
        </div>

        {/* Título Principal */}
        <h1
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-8 tracking-wider"
          style={{ fontFamily: "Anton, sans-serif" }}
        >
          FOI INCRÍVEL TER VOCÊS AQUI!
        </h1>

        {/* Estatísticas */}
        <div className="mb-10">
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-4 md:p-6 shadow-2xl border-2 border-red-500">
            <div className="text-center">
              <p
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-2"
                style={{ fontFamily: "Anton, sans-serif" }}
              >
                + 800
              </p>
              <p className="text-lg md:text-xl font-bold text-white">
                TEST RIDES REALIZADOS!
              </p>
            </div>
          </div>
        </div>

        {/* Mensagem de Agradecimento Emocional */}
        <div className="space-y-6 mb-12">
          <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-3xl mx-auto">
            O{" "}
            <span className="text-red-600 font-bold">Salão Moto Fest 2025</span>{" "}
            foi um sucesso absoluto, e isso só foi possível{" "}
            <span className="text-white font-semibold">graças a você</span>!
          </p>

          <p className="text-base md:text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto">
            Cada volta na lendária pista de Tarumã, cada sorriso, cada momento
            de adrenalina pura... Tudo isso faz parte de uma experiência única
            que construímos juntos. Você não foi apenas um participante, você
            foi{" "}
            <span className="text-white font-semibold">parte da história</span>{" "}
            que estamos escrevendo.
          </p>

          <p className="text-base md:text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto">
            A energia que sentimos durante esses dias foi indescritível. Ver a{" "}
            <span className="text-red-600 font-semibold">
              paixão pela motocicleta
            </span>{" "}
            em cada pessoa que cruzou nossos portões nos enche de orgulho e nos
            motiva a tornar o próximo evento ainda mais especial.
          </p>

          {/* Destaque para o Próximo Evento */}
          <div className="mt-12 pt-10 pb-8 border-t-2 border-b-2 border-red-600 bg-gradient-to-b from-red-950/20 to-transparent rounded-lg px-6">
            <h2
              className="text-3xl md:text-5xl font-extrabold text-red-600 mb-6 tracking-wide"
              style={{ fontFamily: "Anton, sans-serif" }}
            >
              NOS VEMOS NO PRÓXIMO!
            </h2>
            <p className="text-lg md:text-xl text-white leading-relaxed max-w-3xl mx-auto font-semibold mb-4">
              O próximo Salão Moto Fest será ainda mais grandioso, e{" "}
              <span className="text-red-600">você precisa estar lá</span>!
            </p>
            <p className="text-base md:text-lg text-gray-200 leading-relaxed max-w-3xl mx-auto">
              Fique ligado nas nossas redes sociais para não perder nenhuma
              novidade. Novas motos, novas experiências, novos momentos
              inesquecíveis estão chegando.{" "}
              <span className="text-white font-semibold">
                Esta é apenas o começo da nossa jornada juntos!
              </span>
            </p>
          </div>
        </div>

        {/* Redes Sociais */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <a
            href="https://wa.me/5551992485757"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="flex-shrink-0"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
            </svg>
            WhatsApp
          </a>

          <a
            href="https://instagram.com/motofest.taruma"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="flex-shrink-0"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            Instagram
          </a>
        </div>

        {/* Decoração */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <p className="text-sm text-gray-400">
            Obrigado por fazer parte da nossa história!
          </p>
        </div>
      </div>
    </div>
  );
}
