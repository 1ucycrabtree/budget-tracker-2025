export interface addTransactionRequest {
  description: string;
  amount: number;
  category: string;
  transactionDateTime: string;
  bankReference?: string;
}
