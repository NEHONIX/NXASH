import dotenv from "dotenv";
dotenv.config();

if (!process.env.BREVO_API_KEY) {
  throw new Error("BREVO_API_KEY is not defined in environment variables");
}

export const BREVO_CONFIG = {
  API_KEY: process.env.BREVO_API_KEY,
  SMTP: {
    HOST: "smtp-relay.brevo.com",
    PORT: 587,
    USER: "84482d001@smtp-brevo.com",
  },
};
