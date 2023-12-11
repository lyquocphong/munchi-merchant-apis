export interface WoltCoordinate {
  lon: number;
  lat: number;
}

export interface WoltDeliveryLocation {
  street_address: string;
  apartment: string;
  city: string;
  country: string;
  coordinates: WoltCoordinate;
  formatted_address: string;
}

export interface WoltDeliveryFee {
  amount: number;
  currency: string;
}

export interface WoltSmallOrderSurcharge {
  amount: number;
  currency: string;
}

export type WoltDeliveryType = 'takeaway' | 'homedelivery' | 'eatin';

export type WoltOrderStatus =
  | 'received'
  | 'fetched'
  | 'acknowledged'
  | 'production'
  | 'ready'
  | 'delivered'
  | 'rejected'
  | 'refunded';

export interface WoltDeliveryDetails {
  status: string;
  type: WoltDeliveryType;
  time: string;
  fee: WoltDeliveryFee;
  location: WoltDeliveryLocation;
  small_order_surcharge: WoltSmallOrderSurcharge;
}

export interface WoltPrice {
  amount: number;
  currency: string;
}

export interface WoltOption {
  id: string;
  name: string;
  value: string;
  price: WoltPrice;
  pos_id: string;
  count: number;
  value_pos_id: string;
}

export interface WoltCategory {
  id: string;
  name: string;
}

export interface WoltSubstitutionSettings {
  is_allowed: boolean;
}

export interface WoltWeightDetails {
  weight_in_grams: number;
  requested_amount: number;
  extra_weight_percentage: number;
}

export interface WoltItem {
  id: string;
  name: string;
  count: number;
  options: WoltOption[];
  category: WoltCategory;
  row_number: number;
  substitution_settings: WoltSubstitutionSettings;
  total_price: WoltPrice;
  unit_price: WoltPrice;
  base_price: WoltPrice;
  weight_details: WoltWeightDetails;
  sku: string;
  gtin: string;
  pos_id: string;
  item_type: string;
}

export interface WoltPreOrder {
  preorder_time: string;
  pre_order_status: string;
}

export interface WoltOrder {
  id: string;
  venue: {
    id: string;
    name: string;
  };
  price: WoltPrice;
  delivery: WoltDeliveryDetails;
  items: WoltItem[];
  created_at: string;
  consumer_comment: string;
  pickup_eta: string;
  attribution_id: string;
  type: string;
  pre_order: WoltPreOrder;
  consumer_name: string;
  consumer_phone_number: string;
  order_number: string;
  order_status: string;
  modified_at: string;
  company_tax_id: string;
  loyalty_card_number: string;
}
