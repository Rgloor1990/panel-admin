import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  estado: string;
}

@Component({
  selector: 'app-productos',
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.html',
  styleUrl: './productos.css'
})
export class Productos {

  terminoBusqueda: string = '';

  mostrarFormulario: boolean = false;

  modoEdicion: boolean = false;

  productoEditandoId: number = 0;

  mostrarConfirmacionEliminar: boolean = false;

  productoAEliminar: Producto | null = null;


  nuevoProducto: Producto = {
    id: 0,
    nombre: '',
    categoria: '',
    precio: 0,
    stock: 0,
    estado: 'Disponible'
  };


  productos: Producto[] = [

    {
      id: 1,
      nombre: 'Mochila escolar',
      categoria: 'Útiles escolares',
      precio: 15000,
      stock: 12,
      estado: 'Disponible'
    },

    {
      id: 2,
      nombre: 'Cuaderno universitario',
      categoria: 'Útiles escolares',
      precio: 5000,
      stock: 25,
      estado: 'Disponible'
    },

    {
      id: 3,
      nombre: 'Agenda escolar',
      categoria: 'Útiles escolares',
      precio: 8000,
      stock: 8,
      estado: 'Disponible'
    },

    {
      id: 4,
      nombre: 'Set de lápices',
      categoria: 'Útiles escolares',
      precio: 5000,
      stock: 3,
      estado: 'Stock bajo'
    },

    {
      id: 5,
      nombre: 'Mochila deportiva',
      categoria: 'Accesorios',
      precio: 22000,
      stock: 10,
      estado: 'Disponible'
    },

    {
      id: 6,
      nombre: 'Botella de agua',
      categoria: 'Accesorios',
      precio: 10000,
      stock: 0,
      estado: 'Sin stock'
    }

  ];


  get productosFiltrados(): Producto[] {

    const termino = this.terminoBusqueda
      .toLowerCase()
      .trim();

    if (!termino) {
      return this.productos;
    }

    return this.productos.filter(producto =>
      producto.nombre.toLowerCase().includes(termino) ||
      producto.categoria.toLowerCase().includes(termino)
    );

  }


  limpiarBusqueda(): void {

    this.terminoBusqueda = '';

  }


  abrirFormulario(): void {

    this.modoEdicion = false;

    this.productoEditandoId = 0;

    this.nuevoProducto = {
      id: 0,
      nombre: '',
      categoria: '',
      precio: 0,
      stock: 0,
      estado: 'Disponible'
    };

    this.mostrarFormulario = true;

  }


  editarProducto(producto: Producto): void {

    this.modoEdicion = true;

    this.productoEditandoId = producto.id;

    this.nuevoProducto = {
      id: producto.id,
      nombre: producto.nombre,
      categoria: producto.categoria,
      precio: producto.precio,
      stock: producto.stock,
      estado: producto.estado
    };

    this.mostrarFormulario = true;

  }


  cerrarFormulario(): void {

    this.mostrarFormulario = false;

    this.modoEdicion = false;

    this.productoEditandoId = 0;

  }


  guardarProducto(): void {

    const nombre = this.nuevoProducto.nombre.trim();

    const categoria = this.nuevoProducto.categoria.trim();

    if (
      !nombre ||
      !categoria ||
      this.nuevoProducto.precio <= 0 ||
      this.nuevoProducto.stock < 0
    ) {
      return;
    }


    let estado = 'Disponible';

    if (this.nuevoProducto.stock === 0) {

      estado = 'Sin stock';

    }
    else if (this.nuevoProducto.stock <= 5) {

      estado = 'Stock bajo';

    }


    /* ================================
       EDITAR PRODUCTO
       ================================ */

    if (this.modoEdicion) {

      const indice =
        this.productos.findIndex(
          producto => producto.id === this.productoEditandoId
        );


      if (indice !== -1) {

        this.productos[indice] = {

          id: this.productoEditandoId,

          nombre: nombre,

          categoria: categoria,

          precio: Number(this.nuevoProducto.precio),

          stock: Number(this.nuevoProducto.stock),

          estado: estado

        };

      }

    }


    /* ================================
       AGREGAR PRODUCTO
       ================================ */

    else {

      const nuevoId =
        this.productos.length > 0
          ? Math.max(
              ...this.productos.map(producto => producto.id)
            ) + 1
          : 1;


      const productoNuevo: Producto = {

        id: nuevoId,

        nombre: nombre,

        categoria: categoria,

        precio: Number(this.nuevoProducto.precio),

        stock: Number(this.nuevoProducto.stock),

        estado: estado

      };


      this.productos.push(productoNuevo);

    }


    this.cerrarFormulario();

  }


  /* ================================
     ABRIR CONFIRMACIÓN DE ELIMINAR
     ================================ */

  confirmarEliminar(producto: Producto): void {

    this.productoAEliminar = producto;

    this.mostrarConfirmacionEliminar = true;

  }


  /* ================================
     CANCELAR ELIMINACIÓN
     ================================ */

  cancelarEliminar(): void {

    this.productoAEliminar = null;

    this.mostrarConfirmacionEliminar = false;

  }


  /* ================================
     ELIMINAR PRODUCTO
     ================================ */

  eliminarProducto(): void {

    if (!this.productoAEliminar) {
      return;
    }


    this.productos =
      this.productos.filter(
        producto =>
          producto.id !== this.productoAEliminar?.id
      );


    this.productoAEliminar = null;

    this.mostrarConfirmacionEliminar = false;

  }

}