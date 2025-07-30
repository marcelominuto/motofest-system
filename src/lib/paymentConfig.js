// Configuração para alternar entre gateways de pagamento
export const PAYMENT_GATEWAY =
  process.env.NEXT_PUBLIC_PAYMENT_GATEWAY || "stripe";

// URLs das APIs de pagamento
export const getCheckoutUrl = () => {
  switch (PAYMENT_GATEWAY) {
    case "pagarme":
      return "/api/pagarme/checkout-session";
    case "stripe":
    default:
      return "/api/stripe/checkout-session";
  }
};

export const getSessionUrl = (sessionId) => {
  switch (PAYMENT_GATEWAY) {
    case "pagarme":
      return `/api/pagarme/session/${sessionId}`;
    case "stripe":
    default:
      return `/api/stripe/session/${sessionId}`;
  }
};

console.log("PAYMENT_GATEWAY:", PAYMENT_GATEWAY);
