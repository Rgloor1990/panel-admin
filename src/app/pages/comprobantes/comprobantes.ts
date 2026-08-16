import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Comprobante {
  id: number;
  pedido: number;
  cliente: string;
  fecha: string;
  monto: number;
  estado: string;
}

@Component({
  selector: 'app-comprobantes',
  imports: [CommonModule, FormsModule],
  templateUrl: './comprobantes.html',
  styleUrl: './comprobantes.css'
})
export class Comprobantes {

  terminoBusqueda: string = '';

  filtroEstado: string = 'Todos';

  mostrarComprobante: boolean = false;

  mostrarConfirmacion: boolean = false;

  mostrarCambioEstado: boolean = false;

  comprobanteSeleccionado: Comprobante | null = null;

  nuevoEstado: string = 'Pendiente de revisión';


  comprobantes: Comprobante[] = [

    {
      id: 1,
      pedido: 1001,
      cliente: 'Juan Pérez',
      fecha: '12/08/2026',
      monto: 25000,
      estado: 'Pendiente de revisión'
    },

    {
      id: 2,
      pedido: 1002,
      cliente: 'María González',
      fecha: '12/08/2026',
      monto: 18000,
      estado: 'Aprobado'
    },

    {
      id: 3,
      pedido: 1003,
      cliente: 'Carlos Soto',
      fecha: '11/08/2026',
      monto: 32000,
      estado: 'Aprobado'
    },

    {
      id: 4,
      pedido: 1004,
      cliente: 'Ana Martínez',
      fecha: '11/08/2026',
      monto: 14500,
      estado: 'Pendiente de revisión'
    },

    {
      id: 5,
      pedido: 1005,
      cliente: 'Luis Rodríguez',
      fecha: '10/08/2026',
      monto: 27500,
      estado: 'Rechazado'
    }

  ];


  get comprobantesFiltrados(): Comprobante[] {

    const termino =
      this.terminoBusqueda
        .toLowerCase()
        .trim();


    return this.comprobantes.filter(comprobante => {

      const coincideBusqueda =
        !termino ||
        comprobante.cliente
          .toLowerCase()
          .includes(termino) ||
        comprobante.pedido
          .toString()
          .includes(termino);


      const coincideEstado =
        this.filtroEstado === 'Todos' ||
        comprobante.estado === this.filtroEstado;


      return coincideBusqueda && coincideEstado;

    });

  }


  limpiarBusqueda(): void {

    this.terminoBusqueda = '';

  }


  cambiarFiltroEstado(estado: string): void {

    this.filtroEstado = estado;

  }


  verComprobante(comprobante: Comprobante): void {

    this.comprobanteSeleccionado = comprobante;

    this.mostrarComprobante = true;

  }


  cerrarComprobante(): void {

    this.mostrarComprobante = false;

    this.comprobanteSeleccionado = null;

  }


  aprobarComprobante(comprobante: Comprobante): void {

    comprobante.estado = 'Aprobado';

  }


  rechazarComprobante(comprobante: Comprobante): void {

    comprobante.estado = 'Rechazado';

  }


  aprobarDesdeModal(): void {

    if (!this.comprobanteSeleccionado) {
      return;
    }

    this.comprobanteSeleccionado.estado = 'Aprobado';

    this.cerrarComprobante();

  }


  rechazarDesdeModal(): void {

    if (!this.comprobanteSeleccionado) {
      return;
    }

    this.comprobanteSeleccionado.estado = 'Rechazado';

    this.cerrarComprobante();

  }


  abrirCambioEstado(comprobante: Comprobante): void {

    this.comprobanteSeleccionado = comprobante;

    this.nuevoEstado = comprobante.estado;

    this.mostrarConfirmacion = true;

  }


  cancelarCambioEstado(): void {

    this.mostrarConfirmacion = false;

    this.comprobanteSeleccionado = null;

  }


  confirmarCambioEstado(): void {

    if (!this.comprobanteSeleccionado) {
      return;
    }

    this.mostrarConfirmacion = false;

    this.nuevoEstado = this.comprobanteSeleccionado.estado;

    this.mostrarCambioEstado = true;

  }


  cancelarCambioEstadoFinal(): void {

    this.mostrarCambioEstado = false;

    this.comprobanteSeleccionado = null;

  }


  guardarCambioEstado(): void {

    if (!this.comprobanteSeleccionado) {
      return;
    }

    this.comprobanteSeleccionado.estado = this.nuevoEstado;

    this.mostrarCambioEstado = false;

    this.comprobanteSeleccionado = null;

  }

}