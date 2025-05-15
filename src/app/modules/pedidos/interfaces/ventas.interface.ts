export interface Sales {
  id: string;
  order_number: string;
  total: number;
  date?: Date | string;
  status: string;
  client: Client;
  seller: Client;
  items: Item[];
  deliveries: Delivery[];
  totalItems: string;
}

export interface Client {
  id: string;
  full_name: string;
  email: string;
  username: string;
  phone: string;
  id_type: string;
  identification: string;
  role: string;
}

export interface Delivery {
  shipping_number: string;
  license_plate: string;
  driver_name: string;
  warehouse: Warehouse;
  delivery_status: string;
  created_at: Date;
  updated_at: Date;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
}

export interface Item {
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface Product {
  id: string;
  product_code: string;
  name: string;
  price: number;
  images: string[];
  manufacturer: Manufacturer;
}

export interface Manufacturer {
  id: string;
  name: string;
  country: string;
}
