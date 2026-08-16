import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard/dashboard')
        .then(m => m.Dashboard),
    pathMatch: 'full'
  },

  {
    path: 'productos',
    loadComponent: () =>
      import('./pages/productos/productos')
        .then(m => m.Productos)
  },

  {
    path: 'pedidos',
    loadComponent: () =>
      import('./pages/pedidos/pedidos')
        .then(m => m.Pedidos)
  },

  {
    path: 'pedidos/:id',
    loadComponent: () =>
      import('./pages/detalle-pedido/detalle-pedido')
        .then(m => m.DetallePedido)
  },

  {
    path: 'entregas',
    loadComponent: () =>
      import('./pages/entregas/entregas')
        .then(m => m.Entregas)
  },

  {
    path: 'comprobantes',
    loadComponent: () =>
      import('./pages/comprobantes/comprobantes')
        .then(m => m.Comprobantes)
  }

];