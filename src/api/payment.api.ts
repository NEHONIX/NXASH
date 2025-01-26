import axios from "axios";
import { BASE_URL_API } from "./baseUrl.api";

const api = axios.create({
  baseURL: BASE_URL_API({ isStudent: false }),
  headers: {
    "Content-Type": "application/json",
  },
});

type PaymentMethodType = "orange" | "mtn" | "moov";

interface PaymentData {
  amount: number;
  verificationCode?: string;
  paymentPhoneNumber: string;
  paymentMethod: PaymentMethodType;
}

interface PaymentRequest {
  paymentToken: string;
  paymentData: PaymentData;
}

export const paymentService = {
  initializePayment: async (data: PaymentRequest) => {
    const response = await api.post(`/public/v1/payments/initialize`, data);
    return response.data.data;
  },

  verifyPayment: async (paymentRef: string) => {
    const response = await api.get(`/public/v1/payments/status/${paymentRef}`);
    return response.data.data;
  },

  verifyOrangeCode: async (paymentRef: string, verificationCode: string) => {
    const response = await api.post(`/public/v1/payments/verify-orange-code`, {
      paymentRef,
      verificationCode,
    });
    return response.data;
  },
};
