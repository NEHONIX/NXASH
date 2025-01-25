interface OrangeClientNotifMsgProps {
  paymentRef: string;
  amount: number;
  specialty: string;
  name: string;
  paymentPhoneNumber: string;
}
export const OrangeClientNotifMsg = ({
  paymentRef,
  amount,
  specialty,
  name,
  paymentPhoneNumber,
}: OrangeClientNotifMsgProps) => {
  return `
Cher(e) ${name},

Nous avons bien reçu votre demande de paiement pour votre inscription à NEHONIX Academy.

Détails de la transaction :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Référence : ${paymentRef}
• Montant : ${amount} FCFA
• Formation : ${specialty}
• Méthode : Orange Money
• Numéro : ${paymentPhoneNumber}

Instructions de paiement :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Composez le #144 * 82# sur votre téléphone
2. Suivez les instructions pour générer un code Orange Money
3. Une fois le code généré, retournez sur la plateforme et entrez ce code pour confirmer votre paiement

Important :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Gardez votre téléphone à proximité
• Vérifiez que vous avez suffisamment de crédit Orange Money
• Le code de transaction est valable pendant 24 heures
• En cas de problème, contactez notre support : support@nehonix.com

Notre équipe est disponible 24h/24 pour vous assister dans cette procédure.

Cordialement,
L'équipe NEHONIX Academy
  `;
};
