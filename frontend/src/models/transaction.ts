export interface Transaction {
  id: string;
  userId: string;
  description: string;
  amount: number;
  category: string;
  transactionDateTime: string;
  bankReference?: string;
}
