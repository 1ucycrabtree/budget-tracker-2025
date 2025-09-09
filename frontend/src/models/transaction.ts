export interface Transaction {
  id?: string;
  userId?: string;
  description: string;
  amount: number;
  category: string;
  type: "Credit" | "Debit" | "-";
  transactionDateTime: string;
  bankReference?: string;
}
