import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import {
  Pedido,
  PedidoService
} from '../../services/pedido';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  // =========================================================
  // PEDIDOS
  // =========================================================

  pedidos: Pedido[] = [];


  // =========================================================
  // RESUMEN
  // =========================================================

  pedidosPendientes = 0;

  comprobantesPorRevisar = 0;

  pedidosEnPreparacion = 0;

  entregasPendientes = 0;


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private pedidoService: PedidoService,
    private cdr: ChangeDetectorRef
  ) {}


  // =========================================================
  // INICIO
  // =========================================================

  ngOnInit(): void {

    console.log('DASHBOARD INICIADO');

    this.cargarPedidos();

  }


  // =========================================================
  // CARGAR PEDIDOS
  // =========================================================

  cargarPedidos(): void {

    console.log('Intentando obtener pedidos...');


    this.pedidoService.obtenerPedidos().subscribe({

      next: (pedidos) => {

        console.log(
          'PEDIDOS RECIBIDOS DESDE LA API:',
          pedidos
        );


        // Guardamos los pedidos
        this.pedidos = pedidos;


        console.log(
          'CANTIDAD RECIBIDA:',
          pedidos.length
        );


        console.log(
          'CANTIDAD EN this.pedidos:',
          this.pedidos.length
        );


        // Calculamos el resumen
        this.calcularResumen();


        console.log(
          'DESPUÉS DE calcularResumen:',
          this.pedidos.length
        );


        // =====================================================
        // IMPORTANTE
        // Fuerza a Angular a actualizar la pantalla
        // =====================================================

        this.cdr.detectChanges();


        console.log(
          'VISTA ACTUALIZADA'
        );

      },


      error: (error) => {

        console.error(
          'ERROR AL OBTENER PEDIDOS:',
          error
        );

      }

    });

  }


  // =========================================================
  // CALCULAR RESUMEN
  // =========================================================

  calcularResumen(): void {


    // ---------------------------------------------------------
    // PEDIDOS PENDIENTES
    // ---------------------------------------------------------

    this.pedidosPendientes =
      this.pedidos.filter(
        pedido =>
          pedido.estado === 'Pendiente de pago' ||
          pedido.estado === 'Pago en revisión'
      ).length;


    // ---------------------------------------------------------
    // COMPROBANTES POR REVISAR
    // ---------------------------------------------------------

    this.comprobantesPorRevisar =
      this.pedidos.filter(
        pedido =>
          pedido.estado === 'Pago en revisión'
      ).length;


    // ---------------------------------------------------------
    // PEDIDOS EN PREPARACIÓN
    // ---------------------------------------------------------

    this.pedidosEnPreparacion =
      this.pedidos.filter(
        pedido =>
          pedido.estado === 'En preparación'
      ).length;


    // ---------------------------------------------------------
    // ENTREGAS PENDIENTES
    // ---------------------------------------------------------

    this.entregasPendientes =
      this.pedidos.filter(
        pedido =>
          pedido.estado === 'Listo para retiro' ||
          pedido.estado === 'Enviado'
      ).length;


    // =========================================================
    // DEBUG
    // =========================================================

    console.log(
      'RESUMEN CALCULADO:',
      {
        pedidosPendientes: this.pedidosPendientes,
        comprobantesPorRevisar: this.comprobantesPorRevisar,
        pedidosEnPreparacion: this.pedidosEnPreparacion,
        entregasPendientes: this.entregasPendientes
      }
    );

  }


  // =========================================================
  // PEDIDOS RECIENTES
  // =========================================================

  obtenerPedidosRecientes(): Pedido[] {

    return this.pedidos
      .slice()
      .sort(
        (a, b) =>
          b.id - a.id
      )
      .slice(0, 5);

  }

}