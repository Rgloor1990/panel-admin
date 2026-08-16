import { Injectable } from '@angular/core';

export interface Producto {
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  cliente: string;
  correo: string;
  telefono: string;
  fecha: string;
  total: number;
  estado: string;
  comprobante: string;
  productos: Producto[];
}

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  private pedidos: Pedido[] = [

    {
      id: 1001,
      cliente: 'Juan Pérez',
      correo: 'juan.perez@email.com',
      telefono: '+56 9 1234 5678',
      fecha: '12/08/2026',
      total: 25000,
      estado: 'Pago en revisión',
      comprobante: 'Pendiente de revisión',

      productos: [
        {
          nombre: 'Mochila escolar',
          cantidad: 1,
          precio: 15000,
          subtotal: 15000
        },
        {
          nombre: 'Cuaderno universitario',
          cantidad: 2,
          precio: 5000,
          subtotal: 10000
        }
      ]
    },

    {
      id: 1002,
      cliente: 'María González',
      correo: 'maria.gonzalez@email.com',
      telefono: '+56 9 9876 5432',
      fecha: '12/08/2026',
      total: 18000,
      estado: 'Aprobado',
      comprobante: 'Comprobante aprobado',

      productos: [
        {
          nombre: 'Agenda escolar',
          cantidad: 1,
          precio: 8000,
          subtotal: 8000
        },
        {
          nombre: 'Set de lápices',
          cantidad: 2,
          precio: 5000,
          subtotal: 10000
        }
      ]
    },

    {
      id: 1003,
      cliente: 'Carlos Soto',
      correo: 'carlos.soto@email.com',
      telefono: '+56 9 4567 8910',
      fecha: '11/08/2026',
      total: 32000,
      estado: 'En preparación',
      comprobante: 'Comprobante aprobado',

      productos: [
        {
          nombre: 'Mochila deportiva',
          cantidad: 1,
          precio: 22000,
          subtotal: 22000
        },
        {
          nombre: 'Botella de agua',
          cantidad: 1,
          precio: 10000,
          subtotal: 10000
        }
      ]
    },

    {
      id: 1004,
      cliente: 'Ana Martínez',
      correo: 'ana.martinez@email.com',
      telefono: '+56 9 1122 3344',
      fecha: '10/08/2026',
      total: 45000,
      estado: 'Entregado',
      comprobante: 'Comprobante aprobado',

      productos: [
        {
          nombre: 'Mochila ejecutiva',
          cantidad: 1,
          precio: 30000,
          subtotal: 30000
        },
        {
          nombre: 'Cuaderno premium',
          cantidad: 3,
          precio: 5000,
          subtotal: 15000
        }
      ]
    }

  ];


  obtenerPedidos(): Pedido[] {
    return this.pedidos;
  }


  obtenerPedidoPorId(id: number): Pedido | undefined {
    return this.pedidos.find(
      pedido => pedido.id === id
    );
  }


  aprobarPedido(id: number): void {

    const pedido = this.obtenerPedidoPorId(id);

    if (!pedido) {
      return;
    }

    pedido.estado = 'Aprobado';
    pedido.comprobante = 'Comprobante aprobado';
  }


  rechazarPedido(id: number): void {

    const pedido = this.obtenerPedidoPorId(id);

    if (!pedido) {
      return;
    }

    pedido.estado = 'Rechazado';
    pedido.comprobante = 'Comprobante rechazado';
  }

}