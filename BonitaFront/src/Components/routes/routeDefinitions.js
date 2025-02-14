import { lazy } from 'react';

// Rutas públicas
export const publicRoutes = [
  { 
    path: '/', 
    component: lazy(() => import('../LandingPrincipal')),
    exact: true 
  },
  { 
    path: '/login', 
    component: lazy(() => import('../Users/Login')),
    exact: true 
  },
  { 
    path: '/register', 
    component: lazy(() => import('../Users/Register')),
    exact: true 
  },
  { 
    path: '/products', 
    component: lazy(() => import('../Product/ProducstList')),
    exact: true 
  },
  { 
    path: '/product/:id', 
    component: lazy(() => import('../Product/ProductDetails')) 
  },
  { 
    path: '/cart', 
    component: lazy(() => import('../Cart')),
    exact: true 
  },
  { 
    path: '/gracias', 
    component: lazy(() => import('../ThankYouPage')),
    exact: true 
  },
  { 
    path: '/recuperar', 
    component: lazy(() => import('../Users/RequestPasswordReset')) 
  },
  { 
    path: '/resetPassword/:token', 
    component: lazy(() => import('../Users/ResetPassword')) 
  }
];

// Rutas privadas (requieren autenticación)
export const privateRoutes = [
  { 
    path: '/myOrders/:n_document', 
    component: lazy(() => import('../OrdersDetail')) 
  },
  { 
    path: '/allOrders', 
    component: lazy(() => import('../OrdersList')) 
  },
  { 
    path: '/checkout', 
    component: lazy(() => import('../Checkout')) 
  },
  { 
    path: '/updateProduct/:id', 
    component: lazy(() => import('../Product/UpdateProduct')) 
  }
];

// Rutas de administrador
export const adminRoutes = [
  { 
    path: '/panel', 
    component: lazy(() => import('../Taxxa/Panel')) 
  },
  { 
    path: '/panelGeneral', 
    component: lazy(() => import('../PanelGeneral')) 
  },
  { 
    path: '/panel/facturacion', 
    component: lazy(() => import('../Taxxa/BillingForm')) 
  },
  { 
    path: '/panel/productos', 
    component: lazy(() => import('../stock/ListadoProductos')) 
  },
  { 
    path: '/panelProductos', 
    component: lazy(() => import('../Product/PanelProductos')) 
  },
  { 
    path: '/panel/seller', 
    component: lazy(() => import('../Taxxa/SellerForm')) 
  },
  { 
    path: '/panel/ordenesPendientes', 
    component: lazy(() => import('../Taxxa/OrdenesPendientes')) 
  },
  { 
    path: '/createProducts', 
    component: lazy(() => import('../Product/CreateProduct')) 
  },
  { 
    path: '/panelGastos', 
    component: lazy(() => import('../Informes/PanelInformes')) 
  },
  { 
    path: '/informes', 
    component: lazy(() => import('../Informes/Balance')) 
  },
  { 
    path: '/invoice', 
    component: lazy(() => import('../Taxxa/Invoice')) 
  },
  { 
    path: '/creditN', 
    component: lazy(() => import('../Taxxa/CreditN')) 
  }
];

// Rutas de cajero y admin
export const cashierRoutes = [
  { 
    path: '/panel/caja', 
    component: lazy(() => import('../Caja')) 
  },
  { 
    path: '/receipt/:idOrder', 
    component: lazy(() => import('../Recibo')) 
  }
];

// Lista de rutas administrativas para verificación
export const adminPaths = [
  '/panel',
  '/panelGeneral',
  '/panel/facturacion',
  '/panel/productos',
  '/panel/seller',
  '/panel/ordenesPendientes',
  '/panelProductos',
  '/updateProduct',
  '/panel/createProducts',
  '/invoice',
  '/creditN',
  '/caja',
  '/informes',
  '/createProducts',
  '/reservas',
  '/accountClient'
];