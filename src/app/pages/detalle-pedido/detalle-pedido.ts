import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Pedido, PedidoService } from '../../services/pedido';

@Component({
  selector: 'app-detalle-pedido',
  imports: [CommonModule, RouterLink],
  templateUrl: './detalle-pedido.html',
  styleUrl: './detalle-pedido.css'
})
export class DetallePedido {

  pedidoId: string = '';

  pedido: Pedido | undefined;

  decisionTomada: boolean = false;

  mostrarComprobante: boolean = false;


  constructor(
    private route: ActivatedRoute,
    private pedidoService: PedidoService
  ) {

    this.pedidoId =
      this.route.snapshot.paramMap.get('id') ?? '';

    const id = Number(this.pedidoId);

    this.pedido =
      this.pedidoService.obtenerPedidoPorId(id);

    if (
      this.pedido &&
      this.pedido.estado !== 'Pago en revisión'
    ) {
      this.decisionTomada = true;
    }

  }


  aprobarPedido(): void {

    if (!this.pedido) {
      return;
    }

    this.pedidoService.aprobarPedido(
      this.pedido.id
    );

    this.decisionTomada = true;

  }


  rechazarPedido(): void {

    if (!this.pedido) {
      return;
    }

    this.pedidoService.rechazarPedido(
      this.pedido.id
    );

    this.decisionTomada = true;

  }


  abrirComprobante(): void {

    this.mostrarComprobante = true;

  }


  cerrarComprobante(): void {

    this.mostrarComprobante = false;

  }

}