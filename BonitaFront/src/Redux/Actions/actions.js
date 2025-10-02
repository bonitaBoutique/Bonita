import { BASE_URL } from "../../Config";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Swal from "sweetalert2";

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
  PAYMENT_INTENT_INIT_REQUEST,
  PAYMENT_INTENT_INIT_SUCCESS,
  PAYMENT_INTENT_INIT_FAIL,
  FETCH_PAYMENT_INTENTS_REQUEST,
  FETCH_PAYMENT_INTENTS_SUCCESS,
  FETCH_PAYMENT_INTENTS_FAILURE,
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
  FETCH_FILTERED_PRODUCTS_SUCCESS,
  FETCH_FILTERED_PRODUCTS_REQUEST,
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
  FETCH_BALANCE_REQUEST,
  FETCH_BALANCE_SUCCESS,
  FETCH_BALANCE_FAILURE,
  UPDATE_RESERVATION_REQUEST,
  UPDATE_RESERVATION_SUCCESS,
  UPDATE_RESERVATION_FAILURE,
  GET_ALL_RESERVATIONS_REQUEST,
  GET_ALL_RESERVATIONS_SUCCESS,
  GET_ALL_RESERVATIONS_FAILURE,
  DELETE_RESERVATION_REQUEST,
  DELETE_RESERVATION_SUCCESS,
  DELETE_RESERVATION_FAILURE,
  APPLY_PAYMENT_REQUEST,
  APPLY_PAYMENT_SUCCESS,
  APPLY_PAYMENT_FAILURE,
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
  FETCH_SENDINGTRACKING_REQUEST,
FETCH_SENDINGTRACKING_SUCCESS,
FETCH_SENDINGTRACKING_FAILURE,
DELETE_ORDER_DETAIL_REQUEST,
DELETE_ORDER_DETAIL_SUCCESS,
DELETE_ORDER_DETAIL_FAILURE,
REMOVE_PRODUCT_FROM_ORDER_REQUEST,
REMOVE_PRODUCT_FROM_ORDER_SUCCESS,
REMOVE_PRODUCT_FROM_ORDER_FAILURE,
FETCH_ACCOUNT_SUMMARY_REQUEST,
FETCH_ACCOUNT_SUMMARY_SUCCESS,
FETCH_ACCOUNT_SUMMARY_FAILURE,
SEARCH_RECEIPT_FOR_RETURN_REQUEST,
  SEARCH_RECEIPT_FOR_RETURN_SUCCESS,
  SEARCH_RECEIPT_FOR_RETURN_FAILURE,
  PROCESS_RETURN_REQUEST,
  PROCESS_RETURN_SUCCESS,
  PROCESS_RETURN_FAILURE,
  FETCH_RETURN_HISTORY_REQUEST,
  FETCH_RETURN_HISTORY_SUCCESS,
  FETCH_RETURN_HISTORY_FAILURE,
  FETCH_RETURNS_REQUEST,
  FETCH_RETURNS_SUCCESS,
  FETCH_RETURNS_FAILURE,
  CLEAR_RETURN_STATE,
  RESET_RECEIPT_SEARCH,
  FETCH_STOCK_MOVEMENTS_REQUEST,
  FETCH_STOCK_MOVEMENTS_SUCCESS,
  FETCH_STOCK_MOVEMENTS_FAILURE,
  CREATE_STOCK_MOVEMENT_REQUEST,
  CREATE_STOCK_MOVEMENT_SUCCESS,
  CREATE_STOCK_MOVEMENT_FAILURE,
  GET_SERVER_TIME_REQUEST,
  GET_SERVER_TIME_SUCCESS,
  GET_SERVER_TIME_FAILURE
  
} from "./actions-type";

// export const verifyUserByDocument = (document) => async (dispatch) => {
//   try {
//     console.log('🔍 [ACTION] Verificando usuario con documento:', document);
    
//     const response = await axios.get(`${BASE_URL}/users/verify-document/${document}`);
    
//     if (response.data.success) {
//       return {
//         success: true,
//         data: response.data.data,
//         message: 'Usuario encontrado'
//       };
//     } else {
//       return {
//         success: false,
//         data: null,
//         message: 'Usuario no encontrado'
//       };
//     }
//   } catch (error) {
//     console.error('❌ [ACTION] Error verificando usuario:', error);
    
//     if (error.response?.status === 404) {
//       return {
//         success: false,
//         data: null,
//         message: 'Usuario no registrado'
//       };
//     }
    
//     throw error;
//   }
// };

export const getServerTime = () => async (dispatch) => {
  try {
    dispatch({ type: GET_SERVER_TIME_REQUEST });
    
    console.log('🕒 [REDUX] Solicitando hora del servidor...');
    
    const { data } = await axios.get(`${BASE_URL}/system/server-time`);
    
    console.log('🕒 [REDUX] Respuesta del servidor:', data);
    
    dispatch({
      type: GET_SERVER_TIME_SUCCESS,
      payload: data.data
    });
    
    return data.data;
  } catch (error) {
    console.error('❌ [REDUX] Error obteniendo hora del servidor:', error);
    dispatch({
      type: GET_SERVER_TIME_FAILURE,
      payload: error.response?.data?.message || error.message
    });
    throw error;
  }
};

export const createProduct = (productData) => async (dispatch) => {
  dispatch({ type: CREATE_PRODUCT_REQUEST });

  try {
    // Enviar los datos como JSON (sin necesidad de multipart/form-data)
    await axios.post(`${BASE_URL}/product/createProducts`, productData, {
      headers: {
        "Content-Type": "application/json", // Correcto para enviar datos JSON
      },
    });

    dispatch({ type: CREATE_PRODUCT_SUCCESS });
  } catch (error) {
    dispatch({ type: CREATE_PRODUCT_FAILURE, payload: error.message });
  }
};

export const fetchCategories = () => async (dispatch) => {
  dispatch({ type: FETCH_CATEGORIES_REQUEST });

  try {
    const response = await axios.get(`${BASE_URL}/category/`);
    dispatch({
      type: FETCH_CATEGORIES_SUCCESS,
      payload: response.data.data.categories,
    });
  } catch (error) {
    dispatch({ type: FETCH_CATEGORIES_FAILURE, payload: error.message });
  }
};

export const fetchProducts = () => async (dispatch) => {
  dispatch({ type: FETCH_PRODUCTS_REQUEST });

  try {
    const response = await axios.get(`${BASE_URL}/product/`);
    console.log("Respuesta de la API:", response.data);

    if (!response.data?.message?.products) {
      throw new Error('No se encontraron productos');
    }

    dispatch({
      type: FETCH_PRODUCTS_SUCCESS,
      payload: response.data.message.products,
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    dispatch({
      type: FETCH_PRODUCTS_FAILURE,
      payload: error.message || "Error al cargar los productos",
    });
    Swal.fire('Error', 'Error al cargar los productos', 'error');
  }
};

export const fetchProductById = (id_product) => async (dispatch) => {
  dispatch({ type: FETCH_PRODUCT_REQUEST });

  try {
    const response = await axios.get(`${BASE_URL}/product/${id_product}`);

    // Acceso correcto a "product"
    const product = response.data.message.product;

    dispatch({
      type: FETCH_PRODUCT_SUCCESS,
      payload: product,
    });
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    dispatch({ type: FETCH_PRODUCT_FAILURE, payload: error.message });
  }
};

export const addToCart = (id_product) => ({
  type: ADD_TO_CART,
  payload: id_product,
});

export const removeFromCart = (id_product) => ({
  type: REMOVE_FROM_CART,
  payload: id_product,
});

export const clearCart = () => ({
  type: CLEAR_CART,
});

export const incrementQuantity = (productId) => ({
  type: INCREMENT_QUANTITY,
  payload: productId,
});

export const decrementQuantity = (productId) => ({
  type: DECREMENT_QUANTITY,
  payload: productId,
});

export const initPaymentIntent = (orderData) => async (dispatch) => {
  dispatch({ type: PAYMENT_INTENT_INIT_REQUEST });

  try {
    const response = await axios.post(`${BASE_URL}/payments/wompi/init`, orderData);
    const payload = response.data?.message;
    const paymentIntent = payload?.paymentIntent;
    const wompi = payload?.wompi;

    dispatch({
      type: PAYMENT_INTENT_INIT_SUCCESS,
      payload: { paymentIntent, wompi },
    });

    return { paymentIntent, wompi };
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message;
    dispatch({
      type: PAYMENT_INTENT_INIT_FAIL,
      payload: errorMessage,
    });

    throw new Error(errorMessage);
  }
};

export const fetchPaymentIntents = (params = {}) => async (dispatch) => {
  const defaultParams = { page: 1, limit: 20 };
  const combinedParams = { ...defaultParams, ...params };

  const normalizedParams = {
    ...combinedParams,
    page: Number(combinedParams.page) || defaultParams.page,
    limit: Number(combinedParams.limit) || defaultParams.limit,
  };

  const filteredParams = Object.fromEntries(
    Object.entries(normalizedParams).filter(([, value]) =>
      value !== undefined && value !== null && value !== ""
    )
  );

  try {
    dispatch({
      type: FETCH_PAYMENT_INTENTS_REQUEST,
      payload: { filters: filteredParams },
    });

    const { data } = await axios.get(`${BASE_URL}/payments/wompi`, {
      params: filteredParams,
    });

    const paymentIntents = data?.message?.paymentIntents ?? [];
    const pagination = data?.message?.pagination ?? {};
    const timestamp = new Date().toISOString();

    dispatch({
      type: FETCH_PAYMENT_INTENTS_SUCCESS,
      payload: {
        paymentIntents,
        pagination,
        filters: filteredParams,
        timestamp,
      },
    });

    return { paymentIntents, pagination };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message?.error ||
      error.response?.data?.message ||
      error.message;

    dispatch({
      type: FETCH_PAYMENT_INTENTS_FAILURE,
      payload: errorMessage,
    });

    throw new Error(errorMessage);
  }
};

export const createOrder = (orderData) => async (dispatch) => {
  dispatch({ type: ORDER_CREATE_REQUEST });
  try {
    const response = await axios.post(`${BASE_URL}/order/create/`, orderData);
    console.log("AXIOS DATA:", response.data); // <-- Debe mostrar { status, message: { order }, data }
    const order = response.data.message?.order; // <-- Corrige aquí
    dispatch({
      type: ORDER_CREATE_SUCCESS,
      payload: order, // <-- SOLO la orden
    });
    return order; // <-- SOLO la orden
  } catch (error) {
    dispatch({
      type: ORDER_CREATE_FAIL,
      payload: error.response?.data?.error || error.message,
    });
    throw error;
  }
};


export const fetchLatestOrder = () => async (dispatch) => {
  dispatch({ type: FETCH_LATEST_ORDER_REQUEST });
  try {
    const response = await fetch(`${BASE_URL}/order?latest=true`); // Adjust the API endpoint as needed
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    if (data.error) {
      throw new Error(data.message || 'Error fetching latest order');
    }
    dispatch({ type: FETCH_LATEST_ORDER_SUCCESS, payload: data.message.orders[0] });
  } catch (error) {
    dispatch({ type: FETCH_LATEST_ORDER_FAILURE, payload: error.message });
  }
};


export const clearOrderState = () => ({
  type: CLEAR_ORDER_STATE,
});

export const registerUser = (userData) => async (dispatch) => {
  try {
    dispatch({ type: USER_REGISTER_REQUEST });

    // ✅ LIMPIAR DATOS CON VALORES POR DEFECTO CORRECTOS
    const cleanUserData = {
      n_document: userData.n_document.toString().trim(),
      first_name: userData.first_name.trim(),
      last_name: userData.last_name.trim(),
      gender: userData.gender,
      email: userData.email.toLowerCase().trim(),
      password: userData.password,
      phone: userData.phone.trim(),
      city: userData.city?.trim() || 'Bogotá',
      wdoctype: userData.wdoctype || 'CC',
      role: 'User',
      // ✅ CAMPOS TAXXA CON VALORES POR DEFECTO DEL MODELO
      wlegalorganizationtype: 'person',
      scostumername: `${userData.first_name} ${userData.last_name}`.trim(),
      stributaryidentificationkey: 'ZZ', // ✅ USAR VALOR POR DEFECTO DEL ENUM
      sfiscalresponsibilities: 'R-99-PN',
      sfiscalregime: '48' // ✅ CORREGIR: usar '48' en lugar de 'ordinario'
    };

    // ✅ DEBUG: COMPARAR CON EL BODY QUE FUNCIONA EN INSOMNIA
    console.log('📤 [REDUX] Datos que va a enviar el frontend:', JSON.stringify(cleanUserData, null, 2));
    
    // ✅ DEBUG: VERIFICAR QUE TODOS LOS CAMPOS ENUM TENGAN VALORES VÁLIDOS
    console.log('🔧 [DEBUG] Verificación de campos ENUM:', {
      wdoctype: cleanUserData.wdoctype,
      role: cleanUserData.role,
      wlegalorganizationtype: cleanUserData.wlegalorganizationtype,
      stributaryidentificationkey: cleanUserData.stributaryidentificationkey,
      sfiscalresponsibilities: cleanUserData.sfiscalresponsibilities,
      sfiscalregime: cleanUserData.sfiscalregime
    });

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // ✅ DEBUG: VERIFICAR URL COMPLETA
    const fullUrl = `${BASE_URL}/auth/register`;
    console.log('📡 [REDUX] URL completa:', fullUrl);
    console.log('📡 [REDUX] BASE_URL:', BASE_URL);

    const response = await axios.post(fullUrl, cleanUserData, config);
    
    console.log('📥 [REDUX] Respuesta exitosa del servidor:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });

    // ✅ MANEJAR RESPUESTA EXITOSA
    if (response.status === 200 || response.status === 201) {
      let responseData = response.data;

      dispatch({
        type: USER_REGISTER_SUCCESS,
        payload: responseData,
      });

      // ✅ MOSTRAR ÉXITO
      Swal.fire({
        icon: 'success',
        title: '¡Usuario registrado!',
        text: `${cleanUserData.first_name} ${cleanUserData.last_name} se ha registrado exitosamente`,
        timer: 3000,
        showConfirmButton: false
      });

      console.log('✅ [REDUX] Usuario registrado exitosamente');
      return responseData;
    } else {
      throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
    }

  } catch (error) {
    console.error('❌ [REDUX] Error completo en registro:', error);
    
    // ✅ DEBUG: MOSTRAR DETALLES COMPLETOS DEL ERROR
    if (error.response) {
      console.error('📋 [DEBUG] Detalles completos del error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
    }
    
    let errorMessage = 'Error desconocido en el registro';

    if (error.response) {
      switch (error.response.status) {
        case 500:
          errorMessage = 'Error interno del servidor. Verifica los datos e inténtalo de nuevo.';
          break;
        case 400:
          errorMessage = error.response.data?.message || error.response.data || 'Datos inválidos enviados al servidor';
          break;
        case 409:
          errorMessage = 'El usuario ya existe con ese documento o email';
          break;
        case 422:
          errorMessage = 'Error de validación en los datos enviados';
          break;
        default:
          errorMessage = error.response.data?.message || error.response.data || `Error ${error.response.status}`;
      }
    } else if (error.request) {
      errorMessage = 'Error de conexión. Verifica tu internet.';
    } else {
      errorMessage = error.message || 'Error en la configuración de la petición';
    }

    dispatch({
      type: USER_REGISTER_FAIL,
      payload: errorMessage,
    });

    // ✅ MOSTRAR ERROR
    Swal.fire({
      icon: 'error',
      title: 'Error en el registro',
      text: errorMessage,
    });

    console.error('❌ [REDUX] Error final:', errorMessage);
    throw new Error(errorMessage);
  }
};

export const login = (email, password) => async (dispatch) => {
  try {
    dispatch({ type: USER_LOGIN_REQUEST });

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const { data } = await axios.post(
      `${BASE_URL}/auth/login`,
      { email, password },
      config
    );

    if (!data?.message?.token) {
      throw new Error('Token no recibido del servidor');
    }

    // Decodifica el token para obtener el rol del usuario
    const decodedToken = jwtDecode(data.message.token);
    const userInfo = {
      token: data.message.token,
      role: decodedToken.role,
      n_document: data.message.n_document,
      message: data.message.message,
    };

    dispatch({
      type: USER_LOGIN_SUCCESS,
      payload: userInfo,
    });

    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    
    Swal.fire('Éxito', 'Inicio de sesión exitoso', 'success');

  } catch (error) {
    console.error('Login error:', error);
    dispatch({
      type: USER_LOGIN_FAIL,
      payload: error.response?.data?.message || 'Error al iniciar sesión',
    });
    Swal.fire('Error', 'Error al iniciar sesión', 'error');
  }
};

export const logout = () => (dispatch) => {
  localStorage.removeItem("userInfo");
  dispatch({ type: USER_LOGOUT });
};

export const setSearchTerm = (term) => ({
  type: SET_SEARCH_TERM,
  payload: term,
});

export const setPriceFilter = (price) => ({
  type: SET_PRICE_FILTER,
  payload: price,
});

export const setCategoryFilter = (category) => ({
  type: SET_CATEGORY_FILTER,
  payload: category,
});

export const fetchFilteredProducts =
  (searchTerm, priceFilter, categoryName, isOffer) => async (dispatch) => {
    dispatch({ type: FETCH_FILTERED_PRODUCTS_REQUEST });

    try {
      let url = `${BASE_URL}/product/search?search=${searchTerm}`; // Usa el searchTerm directamente

      if (priceFilter && priceFilter.min !== null && priceFilter.max !== null) {
        url += `&minPrice=${priceFilter.min}&maxPrice=${priceFilter.max}`;
      }

      if (categoryName) {
        url += `&categoryName=${categoryName}`;
      }
      if (isOffer) {
        url += `&isOffer=true`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!data.error && data.message.products) {
        dispatch({ type: FETCH_FILTERED_PRODUCTS_SUCCESS, payload: data.message.products });
      } else {
        dispatch({ type: FETCH_PRODUCTS_FAILURE, payload: data.message });
      }
    } catch (error) {
      dispatch({ type: FETCH_PRODUCTS_FAILURE, payload: error.message });
    }
  };

export const fetchOrdersByDocument = (n_document) => async (dispatch) => {
  try {
    dispatch({ type: FETCH_ORDERS_REQUEST });

    const { data } = await axios.get(`${BASE_URL}/order/${n_document}`);

    dispatch({ type: FETCH_ORDERS_SUCCESS, payload: data.message.orders });
  } catch (error) {
    dispatch({
      type: FETCH_ORDERS_FAILURE,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const fetchOrdersByIdOrder = (id_orderDetail) => async (dispatch) => {
  const MAX_RETRIES = 3;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      dispatch({ type: FETCH_ORDERBYID_REQUEST });
      console.log("Fetching order by ID:", id_orderDetail);

      const { data } = await axios.get(
        `${BASE_URL}/order/products/${id_orderDetail}`
      );
      console.log("Response data:", data);

      if (!data || !data.message || !data.message.orderDetail) {
        throw new Error('Order detail not received from server');
      }

      const orderDetail = data.message.orderDetail;

      dispatch({ type: FETCH_ORDERBYID_SUCCESS, payload: orderDetail });
      console.log("Dispatched success:", orderDetail);
      return orderDetail; // Retornar el orderDetail
    } catch (error) {
      attempt++;
      console.error(`Error fetching order (Intento ${attempt}):`, error.message);

      if (attempt >= MAX_RETRIES) {
        dispatch({
          type: FETCH_ORDERBYID_FAILURE,
          payload:
            error.response && error.response.data.message
              ? error.response.data.message
              : error.message,
        });
      }
    }
  }
};

export const fetchAllOrders = () => async (dispatch) => {
  try {
    dispatch({ type: FETCH_ALLS_ORDERS_REQUEST });

    const res = await axios.get(`${BASE_URL}/order`);
    console.log("API response data:", res.data);

    dispatch({ 
      type: FETCH_ALLS_ORDERS_SUCCESS, 
      payload: res.data.message.orders 
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    dispatch({
      type: FETCH_ALLS_ORDERS_FAILURE,
      payload: error.message,
    });
    Swal.fire('Error', 'Error al obtener las órdenes', 'error');
  }
};

export const updateOrderState =
  (id_orderDetail, newState, trackingNumber, amount, discount) => async (dispatch) => {
    try {
      const { data } = await axios.put(`${BASE_URL}/order/${id_orderDetail}`, {
        state_order: newState,
        trackingNumber,
        amount,     // <-- agrega amount
        discount,   // <-- agrega discount
      });

      dispatch({ type: UPDATE_ORDER_STATE_SUCCESS, payload: data.orderDetail });
    } catch (error) {
      dispatch({ type: UPDATE_ORDER_STATE_FAILURE, payload: error.message });
    }
  };

// eslint-disable-next-line no-unused-vars
export const updateProduct =
  (id, productData) => async (dispatch, getState) => {
    dispatch({ type: UPDATE_PRODUCT_REQUEST });

    try {
      console.log("Datos enviados al backend:", productData); // <-- LOG ANTES DE ENVIAR
      const response = await axios.put(
        `${BASE_URL}/product/updateProducts/${id}`,
        productData
      );

      const updatedProduct = response.data.data.product;
      console.log("Producto actualizado recibido del backend:", updatedProduct); // <-- LOG DESPUÉS DE RECIBIR

      dispatch({
        type: UPDATE_PRODUCT_SUCCESS,
        payload: updatedProduct, // Producto actualizado desde el backend
      });
    } catch (error) {
      dispatch({ type: UPDATE_PRODUCT_FAILURE, payload: error.message });
    }
  };

export const deleteProduct = (id_product) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_PRODUCT_REQUEST });

    await axios.delete(`${BASE_URL}/product/deleteProducts/${id_product}`);

    dispatch({ type: DELETE_PRODUCT_SUCCESS, payload: id_product });
  } catch (error) {
    dispatch({
      type: DELETE_PRODUCT_FAILURE,
      payload: error.message,
    });
  }
};

export const createCategory = (name_category) => async (dispatch) => {
  try {
    dispatch({ type: CATEGORY_CREATE_REQUEST });

    // Fetch categories first
    const categories = await dispatch(fetchCategories());

    // Check if categories is defined and not null
    if (categories && categories.length) {
      // Check if category already exists
      const categoryExists = categories.some(
        (category) =>
          category.name_category.toLowerCase() === name_category.toLowerCase()
      );

      if (categoryExists) {
        dispatch({
          type: CATEGORY_CREATE_FAIL,
          payload: "Category already exists",
        });
        return { type: CATEGORY_CREATE_FAIL, error: "Category already exists" };
      }
    }

    const { data } = await axios.post(`${BASE_URL}/category/createCategory`, {
      name_category,
    });

    dispatch({ type: CATEGORY_CREATE_SUCCESS, payload: data });
    return { type: CATEGORY_CREATE_SUCCESS };
  } catch (error) {
    dispatch({
      type: CATEGORY_CREATE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
    return {
      type: CATEGORY_CREATE_FAIL,
      error: error.response ? error.response.data.message : error.message,
    };
  }
};

export const createSB = (name_SB) => async (dispatch) => {
  try {
    dispatch({ type: SB_CREATE_REQUEST });

    // Fetch categories first
    const subCategories = await dispatch(fetchSB());

    // Check if categories is defined and not null
    if (subCategories && subCategories.length) {
      // Check if category already exists
      const subCategoryExists = subCategories.some(
        (sb) => sb.name_SB.toLowerCase() === name_SB.toLowerCase()
      );

      if (subCategoryExists) {
        dispatch({ type: SB_CREATE_FAIL, payload: "SB already exists" });
        return { type: SB_CREATE_FAIL, error: "SB already exists" };
      }
    }

    const { data } = await axios.post(`${BASE_URL}/sb/createSB`, { name_SB });

    dispatch({ type: SB_CREATE_SUCCESS, payload: data });
    return { type: SB_CREATE_SUCCESS };
  } catch (error) {
    dispatch({
      type: SB_CREATE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
    return {
      type: SB_CREATE_FAIL,
      error: error.response ? error.response.data.message : error.message,
    };
  }
};

export const fetchSB = () => async (dispatch) => {
  dispatch({ type: FETCH_SB_REQUEST });

  try {
    const response = await axios.get(`${BASE_URL}/sb/`);
    dispatch({
      type: FETCH_SB_SUCCESS,
      payload: response.data.data.subCategories,
    });
  } catch (error) {
    dispatch({ type: FETCH_SB_FAILURE, payload: error.message });
  }
};

export const fetchUserByDocument = (n_document) => async (dispatch) => {
  dispatch({ type: FETCH_USER_REQUEST });

  try {
    const response = await fetch(`${BASE_URL}/user/${n_document}`);
    const data = await response.json();
    console.log(data);

    if (data && data.message) {
      dispatch({ type: FETCH_USER_SUCCESS, payload: data.message });
    } else {
      dispatch({ type: FETCH_USER_FAILURE, payload: "Usuario no encontrado" });
    }
  } catch (error) {
    dispatch({ type: FETCH_USER_FAILURE, payload: error.message });
  }
};

export const fetchSellerData = (dni) => async (dispatch) => {
  dispatch({ type: FETCH_SELLER_REQUEST });
  console.log('🔍 Iniciando búsqueda de vendedor con DNI:', dni);

  try {
    // Cambiar la URL para usar path parameter en lugar de query parameter
    const url = `${BASE_URL}/seller/${dni}`;
    console.log(`📡 Haciendo petición a:`, url);
    
    const response = await axios.get(url);
    console.log('✅ Respuesta recibida:', response.data);

    if (response.data && response.data.data) {
      console.log('📦 Datos del vendedor encontrados:', response.data.data);
      dispatch({ 
        type: FETCH_SELLER_SUCCESS, 
        payload: response.data.data 
      });
      return response.data.data;
    } else {
      console.warn('⚠️ No se encontraron datos del vendedor');
      throw new Error('No se encontraron datos del vendedor');
    }

  } catch (error) {
    console.error('❌ Error al obtener datos del vendedor:', error);
    console.error('Detalles del error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        "Error al obtener los datos del comercio";

    dispatch({ 
      type: FETCH_SELLER_FAILURE, 
      payload: errorMessage 
    });

    // Mostrar alerta de error
    Swal.fire({
      icon: 'error',
      title: 'Error al cargar datos del vendedor',
      text: errorMessage,
    });

    throw error;
  }
};

export const createSellerData = (sellerData) => async (dispatch) => {
  dispatch({ type: CREATE_SELLER_REQUEST });

  try {
    const response = await fetch(`${BASE_URL}/seller/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sellerData),
    });
    const data = await response.json();

    if (response.ok) {
      dispatch({ type: CREATE_SELLER_SUCCESS, payload: data.data });
      Swal.fire({
        icon: 'success',
        title: 'Datos del comercio creados',
        text: 'Los datos del comercio se han creado correctamente.',
      });
    } else {
      dispatch({
        type: CREATE_SELLER_FAILURE,
        payload: data.error || "Error al crear los datos del comercio",
      });
      Swal.fire({
        icon: 'error',
        title: 'Error al crear los datos del comercio',
        text: data.error || "Ha ocurrido un error al crear los datos del comercio.",
      });
    }
  } catch (error) {
    dispatch({ type: CREATE_SELLER_FAILURE, payload: error.message });
    Swal.fire({
      icon: 'error',
      title: 'Error al crear los datos del comercio',
      text: error.message || "Ha ocurrido un error inesperado.",
    });
  }
};

export const updateSellerData = (id, sellerData) => async (dispatch) => {
  dispatch({ type: UPDATE_SELLER_REQUEST });

  try {
    const response = await fetch(`${BASE_URL}/seller/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sellerData),
    });
    const data = await response.json();

    if (response.ok) {
      dispatch({ type: UPDATE_SELLER_SUCCESS, payload: data.data });
      return true; // Retorna éxito
    } else {
      dispatch({
        type: UPDATE_SELLER_FAILURE,
        payload: data.error || "Error al actualizar los datos del comercio",
      });
      return false; // Retorna fallo
    }
  } catch (error) {
    dispatch({ type: UPDATE_SELLER_FAILURE, payload: error.message });
    return false; // Retorna fallo
  }
};

export const sendInvoice = (payload) => async (dispatch) => {
  dispatch({ type: SEND_INVOICE_REQUEST });
  
  try {
    console.log("📋 Datos recibidos:", payload);

    // Extraer correctamente invoiceData del payload anidado
    const invoiceData = payload.invoiceData;
    
    if (!invoiceData) {
      throw new Error('No se proporcionaron datos de factura');
    }

    // Validar si sorderreference existe y es válido
    if (!invoiceData.sorderreference) {
      console.error('ID de orden inválido:', invoiceData.sorderreference);
      throw new Error('ID de orden no válido');
    }

    console.log("🔍 Verificando orden:", invoiceData.sorderreference);

    // Verificar si la orden ya está facturada
    const orderDetail = await axios.get(`${BASE_URL}/order/products/${invoiceData.sorderreference}`);
    
    if (!orderDetail.data?.message?.orderDetail) {
      throw new Error('No se encontraron detalles de la orden');
    }

    // Crear el objeto con la estructura correcta
    const formattedInvoice = {
      wVersionUBL: invoiceData.wVersionUBL,
      wenvironment: "prod", // Cambiar a prod
      wdocumenttype: invoiceData.wdocumenttype,
      wdocumenttypecode: invoiceData.wdocumenttypecode,
      scustomizationid: invoiceData.scustomizationid,
      wcurrency: invoiceData.wcurrency,
      sdocumentprefix: invoiceData.sdocumentprefix,
      sdocumentsuffix: invoiceData.sdocumentsuffix,
      tissuedate: invoiceData.tissuedate,
      tduedate: invoiceData.tduedate,
      wpaymentmeans: invoiceData.wpaymentmeans,
      wpaymentmethod: invoiceData.wpaymentmethod,
      nlineextensionamount: invoiceData.nlineextensionamount,
      ntaxexclusiveamount: invoiceData.ntaxexclusiveamount,
      ntaxinclusiveamount: invoiceData.ntaxinclusiveamount,
      npayableamount: invoiceData.npayableamount,
      sorderreference: invoiceData.sorderreference,
      snotes: invoiceData.snotes || "",
      snotetop: invoiceData.snotetop || "",
      jextrainfo: invoiceData.jextrainfo,
      jdocumentitems: invoiceData.jdocumentitems,
      jbuyer: invoiceData.jbuyer,
      jseller: {
        wlegalorganizationtype: 'company',
        sfiscalresponsibilities: "O-47",
        sdocno: "901832769",
        sdoctype: "NIT",
        ssellername: "BONITA BOUTIQUE YP S.A.S",
        ssellerbrand: "BONITA BOUTIQUE CUMARAL",
        scontactperson: "ROSALES TAPIA YANIRIS PATRICIA",
        saddresszip: "501021",
        wdepartmentcode: "50",
        wtowncode: "50226",
        scityname: "CUMARAL",
        jcontact: {
          selectronicmail: "bonitaboutiquecumaral@gmail.com",
          jregistrationaddress: {
            wdepartmentcode: "50",
            sdepartmentname: "META",
            scityname: "CUMARAL",
            saddressline1: "CL 12 17 51 LC 3 Y 4",
            scountrycode: "CO",
            wprovincecode: "50226",
            szip: "501021"
          }
        }
      }
    };

    console.log("📦 Datos formateados:", JSON.stringify(formattedInvoice, null, 2));

    const response = await axios.post(
      `${BASE_URL}/taxxa/sendInvoice`, 
      { invoiceData: formattedInvoice },
      {
        headers: {
          "Content-Type": "application/json",
        }
      }
    );

    if (response.status === 200) {
      dispatch({ type: SEND_INVOICE_SUCCESS, payload: response.data });
      Swal.fire({
        icon: 'success',
        title: 'Factura enviada con éxito',
        text: 'La factura se ha generado correctamente'
      });
      return response.data;
    }

    throw new Error(response.data.message || 'Error al enviar la factura');

  } catch (error) {
    console.error("❌ Error detallado:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      stack: error.stack
    });

    dispatch({ 
      type: SEND_INVOICE_FAILURE, 
      payload: error.message 
    });

    Swal.fire({
      icon: 'error',
      title: 'Error al enviar la factura',
      text: error.message
    });

    throw error;
  }
};


export const createReceipt = (receipt) => async (dispatch) => {
  dispatch({ type: CREATE_RECEIPT_REQUEST });
  console.log("Dispatching createReceipt with data:", receipt);

  try {
    // Intenta crear el recibo
    const response = await axios.post(`${BASE_URL}/caja/createReceipt`, receipt, {
      headers: { "Content-Type": "application/json" },
    });

    // Si la petición fue exitosa (status 2xx), Axios no lanza error
    const data = response.data;
    dispatch({ type: CREATE_RECEIPT_SUCCESS, payload: data });
    // Opcional: podrías retornar data si necesitas la respuesta en el componente
     return data;

  } catch (error) {
    // Axios lanza un error para respuestas no exitosas (4xx, 5xx)
    console.error("Error creating receipt:", error.response || error);

    // Extrae el mensaje de error más específico del backend si está disponible
    const message =
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message // Mensaje específico del backend
        : error.message; // Mensaje genérico del error

    dispatch({
      type: CREATE_RECEIPT_FAILURE,
      payload: message, // Envía el mensaje de error al reducer
    });

    // Opcional: Re-lanzar el error si quieres que el componente sepa que falló
     throw new Error(message);
  }
};
export const resetReceiptState = () => ({
  type: RESET_RECEIPT_STATE,
});

export const fetchLatestReceipt = () => async (dispatch) => {
  dispatch({ type: FETCH_LATEST_RECEIPTS_REQUEST });
  try {
    // Llamada al backend para obtener el último recibo
    const { data } = await axios.get(`${BASE_URL}/caja/lastReceipt`);

    // Si no hay recibos, el backend devuelve un objeto con receipt_number
    const receiptNumber = data.receipt_number || 1001;  // Usamos 1001 si es el primer recibo

    dispatch({
      type: FETCH_LATEST_RECEIPTS_SUCCESS,
      payload: receiptNumber,  // Guardamos el número de recibo en el estado
    });
  } catch (error) {
    dispatch({
      type: FETCH_LATEST_RECEIPTS_FAILURE,
      payload: error.response?.data || error.message,
    });
  }
};

export const fetchAllReceipts = (options = {}) => async (dispatch) => {
  try {
    dispatch({ type: FETCH_RECEIPTS_REQUEST });

    // ✅ OPCIONES CONFIGURABLES
    const {
      all = true,           // Por defecto traer todos los recibos
      page = 1,
      limit = 50,
      cashier_document,
      date_from,
      date_to
    } = options;

    // ✅ CONSTRUIR PARÁMETROS DE CONSULTA
    const queryParams = new URLSearchParams();
    
    if (all) {
      queryParams.append('all', 'true');
    } else {
      queryParams.append('page', page);
      queryParams.append('limit', limit);
    }
    
    if (cashier_document) {
      queryParams.append('cashier_document', cashier_document);
    }
    
    if (date_from) {
      queryParams.append('date_from', date_from);
    }
    
    if (date_to) {
      queryParams.append('date_to', date_to);
    }

    const url = `${BASE_URL}/caja/receipts?${queryParams.toString()}`;
    console.log("📡 Fetching receipts from:", url);

    const { data } = await axios.get(url);
    console.log("📥 API response data:", data);

    // ✅ MANEJAR RESPUESTA EXITOSA
    if (data && data.receipts) {
      dispatch({ 
        type: FETCH_RECEIPTS_SUCCESS, 
        payload: {
          receipts: data.receipts,
          total: data.total || data.receipts.length,
          pages: data.pages || 1,
          currentPage: data.currentPage || 1,
          message: data.message || `${data.receipts.length} recibos cargados`
        }
      });

      console.log(`✅ ${data.receipts.length} recibos cargados exitosamente`);
    } else {
      // ✅ MANEJAR RESPUESTA VACÍA
      console.warn("⚠️ No se encontraron recibos en la respuesta");
      dispatch({ 
        type: FETCH_RECEIPTS_SUCCESS, 
        payload: {
          receipts: [],
          total: 0,
          pages: 1,
          currentPage: 1,
          message: "No se encontraron recibos"
        }
      });
    }

  } catch (error) {
    console.error("❌ Error fetching receipts:", error);
    console.error("❌ Error details:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method
      }
    });

    // ✅ EXTRAER MENSAJE DE ERROR ESPECÍFICO
    let errorMessage = 'Error desconocido al obtener recibos';
    
    if (error.response) {
      switch (error.response.status) {
        case 404:
          errorMessage = 'Endpoint de recibos no encontrado';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        case 401:
          errorMessage = 'No autorizado para acceder a los recibos';
          break;
        default:
          errorMessage = error.response.data?.message || 
                        error.response.data?.error || 
                        `Error ${error.response.status}`;
      }
    } else if (error.request) {
      errorMessage = 'Error de conexión al servidor';
    } else {
      errorMessage = error.message || 'Error en la configuración de la petición';
    }

    dispatch({
      type: FETCH_RECEIPTS_FAILURE,
      payload: errorMessage
    });

    // ✅ MOSTRAR ERROR AL USUARIO
    Swal.fire({
      title: '❌ Error al obtener recibos',
      html: `
        <div class="text-left">
          <p class="font-medium text-red-600 mb-2">${errorMessage}</p>
          <div class="text-sm text-gray-600">
            <p>Posibles causas:</p>
            <ul class="list-disc list-inside mt-1">
              <li>Problemas de conexión a internet</li>
              <li>Servidor temporalmente inaccesible</li>
              <li>Error en la configuración del backend</li>
            </ul>
          </div>
        </div>
      `,
      icon: 'error',
      confirmButtonText: '🔄 Reintentar',
      showCancelButton: true,
      cancelButtonText: '❌ Cerrar'
    }).then((result) => {
      if (result.isConfirmed) {
        // ✅ REINTENTAR AUTOMÁTICAMENTE
        dispatch(fetchAllReceipts(options));
      }
    });
  }
};

// ✅ ACTION ESPECÍFICO PARA OBTENER RECIBOS PAGINADOS
export const fetchReceiptsPaginated = (page = 1, limit = 50, filters = {}) => async (dispatch) => {
  return dispatch(fetchAllReceipts({ 
    all: false, 
    page, 
    limit, 
    ...filters 
  }));
};

// ✅ ACTION ESPECÍFICO PARA OBTENER TODOS LOS RECIBOS
export const fetchAllReceiptsComplete = (filters = {}) => async (dispatch) => {
  return dispatch(fetchAllReceipts({ 
    all: true, 
    ...filters 
  }));
};

// ✅ ACTION ESPECÍFICO PARA OBTENER RECIBOS POR CAJERO
export const fetchReceiptsByCashier = (cashier_document, options = {}) => async (dispatch) => {
  return dispatch(fetchAllReceipts({ 
    cashier_document, 
    ...options 
  }));
};

// ✅ ACTION ESPECÍFICO PARA OBTENER RECIBOS POR FECHA
export const fetchReceiptsByDateRange = (date_from, date_to, options = {}) => async (dispatch) => {
  return dispatch(fetchAllReceipts({ 
    date_from, 
    date_to, 
    ...options 
  }));
};

export const createExpense = (expenseData) => async (dispatch) => {
  dispatch({ type: CREATE_EXPENSE_REQUEST });

  try {
    const response = await fetch(`${BASE_URL}/expense/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expenseData),
    });
    const data = await response.json();

    if (response.ok) {
      dispatch({ type: CREATE_EXPENSE_SUCCESS, payload: data.data });
    } else {
      dispatch({
        type: CREATE_EXPENSE_FAILURE,
        payload: data.error || "Error al crear EL gasto",
      });
    }
  } catch (error) {
    dispatch({ type: CREATE_EXPENSE_FAILURE, payload: error.message });
  }
};
export const getFilteredExpenses = (filters) => async (dispatch) => {
  dispatch({ type: GET_FILTERED_EXPENSES_REQUEST });
  try {
    const response = await axios.get(`${BASE_URL}/expense/filter`, { params: filters });
    console.log('Filtered expenses response:', response.data);

    // ✅ CORRECCIÓN: Extraer expenses del objeto respuesta
    let expenses = [];
    if (Array.isArray(response.data)) {
      // Si response.data es directamente un array
      expenses = response.data;
    } else if (response.data && Array.isArray(response.data.expenses)) {
      // Si response.data es un objeto con propiedad expenses
      expenses = response.data.expenses;
    } else if (response.data && Array.isArray(response.data.data)) {
      // Si response.data es un objeto con propiedad data
      expenses = response.data.data;
    }
    
    console.log('🔍 Expenses extracted for Redux:', expenses);
    console.log('🔍 Expenses array length:', expenses.length);

    dispatch({ 
      type: GET_FILTERED_EXPENSES_SUCCESS, 
      payload: expenses 
    });
  } catch (error) {
    console.error('Error filtering expenses:', error);
    dispatch({ 
      type: GET_FILTERED_EXPENSES_FAILURE, 
      payload: error.message 
    });
    Swal.fire("Error", "No se pudieron filtrar los gastos", "error");
  }
};

  
  
  export const deleteExpense = (id) => async (dispatch) => {
    try {
      dispatch({ type: DELETE_EXPENSE_REQUEST });
  
      await axios.delete(`${BASE_URL}/expense/delete/${id}`);
  
      dispatch({ type: DELETE_EXPENSE_SUCCESS, payload: id });
    } catch (error) {
      dispatch({
        type: DELETE_EXPENSE_FAILURE,
        payload: error.message,
      });
    }
  };

export const createReservation = (orderId, reservationData) => async (dispatch) => {
  try {
    dispatch({ type: CREATE_RESERVATION_REQUEST });

    console.log('🔵 [FRONT] Creando reserva para orden:', orderId);
    console.log('🔵 [FRONT] Datos de reserva:', reservationData);

    // ✅ USAR BASE_URL EN LUGAR DE URL HARDCODEADA
    const fullUrl = `${BASE_URL}/order/reservations/${orderId}`;
    console.log('🔵 [FRONT] URL completa:', fullUrl);

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(reservationData)
    });

    console.log('🔵 [FRONT] Status de respuesta:', response.status);
    console.log('🔵 [FRONT] Headers de respuesta:', [...response.headers.entries()]);

    // ✅ OBTENER TEXTO DE RESPUESTA PARA DEBUG
    const responseText = await response.text();
    console.log('🔵 [FRONT] Respuesta raw:', responseText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
        console.log('🔴 [FRONT] Error parseado:', errorData);
      } catch (parseError) {
        console.log('🔴 [FRONT] Error parseando JSON:', parseError);
        errorData = { message: responseText };
      }
      
      // ✅ EXTRAER MENSAJE DE ERROR CORRECTAMENTE
      let errorMessage = 'Error desconocido';
      
      if (errorData.message) {
        if (typeof errorData.message === 'string') {
          errorMessage = errorData.message;
        } else if (errorData.message.error) {
          errorMessage = errorData.message.error;
        } else if (errorData.message.message) {
          errorMessage = errorData.message.message;
        } else {
          errorMessage = JSON.stringify(errorData.message);
        }
      } else if (errorData.error) {
        errorMessage = errorData.error;
      } else if (responseText) {
        errorMessage = responseText;
      }
      
      console.log('🔴 [FRONT] Mensaje de error final:', errorMessage);
      
      // ✅ CREAR ERROR CON MENSAJE ESPECÍFICO
      const finalError = new Error(`HTTP ${response.status}: ${errorMessage}`);
      finalError.status = response.status;
      finalError.data = errorData;
      
      throw finalError;
    }

    // ✅ PARSEAR RESPUESTA EXITOSA
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('🔴 [FRONT] Error parseando respuesta exitosa:', parseError);
      throw new Error('Respuesta del servidor no válida');
    }
    
    console.log('🟢 [FRONT] Reserva creada exitosamente:', data);

    dispatch({ type: CREATE_RESERVATION_SUCCESS, payload: data });
    return data;
  } catch (error) {
    console.error('🔴 [FRONT] Error completo al crear reserva:', {
      message: error.message,
      stack: error.stack,
      status: error.status,
      data: error.data,
      orderId,
      reservationData
    });
    
    dispatch({ type: CREATE_RESERVATION_FAILURE, payload: error.message });
    throw error;
  }
};

  export const fetchBalance = (filters) => async (dispatch) => {
    try {
      dispatch({ type: FETCH_BALANCE_REQUEST });
  
      // Construir los parámetros de consulta
      const queryParams = new URLSearchParams(filters).toString();
  
      // Realizar la solicitud a la API
      const { data } = await axios.get(`${BASE_URL}/balance?${queryParams}`);
  
      // Despachar la acción de éxito con los datos recibidos
      dispatch({ 
        type: FETCH_BALANCE_SUCCESS, 
        payload: data 
      });
    } catch (error) {
      // Manejar errores y despachar la acción de error
      dispatch({ 
        type: FETCH_BALANCE_FAILURE, 
        payload: error.message 
      });
    }
  };

  export const updateReservation = (id_reservation, updateData) => async (dispatch) => {
    try {
      dispatch({ type: UPDATE_RESERVATION_REQUEST });
      
      console.log('Updating reservation:', id_reservation, updateData);
      
      const { data } = await axios.put(`${BASE_URL}/order/reservations/${id_reservation}`, updateData);
  
      dispatch({ type: UPDATE_RESERVATION_SUCCESS, payload: data });
      Swal.fire('Success', 'Reservation updated successfully', 'success');
      return data;
    } catch (error) {
      dispatch({ type: UPDATE_RESERVATION_FAILURE, payload: error.message });
      Swal.fire('Error', 'Failed to update reservation', 'error');
      throw error;
    }
  };

export const getAllReservations = (filters = {}) => async (dispatch) => {
  try {
    dispatch({ type: GET_ALL_RESERVATIONS_REQUEST });
    
    console.log('🔵 [REDUX] Fetching reservations with filters:', filters);
    
    // ✅ Si no hay fechas en filtros, obtener fecha del servidor
    let finalFilters = { ...filters };
    
    if (!filters.fechaInicio && !filters.fechaFin) {
      try {
        console.log('🕒 [REDUX] Obteniendo fecha del servidor para filtros...');
        const serverTime = await dispatch(getServerTime());
        finalFilters = {
          ...filters,
          fechaInicio: serverTime.date,
          fechaFin: serverTime.date
        };
        console.log('🕒 [REDUX] Usando fecha del servidor:', serverTime.date);
      } catch (serverTimeError) {
        console.warn('⚠️ [REDUX] Error obteniendo fecha del servidor, usando filtros originales');
      }
    }
    
    const queryParams = new URLSearchParams();
    
    Object.keys(finalFilters).forEach(key => {
      if (finalFilters[key] !== '' && finalFilters[key] !== null && finalFilters[key] !== undefined) {
        queryParams.append(key, finalFilters[key]);
      }
    });
    
    const queryString = queryParams.toString();
    const url = queryString ? `${BASE_URL}/reservation/all?${queryString}` : `${BASE_URL}/reservation/all`;
    
    console.log('🔵 [REDUX] Request URL:', url);
    
    const { data } = await axios.get(url);
    
    console.log('🔵 [REDUX] Response data:', data);
    
    const reservations = data.message?.reservations || [];
    const statistics = data.message?.statistics || {};
    const total = data.message?.total || 0;
    const appliedFilters = data.message?.filters || {};
    
    console.log('🔵 [REDUX] Parsed reservations:', reservations);
    
    dispatch({
      type: GET_ALL_RESERVATIONS_SUCCESS,
      payload: {
        reservations,
        statistics,
        total,
        filters: appliedFilters
      }
    });
    
  } catch (error) {
    console.error('🔴 [REDUX] Error fetching reservations:', error);
    dispatch({
      type: GET_ALL_RESERVATIONS_FAILURE,
      payload: error.response?.data?.message || error.message
    });
  }
};
  
  export const applyPayment = (id_reservation, amount) => async (dispatch) => {
    dispatch({ type: APPLY_PAYMENT_REQUEST });
    try {
      const res = await axios.post(`${BASE_URL}/reservation/applyPayments/${id_reservation}`, { amount });
      dispatch({
        type: APPLY_PAYMENT_SUCCESS,
        payload: res.data.reservation,
      });
    } catch (error) {
      dispatch({
        type: APPLY_PAYMENT_FAILURE,
        payload: error.message,
      });
    }
  };

  export const deleteReservation = (id_reservation) => async (dispatch) => {
    dispatch({ type: DELETE_RESERVATION_REQUEST });
    try {
      await axios.delete(`${BASE_URL}/reservation/${id_reservation}`);
      dispatch({
        type: DELETE_RESERVATION_SUCCESS,
        payload: id_reservation,
      });
      Swal.fire('Success', 'Reservation deleted successfully', 'success');
    } catch (error) {
      dispatch({
        type: DELETE_RESERVATION_FAILURE,
        payload: error.message,
      });
      Swal.fire('Error', 'Failed to delete reservation', 'error');
    }
  };

  export const getClientAccountBalance = (n_document) => async (dispatch) => {
    dispatch({ type: GET_CLIENT_ACCOUNT_BALANCE_REQUEST });
    try {
      const res = await axios.get(`${BASE_URL}/userAccount/${n_document}`);
      console.log('Client Account Balance Response:', res.data);
      dispatch({
        type: GET_CLIENT_ACCOUNT_BALANCE_SUCCESS,
        payload: {
          user: res.data.message.user,
          orderDetails: res.data.message.orderDetails,
          giftCards: res.data.message.giftCards || [] // ✅ AGREGAR: GiftCards
        },
      });
    } catch (error) {
      console.error('Error fetching client account balance:', error);
      dispatch({
        type: GET_CLIENT_ACCOUNT_BALANCE_FAILURE,
        payload: error.message,
      });
      Swal.fire('Error', 'Error al obtener el saldo del cliente', 'error');
    }
  };

  
  export const getAllClientAccounts = () => async (dispatch) => {
    dispatch({ type: GET_ALL_CLIENT_ACCOUNTS_REQUEST });
    try {
      const res = await axios.get(`${BASE_URL}/userAccount`);
      console.log('All Client Accounts Response:', res.data);
      dispatch({
        type: GET_ALL_CLIENT_ACCOUNTS_SUCCESS,
        payload: res.data.message.users, // Update path to match API response
      });
    } catch (error) {
      console.error('Error fetching all client accounts:', error);
      dispatch({
        type: GET_ALL_CLIENT_ACCOUNTS_FAILURE,
        payload: error.message,
      });
      Swal.fire('Error', 'Error al obtener las cuentas de clientes', 'error');
    }
  };



  export const createSending = (sendingData) => {
    return async (dispatch) => {
      dispatch({ type: CREATE_SENDING_REQUEST });
  
      try {
        const response = await axios.post(
          `${BASE_URL}/mipaquete/create-sending`,
          sendingData,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
  
        console.log('Create Sending Response:', response.data);
  
        dispatch({
          type: CREATE_SENDING_SUCCESS,
          payload: response.data.data
        });
  
        // Show success message
        Swal.fire({
          title: 'Éxito',
          text: 'Envío creado correctamente',
          icon: 'success'
        });
  
        return response.data;
  
      } catch (error) {
        console.error('Create Sending Error:', error);
        
        dispatch({
          type: CREATE_SENDING_FAILURE,
          payload: error.response?.data?.message || 'Error al crear el envío'
        });
  
        // Show error message
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.message || 'Error al crear el envío',
          icon: 'error'
        });
  
        throw error;
      }
    };
  };
export const getSendingTracking = () => async (dispatch) => {
  dispatch({ type: FETCH_SENDINGTRACKING_REQUEST });

  try {
    const response = await axios.get(`${BASE_URL}/mipaquete/tracking`);
    console.log("Respuesta de la API:", response.data);

    if (!response.data?.message?.products) {
      throw new Error('No se encontraron productos');
    }

    dispatch({
      type: FETCH_SENDINGTRACKING_SUCCESS,
      payload: response.data.message.products,
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    dispatch({
      type: FETCH_SENDINGTRACKING_FAILURE,
      payload: error.message || "Error al cargar los productos",
    });
    Swal.fire('Error', 'Error al cargar los productos', 'error');
  }
};


export const deleteOrderDetail = (id_orderDetail) => async (dispatch) => {
  dispatch({ type: DELETE_ORDER_DETAIL_REQUEST });

  try {
    // Llama al endpoint DELETE que creaste en el backend
    // Ajusta la URL si tu endpoint es diferente (ej: /order/details/:id)
    const response = await axios.delete(`${BASE_URL}/order/${id_orderDetail}`);

    // Verifica si la respuesta es exitosa (204 No Content o 200 OK)
    if (response.status === 204 || response.status === 200) {
      dispatch({
        type: DELETE_ORDER_DETAIL_SUCCESS,
        payload: id_orderDetail, // Envía el ID para que el reducer lo elimine del estado
      });
      // No mostramos Swal aquí, lo manejamos en el componente que llama a la acción
      // después de la confirmación inicial.
    } else {
      // Si el backend devuelve un status diferente pero no lanza error
      throw new Error(response.data?.message || 'Error inesperado al borrar la orden');
    }

  } catch (error) {
    console.error("Error deleting order detail:", error);
    const errorMessage = error.response?.data?.error || error.message || "No se pudo borrar la orden.";
    dispatch({
      type: DELETE_ORDER_DETAIL_FAILURE,
      payload: errorMessage,
    });
    // No mostramos Swal aquí tampoco, el componente manejará el error.
    throw new Error(errorMessage); // Re-lanzamos el error para que el componente lo capture
  }
};

export const removeProductFromOrder = (id_orderDetail, id_product) => async (dispatch) => {
  dispatch({ type: REMOVE_PRODUCT_FROM_ORDER_REQUEST });
  try {
    const { data } = await axios.post(
      `${BASE_URL}/order/remove-product`,
      { id_orderDetail, id_product }
    );
    dispatch({ type: REMOVE_PRODUCT_FROM_ORDER_SUCCESS, payload: { id_orderDetail, id_product } });
    Swal.fire('Éxito', 'Producto eliminado de la orden', 'success');
    return data;
  } catch (error) {
    dispatch({
      type: REMOVE_PRODUCT_FROM_ORDER_FAILURE,
      payload: error.response?.data || 'No se pudo eliminar el producto',
    });
    Swal.fire('Error', error.response?.data || 'No se pudo eliminar el producto', 'error');
    throw error;
  }
};

export const fetchAccountSummary = (n_document) => async (dispatch) => {
  dispatch({ type: FETCH_ACCOUNT_SUMMARY_REQUEST });
  try {
    const res = await axios.get(`${BASE_URL}/userAccount/resumenDeCuenta/${n_document}`);
    dispatch({
      type: FETCH_ACCOUNT_SUMMARY_SUCCESS,
      payload: res.data, // Puedes ajustar según la estructura de tu backend
    });
  } catch (error) {
    dispatch({
      type: FETCH_ACCOUNT_SUMMARY_FAILURE,
      payload: error.message,
    });

  }
}

// ✅ AGREGAR AL FINAL DEL ARCHIVO, DESPUÉS DE fetchAccountSummary

// ===========================================
// 🆕 ACTIONS PARA SISTEMA DE DEVOLUCIONES
// ===========================================

// ✅ 1. BUSCAR RECIBO PARA DEVOLUCIÓN

export const searchReceiptForReturn = (receiptId) => async (dispatch) => {
  try {
    console.log("🔍 Buscando recibo:", receiptId);
    
    const response = await axios.get(`${BASE_URL}/product/receipt-for-return/${receiptId}`);
    
    console.log("📥 Respuesta del API:", response.data);
    
    if (response.data.status === "success" && response.data.data.success) {
      return {
        success: true,
        receipt: response.data.data.receipt
      };
    } else {
      throw new Error("Recibo no encontrado");
    }
  } catch (error) {
    console.error("💥 Error buscando recibo:", error);
    throw error;
  }
};

// ✅ 2. PROCESAR DEVOLUCIÓN COMPLETA
export const processReturn = (returnData) => async (dispatch) => {
  try {
    dispatch({ type: PROCESS_RETURN_REQUEST });

    console.log("🔄 Procesando devolución:", returnData);

    const response = await axios.post(`${BASE_URL}/product/process-return`, returnData, {
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      timeout: 30000
    });

    console.log("📥 Response status:", response.status);
    console.log("📥 Response completa:", response.data);

    const data = response.data;

    // ✅ VERIFICAR ESTRUCTURA DE RESPUESTA EXITOSA
    if (data.status === "success" || data.success) {
      const responseData = data.data || data;
      
      dispatch({ 
        type: PROCESS_RETURN_SUCCESS, 
        payload: responseData 
      });

      // Si se creó un nuevo recibo, actualizar la lista de recibos
      if (responseData.newReceipt) {
        dispatch(fetchAllReceipts());
      }

      // ✅ MEJORAR MENSAJE DE ÉXITO SEGÚN EL TIPO DE DEVOLUCIÓN
      let successTitle = '✅ Devolución Procesada';
      let successDetails = [];

      if (responseData.actionRequired) {
        const { actionRequired } = responseData;
        
        switch (actionRequired.type) {
          case 'additional_payment':
            successTitle = '💳 Pago Adicional Requerido';
            successDetails.push(`Cliente debe pagar: $${actionRequired.amount?.toLocaleString("es-CO")}`);
            break;
          case 'credit_issued':
            successTitle = '🎁 Crédito Emitido';
            successDetails.push(`Crédito a favor del cliente: $${actionRequired.amount?.toLocaleString("es-CO")}`);
            break;
          case 'no_action':
            successTitle = '🔄 Intercambio Exitoso';
            successDetails.push('Intercambio realizado sin diferencia de precio');
            break;
          default:
            successDetails.push(actionRequired.message || 'Procesado correctamente');
        }
      }

      // ✅ AGREGAR INFORMACIÓN ADICIONAL
      if (responseData.stockUpdated) {
        successDetails.push('📦 Inventario actualizado correctamente');
      }

      if (responseData.returnedProducts?.length > 0) {
        successDetails.push(`📤 ${responseData.returnedProducts.length} producto(s) devuelto(s)`);
      }

      if (responseData.newProducts?.length > 0) {
        successDetails.push(`📥 ${responseData.newProducts.length} producto(s) nuevo(s)`);
      }

      // ✅ MOSTRAR SWEETALERT CON INFORMACIÓN COMPLETA
      Swal.fire({
        title: successTitle,
        html: `
          <div class="text-left">
            <div class="mb-4">
              <p class="font-medium text-green-600">La devolución se ha procesado exitosamente</p>
            </div>
            ${successDetails.length > 0 ? `
              <div class="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                <ul class="list-disc list-inside space-y-1 text-sm">
                  ${successDetails.map(detail => `<li>${detail}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            ${responseData.calculations ? `
              <div class="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <p class="font-medium text-blue-800 mb-2">💰 Resumen de Cálculos</p>
                <div class="text-sm text-blue-700 space-y-1">
                  <p>• Total devuelto: $${responseData.calculations.totalReturned?.toLocaleString("es-CO")}</p>
                  <p>• Total nuevo: $${responseData.calculations.totalNewPurchase?.toLocaleString("es-CO")}</p>
                  <p>• Diferencia: $${responseData.calculations.difference?.toLocaleString("es-CO")}</p>
                </div>
              </div>
            ` : ''}
          </div>
        `,
        icon: 'success',
        timer: 6000,
        timerProgressBar: true,
        showConfirmButton: true,
        confirmButtonText: '👍 Entendido',
        allowOutsideClick: false
      });

      return responseData;
    } else {
      // ✅ MANEJAR RESPUESTAS DE ERROR DEL SERVIDOR
      const errorMessage = data.message || data.error || 'Error desconocido del servidor';
      console.error("❌ Error en respuesta del servidor:", data);
      throw new Error(errorMessage);
    }

  } catch (error) {
    console.error("❌ Error completo procesando devolución:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      }
    });

    // ✅ EXTRAER INFORMACIÓN DETALLADA DEL ERROR
    let errorMessage = 'Error desconocido al procesar devolución';
    let errorDetails = [];

    if (error.response) {
      // Error de respuesta del servidor (4xx, 5xx)
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          errorMessage = 'Datos de devolución inválidos';
          if (data?.details) {
            errorDetails.push(`Detalles: ${data.details}`);
          }
          break;
        case 404:
          errorMessage = 'Recibo no encontrado';
          errorDetails.push('Verifica que el recibo exista y no haya sido eliminado');
          break;
        case 422:
          errorMessage = 'Error de validación';
          if (data?.details) {
            errorDetails.push(`Detalles: ${data.details}`);
          }
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          errorDetails.push('Contacta al administrador del sistema');
          if (data?.details) {
            errorDetails.push(`Detalles técnicos: ${data.details}`);
          }
          break;
        default:
          errorMessage = `Error del servidor (${status})`;
      }

      // Intentar extraer mensaje específico del backend
      if (data?.message) {
        errorMessage = data.message;
      } else if (data?.error) {
        errorMessage = data.error;
      }

    } else if (error.request) {
      // Error de red (sin respuesta del servidor)
      errorMessage = 'Error de conexión';
      errorDetails.push('Verifica tu conexión a internet');
      errorDetails.push('El servidor podría estar temporalmente inaccesible');
    } else {
      // Error en la configuración de la petición
      errorMessage = error.message || 'Error en la configuración de la petición';
    }

    dispatch({
      type: PROCESS_RETURN_FAILURE,
      payload: errorMessage
    });

    // ✅ MOSTRAR ERROR DETALLADO AL USUARIO
    Swal.fire({
      title: '❌ Error en Devolución',
      html: `
        <div class="text-left">
          <p class="font-medium text-red-600 mb-3">${errorMessage}</p>
          ${errorDetails.length > 0 ? `
            <ul class="list-disc list-inside space-y-1 text-sm text-gray-600">
              ${errorDetails.map(detail => `<li>${detail}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `,
      icon: 'error',
      confirmButtonText: '🔄 Intentar de nuevo',
      showCancelButton: true,
      cancelButtonText: '❌ Cancelar'
    });
    
    throw new Error(errorMessage);
  }
};

// ✅ 3. OBTENER HISTORIAL DE DEVOLUCIONES
export const fetchReturnHistory = (filters = {}) => async (dispatch) => {
  try {
    dispatch({ type: FETCH_RETURN_HISTORY_REQUEST });

    // Construir query params para filtros
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== 'all') {
        queryParams.append(key, filters[key]);
      }
    });

    const url = `${BASE_URL}/product/returns-history${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    console.log("📋 Obteniendo historial:", url);

    const { data } = await axios.get(url);

    if (data.success) {
      dispatch({ 
        type: FETCH_RETURN_HISTORY_SUCCESS, 
        payload: data.data 
      });
      return data.data;
    } else {
      throw new Error(data.message || 'Error al obtener historial');
    }

  } catch (error) {
    console.error("❌ Error obteniendo historial:", error);
    const errorMessage = error.response?.data?.error || error.message;
    
    dispatch({
      type: FETCH_RETURN_HISTORY_FAILURE,
      payload: errorMessage
    });

    Swal.fire('Error', 'Error al cargar el historial de devoluciones', 'error');
    throw new Error(errorMessage);
  }
};

// ✅ 4. OBTENER TODAS LAS DEVOLUCIONES (para listado completo)
export const fetchReturns = (filters = {}) => async (dispatch) => {
  try {
    dispatch({ type: FETCH_RETURNS_REQUEST });

    // Construir query params para filtros
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== 'all' && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const url = `${BASE_URL}/product/returns${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    console.log("📋 Obteniendo todas las devoluciones:", url);

    const { data } = await axios.get(url);
    console.log("📊 Respuesta completa del servidor:", data);

    // La estructura de respuesta es: data.data.data.returns
    const responseData = data.data;
    console.log("📊 Data extraída:", responseData);

    if (responseData.success) {
      dispatch({ 
        type: FETCH_RETURNS_SUCCESS, 
        payload: {
          returns: responseData.data?.returns || [],
          pagination: responseData.data?.pagination || {},
          stats: responseData.data?.stats || {}
        }
      });
      console.log("✅ Devoluciones cargadas exitosamente");
      return responseData.data;
    } else {
      const errorMessage = responseData.message || 'Error al obtener devoluciones';
      console.error("❌ Error en respuesta:", errorMessage);
      
      dispatch({
        type: FETCH_RETURNS_FAILURE,
        payload: errorMessage
      });
      
      return { error: errorMessage };
    }

  } catch (error) {
    console.error("❌ Error en fetchReturns:", error);
    const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Error de conexión';
    
    dispatch({
      type: FETCH_RETURNS_FAILURE,
      payload: errorMessage
    });

    console.error("❌ Error final:", errorMessage);
    return { error: errorMessage };
  }
};

// ✅ 4. LIMPIAR ESTADO DE DEVOLUCIONES
export const clearReturnState = () => ({
  type: CLEAR_RETURN_STATE
});

// ✅ 5. RESETEAR BÚSQUEDA DE RECIBO
export const resetReceiptSearch = () => ({
  type: RESET_RECEIPT_SEARCH
});


export const fetchStockMovements = (filters = {}) => {
  return async (dispatch) => {
    dispatch({ type: FETCH_STOCK_MOVEMENTS_REQUEST });
    try {
      const queryParams = new URLSearchParams();
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      if (filters.id_product) queryParams.append('id_product', filters.id_product); // ✅ Nuevo filtro

      const url = `${BASE_URL}/product/stock-movements?${queryParams.toString()}`;
      const response = await axios.get(url);

      const { data: movements, pagination, filters: appliedFilters } = response.data.message;

      dispatch({
        type: FETCH_STOCK_MOVEMENTS_SUCCESS,
        payload: {
          movements,
          pagination,
          filters: appliedFilters,
          success: response.data.success
        }
      });

      return response.data;
    } catch (error) {
      dispatch({
        type: FETCH_STOCK_MOVEMENTS_FAILURE,
        payload: error.response?.data?.error || error.message
      });
      throw error;
    }
  };
};

export const fetchProductStock = (id_product) => async (dispatch) => {
  dispatch({ type: FETCH_STOCK_MOVEMENTS_REQUEST });
  try {
    const response = await axios.get(`${BASE_URL}/product/stock/${id_product}`);
    // Accede a la estructura real de la respuesta
    const { id_product: product, codigoBarra, stock, movements, stats, stock_initial } = response.data.message;

    dispatch({
      type: FETCH_STOCK_MOVEMENTS_SUCCESS,
      payload: {
        product,
        codigoBarra,
        stock,
        stock_initial,
        movements,
        stats
      }
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.warn(`Producto no encontrado: ${id_product}`);
      return; // Ignora el error 404
    }
    dispatch({
      type: FETCH_STOCK_MOVEMENTS_FAILURE,
      payload: error.response?.data?.error || error.message,
    });
    throw error;
  }
};

// ✅ ACTION: Crear movimiento de stock manual
export const createStockMovement = (movementData) => {
  return async (dispatch) => {
    dispatch({ type: CREATE_STOCK_MOVEMENT_REQUEST });
    
    try {
      console.log("📤 Creando movimiento de stock:", movementData);

      const response = await axios.post(`${BASE_URL}/product/stock`, movementData);

      console.log("📥 Movimiento creado:", response.data);

      dispatch({
        type: CREATE_STOCK_MOVEMENT_SUCCESS,
        payload: response.data
      });

      // ✅ Refrescar lista de movimientos después de crear uno
      dispatch(fetchStockMovements());

      return response.data;
    } catch (error) {
      console.error("❌ Error creating stock movement:", error);
      
      const errorMessage = error.response?.data?.error || error.message || 'Error al crear movimiento de stock';
      
      dispatch({
        type: CREATE_STOCK_MOVEMENT_FAILURE,
        payload: errorMessage
      });

      throw error;
    }
  };
};

// ✅ NEW ACTION: Fetch ALL stock movements for export (without pagination)
export const fetchAllStockMovementsForExport = (filters = {}) => {
  return async (dispatch) => {
    try {
      const queryParams = new URLSearchParams();
      
      // ✅ IMPORTANTE: No enviar page ni limit para obtener TODOS los registros
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      if (filters.id_product) queryParams.append('id_product', filters.id_product);
      
      // ✅ NUEVO: Parámetro especial para indicar que es exportación
      queryParams.append('export', 'true');
      queryParams.append('limit', '999999'); // Limit muy alto para obtener todo

      const url = `${BASE_URL}/product/stock-movements?${queryParams.toString()}`;
      console.log('📊 [Export] Solicitando TODOS los movimientos para exportación:', url);
      
      const response = await axios.get(url);
      
      const { data: movements } = response.data.message;
      console.log('📊 [Export] Movimientos obtenidos para exportación:', movements?.length || 0);
      
      return movements || [];
    } catch (error) {
      console.error('❌ [Export] Error obteniendo movimientos para exportación:', error);
      throw error;
    }
  };
};