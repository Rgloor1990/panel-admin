import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Pedido, PedidoService } from '../../services/pedido';

@Component({
  selector: 'app-pedidos',
  imports: [CommonModule],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.css'
})
export class Pedidos {

  filtroActual: string = 'Todos';

  textoBusqueda: string = '';

  pedidos: Pedido[] = [];

  mensajeActualizacion: boolean = false;


  constructor(
    private router: Router,
    private pedidoService: PedidoService,
    private cdr: ChangeDetectorRef
  ) {

    this.cargarPedidos();

  }


  cargarPedidos(): void {

    this.pedidos = this.pedidoService.obtenerPedidos();

  }


  actualizarPedidos(): void {

    this.cargarPedidos();

    this.mensajeActualizacion = true;

    this.cdr.detectChanges();

    setTimeout(() => {

      this.mensajeActualizacion = false;

      this.cdr.detectChanges();

    }, 2500);

  }


  verPedido(id: number): void {

    this.router.navigate(['/pedidos', id]);

  }


  cambiarFiltro(filtro: string): void {

    this.filtroActual = filtro;

  }


  buscar(event: Event): void {

    const input = event.target as HTMLInputElement;

    this.textoBusqueda = input.value;

  }


  get pedidosFiltrados(): Pedido[] {

    return this.pedidos.filter(pedido => {

      const coincideFiltro =
        this.filtroActual === 'Todos' ||
        pedido.estado === this.filtroActual;

      const texto =
        this.textoBusqueda
          .toLowerCase()
          .trim();

      const coincideBusqueda =
        texto === '' ||
        pedido.id.toString().includes(texto) ||
        pedido.cliente.toLowerCase().includes(texto);

      return coincideFiltro && coincideBusqueda;

    });

  }

}