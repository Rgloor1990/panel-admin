import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
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

  pedido: Pedido | undefined = undefined;

  decisionTomada: boolean = false;

  mostrarComprobante: boolean = false;

  cargando: boolean = true;

  error: string = '';

  procesando: boolean = false;


  constructor(
    private route: ActivatedRoute,
    private pedidoService: PedidoService,
    private cdr: ChangeDetectorRef
  ) {

    console.log('=== DETALLE PEDIDO ===');

    console.log(
      'URL actual:',
      window.location.href
    );

    console.log(
      'Parámetros de ruta:',
      this.route.snapshot.paramMap.keys
    );

    this.pedidoId =
      this.route.snapshot.paramMap.get('id') ?? '';

    console.log(
      'ID recibido desde la ruta:',
      this.pedidoId
    );

    const id = Number(this.pedidoId);

    if (!id || id <= 0) {

      console.error(
        'ID de pedido inválido:',
        this.pedidoId
      );

      this.error =
        'El identificador del pedido no es válido.';

      this.cargando = false;

      this.cdr.detectChanges();

      return;
    }

    this.cargarPedido(id);
  }


  cargarPedido(id: number): void {

    console.log(
      'Solicitando pedido al backend. ID:',
      id
    );

    this.cargando = true;

    this.error = '';

    this.pedidoService
      .obtenerPedidoPorId(id)
      .subscribe({

        next: (pedido: Pedido) => {

          console.log(
            'Pedido recibido desde el backend:',
            pedido
          );

          this.pedido = pedido;

          this.decisionTomada =
            pedido.estado !== 'Pago en revisión';

          this.cargando = false;

          this.cdr.detectChanges();

          console.log(
            'Estado del pedido:',
            pedido.estado
          );

          console.log(
            'Decisión tomada:',
            this.decisionTomada
          );

        },

        error: (err: any) => {

          console.error(
            'Error al obtener el pedido:',
            err
          );

          this.error =
            'No fue posible obtener el pedido.';

          this.pedido = undefined;

          this.cargando = false;

          this.cdr.detectChanges();

        }

      });

  }


  aprobarPedido(): void {

    if (
      !this.pedido ||
      this.procesando
    ) {
      return;
    }

    this.procesando = true;

    this.error = '';

    const id = this.pedido.id;

    console.log(
      'Aprobando pedido:',
      id
    );

    this.pedidoService
      .aprobarPedido(id)
      .subscribe({

        next: (respuesta: any) => {

          console.log(
            'Pago aprobado:',
            respuesta
          );

          this.decisionTomada = true;

          this.procesando = false;

          this.cargarPedido(id);

        },

        error: (err: any) => {

          console.error(
            'Error al aprobar el pago:',
            err
          );

          this.procesando = false;

          this.error =
            err?.error?.message ||
            'No fue posible aprobar el pago.';

          this.cdr.detectChanges();

        }

      });

  }


  rechazarPedido(): void {

    if (
      !this.pedido ||
      this.procesando
    ) {
      return;
    }

    this.procesando = true;

    this.error = '';

    const id = this.pedido.id;

    console.log(
      'Rechazando pedido:',
      id
    );

    this.pedidoService
      .rechazarPedido(id)
      .subscribe({

        next: (respuesta: any) => {

          console.log(
            'Pago rechazado:',
            respuesta
          );

          this.decisionTomada = true;

          this.procesando = false;

          this.cargarPedido(id);

        },

        error: (err: any) => {

          console.error(
            'Error al rechazar el pago:',
            err
          );

          this.procesando = false;

          this.error =
            err?.error?.message ||
            'No fue posible rechazar el pago.';

          this.cdr.detectChanges();

        }

      });

  }


  iniciarPreparacion(): void {

    this.ejecutarCambioEstado(
      'iniciarPreparacion',
      'Iniciando preparación del pedido...'
    );

  }


  marcarListoParaRetiro(): void {

    this.ejecutarCambioEstado(
      'marcarListoParaRetiro',
      'Marcando pedido como listo para retiro...'
    );

  }


  marcarEnviado(): void {

    this.ejecutarCambioEstado(
      'marcarEnviado',
      'Marcando pedido como enviado...'
    );

  }


  finalizarPedido(): void {

    this.ejecutarCambioEstado(
      'finalizarPedido',
      'Finalizando pedido...'
    );

  }


  private ejecutarCambioEstado(
    accion:
      | 'iniciarPreparacion'
      | 'marcarListoParaRetiro'
      | 'marcarEnviado'
      | 'finalizarPedido',
    mensaje: string
  ): void {

    if (
      !this.pedido ||
      this.procesando
    ) {
      return;
    }

    const id = this.pedido.id;

    this.procesando = true;

    this.error = '';

    console.log(
      mensaje,
      id
    );

    this.pedidoService[accion](id).subscribe({

      next: (respuesta: any) => {

        console.log(
          'Cambio de estado realizado:',
          respuesta
        );

        this.procesando = false;

        /*
         * Volvemos a consultar el pedido para
         * mostrar inmediatamente el nuevo estado.
         */
        this.cargarPedido(id);

      },

      error: (err: any) => {

        console.error(
          'Error al cambiar el estado del pedido:',
          err
        );

        this.procesando = false;

        this.error =
          err?.error?.message ||
          'No fue posible cambiar el estado del pedido.';

        this.cdr.detectChanges();

      }

    });

  }


  abrirComprobante(): void {

    this.mostrarComprobante = true;

    this.cdr.detectChanges();

  }


  cerrarComprobante(): void {

    this.mostrarComprobante = false;

    this.cdr.detectChanges();

  }

}