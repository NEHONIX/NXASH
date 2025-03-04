"use strict";
class PaiementPro {
  constructor(merchantId) {
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
  async init() {
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
  }
  async getUrlPayment() {
    let data = await this.init();
  }
}
