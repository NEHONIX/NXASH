import { firestore } from "../conf/firebase";

interface PaymentStats {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  totalAmount: number;
  averageAmount: number;
  paymentsByMethod: {
    orange: number;
    mtn: number;
    moov: number;
  };
  subscriptionRenewalRate: number;
}

class PaymentStatsService {
  private paymentsRef = firestore.collection("payment_sessions");
  private subscriptionsRef = firestore.collection("subscriptions");

  async updatePaymentStats(paymentData: any, success: boolean) {
    const statsRef = firestore.collection("statistics").doc("payments");
    const statsDoc = await statsRef.get();

    const maintenant = new Date();
    const moisActuel = `${maintenant.getFullYear()}-${String(maintenant.getMonth() + 1).padStart(2, "0")}`;

    if (!statsDoc.exists) {
      // Initialiser les statistiques
      await statsRef.set({
        global: {
          totalPayments: 1,
          successfulPayments: success ? 1 : 0,
          failedPayments: success ? 0 : 1,
          totalAmount: success ? paymentData.amount : 0,
          paymentsByMethod: {
            orange: paymentData.paymentMethod === "orange" ? 1 : 0,
            mtn: paymentData.paymentMethod === "mtn" ? 1 : 0,
            moov: paymentData.paymentMethod === "moov" ? 1 : 0,
          }
        },
        monthly: {
          [moisActuel]: {
            totalPayments: 1,
            successfulPayments: success ? 1 : 0,
            failedPayments: success ? 0 : 1,
            totalAmount: success ? paymentData.amount : 0,
            paymentsByMethod: {
              orange: paymentData.paymentMethod === "orange" ? 1 : 0,
              mtn: paymentData.paymentMethod === "mtn" ? 1 : 0,
              moov: paymentData.paymentMethod === "moov" ? 1 : 0,
            }
          }
        }
      });
      return;
    }

    const stats = statsDoc.data()!;
    const monthlyStats = stats.monthly?.[moisActuel] || {
      totalPayments: 0,
      successfulPayments: 0,
      failedPayments: 0,
      totalAmount: 0,
      paymentsByMethod: { orange: 0, mtn: 0, moov: 0 }
    };

    // Mettre à jour les statistiques globales
    await statsRef.update({
      "global.totalPayments": stats.global.totalPayments + 1,
      "global.successfulPayments": stats.global.successfulPayments + (success ? 1 : 0),
      "global.failedPayments": stats.global.failedPayments + (success ? 0 : 1),
      "global.totalAmount": stats.global.totalAmount + (success ? paymentData.amount : 0),
      [`global.paymentsByMethod.${paymentData.paymentMethod}`]: 
        stats.global.paymentsByMethod[paymentData.paymentMethod] + 1,
      
      // Mettre à jour les statistiques mensuelles
      [`monthly.${moisActuel}`]: {
        totalPayments: monthlyStats.totalPayments + 1,
        successfulPayments: monthlyStats.successfulPayments + (success ? 1 : 0),
        failedPayments: monthlyStats.failedPayments + (success ? 0 : 1),
        totalAmount: monthlyStats.totalAmount + (success ? paymentData.amount : 0),
        paymentsByMethod: {
          ...monthlyStats.paymentsByMethod,
          [paymentData.paymentMethod]: monthlyStats.paymentsByMethod[paymentData.paymentMethod] + 1
        }
      }
    });
  }

  async getPaymentStats(period: "global" | "monthly" = "global"): Promise<PaymentStats | null> {
    const statsDoc = await firestore.collection("statistics").doc("payments").get();
    
    if (!statsDoc.exists) return null;

    const stats = statsDoc.data()!;
    
    if (period === "monthly") {
      const maintenant = new Date();
      const moisActuel = `${maintenant.getFullYear()}-${String(maintenant.getMonth() + 1).padStart(2, "0")}`;
      return stats.monthly?.[moisActuel] || null;
    }

    return stats.global;
  }

  async getSubscriptionRenewalRate(): Promise<number> {
    const maintenant = new Date();
    const moisDernier = new Date(maintenant.setMonth(maintenant.getMonth() - 1));

    const subscriptions = await this.subscriptionsRef
      .where("status", "==", "actif")
      .get();

    let totalSubscriptions = subscriptions.size;
    let renewedSubscriptions = 0;

    for (const doc of subscriptions.docs) {
      const subscription = doc.data();
      const payments = await this.paymentsRef
        .where("subscriptionId", "==", subscription.id)
        .where("status", "==", "success")
        .where("createdAt", ">=", moisDernier)
        .get();

      if (payments.size > 0) {
        renewedSubscriptions++;
      }
    }

    return totalSubscriptions > 0 ? (renewedSubscriptions / totalSubscriptions) * 100 : 0;
  }
}

export const paymentStatsService = new PaymentStatsService();
