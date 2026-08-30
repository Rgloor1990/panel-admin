import { Component, OnInit } from '@angular/core';
import { TareasService } from '../../services/tareas';

interface Tarea {
  id: number | string;
  titulo: string;
  descripcion: string;
  pedidoId: number | string;
  asignado: string;
  tipo: 'pago' | 'pedido' | 'entrega';
  icono: string;
}

@Component({
  selector: 'app-tareas',
  imports: [],
  providers: [TareasService],
  templateUrl: './tareas.html',
  styleUrl: './tareas.css',
})
export class Tareas implements OnInit {

  filtro: 'todas' | 'pago' | 'pedido' | 'entrega' = 'todas';

  tareas: Tarea[] = [];

  cargando = true;

  error = '';

  constructor(private tareasService: TareasService) {}

  ngOnInit(): void {
    this.cargarTareas();
  }

  cargarTareas(): void {

    this.cargando = true;
    this.error = '';

    this.tareasService.obtenerTareas().subscribe({

      next: (respuesta: any) => {

        console.log('Respuesta del backend:', respuesta);

        if (Array.isArray(respuesta)) {

          this.tareas = respuesta.map(
            (tarea: any, index: number) =>
              this.convertirTarea(tarea, index)
          );

        } else if (
          respuesta?.content &&
          Array.isArray(respuesta.content)
        ) {

          this.tareas = respuesta.content.map(
            (tarea: any, index: number) =>
              this.convertirTarea(tarea, index)
          );

        } else if (
          respuesta?.tareas &&
          Array.isArray(respuesta.tareas)
        ) {

          this.tareas = respuesta.tareas.map(
            (tarea: any, index: number) =>
              this.convertirTarea(tarea, index)
          );

        } else {

          this.tareas = [];

        }

        this.cargando = false;
      },

      error: (err: any) => {

        console.error(
          'Error al obtener las tareas:',
          err
        );

        this.error =
          'No fue posible cargar las tareas. Verifica que el backend esté funcionando.';

        this.cargando = false;
      }

    });
  }

  convertirTarea(
    tarea: any,
    index: number
  ): Tarea {

    const nombre = String(
      tarea.nombre ||
      tarea.name ||
      tarea.taskName ||
      tarea.titulo ||
      tarea.nombreTarea ||
      'Tarea pendiente'
    );

    const nombreMinuscula =
      nombre.toLowerCase();

    let tipo:
      'pago' |
      'pedido' |
      'entrega' = 'pedido';

    let icono = '📦';

    if (
      nombreMinuscula.includes('comprobante') ||
      nombreMinuscula.includes('pago')
    ) {

      tipo = 'pago';

      icono = '🧾';
    }

    if (
      nombreMinuscula.includes('retiro') ||
      nombreMinuscula.includes('despacho') ||
      nombreMinuscula.includes('entrega') ||
      nombreMinuscula.includes('envío') ||
      nombreMinuscula.includes('envio')
    ) {

      tipo = 'entrega';

      icono = '🚚';
    }

    return {

      id:
        tarea.id ||
        tarea.taskId ||
        index + 1,

      titulo:
        nombre,

      descripcion:
        tarea.descripcion ||
        tarea.description ||
        'Tarea pendiente del proceso.',

      pedidoId:
        tarea.pedidoId ||
        tarea.orderId ||
        tarea.idPedido ||
        tarea.variables?.pedidoId ||
        '-',

      asignado:
        tarea.asignado ||
        tarea.assignee ||
        tarea.usuario ||
        'Voluntario',

      tipo,

      icono

    };
  }

  get tareasFiltradas(): Tarea[] {

    if (this.filtro === 'todas') {

      return this.tareas;

    }

    return this.tareas.filter(
      tarea =>
        tarea.tipo === this.filtro
    );
  }

  abrirTarea(
    tarea: Tarea
  ): void {

    console.log(
      'Tarea seleccionada:',
      tarea
    );

  }

}