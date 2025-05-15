export interface CrearPedido {
  client_id: string;
  items: Item[];
}

export interface Item {
  product_id: string;
  quantity: number;
}
