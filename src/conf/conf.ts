export const config = {
  pendingPaymentURL: process.env._PAYMENT_PENDING_URL_,
  server: {
    _port: process.env.PORT || 5000,
    _host: process.env.HOST || "nehonix.space",
    _url: process.env._URL || "https://nehonix.space",
    _frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
    _backendUrl: process.env.API_BASE_URL || "https://server.nehonix.space/",
    _name: process.env._SERVER_NAME || "NEHONIX",
    __dirname,
  },
};
