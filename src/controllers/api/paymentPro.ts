import axios from "axios";
import { PaymentPro as PaymentProInterface } from "../../types/payment";

export class PaymentService {
  private paymentDatas: PaymentProInterface;
  private merchantId: string = process.env.PAYMENT_PRO_API_KEY || "";
  private paymentBaseUrl =
    "https://www.paiementpro.net/webservice/onlinepayment/js/initialize/initialize.php";
  private dataToSend: (PaymentProInterface & { merchantId: string }) | null =
    null;
  private paymentUrl: string = "";
  private success: boolean = false;
  // success: boolean;
  // url: string;
  // returnContext: string;
  // returnURL: string; //OMCIV2
  // notificationURL: string;
  // paymentDatas: PaymentProInterface;

  constructor(paymentDatas: PaymentProInterface) {
    this.merchantId;
    this.paymentDatas = paymentDatas;
    this.dataToSend = Object.assign(this.paymentDatas, {
      merchantId: this.merchantId,
    });
  }

  async init(): Promise<any> {
    const response = await axios.post(this.paymentBaseUrl, this.dataToSend);
    const data = response.data;
    this.success = data.success;
    this.paymentUrl = data.url;
    return {
      paymentUrl: data.url,
      success: data.success,
    };
  }

  async getUrlPayment(): Promise<{ paymentUrl: string; success: boolean }> {
    let data = await this.init();
    // console.log("data: ", data);
    return data;
  }
}
