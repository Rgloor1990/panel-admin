import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  PedidoService,
  Pedido,
  Despacho,
  DespachoRequest
} from '../../services/pedido';

import {
  forkJoin,
  of
} from 'rxjs';

import {
  catchError
} from 'rxjs/operators';

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

  despachoId: number | null;
  tipoDespacho: 'VOLUNTARIO' | 'COURIER' | '';
  empresaTransporte: string;
  numeroSeguimiento: string;
  fechaEnvio: string;
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
  filtroEstado: string = 'Todos';

  mostrarGestion: boolean = false;
  entregaSeleccionada: Entrega | null = null;

  entregas: Entrega[] = [];

  cargando: boolean = false;
  procesando: boolean = false;
  cargandoDespacho: boolean = false;

  mensajeExito: string = '';
  mensajeError: string = '';

  responsables: string[] = [
    'Pendiente'
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

        /*
         * Convertimos primero todos los pedidos
         * al modelo utilizado por esta pantalla.
         */
        const entregasBase: Entrega[] =
          pedidos.map(
            (pedido: Pedido) =>
              this.convertirPedidoAEntrega(pedido)
          );

        /*
         * Consultamos el despacho asociado a cada pedido.
         *
         * Si un pedido no tiene despacho, el backend
         * responderá 404. Ese caso se transforma en null
         * para que no genere un error general.
         */
        const consultasDespacho =
          entregasBase.map(
            (entrega: Entrega) =>
              this.pedidoService
                .obtenerDespachoPorPedido(entrega.id)
                .pipe(
                  catchError(() => of(null))
                )
          );

        /*
         * Esperamos todas las consultas de despacho.
         */
        forkJoin(consultasDespacho).subscribe({

          next: (
            despachos: (Despacho | null)[]
          ) => {

            this.entregas =
              entregasBase.map(
                (
                  entrega: Entrega,
                  indice: number
                ) => {

                  const despacho =
                    despachos[indice];

                  /*
                   * No existe despacho.
                   */
                  if (!despacho) {
                    return entrega;
                  }

                  /*
                   * Existe despacho.
                   */
                  return {
                    ...entrega,

                    despachoId:
                      despacho.id,

                    tipoDespacho:
                      despacho.tipo,

                    empresaTransporte:
                      despacho.empresaTransporte || '',

                    numeroSeguimiento:
                      despacho.numeroSeguimiento || '',

                    fechaEnvio:
                      despacho.fechaEnvio || ''
                  };
                }
              );

            console.log(
              'ENTREGAS CON DESPACHOS:',
              this.entregas
            );

            this.cargando = false;

            this.changeDetectorRef.detectChanges();

            console.log(
              'CANTIDAD DE ENTREGAS:',
              this.entregas.length
            );

            console.log(
              'CANTIDAD DE ENTREGAS FILTRADAS:',
              this.entregasFiltradas.length
            );
          },

          error: (error: any) => {

            console.error(
              'ERROR AL CONSULTAR DESPACHOS:',
              error
            );

            /*
             * Si ocurre un error general en las consultas,
             * mantenemos igualmente los pedidos.
             */
            this.entregas = entregasBase;

            this.cargando = false;

            this.changeDetectorRef.detectChanges();
          }
        });
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

    const estado =
      pedido.estado || 'Pendiente de pago';

    return {

      id:
        Number(pedido.id),

      pedido:
        Number(pedido.id),

      cliente:
        pedido.cliente || 'Sin cliente',

      correo:
        pedido.correo || '',

      telefono:
        pedido.telefono || '',

      direccion:
        pedido.direccionDespacho || 'Sin dirección',

      modalidadEntrega:
        pedido.modalidadEntrega || 'No especificada',

      fecha:
        pedido.fecha || 'Sin fecha',

      responsable:
        'Pendiente',

      estado:
        estado,

      estadoBackend:
        this.obtenerEstadoBackend(estado),

      total:
        Number(pedido.total || 0),

      despachoId:
        null,

      tipoDespacho:
        '',

      empresaTransporte:
        '',

      numeroSeguimiento:
        '',

      fechaEnvio:
        ''
    };
  }

  private obtenerEstadoBackend(
    estado: string
  ): string {

    const equivalencias: {
      [key: string]: string
    } = {

      'Pendiente de pago':
        'PENDIENTE_PAGO',

      'Pago en revisión':
        'PAGO_EN_REVISION',

      'Rechazado':
        'PAGO_RECHAZADO',

      'Aprobado':
        'PAGO_APROBADO',

      'En preparación':
        'EN_PREPARACION',

      'Listo para retiro':
        'LISTO_PARA_RETIRO',

      'Enviado':
        'ENVIADO',

      'Entregado':
        'FINALIZADO',

      'Cancelado':
        'CANCELADO'
    };

    return equivalencias[estado] || estado;
  }

  get entregasFiltradas(): Entrega[] {

    const termino =
      String(this.terminoBusqueda || '')
        .toLowerCase()
        .trim();

    const filtro =
      String(this.filtroEstado || 'Todos')
        .toLowerCase()
        .trim();

    return this.entregas.filter(
      (entrega: Entrega) => {

        const cliente =
          String(entrega.cliente || '')
            .toLowerCase()
            .trim();

        const direccion =
          String(entrega.direccion || '')
            .toLowerCase()
            .trim();

        const pedido =
          String(entrega.pedido || '')
            .toLowerCase()
            .trim();

        const estado =
          String(entrega.estado || '')
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

        return (
          coincideBusqueda &&
          coincideEstado
        );
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

  cambiarFiltroEstado(
    estado: string
  ): void {
    this.filtroEstado = estado;
  }

  abrirGestion(
    entrega: Entrega
  ): void {

    this.entregaSeleccionada = {
      ...entrega
    };

    this.mensajeExito = '';
    this.mensajeError = '';

    this.mostrarGestion = true;

    /*
     * Consultamos nuevamente el despacho al abrir
     * el modal para asegurarnos de tener información
     * actualizada.
     */
    if (
      this.esPedidoDespacho(
        this.entregaSeleccionada
      )
    ) {

      this.cargarDespacho(
        this.entregaSeleccionada.id
      );
    }
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

  private cargarDespacho(
    pedidoId: number
  ): void {

    this.cargandoDespacho = true;

    this.pedidoService
      .obtenerDespachoPorPedido(pedidoId)
      .subscribe({

        next: (despacho: Despacho) => {

          console.log(
            'DESPACHO RECIBIDO DESDE BACKEND:',
            despacho
          );

          if (
            !this.entregaSeleccionada ||
            this.entregaSeleccionada.id !== pedidoId
          ) {

            this.cargandoDespacho = false;
            return;
          }

          this.entregaSeleccionada.despachoId =
            despacho.id;

          this.entregaSeleccionada.tipoDespacho =
            despacho.tipo;

          this.entregaSeleccionada.empresaTransporte =
            despacho.empresaTransporte || '';

          this.entregaSeleccionada.numeroSeguimiento =
            despacho.numeroSeguimiento || '';

          this.entregaSeleccionada.fechaEnvio =
            despacho.fechaEnvio || '';

          this.cargandoDespacho = false;

          this.changeDetectorRef.detectChanges();
        },

        error: (error: any) => {

          console.log(
            'El pedido todavía no tiene despacho registrado.',
            error
          );

          if (
            this.entregaSeleccionada &&
            this.entregaSeleccionada.id === pedidoId
          ) {

            this.entregaSeleccionada.despachoId =
              null;

            this.entregaSeleccionada.tipoDespacho =
              'COURIER';

            this.entregaSeleccionada.empresaTransporte =
              '';

            this.entregaSeleccionada.numeroSeguimiento =
              '';

            this.entregaSeleccionada.fechaEnvio =
              this.obtenerFechaActual();
          }

          this.cargandoDespacho = false;

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  guardarGestion(): void {

    if (!this.entregaSeleccionada) {
      return;
    }

    /*
     * Para pedidos de despacho que están en preparación,
     * guardar gestión significa registrar el despacho real.
     */
    if (
      this.esPedidoDespacho(
        this.entregaSeleccionada
      ) &&
      this.entregaSeleccionada.estadoBackend ===
        'EN_PREPARACION'
    ) {

      this.registrarDespacho();

      return;
    }

    /*
     * Para pedidos de retiro mantenemos el responsable
     * como dato visual.
     */
    const indice =
      this.entregas.findIndex(
        entrega =>
          entrega.id ===
          this.entregaSeleccionada!.id
      );

    if (indice === -1) {
      return;
    }

    this.entregas[indice] = {
      ...this.entregaSeleccionada
    };

    this.mensajeExito =
      'Responsable actualizado.';

    this.changeDetectorRef.detectChanges();
  }

  registrarDespacho(): void {

    if (
      !this.entregaSeleccionada ||
      this.procesando
    ) {
      return;
    }

    const entrega =
      this.entregaSeleccionada;

    if (
      entrega.despachoId !== null
    ) {

      this.mensajeError =
        'Este pedido ya tiene un despacho registrado.';

      return;
    }

    if (
      entrega.tipoDespacho !==
        'COURIER' &&
      entrega.tipoDespacho !==
        'VOLUNTARIO'
    ) {

      this.mensajeError =
        'Debes seleccionar un tipo de despacho.';

      return;
    }

    if (!entrega.fechaEnvio) {

      this.mensajeError =
        'Debes indicar la fecha de envío.';

      return;
    }

    if (
      entrega.tipoDespacho ===
      'COURIER'
    ) {

      if (
        !entrega.empresaTransporte.trim()
      ) {

        this.mensajeError =
          'Debes ingresar la empresa de transporte.';

        return;
      }

      if (
        !entrega.numeroSeguimiento.trim()
      ) {

        this.mensajeError =
          'Debes ingresar el número de seguimiento.';

        return;
      }
    }

    const request: DespachoRequest = {

      pedidoId:
        entrega.id,

      tipo:
        entrega.tipoDespacho,

      empresaTransporte:
        entrega.tipoDespacho === 'COURIER'
          ? entrega.empresaTransporte.trim()
          : undefined,

      numeroSeguimiento:
        entrega.tipoDespacho === 'COURIER'
          ? entrega.numeroSeguimiento.trim()
          : undefined,

      fechaEnvio:
        entrega.fechaEnvio
    };

    console.log(
      'REGISTRANDO DESPACHO:',
      request
    );

    this.procesando = true;

    this.limpiarMensajes();

    this.pedidoService
      .crearDespacho(request)
      .subscribe({

        next: (despacho: Despacho) => {

          console.log(
            'DESPACHO CREADO:',
            despacho
          );

          this.mensajeExito =
            'Despacho registrado correctamente. El pedido fue marcado como enviado.';

          this.procesando = false;

          const indice =
            this.entregas.findIndex(
              entrega =>
                entrega.id ===
                despacho.pedidoId
            );

          if (indice !== -1) {

            this.entregas[indice] = {

              ...this.entregas[indice],

              estado:
                'Enviado',

              estadoBackend:
                'ENVIADO',

              despachoId:
                despacho.id,

              tipoDespacho:
                despacho.tipo,

              empresaTransporte:
                despacho.empresaTransporte || '',

              numeroSeguimiento:
                despacho.numeroSeguimiento || '',

              fechaEnvio:
                despacho.fechaEnvio || ''
            };

            this.entregaSeleccionada = {
              ...this.entregas[indice]
            };
          }

          this.changeDetectorRef.detectChanges();
        },

        error: (error: any) => {

          console.error(
            'ERROR AL REGISTRAR DESPACHO:',
            error
          );

          this.mensajeError =
            this.obtenerMensajeErrorBackend(
              error
            );

          this.procesando = false;

          this.changeDetectorRef.detectChanges();
        }
      });
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
        'EN_PREPARACION' &&
      this.esPedidoRetiro(
        this.entregaSeleccionada
      )
    );
  }

  puedeMarcarEnviado(): boolean {

    /*
     * Para DESPACHO utilizamos registrarDespacho(),
     * ya que el backend cambia automáticamente
     * el estado a ENVIADO.
     */
    if (
      this.esPedidoDespacho(
        this.entregaSeleccionada
      )
    ) {
      return false;
    }

    return (
      this.entregaSeleccionada?.estadoBackend ===
        'PAGO_APROBADO' ||
      this.entregaSeleccionada?.estadoBackend ===
        'EN_PREPARACION' ||
      this.entregaSeleccionada?.estadoBackend ===
        'LISTO_PARA_RETIRO'
    );
  }

  puedeRegistrarDespacho(): boolean {

    return (
      !!this.entregaSeleccionada &&
      this.esPedidoDespacho(
        this.entregaSeleccionada
      ) &&
      this.entregaSeleccionada.estadoBackend ===
        'EN_PREPARACION' &&
      this.entregaSeleccionada.despachoId ===
        null
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

  esPedidoDespacho(
    entrega: Entrega | null
  ): boolean {

    if (!entrega) {
      return false;
    }

    return (
      String(
        entrega.modalidadEntrega || ''
      ).toUpperCase() ===
      'DESPACHO'
    );
  }

  esPedidoRetiro(
    entrega: Entrega | null
  ): boolean {

    if (!entrega) {
      return false;
    }

    return (
      String(
        entrega.modalidadEntrega || ''
      ).toUpperCase() ===
      'RETIRO'
    );
  }

  obtenerFechaActual(): string {

    const fecha =
      new Date();

    const año =
      fecha.getFullYear();

    const mes =
      String(
        fecha.getMonth() + 1
      ).padStart(2, '0');

    const dia =
      String(
        fecha.getDate()
      ).padStart(2, '0');

    return `${año}-${mes}-${dia}`;
  }

  limpiarMensajes(): void {

    this.mensajeExito = '';
    this.mensajeError = '';
  }

  obtenerMensajeErrorBackend(
    error: any
  ): string {

    const mensaje =
      error?.error?.message ||
      error?.error?.error ||
      error?.message;

    if (mensaje) {
      return mensaje;
    }

    return 'No se pudo registrar el despacho.';
  }

  obtenerClaseEstado(
    estado: string
  ): string {

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