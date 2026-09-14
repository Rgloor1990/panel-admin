import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PedidoService, Pedido } from '../../services/pedido';

interface Entrega {
  id: number;
  pedido: number;
  cliente: string;
  correo: string;
  telefono: string;
  direccion: string;
  modalidadEntrega: string;
  fecha: string;
  responsable: string;
  estado: string;
  estadoBackend: string;
  total: number;
}

@Component({
  selector: 'app-entregas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './entregas.html',
  styleUrl: './entregas.css'
})
export class Entregas implements OnInit {

  terminoBusqueda: string = '';

  // Al ingresar se muestran todas las entregas
  filtroEstado: string = 'Todos';

  mostrarGestion: boolean = false;

  entregaSeleccionada: Entrega | null = null;

  entregas: Entrega[] = [];

  cargando: boolean = false;

  procesando: boolean = false;

  mensajeExito: string = '';

  mensajeError: string = '';

  responsables: string[] = [
    'Pendiente',
    'Pedro Muñoz',
    'Marcos Silva',
    'Laura González',
    'Carlos Ramírez'
  ];

  estados: string[] = [
    'Todos',
    'Pendiente de pago',
    'Pago en revisión',
    'Aprobado',
    'En preparación',
    'Listo para retiro',
    'Enviado',
    'Entregado',
    'Rechazado',
    'Cancelado'
  ];

  constructor(
    private pedidoService: PedidoService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('COMPONENTE ENTREGAS CARGADO');
    this.cargarEntregas();
  }

  cargarEntregas(): void {
    console.log('Ejecutando cargarEntregas()');

    this.cargando = true;
    this.mensajeError = '';

    this.pedidoService.obtenerPedidos().subscribe({
      next: (pedidos: Pedido[]) => {
        console.log(
          'PEDIDOS RECIBIDOS DESDE BACKEND:',
          pedidos
        );

        console.log(
          'CANTIDAD DE PEDIDOS RECIBIDOS:',
          pedidos.length
        );

        this.entregas = pedidos.map((pedido: Pedido) => {
          const entrega = this.convertirPedidoAEntrega(pedido);

          console.log('PEDIDO CONVERTIDO:', entrega);

          return entrega;
        });

        console.log(
          'ENTREGAS CARGADAS EN LA TABLA:',
          this.entregas
        );

        console.log(
          'CANTIDAD TOTAL DE ENTREGAS:',
          this.entregas.length
        );

        // Finaliza el estado de carga
        this.cargando = false;

        // Actualiza la vista de Angular
        this.changeDetectorRef.detectChanges();

        console.log(
          'CANTIDAD DE ENTREGAS FILTRADAS:',
          this.entregasFiltradas.length
        );
      },

      error: (error: any) => {
        console.error(
          'ERROR AL CARGAR LAS ENTREGAS:',
          error
        );

        this.entregas = [];
        this.cargando = false;

        this.mensajeError =
          'No se pudieron cargar las entregas desde el servidor.';

        this.changeDetectorRef.detectChanges();
      }
    });
  }

  private convertirPedidoAEntrega(
    pedido: Pedido
  ): Entrega {
    const estado = pedido.estado || 'Pendiente de pago';

    return {
      id: Number(pedido.id),
      pedido: Number(pedido.id),
      cliente: pedido.cliente || 'Sin cliente',
      correo: pedido.correo || '',
      telefono: pedido.telefono || '',
      direccion: pedido.direccionDespacho || 'Sin dirección',
      modalidadEntrega:
        pedido.modalidadEntrega || 'No especificada',
      fecha: pedido.fecha || 'Sin fecha',
      responsable: 'Pendiente',
      estado: estado,
      estadoBackend: this.obtenerEstadoBackend(estado),
      total: Number(pedido.total || 0)
    };
  }

  private obtenerEstadoBackend(
    estado: string
  ): string {
    const equivalencias: {
      [key: string]: string;
    } = {
      'Pendiente de pago': 'PENDIENTE_PAGO',
      'Pago en revisión': 'PAGO_EN_REVISION',
      'Rechazado': 'PAGO_RECHAZADO',
      'Aprobado': 'PAGO_APROBADO',
      'En preparación': 'EN_PREPARACION',
      'Listo para retiro': 'LISTO_PARA_RETIRO',
      'Enviado': 'ENVIADO',
      'Entregado': 'FINALIZADO',
      'Cancelado': 'CANCELADO'
    };

    return equivalencias[estado] || estado;
  }

  get entregasFiltradas(): Entrega[] {
    const termino = String(
      this.terminoBusqueda || ''
    )
      .toLowerCase()
      .trim();

    const filtro = String(
      this.filtroEstado || 'Todos'
    )
      .toLowerCase()
      .trim();

    return this.entregas.filter(
      (entrega: Entrega) => {
        const cliente = String(
          entrega.cliente || ''
        )
          .toLowerCase()
          .trim();

        const direccion = String(
          entrega.direccion || ''
        )
          .toLowerCase()
          .trim();

        const pedido = String(
          entrega.pedido || ''
        )
          .toLowerCase()
          .trim();

        const estado = String(
          entrega.estado || ''
        )
          .toLowerCase()
          .trim();

        const coincideBusqueda =
          termino === '' ||
          cliente.includes(termino) ||
          direccion.includes(termino) ||
          pedido.includes(termino);

        const coincideEstado =
          filtro === '' ||
          filtro === 'todos' ||
          filtro === 'todos los estados' ||
          estado === filtro;

        return coincideBusqueda && coincideEstado;
      }
    );
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda = '';
  }

  limpiarFiltros(): void {
    this.terminoBusqueda = '';
    this.filtroEstado = 'Todos';
  }

  cambiarFiltroEstado(estado: string): void {
    this.filtroEstado = estado;
  }

  abrirGestion(entrega: Entrega): void {
    this.entregaSeleccionada = {
      ...entrega
    };

    this.mensajeExito = '';
    this.mensajeError = '';
    this.mostrarGestion = true;
  }

  cerrarGestion(): void {
    if (this.procesando) {
      return;
    }

    this.mostrarGestion = false;
    this.entregaSeleccionada = null;
    this.mensajeExito = '';
    this.mensajeError = '';
  }

  guardarGestion(): void {
    if (!this.entregaSeleccionada) {
      return;
    }

    const indice = this.entregas.findIndex(
      entrega =>
        entrega.id === this.entregaSeleccionada!.id
    );

    if (indice === -1) {
      return;
    }

    this.entregas[indice] = {
      ...this.entregaSeleccionada
    };

    this.mensajeExito =
      'Responsable actualizado visualmente. Este dato aún no se guarda en el backend.';
  }

  iniciarPreparacion(): void {
    if (
      !this.entregaSeleccionada ||
      this.procesando
    ) {
      return;
    }

    this.procesando = true;
    this.limpiarMensajes();

    this.pedidoService
      .iniciarPreparacion(
        this.entregaSeleccionada.id
      )
      .subscribe({
        next: () => {
          this.mensajeExito =
            'El pedido pasó a preparación.';

          this.procesando = false;
          this.cargarEntregas();
        },

        error: (error: any) => {
          console.error(
            'Error al iniciar preparación:',
            error
          );

          this.mensajeError =
            'No se pudo iniciar la preparación del pedido.';

          this.procesando = false;
        }
      });
  }

  marcarListoParaRetiro(): void {
    if (
      !this.entregaSeleccionada ||
      this.procesando
    ) {
      return;
    }

    this.procesando = true;
    this.limpiarMensajes();

    this.pedidoService
      .marcarListoParaRetiro(
        this.entregaSeleccionada.id
      )
      .subscribe({
        next: () => {
          this.mensajeExito =
            'El pedido fue marcado como listo para retiro.';

          this.procesando = false;
          this.cargarEntregas();
        },

        error: (error: any) => {
          console.error(
            'Error al marcar listo para retiro:',
            error
          );

          this.mensajeError =
            'No se pudo marcar el pedido como listo para retiro.';

          this.procesando = false;
        }
      });
  }

  marcarEnviado(): void {
    if (
      !this.entregaSeleccionada ||
      this.procesando
    ) {
      return;
    }

    this.procesando = true;
    this.limpiarMensajes();

    this.pedidoService
      .marcarEnviado(
        this.entregaSeleccionada.id
      )
      .subscribe({
        next: () => {
          this.mensajeExito =
            'El pedido fue marcado como enviado.';

          this.procesando = false;
          this.cargarEntregas();
        },

        error: (error: any) => {
          console.error(
            'Error al marcar enviado:',
            error
          );

          this.mensajeError =
            'No se pudo marcar el pedido como enviado.';

          this.procesando = false;
        }
      });
  }

  finalizarPedido(): void {
    if (
      !this.entregaSeleccionada ||
      this.procesando
    ) {
      return;
    }

    this.procesando = true;
    this.limpiarMensajes();

    this.pedidoService
      .finalizarPedido(
        this.entregaSeleccionada.id
      )
      .subscribe({
        next: () => {
          this.mensajeExito =
            'El pedido fue marcado como entregado.';

          this.procesando = false;
          this.cargarEntregas();
        },

        error: (error: any) => {
          console.error(
            'Error al finalizar pedido:',
            error
          );

          this.mensajeError =
            'No se pudo finalizar el pedido.';

          this.procesando = false;
        }
      });
  }

  puedeIniciarPreparacion(): boolean {
    return (
      this.entregaSeleccionada?.estadoBackend ===
      'PAGO_APROBADO'
    );
  }

  puedeMarcarListo(): boolean {
    return (
      this.entregaSeleccionada?.estadoBackend ===
      'EN_PREPARACION'
    );
  }

  puedeMarcarEnviado(): boolean {
    return (
      this.entregaSeleccionada?.estadoBackend ===
        'PAGO_APROBADO' ||
      this.entregaSeleccionada?.estadoBackend ===
        'EN_PREPARACION' ||
      this.entregaSeleccionada?.estadoBackend ===
        'LISTO_PARA_RETIRO'
    );
  }

  puedeFinalizar(): boolean {
    return (
      this.entregaSeleccionada?.estadoBackend ===
        'ENVIADO' ||
      this.entregaSeleccionada?.estadoBackend ===
        'LISTO_PARA_RETIRO'
    );
  }

  limpiarMensajes(): void {
    this.mensajeExito = '';
    this.mensajeError = '';
  }

  obtenerClaseEstado(estado: string): string {
    switch (estado) {
      case 'Pendiente de pago':
        return 'pending';

      case 'Pago en revisión':
        return 'review';

      case 'Aprobado':
        return 'approved';

      case 'En preparación':
        return 'preparation';

      case 'Listo para retiro':
        return 'ready';

      case 'Enviado':
        return 'transit';

      case 'Entregado':
        return 'delivered';

      case 'Rechazado':
      case 'Cancelado':
        return 'cancelled';

      default:
        return 'pending';
    }
  }
}