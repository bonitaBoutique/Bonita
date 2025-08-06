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
    path: '/reset-password/:token', 
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
    path: '/panelGastos/createGastos', 
    component: lazy(() => import('../Informes/CargarGastos')) 
  },
  { 
    path: '/panelGastos/filtroGastos', 
    component: lazy(() => import('../Informes/FilterExpenses')) 
  },
  { 
    path: '/panelGeneral', 
    component: lazy(() => import('../PanelGeneral')) 
  },
  { 
    path: '/resumenDeCuenta/:n_document',
    component: lazy(() => import('../Informes/AccountSummary')) 
    
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
    path: '/stock/movements', 
    component: lazy(() => import('../stock/StockMovements'))
   },
  { 
    path: '/reservas', 
    component: lazy(() => import('../ReservationsList')) 
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
    path: '/returns/management', 
    component: lazy(() => import('../stock/ReturnManagment')) 
  },
  { 
    path: '/returns/history', 
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
    path: '/panel/listado', 
    component: lazy(() => import('../Taxxa/InvoicesList')) 
  },
  { 
    path: '/creditN', 
    component: lazy(() => import('../Taxxa/CreditN')) 
  },
   { 
    path: '/pagoCredito', 
    component: lazy(() => import('../AddiSistecreditoPayments')) 
  }
 
  
  

];

// Rutas de cajero y admin
export const cashierRoutes = [
  { 
    path: '/panel/caja', 
    component: lazy(() => import('../Caja')) 
  },
  { 
    path: '/informes', 
    component: lazy(() => import('../Informes/Balance')) 
  },
  { 
    path: '/receipt/:idOrder', 
    component: lazy(() => import('../Recibo')) 
  },
  { 
    path: '/recibo/giftcard/:n_document', 
    component: lazy(() => import('../GiftCard')) 
  },
  { 
    path: '/active-giftcards', 
    component: lazy(() => import('../ActiveGiftCards')) 
  },
  { 
    path: '/giftcard/redeem/:n_document', 
    component: lazy(() => import('../RedeemGiftCard')) 
  },

  { 
    path: '/accountClient', 
    component: lazy(() => import('../ClientAccountBalance')) 
  },
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