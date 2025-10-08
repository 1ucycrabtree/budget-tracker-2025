export const formatAmount = (amountPence: number): string => {
  // amount stored in pence, convert to pounds
  const amount = amountPence / 100;
  const absAmount = Math.abs(amount);
  const formattedAmount = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(absAmount);

  if (amount > 0) {
    return `+${formattedAmount}`;
  }
  return formattedAmount;
};

// format date as 02/Jun/25
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  }).format(date);
};
