export interface SmartphoneSubscriptionItem {
  id: string;
  product: string;
  quantity: number;
  stock: number;
  description: string;
  model: string;
  image: string;
  monthlyPrice: number;
  planType: string;
  benefits: string[];
}
