"use client";
import { useState, useEffect } from "react";

function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate));
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);
  return timeLeft;
}
function getTimeLeft(targetDate) {
  const now = new Date();
  const diff = Math.max(0, targetDate - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export default function ContadorEvento({ data, dataLabel }) {
  const countdown = useCountdown(data);
  return (
    <div className="w-full max-w-5xl flex flex-col md:grid md:grid-cols-[1fr_1fr_2fr_auto] items-stretch min-h-[160px] px-2 md:px-0">
      {/* Contador */}
      <div className="w-full md:col-span-3 flex flex-col md:flex-row items-center">
        <div className="flex-1 flex justify-center gap-8 md:gap-24 bg-[#222] rounded-l-lg px-6 py-8 w-full min-h-[160px] h-full">
          {[
            {
              label: "DIAS",
              value: countdown.days.toString().padStart(2, "0"),
            },
            {
              label: "HORAS",
              value: countdown.hours.toString().padStart(2, "0"),
            },
            {
              label: "MINUTOS",
              value: countdown.minutes.toString().padStart(2, "0"),
            },
            {
              label: "SEGUNDOS",
              value: countdown.seconds.toString().padStart(2, "0"),
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center justify-center min-w-[60px] md:min-w-[90px]"
            >
              <span
                className="text-4xl md:text-6xl font-extrabold text-white leading-none"
                style={{ fontFamily: "Anton, sans-serif" }}
              >
                {item.value}
              </span>
              <span className="text-xs md:text-lg text-white font-light tracking-widest mt-1 uppercase font-sans">
                {item.label}
              </span>
            </div>
          ))}
        </div>
        {/* Data destaque - desktop */}
        <div className="hidden md:flex items-stretch md:col-span-1 h-full">
          <div
            className="bg-red-600 text-white font-extrabold text-3xl md:text-5xl px-8 py-8 flex flex-col items-center justify-center whitespace-nowrap rounded-r-lg min-h-[160px] h-full"
            style={{ fontFamily: "Anton, sans-serif" }}
          >
            <span>
              {dataLabel.inicio}{" "}
              <span className="text-base align-top font-sans">
                {dataLabel.mesInicio}
              </span>
            </span>
            <span className="text-xl md:text-3xl font-bold font-sans">A</span>
            <span>
              {dataLabel.fim}{" "}
              <span className="text-base align-top font-sans">
                {dataLabel.mesFim}
              </span>
            </span>
          </div>
        </div>
      </div>
      {/* Data destaque - mobile */}
      <div className="flex md:hidden w-full justify-center">
        <div className="w-full max-w-4xl flex flex-row items-center rounded-b-lg overflow-hidden mx-auto">
          <div
            className="bg-red-600 text-white font-extrabold text-xl px-4 py-2 flex-1 flex items-center justify-center whitespace-nowrap text-center"
            style={{ fontFamily: "Anton, sans-serif" }}
          >
            {dataLabel.inicio} DE {dataLabel.mesInicio} A {dataLabel.fim} DE{" "}
            {dataLabel.mesFim}
          </div>
        </div>
      </div>
    </div>
  );
}
