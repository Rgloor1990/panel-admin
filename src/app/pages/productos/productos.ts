import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';

import { Subject, filter, takeUntil } from 'rxjs';

interface ProductoBackend {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  fotoUrl?: string;
  stock: number;
  estado: string;
  version?: number;
}

interface Producto {
  id?: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  fotoUrl?: string;
  stock: number;
  estado: string;
  version?: number;
}

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './productos.html',
  styleUrl: './productos.scss'
})
export class Productos implements OnInit, OnDestroy {

  private apiUrl = '/api/productos';

  private readonly claveProductos =
    'mapuescuela_productos';

  private destruir$ = new Subject<void>();

  productos: Producto[] = [];

  terminoBusqueda = '';
  busquedaActiva = false;

  mostrarFormulario = false;
  mostrarConfirmacionEliminar = false;

  modoEdicion = false;

  productoAEliminar: Producto | null = null;

  nuevoProducto: Producto = this.productoInicial();

  cargando = false;
  errorCarga = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('Página Productos iniciada');

    /*
     * Primero recuperamos los productos guardados localmente.
     * Así no desaparecen al recargar o cambiar de pestaña.
     */
    this.cargarProductosGuardados();

    /*
     * Después consultamos el backend para obtener
     * la información actualizada.
     */
    this.cargarProductos();

    /*
     * Si se vuelve a navegar hacia Productos,
     * se consulta nuevamente el backend.
     */
    this.router.events
      .pipe(
        filter(
          (evento) => evento instanceof NavigationEnd
        ),
        takeUntil(this.destruir$)
      )
      .subscribe((evento) => {
        const navegacion = evento as NavigationEnd;

        if (
          navegacion.urlAfterRedirects.includes('/productos')
        ) {
          this.cargarProductos();
        }
      });
  }

  ngOnDestroy(): void {
    this.destruir$.next();
    this.destruir$.complete();
  }

  private cargarProductosGuardados(): void {
    try {
      const productosGuardados =
        localStorage.getItem(this.claveProductos);

      if (!productosGuardados) {
        return;
      }

      const productosParseados: Producto[] =
        JSON.parse(productosGuardados);

      if (Array.isArray(productosParseados)) {
        this.productos = productosParseados;

        console.log(
          'Productos recuperados desde localStorage:',
          this.productos
        );
      }

    } catch (error) {
      console.error(
        'Error al recuperar productos guardados:',
        error
      );
    }
  }

  private guardarProductosLocalmente(): void {
    try {
      localStorage.setItem(
        this.claveProductos,
        JSON.stringify(this.productos)
      );

      console.log(
        'Productos guardados en localStorage'
      );

    } catch (error) {
      console.error(
        'Error al guardar productos localmente:',
        error
      );
    }
  }

  cargarProductos(): void {
    console.log('Consultando productos al backend...');

    this.cargando = true;
    this.errorCarga = '';

    this.http
      .get<ProductoBackend[]>(this.apiUrl)
      .subscribe({
        next: (productosBackend) => {
          console.log(
            'Productos recibidos del backend:',
            productosBackend
          );

          this.productos = productosBackend.map(
            (producto) => this.convertirProducto(producto)
          );

          /*
           * Guardamos la respuesta actualizada.
           */
          this.guardarProductosLocalmente();

          this.cargando = false;

          console.log(
            'Productos mostrados:',
            this.productos
          );
        },

        error: (error) => {
          console.error(
            'Error al cargar productos:',
            error
          );

          this.cargando = false;

          /*
           * Si ya existen productos guardados,
           * no los borramos cuando el backend falla.
           */
          if (this.productos.length === 0) {
            this.errorCarga =
              'No se pudieron cargar los productos. Verifica que el servidor esté funcionando.';
          } else {
            this.errorCarga = '';
          }
        }
      });
  }

  private convertirProducto(
    producto: ProductoBackend
  ): Producto {
    return {
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? '',
      categoria: producto.categoria ?? '',
      precio: Number(producto.precio),
      fotoUrl: producto.fotoUrl ?? '',
      stock: Number(producto.stock),
      estado: this.obtenerEstado(
        Number(producto.stock)
      ),
      version: producto.version
    };
  }

  cambiarBusqueda(valor: string): void {
    this.terminoBusqueda = valor;
    this.busquedaActiva = valor.trim().length > 0;
  }

  get productosFiltrados(): Producto[] {
    if (!this.busquedaActiva) {
      return this.productos;
    }

    const termino = this.terminoBusqueda
      .trim()
      .toLowerCase();

    return this.productos.filter((producto) =>
      producto.nombre
        .toLowerCase()
        .includes(termino) ||

      producto.categoria
        .toLowerCase()
        .includes(termino) ||

      producto.descripcion
        .toLowerCase()
        .includes(termino)
    );
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda = '';
    this.busquedaActiva = false;
  }

  abrirFormulario(): void {
    this.modoEdicion = false;
    this.nuevoProducto = this.productoInicial();
    this.mostrarFormulario = true;
  }

  editarProducto(producto: Producto): void {
    this.modoEdicion = true;

    this.nuevoProducto = {
      ...producto
    };

    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.modoEdicion = false;
    this.nuevoProducto = this.productoInicial();
  }

  guardarProducto(): void {
    if (
      !this.nuevoProducto.nombre.trim() ||
      !this.nuevoProducto.descripcion.trim() ||
      !this.nuevoProducto.categoria.trim()
    ) {
      alert(
        'Completa el nombre, la descripción y la categoría.'
      );

      return;
    }

    if (
      this.nuevoProducto.precio < 0 ||
      this.nuevoProducto.stock < 0
    ) {
      alert(
        'El precio y el stock no pueden ser negativos.'
      );

      return;
    }

    const productoRequest = {
      nombre: this.nuevoProducto.nombre.trim(),
      descripcion: this.nuevoProducto.descripcion.trim(),
      categoria: this.nuevoProducto.categoria.trim(),
      precio: Number(this.nuevoProducto.precio),
      fotoUrl: this.nuevoProducto.fotoUrl?.trim() || '',
      stock: Number(this.nuevoProducto.stock)
    };

    if (
      this.modoEdicion &&
      this.nuevoProducto.id !== undefined
    ) {
      this.actualizarProducto(
        this.nuevoProducto.id,
        productoRequest
      );
    } else {
      this.crearProducto(productoRequest);
    }
  }

  private crearProducto(productoRequest: {
    nombre: string;
    descripcion: string;
    categoria: string;
    precio: number;
    fotoUrl: string;
    stock: number;
  }): void {
    this.http
      .post<ProductoBackend>(
        this.apiUrl,
        productoRequest
      )
      .subscribe({
        next: (productoCreado) => {
          this.productos = [
            ...this.productos,
            this.convertirProducto(productoCreado)
          ];

          this.guardarProductosLocalmente();

          this.cerrarFormulario();

          alert(
            'Producto creado correctamente.'
          );
        },

        error: (error) => {
          console.error(
            'Error al crear producto:',
            error
          );

          alert(
            'No se pudo crear el producto.'
          );
        }
      });
  }

  private actualizarProducto(
    id: number,
    productoRequest: {
      nombre: string;
      descripcion: string;
      categoria: string;
      precio: number;
      fotoUrl: string;
      stock: number;
    }
  ): void {
    this.http
      .put<ProductoBackend>(
        `${this.apiUrl}/${id}`,
        productoRequest
      )
      .subscribe({
        next: (productoActualizado) => {
          this.productos = this.productos.map(
            (producto) =>
              producto.id === id
                ? this.convertirProducto(
                    productoActualizado
                  )
                : producto
          );

          this.guardarProductosLocalmente();

          this.cerrarFormulario();

          alert(
            'Producto actualizado correctamente.'
          );
        },

        error: (error) => {
          console.error(
            'Error al actualizar producto:',
            error
          );

          alert(
            'No se pudo actualizar el producto.'
          );
        }
      });
  }

  confirmarEliminar(producto: Producto): void {
    this.productoAEliminar = producto;
    this.mostrarConfirmacionEliminar = true;
  }

  cancelarEliminar(): void {
    this.productoAEliminar = null;
    this.mostrarConfirmacionEliminar = false;
  }

  eliminarProducto(): void {
    if (
      !this.productoAEliminar ||
      this.productoAEliminar.id === undefined
    ) {
      return;
    }

    const id = this.productoAEliminar.id;

    this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .subscribe({
        next: () => {
          this.productos = this.productos.filter(
            (producto) => producto.id !== id
          );

          this.guardarProductosLocalmente();

          this.cancelarEliminar();

          alert(
            'Producto eliminado correctamente.'
          );
        },

        error: (error) => {
          console.error(
            'Error al eliminar producto:',
            error
          );

          alert(
            'No se pudo eliminar el producto.'
          );
        }
      });
  }

  private obtenerEstado(stock: number): string {
    if (stock === 0) {
      return 'Sin stock';
    }

    if (stock <= 5) {
      return 'Stock bajo';
    }

    return 'Disponible';
  }

  private productoInicial(): Producto {
    return {
      nombre: '',
      descripcion: '',
      categoria: '',
      precio: 0,
      fotoUrl: '',
      stock: 0,
      estado: 'Sin stock'
    };
  }

}