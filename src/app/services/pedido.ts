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

export interface ComprobantePagoRequest {
  nombreArchivo: string;
  rutaArchivo: string;
  observacion?: string;
}

export interface ComprobantePagoResponse {
  id: number;
  pedidoId: number;
  codigoPedido: string;
  nombreArchivo: string;
  rutaArchivo: string;
  fechaCarga: string;
  decision?: string;
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

  obtenerPedidos(): Observable<Pedido[]> {
    console.log('🌐 Consultando backend:', this.apiUrl);

    return this.http
      .get<PedidoBackend[]>(this.apiUrl)
      .pipe(
        map((pedidosBackend: PedidoBackend[]) => {

          console.log(
            '📦 Respuesta recibida desde el backend:',
            pedidosBackend
          );

          const pedidosConvertidos: Pedido[] = pedidosBackend.map(
            (pedido: PedidoBackend) =>
              this.convertirPedido(pedido)
          );

          console.log(
            '✅ Pedidos convertidos para el frontend:',
            pedidosConvertidos
          );

          return pedidosConvertidos;
        })
      );
  }

  obtenerPedidoPorId(id: number): Observable<Pedido> {
    console.log('🔎 Consultando pedido por ID:', id);

    return this.http
      .get<PedidoBackend>(`${this.apiUrl}/${id}`)
      .pipe(
        map((pedidoBackend: PedidoBackend) =>
          this.convertirPedido(pedidoBackend)
        )
      );
  }

  registrarComprobante(
    id: number,
    comprobante: ComprobantePagoRequest
  ): Observable<ComprobantePagoResponse> {
    return this.http.post<ComprobantePagoResponse>(
      `${this.apiUrl}/${id}/comprobante`,
      comprobante
    );
  }

  obtenerComprobante(
    id: number
  ): Observable<ComprobantePagoResponse> {
    return this.http.get<ComprobantePagoResponse>(
      `${this.apiUrl}/${id}/comprobante`
    );
  }

  aprobarPedido(
    id: number,
    observacion: string = ''
  ): Observable<any> {
    const request: RevisionPagoRequest = {
      observacion
    };

    return this.http.post(
      `${this.apiUrl}/${id}/pago/aprobar`,
      request
    );
  }

  rechazarPedido(
    id: number,
    observacion: string = ''
  ): Observable<any> {
    const request: RevisionPagoRequest = {
      observacion
    };

    return this.http.post(
      `${this.apiUrl}/${id}/pago/rechazar`,
      request
    );
  }

  iniciarPreparacion(id: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${id}/preparacion/iniciar`,
      {}
    );
  }

  marcarListoParaRetiro(id: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${id}/entrega/listo-retiro`,
      {}
    );
  }

  marcarEnviado(id: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${id}/entrega/enviar`,
      {}
    );
  }

  finalizarPedido(id: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${id}/finalizar`,
      {}
    );
  }

  private convertirPedido(
    pedido: PedidoBackend
  ): Pedido {
    return {
      id: pedido.id,
      codigo: pedido.codigo,
      cliente: pedido.nombreCliente,
      correo: pedido.emailCliente,
      telefono: pedido.telefonoCliente,
      direccionDespacho: pedido.direccionDespacho ?? '',
      modalidadEntrega: pedido.modalidadEntrega ?? '',
      fecha: this.formatearFecha(pedido.fechaCreacion),
      total: Number(pedido.total),
      estado: this.convertirEstado(pedido.estado),
      comprobante: this.obtenerTextoComprobante(pedido.estado),
      productos: (pedido.detalles ?? []).map(
        (detalle: DetalleBackend) => ({
          nombre: detalle.nombreProducto,
          cantidad: detalle.cantidad,
          precio: Number(detalle.precioUnitario),
          subtotal: Number(detalle.subtotal)
        })
      )
    };
  }

  private formatearFecha(
    fecha: string
  ): string {
    if (!fecha) {
      return '';
    }

    const fechaObjeto = new Date(fecha);

    if (isNaN(fechaObjeto.getTime())) {
      return fecha;
    }

    return fechaObjeto.toLocaleDateString('es-CL');
  }

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