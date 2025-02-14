export class PaymentService {
  merchantId: string;
  amount: number;
  description: string;
  channel: string;
  countryCurrencyCode: string;
  referenceNumber: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastname: string;
  customerPhoneNumber: string;
  notificationURL: string;
  returnURL: string;
  returnContext: string;
  url: string;
  success: boolean;

  constructor(merchantId: string) {
    this.merchantId = merchantId;
    this.amount = 0;
    this.description = "";
    this.channel = "";
    this.countryCurrencyCode = "952";
    this.referenceNumber = "";
    this.customerEmail = "";
    this.customerFirstName = "";
    this.customerLastname = "";
    this.customerPhoneNumber = "";
    this.notificationURL = "";
    this.returnURL = "";
    this.returnContext = "";
    this.url = "";
    this.success = false;
  }

  async init(): Promise<{
    url: string;
    success: boolean;
  }> {
    const response = await fetch(
      "https://www.paiementpro.net/webservice/onlinepayment/js/initialize/initialize.php",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this),
      }
    );
    let data = await response.json().then((data) => {
      this.url = data.url;
      this.success = data.success;
    });
    console.log(data);
    return {
      url: this.url,
      success: this.success,
    };
  }

  async getUrlPayment(): Promise<{ url: string; success: boolean }> {
    let data = await this.init();
    return data;
  }
}
