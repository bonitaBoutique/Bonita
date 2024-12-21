/* eslint-disable no-case-declarations */
import {
  CREATE_PRODUCT_REQUEST,
  CREATE_PRODUCT_SUCCESS,
  CREATE_PRODUCT_FAILURE,
  FETCH_CATEGORIES_REQUEST,
  FETCH_CATEGORIES_SUCCESS,
  FETCH_CATEGORIES_FAILURE,
  FETCH_PRODUCTS_REQUEST,
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
  SEND_INVOICE_FAILURE
  
} from "../Actions/actions-type";

const initialState = {
  searchTerm: "",
  priceFilter: { min: null, max: null },
  categoryFilter: "",
  searchResults: [],
  loading: false,
  product: {},
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
    userInfo: localStorage.getItem("userInfo")
      ? JSON.parse(localStorage.getItem("userInfo"))
      : null,
    loading: false,
    error: null,
  },
  userLogin: {
    userInfo: localStorage.getItem("userInfo")
      ? JSON.parse(localStorage.getItem("userInfo"))
      : null,
    loading: false,
    error: null,
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

  order: {
    loading: false,
    success: false,
    error: null,
    order: {},
  },
  orders: {
    loading: false,
    orders: [],
    error: null,
  },
  orderById: {
    loading: false,
    error: null,
    order: {},
  },
  ordersGeneral: {
    loading: false,
    orders: [],
    error: null,
  },
  updateProduct: {
    loading: false,
    roduct: null,
    error: null,
  },
  latestOrder: {
    loading: false,
    success: false,
    error: null,
    data: {},
  },
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
            totalPrice: state.cart.totalPrice + action.payload.price,
          },
        };
      } else {
        return {
          ...state,
          cart: {
            ...state.cart,
            items: [...state.cart.items, { ...action.payload, quantity: 1 }],
            totalItems: state.cart.totalItems + 1,
            totalPrice: state.cart.totalPrice + action.payload.price,
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
            state.cart.totalPrice - itemToRemove.price * itemToRemove.quantity,
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
              .price,
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
            totalPrice: state.cart.totalPrice - itemToDecrement.price,
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
          totalPrice: state.cart.totalPrice - itemToDecrement.price,
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
      return {
        ...state,
        order: {
          ...state.order,
          loading: false,
          success: true,
          order: action.payload,
          error: null,
        },
      };
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
            order: action.payload,  // Verifica que action.payload contiene el objeto esperado
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
  return {
    ...state,
    products: state.products.map((product) =>
      product.id_product === action.payload.id_product
        ? { ...product, ...action.payload } // Solo actualiza el producto correspondiente
        : product // Los demás productos permanecen iguales
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
          ...state.latestOrder,
          loading: false,
          success: true,
          data: action.payload.data,
        },
      };
    case FETCH_LATEST_ORDER_FAILURE:
      return {
        ...state,
        latestOrder: {
          ...state.latestOrder,
          loading: false,
          error: action.payload,
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
        userTaxxa: {
          ...state.userTaxxa,
          loading: true,
          error: null,
        },
      };
    case USER_REGISTER_SUCCESS:
      return {
        ...state,
        userTaxxa: {
          ...state.userTaxxa,
          loading: false,
          userInfo: action.payload,
          error: null,
        },
      };
    case USER_REGISTER_FAIL:
      return {
        ...state,
        userTaxxa: {
          ...state.userTaxxa,
          loading: false,
          error: action.payload,
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
  

    default:
      return state;
  }
};
export default rootReducer;
