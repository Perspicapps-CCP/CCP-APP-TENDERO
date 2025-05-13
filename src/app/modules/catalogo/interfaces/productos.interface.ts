export interface Producto {
  product_id?: string;
  product_name: string;
  product_code: string;
  manufacturer_name: string;
  price: number;
  price_currency: string;
  images: string[];
  quantity: number;
  quantity_selected: number;
}
