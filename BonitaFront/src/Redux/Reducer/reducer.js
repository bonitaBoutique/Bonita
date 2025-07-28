/* eslint-disable no-case-declarations */
import {
  CREATE_PRODUCT_REQUEST,
  CREATE_PRODUCT_SUCCESS,
  CREATE_PRODUCT_FAILURE,
  FETCH_CATEGORIES_REQUEST,
  FETCH_CATEGORIES_SUCCESS,
  FETCH_CATEGORIES_FAILURE,
  FETCH_PRODUCTS_REQUEST,
  FETCH_FILTERED_PRODUCTS_REQUEST,
  FETCH_FILTERED_PRODUCTS_SUCCESS,
  FETCH_PRODUCTS_SUCCESS,
  FETCH_PRODUCTS_FAILURE,
  FETCH_PRODUCT_REQUEST,
  FETCH_PRODUCT_SUCCESS,
  FETCH_PRODUCT_FAILURE,
  ADD_TO_CART,
  REMOVE_FROM_CART,
  CLEAR_CART,
  INCREMENT_QUANTITY,
  DECREMENT_QUANTITY,
  ORDER_CREATE_REQUEST,
  ORDER_CREATE_SUCCESS,
  ORDER_CREATE_FAIL,
  USER_REGISTER_REQUEST,
  USER_REGISTER_SUCCESS,
  USER_REGISTER_FAIL,
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAIL,
  USER_LOGOUT,
  SET_SEARCH_TERM,
  SET_PRICE_FILTER,
  SET_CATEGORY_FILTER,
  CLEAR_ORDER_STATE,
  FETCH_ORDERS_REQUEST,
  FETCH_ORDERS_SUCCESS,
  FETCH_ORDERS_FAILURE,
  FETCH_ORDERBYID_REQUEST,
  FETCH_ORDERBYID_SUCCESS,
  FETCH_ORDERBYID_FAILURE,
  FETCH_ALLS_ORDERS_REQUEST,
  FETCH_ALLS_ORDERS_SUCCESS,
  FETCH_ALLS_ORDERS_FAILURE,
  UPDATE_ORDER_STATE_SUCCESS,
  UPDATE_ORDER_STATE_FAILURE,
  UPDATE_PRODUCT_REQUEST,
  UPDATE_PRODUCT_SUCCESS,
  UPDATE_PRODUCT_FAILURE,
  DELETE_PRODUCT_REQUEST,
  DELETE_PRODUCT_SUCCESS,
  DELETE_PRODUCT_FAILURE,
  CATEGORY_CREATE_REQUEST,
  CATEGORY_CREATE_SUCCESS,
  CATEGORY_CREATE_FAIL,
  SB_CREATE_REQUEST,
  SB_CREATE_SUCCESS,
  SB_CREATE_FAIL,
  FETCH_LATEST_ORDER_REQUEST,
  FETCH_LATEST_ORDER_SUCCESS,
  FETCH_LATEST_ORDER_FAILURE,
  FETCH_SB_REQUEST,
  FETCH_SB_SUCCESS,
  FETCH_SB_FAILURE,
  FETCH_USER_REQUEST,
  FETCH_USER_SUCCESS,
  FETCH_USER_FAILURE,
  FETCH_SELLER_REQUEST,
  FETCH_SELLER_SUCCESS,
  FETCH_SELLER_FAILURE,
  CREATE_SELLER_REQUEST,
  CREATE_SELLER_SUCCESS,
  CREATE_SELLER_FAILURE,
  UPDATE_SELLER_REQUEST,
  UPDATE_SELLER_SUCCESS,
  UPDATE_SELLER_FAILURE,
  SEND_INVOICE_REQUEST,
  SEND_INVOICE_SUCCESS,
  SEND_INVOICE_FAILURE,
  CREATE_RECEIPT_REQUEST,
  CREATE_RECEIPT_SUCCESS,
  CREATE_RECEIPT_FAILURE,
  FETCH_LATEST_RECEIPTS_REQUEST,
  FETCH_LATEST_RECEIPTS_SUCCESS,
  FETCH_LATEST_RECEIPTS_FAILURE,
  FETCH_RECEIPTS_REQUEST,
  FETCH_RECEIPTS_SUCCESS,
  FETCH_RECEIPTS_FAILURE,
  CREATE_EXPENSE_REQUEST,
  CREATE_EXPENSE_SUCCESS,
  CREATE_EXPENSE_FAILURE,
  GET_FILTERED_EXPENSES_REQUEST,
  GET_FILTERED_EXPENSES_SUCCESS,
  GET_FILTERED_EXPENSES_FAILURE,
  DELETE_EXPENSE_REQUEST,
  DELETE_EXPENSE_SUCCESS,
  DELETE_EXPENSE_FAILURE,
  CREATE_RESERVATION_REQUEST,
  CREATE_RESERVATION_SUCCESS,
  CREATE_RESERVATION_FAILURE,
  UPDATE_RESERVATION_REQUEST,
  UPDATE_RESERVATION_SUCCESS,
  UPDATE_RESERVATION_FAILURE,
  FETCH_BALANCE_REQUEST,
  FETCH_BALANCE_SUCCESS,
  FETCH_BALANCE_FAILURE,
  GET_ALL_RESERVATIONS_REQUEST,
  GET_ALL_RESERVATIONS_SUCCESS,
  GET_ALL_RESERVATIONS_FAILURE,
  APPLY_PAYMENT_REQUEST,
  APPLY_PAYMENT_SUCCESS,
  APPLY_PAYMENT_FAILURE,
  DELETE_RESERVATION_REQUEST,
  DELETE_RESERVATION_SUCCESS,
  DELETE_RESERVATION_FAILURE,
  GET_CLIENT_ACCOUNT_BALANCE_REQUEST,
  GET_CLIENT_ACCOUNT_BALANCE_SUCCESS,
  GET_CLIENT_ACCOUNT_BALANCE_FAILURE,
  GET_ALL_CLIENT_ACCOUNTS_REQUEST,
  GET_ALL_CLIENT_ACCOUNTS_SUCCESS,
  GET_ALL_CLIENT_ACCOUNTS_FAILURE,
  RESET_RECEIPT_STATE,
  CREATE_SENDING_REQUEST,
  CREATE_SENDING_SUCCESS,
  CREATE_SENDING_FAILURE,
DELETE_ORDER_DETAIL_REQUEST,
  DELETE_ORDER_DETAIL_SUCCESS,
  DELETE_ORDER_DETAIL_FAILURE,
  REMOVE_PRODUCT_FROM_ORDER_REQUEST,
  REMOVE_PRODUCT_FROM_ORDER_SUCCESS,
  REMOVE_PRODUCT_FROM_ORDER_FAILURE,
  FETCH_ACCOUNT_SUMMARY_REQUEST,
  FETCH_ACCOUNT_SUMMARY_SUCCESS,
  FETCH_ACCOUNT_SUMMARY_FAILURE,
  FETCH_STOCK_MOVEMENTS_REQUEST,
  FETCH_STOCK_MOVEMENTS_SUCCESS,
  FETCH_STOCK_MOVEMENTS_FAILURE,
  CREATE_STOCK_MOVEMENT_REQUEST,
  CREATE_STOCK_MOVEMENT_SUCCESS,
  CREATE_STOCK_MOVEMENT_FAILURE,
  SEARCH_RECEIPT_FOR_RETURN_REQUEST,
  SEARCH_RECEIPT_FOR_RETURN_SUCCESS,
  SEARCH_RECEIPT_FOR_RETURN_FAILURE,
  PROCESS_RETURN_REQUEST,
  PROCESS_RETURN_SUCCESS,
  PROCESS_RETURN_FAILURE,
  FETCH_RETURN_HISTORY_REQUEST,
  FETCH_RETURN_HISTORY_SUCCESS,
  FETCH_RETURN_HISTORY_FAILURE,
  CLEAR_RETURN_STATE,
  RESET_RECEIPT_SEARCH,
  GET_SERVER_TIME_REQUEST,
  GET_SERVER_TIME_SUCCESS,
  GET_SERVER_TIME_FAILURE

} from "../Actions/actions-type";

const initialState = {
  receiptsLoading: false,
  receiptsError: null,
  receiptsPagination: {
    total: 0,
    pages: 0,
    currentPage: 1
  },
  receipts: [],
  receiptNumber: null,
  
  priceFilter: { min: null, max: null },
  categoryFilter: "",
  searchResults: [],
  loading: false,
  product: {},
  reservation: {
    data: null,
    loading: false,
    error: null,
    list: [], // For listing all reservations
    currentReservation: null, // For single reservation view/edit
    updateStatus: {
      loading: false,
      error: null,
      success: false
    }
  },
  sending: {
    loading: false,
    error: null,
    data: null
  },
  clientAccountBalance: {
    user: null,
    orderDetails: [],
    loading: false,
    error: null,
  },
  allClientAccounts: {
    data: [],
    loading: false,
    error: null,
  },
  similarProducts: [],
  products: [],
  data: null,
  error: null,

  userTaxxa: {
    userInfo: {},
    loading: false,
    error: null,
  },
  sellerData: {
    data: null,
    loading: false,
    error: null,
  },

  userRegister: {
    userInfo: null,
    loading: false,
    error: null,
    success: false
  },
  userLogin: {
    userInfo: null,
    loading: false,
    error: null
  },
  categories: {
    loading: false,
    data: [],
    error: null,
  },
  subCategories: {
    loading: false,
    data: [],
    error: null,
  },
  cart: {
    items: localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [],
    totalItems: localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart")).reduce(
          (acc, item) => acc + item.quantity,
          0
        )
      : 0,
    totalPrice: localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart")).reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
        )
      : 0,
  },
  invoice: {
    loading: false,
    success: false,
    error: null,
  },
  balance: 0,
  totalIncome: 0,
  totalOnlineSales: 0,
  totalLocalSales: 0,
  totalExpenses: 0,
  income: {
    online: [],
    local: []
  },

  expenses: {
    data: [],
    loading: false,
    success: false,
    error: null
  },

  movements: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0
  },
  filters: {},
  // ✅ QUITAR DUPLICADOS: ya tienes loading, error, success arriba
  // loading: false,
  // error: null,
  // success: false,
  creating: false,
  createError: null,

  // ✅ AGREGAR serverTime DENTRO del initialState
  serverTime: {
    current: null,
    loading: false,
    error: null,
    lastUpdate: null
  },

  // ✅ AGREGAR otros estados que faltan para el sistema de devoluciones
  returns: {
    receiptSearch: {
      loading: false,
      receipt: null,
      canReturn: true,
      daysSinceReceipt: 0,
      error: null,
    },
    processing: {
      loading: false,
      result: null,
      error: null,
      success: false,
    },
    history: {
      loading: false,
      data: [],
      pagination: null,
      stats: [],
      error: null,
    },
  },

  // ✅ AGREGAR estados para stock movements
  stockMovements: {
    data: [],
    loading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0
    },
    filters: {},
    creating: false,
    createError: null
  },

  // ✅ AGREGAR estados para ordersGeneral si no existen
  ordersGeneral: {
    loading: false,
    orders: [],
    error: null,
  },

  // ✅ AGREGAR estados para orderById si no existen
  orderById: {
    loading: false,
    order: {},
    error: null,
  },

  // ✅ AGREGAR estados para orders si no existen
  orders: {
    loading: false,
    orders: [],
    error: null,
  },

  // ✅ AGREGAR estado para order si no existe
  order: {
    loading: false,
    success: false,
    order: null,
    error: null,
  },

  // ✅ AGREGAR estado para latestOrder si no existe
  latestOrder: {
    loading: false,
    success: false,
    error: null,
    data: {},
  },

  // ✅ AGREGAR estado para updateProduct si no existe
  updateProduct: {
    loading: false,
    error: null,
    product: null,
  },

  // ✅ AGREGAR estado para accountSummary si no existe
  accountSummary: {
    loading: false,
    data: null,
    error: null,
  },

  // ✅ MANTENER searchTerm para compatibilidad
  searchTerm: "",

  // ✅ AGREGAR paymentMethodBreakdown que se usa en Balance
  paymentMethodBreakdown: {},
  cashierTotals: {},
  debug: null,
  dateRange: null,
}; 

 
  
 
 
const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_PRODUCT_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case CREATE_PRODUCT_SUCCESS:
      return {
        ...state,
        loading: false,
        product: action.payload,
      };
      
    case CREATE_PRODUCT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
      
    case FETCH_CATEGORIES_REQUEST:
      return {
        ...state,
        categories: {
          ...state.categories,
          loading: true,
        },
      };
    case FETCH_CATEGORIES_SUCCESS:
      return {
        ...state,
        categories: {
          loading: false,
          data: action.payload,
          error: null,
        },
      };
    case FETCH_CATEGORIES_FAILURE:
      return {
        ...state,
        categories: {
          ...state.categories,
          loading: false,
          error: action.payload,
        },
      };

    case FETCH_PRODUCTS_REQUEST:
      return { ...state, loading: true };

    case FETCH_PRODUCTS_SUCCESS:
      return {
        ...state,
        products: action.payload,
        loading: false,
      };
      case FETCH_FILTERED_PRODUCTS_REQUEST: // Nuevo caso para la solicitud de búsqueda filtrada
      return {
        ...state,
        loading: true, // Establece loading en true cuando se inicia la búsqueda
        error: null,
      };

    case FETCH_FILTERED_PRODUCTS_SUCCESS:
      return {
        ...state,
        searchResults: action.payload,
        loading: false,
        error: null,
      };


    case FETCH_PRODUCTS_FAILURE:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case FETCH_PRODUCT_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_PRODUCT_SUCCESS:
      return {
        ...state,
        product: action.payload,
        loading: false,
      };
    case FETCH_PRODUCT_FAILURE:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case ADD_TO_CART:
      const existingItem = state.cart.items.find(
        (item) => item.id_product === action.payload.id_product
      );
      if (existingItem) {
        return {
          ...state,
          cart: {
            ...state.cart,
            items: state.cart.items.map((item) =>
              item.id_product === action.payload.id_product
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
            totalItems: state.cart.totalItems + 1,
            totalPrice: state.cart.totalPrice + action.payload.priceSell,
          },
        };
      } else {
        return {
          ...state,
          cart: {
            ...state.cart,
            items: [...state.cart.items, { ...action.payload, quantity: 1 }],
            totalItems: state.cart.totalItems + 1,
            totalPrice: state.cart.totalPrice + action.payload.priceSell,
          },
        };
      }
    case REMOVE_FROM_CART:
      const itemToRemove = state.cart.items.find(
        (item) => item.id_product === action.payload
      );
      if (!itemToRemove) return state;

      return {
        ...state,
        cart: {
          ...state.cart,
          items: state.cart.items.filter(
            (item) => item.id_product !== action.payload
          ),
          totalItems: state.cart.totalItems - itemToRemove.quantity,
          totalPrice:
            state.cart.totalPrice -
            itemToRemove.priceSell * itemToRemove.quantity,
        },
      };
    case INCREMENT_QUANTITY:
      return {
        ...state,
        cart: {
          ...state.cart,
          items: state.cart.items.map((item) =>
            item.id_product === action.payload
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
          totalItems: state.cart.totalItems + 1,
          totalPrice:
            state.cart.totalPrice +
            state.cart.items.find((item) => item.id_product === action.payload)
              .priceSell,
        },
      };
    case DECREMENT_QUANTITY:
      const itemToDecrement = state.cart.items.find(
        (item) => item.id_product === action.payload
      );
      if (itemToDecrement.quantity === 1) {
        return {
          ...state,
          cart: {
            ...state.cart,
            items: state.cart.items.filter(
              (item) => item.id_product !== action.payload
            ),
            totalItems: state.cart.totalItems - 1,
            totalPrice: state.cart.totalPrice - itemToDecrement.priceSell,
          },
        };
      }
      return {
        ...state,
        cart: {
          ...state.cart,
          items: state.cart.items.map((item) =>
            item.id_product === action.payload
              ? { ...item, quantity: item.quantity - 1 }
              : item
          ),
          totalItems: state.cart.totalItems - 1,
          totalPrice: state.cart.totalPrice - itemToDecrement.priceSell,
        },
      };
    case CLEAR_CART:
      return {
        ...state,
        cart: {
          items: [],
          totalItems: 0,
          totalPrice: 0,
        },
      };
    case ORDER_CREATE_REQUEST:
      return {
        ...state,
        order: {
          ...state.order,
          loading: true,
          success: false,
          error: null,
        },
      };
      case ORDER_CREATE_SUCCESS:
  console.log('>>> Reducer: ORDER_CREATE_SUCCESS - Received Payload:', action.payload);

  // Aquí el payload YA ES el objeto de la orden
  const orderDataFromPayload = action.payload;

  const newState = {
    ...state,
    order: {
      loading: false,
      success: true,
      order: orderDataFromPayload,
      error: null,
    },
  };
  console.log('>>> Reducer: ORDER_CREATE_SUCCESS - Returning New State:', JSON.stringify(newState.order));
  return newState;
    case ORDER_CREATE_FAIL:
      return {
        ...state,
        order: {
          ...state.order,
          loading: false,
          success: false,
          error: action.payload,
        },
      };

    case USER_LOGIN_REQUEST:
      return {
        ...state,
        userLogin: {
          ...state.userLogin,
          loading: true,
          error: null,
        },
      };
    case USER_LOGIN_SUCCESS:
      return {
        ...state,
        userLogin: {
          ...state.userLogin,
          loading: false,
          userInfo: action.payload,
          error: null,
        },
      };
    case USER_LOGIN_FAIL:
      return {
        ...state,
        userLogin: {
          ...state.userLogin,
          loading: false,
          error: action.payload,
        },
      };
    case USER_LOGOUT:
      return {
        ...state,
        userLogin: {
          ...state.userLogin,
          userInfo: null,
        },
      };
    case SET_SEARCH_TERM:
      return {
        ...state,
        searchTerm: action.payload,
      };
    case SET_PRICE_FILTER:
      return {
        ...state,
        priceFilter: action.payload,
      };
    case SET_CATEGORY_FILTER:
      return {
        ...state,
        categoryFilter: action.payload,
      };

      case CLEAR_ORDER_STATE:
        return {
          ...state,
          order: {
            loading: false,
            success: false,
            order: null,
            error: null,
          },
        };
    case FETCH_ORDERS_REQUEST:
      return {
        ...state,
        orders: {
          ...state.orders,
          loading: true,
          error: null,
        },
      };
    case FETCH_ORDERS_SUCCESS:
      return {
        ...state,
        orders: {
          loading: false,
          orders: action.payload,
          error: null,
        },
      };
    case FETCH_ORDERS_FAILURE:
      return {
        ...state,
        orders: {
          loading: false,
          orders: [],
          error: action.payload,
        },
      };
    case FETCH_ORDERBYID_REQUEST:
      return {
        ...state,
        orderById: {
          ...state.orderById,
          loading: true,
          error: null,
        },
      };

    case FETCH_ORDERBYID_SUCCESS:
      return {
        ...state,
        orderById: {
          loading: false,
          order: action.payload, // Verifica que action.payload contiene el objeto esperado
          error: null,
        },
      };

    case FETCH_ORDERBYID_FAILURE:
      return {
        ...state,
        orderById: {
          loading: false,
          order: {},
          error: action.payload,
        },
      };

    case FETCH_ALLS_ORDERS_REQUEST:
      return {
        ...state,
        ordersGeneral: {
          ...state.ordersGeneral,
          loading: true,
          error: null,
        },
      };
    case FETCH_ALLS_ORDERS_SUCCESS:
      return {
        ...state,
        ordersGeneral: {
          loading: false,
          orders: action.payload,
          error: null,
        },
      };
    case FETCH_ALLS_ORDERS_FAILURE:
      return {
        ...state,
        ordersGeneral: {
          loading: false,
          orders: [],
          error: action.payload,
        },
      };
    case UPDATE_ORDER_STATE_SUCCESS:
      // Actualiza el estado de una orden específica dentro de ordersGeneral.orders
      const updatedOrders = state.ordersGeneral.orders.map(
        (order) => order.id_orderDetail === action.payload.id_orderDetail
      );
      return {
        ...state,
        ordersGeneral: {
          ...state.ordersGeneral,
          orders: updatedOrders,
          error: null,
        },
      };

    case UPDATE_ORDER_STATE_FAILURE:
      return {
        ...state,
        ordersGeneral: {
          ...state.ordersGeneral,
          error: action.payload,
        },
      };
    case UPDATE_PRODUCT_REQUEST:
      return {
        ...state,
        updateProduct: {
          ...state.updateProduct,
          loading: true,
        },
      };
      case UPDATE_PRODUCT_SUCCESS:
  console.log("Reducer actualiza producto:", action.payload); // <-- LOG AQUÍ
  return {
    ...state,
    updateProduct: {
      ...state.updateProduct,
      loading: false,
      error: null,
      product: action.payload,
    },
    products: state.products.map(product =>
      product.id_product === action.payload.id_product
        ? { ...product, ...action.payload }
        : product
    ),
  };

    case UPDATE_PRODUCT_FAILURE:
      return {
        ...state,
        updateProduct: {
          ...state.updateProduct,
          loading: false,
          error: action.payload,
        },
      };
    case DELETE_PRODUCT_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case DELETE_PRODUCT_SUCCESS:
      return {
        ...state,
        loading: false,
        products: state.products.filter(
          (product) => product.id_product !== action.payload
        ),
      };
    case DELETE_PRODUCT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case CATEGORY_CREATE_REQUEST:
      return {
        ...state,
        categories: {
          ...state.categories,
          loading: true,
        },
      };
    case CATEGORY_CREATE_SUCCESS:
      return {
        ...state,
        categories: {
          ...state.categories,
          loading: false,
          data: [...state.categories.data, action.payload.data.category],
        },
      };
    case CATEGORY_CREATE_FAIL:
      return {
        ...state,
        categories: {
          ...state.categories,
          loading: false,
          error: action.payload,
        },
      };
    case SB_CREATE_REQUEST:
      return {
        ...state,
        subCategories: {
          ...state.subCategories,
          loading: true,
        },
      };
    case SB_CREATE_SUCCESS:
      return {
        ...state,
        subCategories: {
          ...state.subCategories,
          loading: false,
          data: Array.isArray(state.subCategories.data)
            ? [...state.subCategories.data, action.payload.data.sb]
            : [action.payload.data.sb],
        },
      };
    case SB_CREATE_FAIL:
      return {
        ...state,
        subCategories: {
          ...state.subCategories,
          loading: false,
          error: action.payload,
        },
      };
      case FETCH_LATEST_ORDER_REQUEST:
      return {
        ...state,
        latestOrder: {
          ...state.latestOrder,
          loading: true,
          error: null,
        },
      };
    case FETCH_LATEST_ORDER_SUCCESS:
      return {
        ...state,
        latestOrder: {
          loading: false,
          success: true,
          error: null,
          data: action.payload,
        },
      };
    case FETCH_LATEST_ORDER_FAILURE:
      return {
        ...state,
        latestOrder: {
          loading: false,
          success: false,
          error: action.payload,
          data: {},
        },
      };

    case FETCH_SB_REQUEST:
      return {
        ...state,
        subCategories: {
          ...state.subCategories,
          loading: true,
        },
      };
    case FETCH_SB_SUCCESS:
      return {
        ...state,
        subCategories: {
          loading: false,
          data: action.payload,
          error: null,
        },
      };
    case FETCH_SB_FAILURE:
      return {
        ...state,
        subCategories: {
          ...state.subCategories,
          loading: false,
          error: action.payload,
        },
      };
    case FETCH_USER_REQUEST:
      return {
        ...state,
        userTaxxa: {
          ...state.userTaxxa,
          loading: true,
          error: null,
        },
      };
    case FETCH_USER_SUCCESS:
      return {
        ...state,
        userTaxxa: {
          ...state.userTaxxa,
          loading: false,
          userInfo: action.payload,
          error: null,
        },
      };
    case FETCH_USER_FAILURE:
      return {
        ...state,
        userTaxxa: {
          ...state.userTaxxa,
          loading: false,
          userInfo: null,
          error: action.payload,
        },
      };

      case USER_REGISTER_REQUEST:
  return {
    ...state,
    userRegister: {
      ...state.userRegister,
      loading: true,
      success: false,
      error: null,
    },
  };

case USER_REGISTER_SUCCESS:
  return {
    ...state,
    userRegister: {
      ...state.userRegister,
      loading: false,
      userInfo: action.payload,
      error: null,
      success: true
    },
  };

case USER_REGISTER_FAIL:
  return {
    ...state,
    userRegister: {
      ...state.userRegister,
      loading: false,
      success: false,
      error: action.payload,
      userInfo: null,
    },
  };

    case FETCH_SELLER_REQUEST:
      return {
        ...state,
        sellerData: {
          ...state.sellerData,
          loading: true,
          error: null,
        },
      };
    case FETCH_SELLER_SUCCESS:
      return {
        ...state,
        sellerData: {
          ...state.sellerData,
          loading: false,
          data: action.payload,
          error: null,
        },
      };
    case FETCH_SELLER_FAILURE:
      return {
        ...state,
        sellerData: {
          ...state.sellerData,
          loading: false,
          error: action.payload,
        },
      };

    // Create Seller Data
    case CREATE_SELLER_REQUEST:
      return {
        ...state,
        sellerData: {
          ...state.sellerData,
          loading: true,
          error: null,
        },
      };
    case CREATE_SELLER_SUCCESS:
      return {
        ...state,
        sellerData: {
          ...state.sellerData,
          loading: false,
          data: action.payload,
          error: null,
        },
      };
    case CREATE_SELLER_FAILURE:
      return {
        ...state,
        sellerData: {
          ...state.sellerData,
          loading: false,
          error: action.payload,
        },
      };

    // Update Seller Data
    case UPDATE_SELLER_REQUEST:
      return {
        ...state,
        sellerData: {
          ...state.sellerData,
          loading: true,
          error: null,
        },
      };
    case UPDATE_SELLER_SUCCESS:
      return {
        ...state,
        sellerData: {
          ...state.sellerData,
          loading: false,
          data: action.payload,
          error: null,
        },
      };
    case UPDATE_SELLER_FAILURE:
      return {
        ...state,
        sellerData: {
          ...state.sellerData,
          loading: false,
          error: action.payload,
        },
      };
    case SEND_INVOICE_REQUEST:
      return {
        ...state,
        invoice: {
          ...state.invoice,
          loading: true,
          success: false,
          error: null,
        },
      };
    case SEND_INVOICE_SUCCESS:
      return {
        ...state,
        invoice: {
          ...state.invoice,
          loading: false,
          success: true,
          error: null,
        },
      };
    case SEND_INVOICE_FAILURE:
      return {
        ...state,
        invoice: {
          ...state.invoice,
          loading: false,
          success: false,
          error: action.payload,
        },
      };

  case CREATE_RECEIPT_REQUEST:
  return {
    ...state,
    receiptsLoading: true,
    receiptsError: null,
  };

case CREATE_RECEIPT_SUCCESS:
  return {
    ...state,
    receiptsLoading: false,
    receipts: [...state.receipts, action.payload],
    receiptsError: null,
  };

case CREATE_RECEIPT_FAILURE:
  return { 
    ...state, 
    receiptsLoading: false, 
    receiptsError: action.payload 
  };

case RESET_RECEIPT_STATE:
  return {
    ...state,
    receipts: [],
    receiptNumber: null,
    receiptsLoading: false, // ✅ Agregar esto también
    receiptsError: null,    // ✅ Agregar esto también
    orderById: {
      loading: false,
      error: null,
      order: {},
    },
    order: {
      loading: false,
      success: false,
      order: {},
      error: null,
    },
  };
    case FETCH_LATEST_RECEIPTS_REQUEST:
      return { ...state, loading: true, error: null };

    case FETCH_LATEST_RECEIPTS_SUCCESS:
      return { ...state, loading: false, receiptNumber: action.payload };

    case FETCH_LATEST_RECEIPTS_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case FETCH_RECEIPTS_REQUEST:
  return { 
    ...state, 
    receiptsLoading: true, 
    receiptsError: null 
  };

case FETCH_RECEIPTS_SUCCESS:
  return { 
    ...state, 
    receiptsLoading: false, 
    receipts: action.payload.receipts || action.payload,
    receiptsPagination: action.payload.total ? {
      total: action.payload.total,
      pages: action.payload.pages,
      currentPage: action.payload.currentPage
    } : state.receiptsPagination,
    receiptsError: null
  };

case FETCH_RECEIPTS_FAILURE:
  return { 
    ...state, 
    receiptsLoading: false, 
    receiptsError: action.payload 
  };

    case CREATE_EXPENSE_REQUEST:
      return {
        ...state,
        expenses: {
          ...state.invoice,
          loading: true,
          success: false,
          error: null,
        },
      };
    case CREATE_EXPENSE_SUCCESS:
      return {
        ...state,
        expenses: {
          ...state.invoice,
          loading: false,
          success: true,
          error: null,
        },
      };
    case CREATE_EXPENSE_FAILURE:
      return {
        ...state,
        expenses: {
          ...state.invoice,
          loading: false,
          success: false,
          error: action.payload,
        },
      };
      case GET_FILTERED_EXPENSES_REQUEST:
        return {
          ...state,
          expenses: {
            ...state.expenses,
            loading: true,
            success: false,
            error: null,
          },
        };
      case GET_FILTERED_EXPENSES_SUCCESS:
        return {
          ...state,
          expenses: {
            ...state.expenses,
            data: action.payload,
            loading: false,
            success: true,
            error: null,
          },
        };
      case GET_FILTERED_EXPENSES_FAILURE:
        return {
          ...state,
          expenses: {
            ...state.expenses,
            loading: false,
            success: false,
            error: action.payload,
          },
      };
    case DELETE_EXPENSE_REQUEST:
      return {
        ...state,
        expenses: {
          ...state.expenses,
          loading: true,
          error: null,
        },
      };
    case DELETE_EXPENSE_SUCCESS:
      return {
        ...state,
        expenses: {
          ...state.expenses,
          data: state.expenses.data.filter(
            (expense) => expense.id !== action.payload
          ),
          loading: false,
          success: true,
          error: null,
        },
      };
    case DELETE_EXPENSE_FAILURE:
      return {
        ...state,
        expenses: {
          ...state.expenses,
          loading: false,
          success: false,
          error: action.payload,
        },
      };
    case CREATE_RESERVATION_REQUEST:
      return { ...state, loading: true };
    case CREATE_RESERVATION_SUCCESS:
      return { ...state, loading: false, reservation: action.payload };
    case CREATE_RESERVATION_FAILURE:
      return { ...state, loading: false, error: action.payload };

      case FETCH_BALANCE_REQUEST:
        return {
          ...state,
          loading: true,
          error: null
        };

        case UPDATE_RESERVATION_REQUEST:
      return {
        ...state,
        reservation: {
          ...state.reservation,
          updateStatus: {
            loading: true,
            error: null,
            success: false
          }
        }
      };

    case UPDATE_RESERVATION_SUCCESS:
      return {
        ...state,
        reservation: {
          ...state.reservation,
          currentReservation: action.payload.reservation,
          updateStatus: {
            loading: false,
            error: null,
            success: true
          }
        }
      };

    case UPDATE_RESERVATION_FAILURE:
      return {
        ...state,
        reservation: {
          ...state.reservation,
          updateStatus: {
            loading: false,
            error: action.payload,
            success: false
          }
        }
      };
      case FETCH_BALANCE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    // ✅ FETCH_BALANCE_SUCCESS CORREGIDO
    case FETCH_BALANCE_SUCCESS:
      console.log('🟢 [REDUX] Balance data received:', action.payload);
      
      return {
        ...state,
        loading: false,
        error: null,
        // ✅ Mapear todos los campos del backend correctamente
        balance: action.payload.balance || 0,
        totalIncome: action.payload.totalIncome || 0,
        totalOnlineSales: action.payload.totalOnlineSales || 0,
        totalLocalSales: action.payload.totalLocalSales || 0,
        totalExpenses: action.payload.totalExpenses || 0,
        income: {
          online: action.payload.income?.online || [],
          local: action.payload.income?.local || []
        },
        expenses: {
          ...state.expenses,
          data: action.payload.expenses || []
        },
        // ✅ NUEVO: Campos adicionales del backend
        cashierTotals: action.payload.cashierTotals || {},
        paymentMethodBreakdown: {
          ...initialState.paymentMethodBreakdown,
          ...action.payload.paymentMethodBreakdown
        },
        debug: action.payload.debug || null,
        dateRange: action.payload.dateRange || null
      };

    case FETCH_BALANCE_FAILURE:
      console.log('🔴 [REDUX] Balance error:', action.payload);
      
      return {
        ...state,
        loading: false,
        error: action.payload
      };

        case GET_ALL_RESERVATIONS_REQUEST:
  return {
    ...state,
    reservation: {
      ...state.reservation,
      loading: true,
      error: null,
    },
  };

case GET_ALL_RESERVATIONS_SUCCESS:
  console.log('🟢 [REDUCER] GET_ALL_RESERVATIONS_SUCCESS payload:', action.payload);
  
  return {
    ...state,
    reservation: {
      ...state.reservation,
      list: action.payload.reservations || [], // ✅ CORREGIR: Acceder a reservations dentro del payload
      statistics: action.payload.statistics || {},
      total: action.payload.total || 0,
      filters: action.payload.filters || {},
      loading: false,
      error: null,
    },
  };

case GET_ALL_RESERVATIONS_FAILURE:
  return {
    ...state,
    reservation: {
      ...state.reservation,
      loading: false,
      error: action.payload,
      list: [], // ✅ Array vacío en caso de error
    },
  };

// ✅ CORREGIR APPLY_PAYMENT_SUCCESS
case APPLY_PAYMENT_SUCCESS:
  console.log('🟢 [REDUCER] APPLY_PAYMENT_SUCCESS payload:', action.payload);
  
  return {
    ...state,
    reservation: {
      ...state.reservation,
      loading: false,
      error: null,
      updateStatus: {
        loading: false,
        error: null,
        success: true
      },
      // ✅ Actualizar la reserva específica en la lista
      list: state.reservation.list.map((reservation) =>
        reservation.id_reservation === action.payload.id_reservation
          ? { ...reservation, ...action.payload }
          : reservation
      ),
    },
  };

case APPLY_PAYMENT_FAILURE:
  return {
    ...state,
    reservation: {
      ...state.reservation,
      updateStatus: {
        loading: false,
        error: action.payload,
        success: false,
      },
    },
  };
          case DELETE_RESERVATION_SUCCESS:
  console.log('🟢 [REDUCER] DELETE_RESERVATION_SUCCESS payload:', action.payload);
  
  return {
    ...state,
    reservation: {
      ...state.reservation,
      list: state.reservation.list.filter(
        (reservation) => reservation.id_reservation !== action.payload
      ),
      loading: false,
      error: null,
    },
  };

case DELETE_RESERVATION_FAILURE:
  return {
    ...state,
    reservation: {
      ...state.reservation,
      loading: false,
      error: action.payload,
    },
  };

  case UPDATE_RESERVATION_REQUEST:
  return {
    ...state,
    reservation: {
      ...state.reservation,
      updateStatus: {
        loading: true,
        error: null,
        success: false,
      },
    },
  };

case UPDATE_RESERVATION_SUCCESS:
  console.log('🟢 [REDUCER] UPDATE_RESERVATION_SUCCESS payload:', action.payload);
  
  return {
    ...state,
    reservation: {
      ...state.reservation,
      currentReservation: action.payload,
      updateStatus: {
        loading: false,
        error: null,
        success: true,
      },
      // ✅ También actualizar en la lista si existe
      list: state.reservation.list.map((reservation) =>
        reservation.id_reservation === action.payload.id_reservation
          ? { ...reservation, ...action.payload }
          : reservation
      ),
    },
  };

case UPDATE_RESERVATION_FAILURE:
  return {
    ...state,
    reservation: {
      ...state.reservation,
      updateStatus: {
        loading: false,
        error: action.payload,
        success: false,
      },
    },
  };
            case GET_CLIENT_ACCOUNT_BALANCE_REQUEST:
              return {
                ...state,
                clientAccountBalance: {
                  ...state.clientAccountBalance,
                  loading: true,
                  error: null,
                },
              };
            case GET_CLIENT_ACCOUNT_BALANCE_SUCCESS:
              return {
                ...state,
                clientAccountBalance: {
                  ...state.clientAccountBalance,
                  user: action.payload.user,
                  orderDetails: action.payload.orderDetails,
                  loading: false,
                  error: null,
                },
              };
            case GET_CLIENT_ACCOUNT_BALANCE_FAILURE:
              return {
                ...state,
                clientAccountBalance: {
                  ...state.clientAccountBalance,
                  loading: false,
                  error: action.payload,
                },
              };
              case GET_ALL_CLIENT_ACCOUNTS_REQUEST:
                return {
                  ...state,
                  allClientAccounts: {
                    ...state.allClientAccounts,
                    loading: true,
                    error: null,
                  },
                };
              case GET_ALL_CLIENT_ACCOUNTS_SUCCESS:
                return {
                  ...state,
                  allClientAccounts: {
                    ...state.allClientAccounts,
                    data: action.payload,
                    loading: false,
                    error: null,
                  },
                };
              case GET_ALL_CLIENT_ACCOUNTS_FAILURE:
                return {
                  ...state,
                  allClientAccounts: {
                    ...state.allClientAccounts,
                    loading: false,
                    error: action.payload,
                  },
                };
                case CREATE_SENDING_REQUEST:
  return {
    ...state,
    sending: {
      ...state.sending,
      loading: true,
      error: null
    }
  };

case CREATE_SENDING_SUCCESS:
  return {
    ...state,
    sending: {
      loading: false,
      error: null,
      data: action.payload
    }
  };

case CREATE_SENDING_FAILURE:
  return {
    ...state,
    sending: {
      ...state.sending,
      loading: false,
      error: action.payload
    }
  };
  case DELETE_ORDER_DETAIL_REQUEST:
    return {
      ...state,
      ordersGeneral: { // Actualiza el estado de carga dentro de ordersGeneral
        ...state.ordersGeneral,
        loading: true, // Indica que la operación de borrado está en curso
        error: null,   // Limpia errores previos
      },
    };

  case DELETE_ORDER_DETAIL_SUCCESS:
    // Filtra la orden eliminada del array 'orders' en 'ordersGeneral'
    const updatedOrdersList = state.ordersGeneral.orders.filter(
      (order) => order.id_orderDetail !== action.payload // action.payload es el ID de la orden borrada
    );
    return {
      ...state,
      ordersGeneral: {
        ...state.ordersGeneral,
        loading: false, // Termina el estado de carga
        orders: updatedOrdersList, // Actualiza la lista de órdenes
        error: null, // Limpia errores
      },
    };

  case DELETE_ORDER_DETAIL_FAILURE:
    return {
      ...state,
      ordersGeneral: { // Actualiza el estado de error dentro de ordersGeneral
        ...state.ordersGeneral,
        loading: false, // Termina el estado de carga
        error: action.payload, // Guarda el mensaje de error
      },
    };
    case REMOVE_PRODUCT_FROM_ORDER_REQUEST:
      return {
        ...state,
        ordersGeneral: {
          ...state.ordersGeneral,
          loading: true,
          error: null,
        },
      };
    case REMOVE_PRODUCT_FROM_ORDER_SUCCESS:
      return {
        ...state,
        ordersGeneral: {
          ...state.ordersGeneral,
          loading: false,
          // Opcional: puedes actualizar el array de órdenes si quieres quitar el producto del estado
          // Aquí solo se marca como éxito, pero puedes actualizar el detalle de la orden si lo necesitas
          error: null,
        },
      };
    case REMOVE_PRODUCT_FROM_ORDER_FAILURE:
      return {
        ...state,
        ordersGeneral: {
          ...state.ordersGeneral,
          loading: false,
          error: action.payload,
        },
      };

      case FETCH_ACCOUNT_SUMMARY_REQUEST:
        return {
          ...state,
          accountSummary: {
            loading: true,
            data: null,
            error: null,
          },
        };
      case FETCH_ACCOUNT_SUMMARY_SUCCESS:
        return {
          ...state,
          accountSummary: {
            loading: false,
            data: action.payload,
            error: null,
          },
        };
      case FETCH_ACCOUNT_SUMMARY_FAILURE:
        return {
          ...state,
          accountSummary: {
            loading: false,
            data: null,
            error: action.payload,
          },
        }; 
         case FETCH_ACCOUNT_SUMMARY_FAILURE:
      return {
        ...state,
        accountSummary: {
          loading: false,
          data: null,
          error: action.payload,
        },
      };
    
    // 🔍 BUSCAR RECIBO PARA DEVOLUCIÓN
    case SEARCH_RECEIPT_FOR_RETURN_REQUEST:
      return {
        ...state,
        returns: {
          ...state.returns,
          receiptSearch: {
            ...state.returns.receiptSearch,
            loading: true,
            error: null,
          },
        },
      };

    case SEARCH_RECEIPT_FOR_RETURN_SUCCESS:
      return {
        ...state,
        returns: {
          ...state.returns,
          receiptSearch: {
            loading: false,
            receipt: action.payload.receipt,
            canReturn: action.payload.canReturn,
            daysSinceReceipt: action.payload.daysSinceReceipt,
            error: null,
          },
        },
      };

    case SEARCH_RECEIPT_FOR_RETURN_FAILURE:
      return {
        ...state,
        returns: {
          ...state.returns,
          receiptSearch: {
            ...state.returns.receiptSearch,
            loading: false,
            error: action.payload,
          },
        },
      };

    // 🔄 PROCESAR DEVOLUCIÓN
    case PROCESS_RETURN_REQUEST:
      return {
        ...state,
        returns: {
          ...state.returns,
          processing: {
            ...state.returns.processing,
            loading: true,
            error: null,
            success: false,
          },
        },
      };

    case PROCESS_RETURN_SUCCESS:
      return {
        ...state,
        returns: {
          ...state.returns,
          processing: {
            loading: false,
            result: action.payload,
            error: null,
            success: true,
          },
        },
        // ✅ Si se creó un nuevo recibo, agregarlo a la lista
        receipts: action.payload.newReceipt 
          ? [...state.receipts, action.payload.newReceipt]
          : state.receipts,
      };

    case PROCESS_RETURN_FAILURE:
      return {
        ...state,
        returns: {
          ...state.returns,
          processing: {
            ...state.returns.processing,
            loading: false,
            error: action.payload,
            success: false,
          },
        },
      };

    // 📋 HISTORIAL DE DEVOLUCIONES
    case FETCH_RETURN_HISTORY_REQUEST:
      return {
        ...state,
        returns: {
          ...state.returns,
          history: {
            ...state.returns.history,
            loading: true,
            error: null,
          },
        },
      };

    case FETCH_RETURN_HISTORY_SUCCESS:
      return {
        ...state,
        returns: {
          ...state.returns,
          history: {
            loading: false,
            data: action.payload.returns,
            pagination: action.payload.pagination,
            stats: action.payload.stats,
            error: null,
          },
        },
      };

    case FETCH_RETURN_HISTORY_FAILURE:
      return {
        ...state,
        returns: {
          ...state.returns,
          history: {
            ...state.returns.history,
            loading: false,
            error: action.payload,
          },
        },
      };

    // 🧹 LIMPIAR ESTADO DE DEVOLUCIONES
    case CLEAR_RETURN_STATE:
      return {
        ...state,
        returns: {
          receiptSearch: {
            loading: false,
            receipt: null,
            canReturn: true,
            daysSinceReceipt: 0,
            error: null,
          },
          processing: {
            loading: false,
            result: null,
            error: null,
            success: false,
          },
          history: {
            loading: false,
            data: [],
            pagination: null,
            stats: [],
            error: null,
          },
        },
      };
      

    // 🔄 RESETEAR BÚSQUEDA DE RECIBO
    case RESET_RECEIPT_SEARCH:
      return {
        ...state,
        returns: {
          ...state.returns,
          receiptSearch: {
            loading: false,
            receipt: null,
            canReturn: true,
            daysSinceReceipt: 0,
            error: null,
          },
        },
      };  

      case GET_SERVER_TIME_REQUEST:
      return {
        ...state,
        serverTime: {
          ...state.serverTime,
          loading: true,
          error: null
        }
      };

    case GET_SERVER_TIME_SUCCESS:
      console.log('🟢 [REDUCER] GET_SERVER_TIME_SUCCESS payload:', action.payload);
      return {
        ...state,
        serverTime: {
          current: action.payload,
          loading: false,
          error: null,
          lastUpdate: Date.now()
        }
      };

    case GET_SERVER_TIME_FAILURE:
      return {
        ...state,
        serverTime: {
          ...state.serverTime,
          loading: false,
          error: action.payload
        }
      };

      case FETCH_STOCK_MOVEMENTS_REQUEST:
  return {
    ...state,
    stockMovements: {
      ...state.stockMovements,
      loading: true,
      error: null,
    },
  };

case FETCH_STOCK_MOVEMENTS_SUCCESS:
  return {
    ...state,
    stockMovements: {
      ...state.stockMovements,
      loading: false,
      error: null,
      // Si es listado global (movements es array y hay paginación)
      data: Array.isArray(action.payload.movements)
        ? action.payload.movements
        : action.payload.movements
          ? [action.payload.movements]
          : [],
      pagination: action.payload.pagination || state.stockMovements.pagination,
      filters: action.payload.filters || state.stockMovements.filters,
      // Si es detalle de producto
      product: action.payload.product || null,
      codigoBarra: action.payload.codigoBarra || null,
      stock: action.payload.stock || null,
      stock_initial: action.payload.stock_initial || null,
      stats: action.payload.stats || null,
    },
  };

case FETCH_STOCK_MOVEMENTS_FAILURE:
  return {
    ...state,
    stockMovements: {
      ...state.stockMovements,
      loading: false,
      error: action.payload,
    },
  };
          
    default:
      return state;
  }
};
export default rootReducer;
