import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
  Pedido,
  PedidoService,
  ComprobantePagoResponse
} from '../../services/pedido';

interface Comprobante {
  id: number;
  pedido: number;
  codigoPedido: string;
  cliente: string;
  fecha: string;
  monto: number;
  estado: string;
  nombreArchivo: string;
  rutaArchivo: string;
  observacion: string;
}

@Component({
  selector: 'app-comprobantes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comprobantes.html',
  styleUrl: './comprobantes.css'
})
export class Comprobantes implements OnInit {

  terminoBusqueda: string = '';

  filtroEstado: string = 'Todos';

  mostrarComprobante: boolean = false;

  comprobanteSeleccionado: Comprobante | null = null;

  comprobantes: Comprobante[] = [];

  cargando: boolean = false;

  procesandoId: number | null = null;

  mensajeExito: string = '';

  mensajeError: string = '';

  constructor(
    private pedidoService: PedidoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarComprobantes();
  }

  cargarComprobantes(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.pedidoService.obtenerPedidos().subscribe({
      next: (pedidos: Pedido[]) => {

        if (pedidos.length === 0) {
          this.comprobantes = [];
          this.cargando = false;
          this.cdr.detectChanges();
          return;
        }

        const consultas = pedidos.map(pedido =>
          this.pedidoService.obtenerComprobante(pedido.id).pipe(
            map((comprobanteBackend: ComprobantePagoResponse) => {
              return this.convertirComprobante(
                pedido,
                comprobanteBackend
              );
            }),
            catchError(error => {
              console.warn(
                `El pedido ${pedido.id} no tiene comprobante o no pudo ser consultado.`,
                error
              );

              return of(null);
            })
          )
        );

        forkJoin(consultas).subscribe({
          next: resultados => {
            this.comprobantes = resultados.filter(
              (comprobante): comprobante is Comprobante =>
                comprobante !== null
            );

            this.cargando = false;

            console.log(
              'Comprobantes cargados:',
              this.comprobantes
            );

            this.cdr.detectChanges();
          },
          error: error => {
            console.error(
              'Error al cargar los comprobantes:',
              error
            );

            this.mensajeError =
              'No fue posible cargar los comprobantes.';

            this.cargando = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: error => {
        console.error(
          'Error al cargar los pedidos:',
          error
        );

        this.mensajeError =
          'No fue posible cargar los comprobantes. Verifica que el backend esté funcionando.';

        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  private convertirComprobante(
    pedido: Pedido,
    comprobante: ComprobantePagoResponse
  ): Comprobante {
    return {
      id: comprobante.id,
      pedido: pedido.id,
      codigoPedido: comprobante.codigoPedido,
      cliente: pedido.cliente,
      fecha: this.formatearFecha(comprobante.fechaCarga),
      monto: pedido.total,
      estado: this.convertirDecision(
        comprobante.decision,
        pedido.estado
      ),
      nombreArchivo: comprobante.nombreArchivo ?? '',
      rutaArchivo: comprobante.rutaArchivo ?? '',
      observacion: comprobante.observacion ?? ''
    };
  }

  private convertirDecision(
    decision: string | undefined,
    estadoPedido: string
  ): string {
    switch (decision) {
      case 'APROBADO':
        return 'Aprobado';

      case 'RECHAZADO':
        return 'Rechazado';

      case 'PENDIENTE':
        return 'Pendiente de revisión';

      default:
        if (
          estadoPedido === 'Aprobado' ||
          estadoPedido === 'Pago aprobado'
        ) {
          return 'Aprobado';
        }

        if (
          estadoPedido === 'Rechazado' ||
          estadoPedido === 'Pago rechazado'
        ) {
          return 'Rechazado';
        }

        return 'Pendiente de revisión';
    }
  }

  private formatearFecha(fecha: string): string {
    if (!fecha) {
      return '';
    }

    return new Date(fecha).toLocaleDateString('es-CL');
  }

  get comprobantesFiltrados(): Comprobante[] {
    const termino = this.terminoBusqueda
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
          .includes(termino) ||
        comprobante.codigoPedido
          .toLowerCase()
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
    if (this.procesandoId !== null) {
      return;
    }

    const confirmar = window.confirm(
      `¿Deseas aprobar el comprobante del pedido ${comprobante.codigoPedido}?`
    );

    if (!confirmar) {
      return;
    }

    this.procesandoId = comprobante.id;
    this.mensajeError = '';
    this.mensajeExito = '';

    this.pedidoService
      .aprobarPedido(comprobante.pedido)
      .subscribe({
        next: () => {
          this.mensajeExito =
            `El comprobante del pedido ${comprobante.codigoPedido} fue aprobado correctamente.`;

          this.procesandoId = null;
          this.cerrarComprobante();
          this.cargarComprobantes();

          this.limpiarMensajeExito();
        },
        error: error => {
          console.error(
            'Error al aprobar el comprobante:',
            error
          );

          this.mensajeError =
            error?.error?.message ||
            'No fue posible aprobar el comprobante.';

          this.procesandoId = null;
          this.cdr.detectChanges();
        }
      });
  }

  rechazarComprobante(comprobante: Comprobante): void {
    if (this.procesandoId !== null) {
      return;
    }

    const observacion = window.prompt(
      'Ingrese una observación para rechazar el comprobante:',
      ''
    );

    if (observacion === null) {
      return;
    }

    const confirmar = window.confirm(
      `¿Deseas rechazar el comprobante del pedido ${comprobante.codigoPedido}?`
    );

    if (!confirmar) {
      return;
    }

    this.procesandoId = comprobante.id;
    this.mensajeError = '';
    this.mensajeExito = '';

    this.pedidoService
      .rechazarPedido(
        comprobante.pedido,
        observacion
      )
      .subscribe({
        next: () => {
          this.mensajeExito =
            `El comprobante del pedido ${comprobante.codigoPedido} fue rechazado.`;

          this.procesandoId = null;
          this.cerrarComprobante();
          this.cargarComprobantes();

          this.limpiarMensajeExito();
        },
        error: error => {
          console.error(
            'Error al rechazar el comprobante:',
            error
          );

          this.mensajeError =
            error?.error?.message ||
            'No fue posible rechazar el comprobante.';

          this.procesandoId = null;
          this.cdr.detectChanges();
        }
      });
  }

  aprobarDesdeModal(): void {
    if (!this.comprobanteSeleccionado) {
      return;
    }

    this.aprobarComprobante(
      this.comprobanteSeleccionado
    );
  }

  rechazarDesdeModal(): void {
    if (!this.comprobanteSeleccionado) {
      return;
    }

    this.rechazarComprobante(
      this.comprobanteSeleccionado
    );
  }

  private limpiarMensajeExito(): void {
    setTimeout(() => {
      this.mensajeExito = '';
      this.cdr.detectChanges();
    }, 4000);
  }
}