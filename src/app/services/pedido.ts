import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Producto {
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  codigo: string;
  cliente: string;
  correo: string;
  telefono: string;
  direccionDespacho: string;
  modalidadEntrega: string;
  fecha: string;
  total: number;
  estado: string;
  comprobante: string;
  productos: Producto[];
}

interface PedidoBackend {
  id: number;
  codigo: string;
  nombreCliente: string;
  emailCliente: string;
  telefonoCliente: string;
  direccionDespacho: string;
  modalidadEntrega: string;
  estado: string;
  total: number;
  fechaCreacion: string;
  detalles: DetalleBackend[];
}

interface DetalleBackend {
  id: number;
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface RevisionPagoRequest {
  observacion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  private apiUrl = '/api/pedidos';

  constructor(
    private http: HttpClient
  ) {}


  // =========================================================
  // OBTENER TODOS LOS PEDIDOS
  // =========================================================

  obtenerPedidos(): Observable<Pedido[]> {

    return this.http
      .get<PedidoBackend[]>(this.apiUrl)
      .pipe(
        map(pedidosBackend =>
          pedidosBackend.map(pedido =>
            this.convertirPedido(pedido)
          )
        )
      );

  }


  // =========================================================
  // OBTENER PEDIDO POR ID
  // =========================================================

  obtenerPedidoPorId(id: number): Observable<Pedido> {

    return this.http
      .get<PedidoBackend>(
        `${this.apiUrl}/${id}`
      )
      .pipe(
        map(pedidoBackend =>
          this.convertirPedido(pedidoBackend)
        )
      );

  }


  // =========================================================
  // APROBAR PAGO
  // =========================================================

  aprobarPedido(
    id: number,
    observacion: string = ''
  ): Observable<any> {

    const request: RevisionPagoRequest = {
      observacion: observacion
    };

    return this.http.post(
      `${this.apiUrl}/${id}/pago/aprobar`,
      request
    );

  }


  // =========================================================
  // RECHAZAR PAGO
  // =========================================================

  rechazarPedido(
    id: number,
    observacion: string = ''
  ): Observable<any> {

    const request: RevisionPagoRequest = {
      observacion: observacion
    };

    return this.http.post(
      `${this.apiUrl}/${id}/pago/rechazar`,
      request
    );

  }


  // =========================================================
  // INICIAR PREPARACIÓN
  // =========================================================

  iniciarPreparacion(
    id: number
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/${id}/preparacion/iniciar`,
      {}
    );

  }


  // =========================================================
  // MARCAR LISTO PARA RETIRO
  // =========================================================

  marcarListoParaRetiro(
    id: number
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/${id}/entrega/listo-retiro`,
      {}
    );

  }


  // =========================================================
  // MARCAR COMO ENVIADO
  // =========================================================

  marcarEnviado(
    id: number
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/${id}/entrega/enviar`,
      {}
    );

  }


  // =========================================================
  // FINALIZAR PEDIDO
  // =========================================================

  finalizarPedido(
    id: number
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/${id}/finalizar`,
      {}
    );

  }


  // =========================================================
  // CONVERTIR PEDIDO DEL BACKEND AL FORMATO DEL FRONTEND
  // =========================================================

  private convertirPedido(
    pedido: PedidoBackend
  ): Pedido {

    return {

      id: pedido.id,

      codigo: pedido.codigo,

      cliente: pedido.nombreCliente,

      correo: pedido.emailCliente,

      telefono: pedido.telefonoCliente,

      direccionDespacho:
        pedido.direccionDespacho ?? '',

      modalidadEntrega:
        pedido.modalidadEntrega ?? '',

      fecha:
        this.formatearFecha(
          pedido.fechaCreacion
        ),

      total:
        Number(pedido.total),

      estado:
        this.convertirEstado(
          pedido.estado
        ),

      comprobante:
        this.obtenerTextoComprobante(
          pedido.estado
        ),

      productos:
        (pedido.detalles ?? []).map(
          detalle => ({

            nombre:
              detalle.nombreProducto,

            cantidad:
              detalle.cantidad,

            precio:
              Number(
                detalle.precioUnitario
              ),

            subtotal:
              Number(
                detalle.subtotal
              )

          })
        )

    };

  }


  // =========================================================
  // FORMATEAR FECHA
  // =========================================================

  private formatearFecha(
    fecha: string
  ): string {

    if (!fecha) {
      return '';
    }

    const fechaObj = new Date(fecha);

    return fechaObj.toLocaleDateString(
      'es-CL'
    );

  }


  // =========================================================
  // CONVERTIR ESTADOS
  // =========================================================

  private convertirEstado(
    estado: string
  ): string {

    switch (estado) {

      case 'PENDIENTE_PAGO':
        return 'Pendiente de pago';

      case 'PAGO_EN_REVISION':
        return 'Pago en revisión';

      case 'PAGO_RECHAZADO':
        return 'Rechazado';

      case 'PAGO_APROBADO':
        return 'Aprobado';

      case 'EN_PREPARACION':
        return 'En preparación';

      case 'LISTO_PARA_RETIRO':
        return 'Listo para retiro';

      case 'ENVIADO':
        return 'Enviado';

      case 'FINALIZADO':
        return 'Entregado';

      case 'CANCELADO':
        return 'Cancelado';

      default:
        return estado;

    }

  }


  // =========================================================
  // TEXTO DEL COMPROBANTE
  // =========================================================

  private obtenerTextoComprobante(
    estado: string
  ): string {

    switch (estado) {

      case 'PAGO_EN_REVISION':
        return 'Pendiente de revisión';

      case 'PAGO_APROBADO':
        return 'Comprobante aprobado';

      case 'PAGO_RECHAZADO':
        return 'Comprobante rechazado';

      default:
        return 'Sin comprobante';

    }

  }

}