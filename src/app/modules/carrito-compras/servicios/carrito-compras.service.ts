import { Injectable } from '@angular/core';
import { Producto } from '../interfaces/productos.interface';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { ClientCart } from '../interfaces/carrito.interface';

@Injectable({
  providedIn: 'root',
})
export class CarritoComprasService {
  private currentClientId: string | null = null;
  private clientCarts: Map<string, ClientCart> = new Map();

  // BehaviorSubjects para el carrito actual
  private cartItemCount = new BehaviorSubject<number>(0);
  private cartTotalAmount = new BehaviorSubject<number>(0);

  // BehaviorSubject para la lista de clientes con carritos
  private clientsWithCarts = new BehaviorSubject<string[]>([]);

  // BehaviorSubject para el cambio de disponibilidad del producto
  private productAvailabilityChanged = new BehaviorSubject<string | null>(null);
  productAvailabilityChanged$ = this.productAvailabilityChanged.asObservable();

  private storageReady = false;

  constructor(
    private storage: Storage,
    private platform: Platform,
  ) {
    this.init();
  }

  async init() {
    // Crear el almacenamiento
    await this.storage.create();
    this.storageReady = true;

    // Cargar todos los carritos almacenados
    await this.loadAllCarts();

    // Escuchar el evento de pausa para guardar los carritos
    this.platform.pause.subscribe(() => {
      this.saveAllCarts();
    });
  }

  // Establecer el cliente actual
  setCurrentClient(clientId: string): void {
    this.currentClientId = clientId;

    // Asegurarse de que existe un carrito para este cliente
    if (!this.clientCarts.has(clientId)) {
      this.clientCarts.set(clientId, {
        clientId,
        items: [],
        lastUpdated: new Date(),
      });
    }

    // Actualizar los contadores basado en el carrito del cliente seleccionado
    this.updateCartStatus();
  }

  // Obtener el ID del cliente actual
  getCurrentClientId(): string | null {
    return this.currentClientId;
  }

  // Obtener la lista de clientes que tienen carritos
  getClientsWithCarts(): Observable<string[]> {
    return this.clientsWithCarts.asObservable();
  }

  // Obtener el contador de elementos del carrito actual como Observable
  getCartItemCount(): Observable<string> {
    return this.cartItemCount
      .asObservable()
      .pipe(map(count => (count > 99 ? '99+' : count.toString())));
  }

  // Obtener el total del carrito actual como Observable
  getCartTotalAmount(): Observable<number> {
    return this.cartTotalAmount.asObservable();
  }

  // Obtener el carrito de un cliente específico
  getCartByClientId(clientId: string): Producto[] {
    const clientCart = this.clientCarts.get(clientId);
    return clientCart ? [...clientCart.items] : [];
  }

  // Obtener el carrito actual
  getCurrentCart(): Producto[] {
    if (!this.currentClientId) return [];
    return this.getCartByClientId(this.currentClientId);
  }

  // Añadir un elemento al carrito del cliente actual
  addToCurrentCart(product: Producto): void {
    if (!this.currentClientId) return;

    const clientCart = this.clientCarts.get(this.currentClientId);
    if (!clientCart) return;

    // Verificar si el producto ya existe en el carrito
    const existingItemIndex = clientCart.items.findIndex(
      item => item.product_id === product.product_id,
    );

    if (existingItemIndex >= 0) {
      // Incrementar la cantidad si ya existe, pero sin exceder la cantidad disponible
      const newQuantity =
        clientCart.items[existingItemIndex].quantity_selected + (product.quantity_selected || 1);
      clientCart.items[existingItemIndex].quantity_selected = Math.min(
        newQuantity,
        clientCart.items[existingItemIndex].quantity,
      );
    } else {
      // Establecer cantidad inicial si es un nuevo producto
      product.quantity_selected = product.quantity_selected || 1;
      // Asegurar que quantity_selected no exceda quantity
      product.quantity_selected = Math.min(product.quantity_selected, product.quantity);
      clientCart.items.push({ ...product });
    }

    // Actualizar la fecha de modificación
    clientCart.lastUpdated = new Date();

    // Actualizar contadores y guardar
    this.updateCartStatus();
    this.saveAllCarts();
    this.updateClientsWithCarts();
  }

  //actualizar un producto en el carrito actual
  updateProductQuantity(productId: string, quantity: number): void {
    if (!this.currentClientId) return;
    const clientCart = this.clientCarts.get(this.currentClientId);
    if (!clientCart) return;

    const productIndex = clientCart.items.findIndex(item => item.product_id === productId);
    if (productIndex >= 0) {
      clientCart.items[productIndex].quantity_selected = Math.min(
        quantity,
        clientCart.items[productIndex].quantity,
      );
      clientCart.lastUpdated = new Date();
      this.updateCartStatus();
      this.saveAllCarts();
    }
  }

  // Añadir un elemento al carrito de un cliente específico
  addToClientCart(clientId: string, product: Producto): void {
    // Guarda el cliente actual
    const previousClientId = this.currentClientId;

    // Cambia temporalmente al cliente especificado
    this.setCurrentClient(clientId);

    // Añade el producto
    this.addToCurrentCart(product);

    // Restaura el cliente anterior
    if (previousClientId !== null) {
      this.setCurrentClient(previousClientId);
    }
  }

  // Eliminar un elemento del carrito actual
  removeFromCurrentCart(productId: string): void {
    if (!this.currentClientId) return;

    const clientCart = this.clientCarts.get(this.currentClientId);
    if (!clientCart) return;

    clientCart.items = clientCart.items.filter(item => item.product_id !== productId);
    clientCart.lastUpdated = new Date();

    this.updateCartStatus();
    this.saveAllCarts();
    this.updateClientsWithCarts();
  }

  // Vaciar el carrito actual
  clearCurrentCart(): void {
    if (!this.currentClientId) return;

    const clientCart = this.clientCarts.get(this.currentClientId);
    if (!clientCart) return;

    clientCart.items = [];
    clientCart.lastUpdated = new Date();

    this.updateCartStatus();
    this.saveAllCarts();
    this.updateClientsWithCarts();
  }

  // Eliminar el carrito de un cliente específico
  deleteClientCart(clientId: string): void {
    this.clientCarts.delete(clientId);

    if (this.currentClientId === clientId) {
      this.currentClientId = null;
      this.cartItemCount.next(0);
      this.cartTotalAmount.next(0);
    }

    this.saveAllCarts();
    this.updateClientsWithCarts();
  }

  // Actualizar el contador y el total del carrito actual
  private updateCartStatus(): void {
    if (!this.currentClientId) {
      this.cartItemCount.next(0);
      this.cartTotalAmount.next(0);
      return;
    }

    const clientCart = this.clientCarts.get(this.currentClientId);
    if (!clientCart) {
      this.cartItemCount.next(0);
      this.cartTotalAmount.next(0);
      return;
    }

    // Calcular el número total de elementos
    const itemCount = clientCart.items.reduce(
      (count, item) => count + (item.quantity_selected || 0),
      0,
    );
    this.cartItemCount.next(itemCount);

    // Calcular el importe total
    const totalAmount = clientCart.items.reduce(
      (total, item) => total + item.price * item.quantity_selected,
      0,
    );
    this.cartTotalAmount.next(totalAmount);
  }

  // Actualizar la lista de clientes con carritos
  private updateClientsWithCarts(): void {
    const clientIds = Array.from(this.clientCarts.keys()).filter(clientId => {
      const cart = this.clientCarts.get(clientId);
      return cart && cart.items.length > 0;
    });

    this.clientsWithCarts.next(clientIds);
  }

  // Guardar todos los carritos en el almacenamiento local
  async saveAllCarts(): Promise<void> {
    if (!this.storageReady) return;

    // Convertir el Map a un array para almacenamiento
    const cartsArray = Array.from(this.clientCarts.values());

    // Guardar el array
    await this.storage.set('clientCarts', cartsArray);

    // Guardar también el ID del cliente actual
    await this.storage.set('currentClientId', this.currentClientId);
  }

  // Cargar todos los carritos desde el almacenamiento local
  async loadAllCarts(): Promise<void> {
    if (!this.storageReady) return;

    // Cargar el array de carritos
    const cartsArray = await this.storage.get('clientCarts');

    if (cartsArray && Array.isArray(cartsArray)) {
      // Limpiar el Map actual
      this.clientCarts.clear();

      // Convertir el array a un Map
      cartsArray.forEach((cart: ClientCart) => {
        // Asegurarse de que la fecha sea un objeto Date
        cart.lastUpdated = new Date(cart.lastUpdated);
        this.clientCarts.set(cart.clientId, cart);
      });

      // Actualizar la lista de clientes con carritos
      this.updateClientsWithCarts();
    }

    // Cargar el ID del cliente actual
    const storedClientId = await this.storage.get('currentClientId');
    if (storedClientId !== null && this.clientCarts.has(storedClientId)) {
      this.currentClientId = storedClientId;
      this.updateCartStatus();
    }
  }

  // Método para actualizar la cantidad disponible de un producto en todos los carritos
  updateProductAvailability(productId: string, newAvailableQuantity: number): void {
    // Contador para saber cuántos carritos se actualizaron
    let updatedCarts = 0;
    let updatedQuantities = 0;

    // Iterar sobre todos los carritos
    this.clientCarts.forEach(clientCart => {
      // Buscar el producto en el carrito actual
      const productIndex = clientCart.items.findIndex(item => item.product_id === productId);
      // Si el producto existe en este carrito
      if (productIndex >= 0) {
        const product = clientCart.items[productIndex];
        // Guardar la cantidad anterior para verificar si hubo cambio
        const previousQuantity = product.quantity;
        // Actualizar la cantidad disponible
        product.quantity = newAvailableQuantity;
        // Verificar si la cantidad seleccionada excede la nueva cantidad disponible
        if (product.quantity_selected > newAvailableQuantity) {
          // Ajustar la cantidad seleccionada al máximo disponible
          product.quantity_selected = newAvailableQuantity;
          updatedQuantities++;
        }
        // Actualizar la fecha de modificación del carrito
        clientCart.lastUpdated = new Date();
        updatedCarts++;

        // Si la cantidad disponible cambió, notificar a los componentes
        if (previousQuantity !== newAvailableQuantity) {
          this.productAvailabilityChanged.next(productId);
        }
      }
    });

    if (this.currentClientId) {
      this.updateCartStatus();
    }

    this.saveAllCarts();
  }
}
