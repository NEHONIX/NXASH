export interface FirestoreTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

export const formatFirestoreDate = (
  timestamp: FirestoreTimestamp,
  // options?: { withTime?: boolean }
): Date => {
  const convertedDate = new Date(
    timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000
  );

  // if (!options?.withTime) {
  //   const newDate = new Date(
  //     convertedDate.getFullYear(),
  //     convertedDate.getMonth(),
  //     convertedDate.getDate()
  //   );

  //   const splitDate = newDate.toString().split(" ");


  //   return newDate
  // }

  return convertedDate
};

export const formatDateToFr = (date: Date): string => {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
