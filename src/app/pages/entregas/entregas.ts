import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Entrega {
  id: number;
  pedido: number;
  cliente: string;
  direccion: string;
  fecha: string;
  responsable: string;
  estado: string;
}

@Component({
  selector: 'app-entregas',
  imports: [CommonModule, FormsModule],
  templateUrl: './entregas.html',
  styleUrl: './entregas.css'
})
export class Entregas {

  terminoBusqueda: string = '';

  filtroEstado: string = 'Todos';

  mostrarGestion: boolean = false;

  entregaSeleccionada: Entrega | null = null;


  responsables: string[] = [
    'Pedro Muñoz',
    'Marcos Silva',
    'Laura González',
    'Carlos Ramírez'
  ];


  estados: string[] = [
    'Pendiente',
    'En preparación',
    'En camino',
    'Entregado'
  ];


  entregas: Entrega[] = [

    {
      id: 1,
      pedido: 1001,
      cliente: 'Juan Pérez',
      direccion: 'Av. Principal 123, Loncoche',
      fecha: '14/08/2026',
      responsable: 'Pendiente',
      estado: 'Pendiente'
    },

    {
      id: 2,
      pedido: 1002,
      cliente: 'María González',
      direccion: 'Los Copihues 456, Loncoche',
      fecha: '13/08/2026',
      responsable: 'Pedro Muñoz',
      estado: 'En camino'
    },

    {
      id: 3,
      pedido: 1003,
      cliente: 'Carlos Soto',
      direccion: 'Calle Balmaceda 789, Loncoche',
      fecha: '12/08/2026',
      responsable: 'Pedro Muñoz',
      estado: 'Entregado'
    },

    {
      id: 4,
      pedido: 1004,
      cliente: 'Ana Martínez',
      direccion: 'Villa Esperanza 321, Loncoche',
      fecha: '15/08/2026',
      responsable: 'Pendiente',
      estado: 'Pendiente'
    },

    {
      id: 5,
      pedido: 1005,
      cliente: 'Luis Rodríguez',
      direccion: 'Los Robles 654, Loncoche',
      fecha: '14/08/2026',
      responsable: 'Marcos Silva',
      estado: 'En preparación'
    }

  ];


  get entregasFiltradas(): Entrega[] {

    const termino =
      this.terminoBusqueda
        .toLowerCase()
        .trim();


    return this.entregas.filter(entrega => {

      const coincideBusqueda =
        !termino ||
        entrega.cliente
          .toLowerCase()
          .includes(termino) ||
        entrega.direccion
          .toLowerCase()
          .includes(termino) ||
        entrega.pedido
          .toString()
          .includes(termino);


      const coincideEstado =
        this.filtroEstado === 'Todos' ||
        entrega.estado === this.filtroEstado;


      return coincideBusqueda && coincideEstado;

    });

  }


  limpiarBusqueda(): void {

    this.terminoBusqueda = '';

  }


  cambiarFiltroEstado(estado: string): void {

    this.filtroEstado = estado;

  }


  abrirGestion(entrega: Entrega): void {

    this.entregaSeleccionada = {
      ...entrega
    };

    this.mostrarGestion = true;

  }


  cerrarGestion(): void {

    this.mostrarGestion = false;

    this.entregaSeleccionada = null;

  }


  guardarGestion(): void {

    if (!this.entregaSeleccionada) {
      return;
    }


    const indice =
      this.entregas.findIndex(
        entrega =>
          entrega.id === this.entregaSeleccionada?.id
      );


    if (indice === -1) {
      return;
    }


    this.entregas[indice] = {
      ...this.entregaSeleccionada
    };


    this.cerrarGestion();

  }

}