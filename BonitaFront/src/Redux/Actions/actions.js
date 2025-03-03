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
FETCH_SENDINGTRACKING_FAILURE

  
} from "./actions-type";

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

export const createOrder = (orderData) => async (dispatch) => {
  try {
    const response = await axios.post(`${BASE_URL}/order/create/`, orderData);
    //console.log("Response data from createOrder:", response.data); // Agrega este log
    dispatch({
      type: "CREATE_ORDER_SUCCESS",
      payload: response.data.message.orderDetail,
    });
    return response.data.message.orderDetail; // Retorna la data para que el componente pueda acceder al id
  } catch (error) {
    console.error("Error creating order:", error);
    dispatch({
      type: "CREATE_ORDER_ERROR",
      payload: error.message,
    });
    throw error; // Re-lanza el error para que el componente pueda manejarlo
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

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await axios.post(`${BASE_URL}/auth/register`, userData, config);
    
    // Handle success
    if (response.data.status === 'success') {
      dispatch({
        type: USER_REGISTER_SUCCESS,
        payload: response.data.data,
      });
    } else {
      // Handle error from API
      dispatch({
        type: USER_REGISTER_FAIL,
        payload: response.data.message,
      });
    }
  } catch (error) {
    // Handle axios error
    dispatch({
      type: USER_REGISTER_FAIL,
      payload: error.response?.data?.message || 'Error en el registro',
    });
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
  (id_orderDetail, newState, trackingNumber) => async (dispatch) => {
    try {
      const { data } = await axios.put(`${BASE_URL}/order/${id_orderDetail}`, {
        state_order: newState,
        trackingNumber,
      });

      dispatch({ type: UPDATE_ORDER_STATE_SUCCESS, payload: data.orderDetail });
      // Puedes manejar un mensaje de éxito o hacer otras acciones después de actualizar el estado
    } catch (error) {
      dispatch({ type: UPDATE_ORDER_STATE_FAILURE, payload: error.message });
      // Manejar errores o mostrar mensajes de error al usuario si es necesario
    }
  };

// eslint-disable-next-line no-unused-vars
export const updateProduct =
  // eslint-disable-next-line no-unused-vars
  (id, productData) => async (dispatch, getState) => {
    dispatch({ type: UPDATE_PRODUCT_REQUEST });

    try {
      const response = await axios.put(
        `${BASE_URL}/product/updateProducts/${id}`,
        productData
      );

      const updatedProduct = response.data.data.product;

      dispatch({
        type: UPDATE_PRODUCT_SUCCESS,
        payload: updatedProduct, // Producto actualizado desde el backend
      });

      // Opcional: puedes usar console.log para depurar
      console.log("Producto actualizado:", updatedProduct);
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

  try {
    const response = await fetch(`${BASE_URL}/seller?dni=${dni}`); // Pasar el DNI como parámetro
    const result = await response.json();

    if (response.ok) {
      dispatch({ type: FETCH_SELLER_SUCCESS, payload: result.data });
    } else {
      dispatch({
        type: FETCH_SELLER_FAILURE,
        payload: result.message || "Error al obtener los datos del comercio",
      });
    }
  } catch (error) {
    dispatch({ type: FETCH_SELLER_FAILURE, payload: error.message });
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

export const sendInvoice = (invoiceData) => async (dispatch) => {
  dispatch({ type: SEND_INVOICE_REQUEST });
  try {
    console.log("invoiceData:", JSON.stringify(invoiceData, null, 2));

    const response = await axios.post(`${BASE_URL}/taxxa/sendInvoice`, invoiceData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    dispatch({ type: SEND_INVOICE_SUCCESS, payload: response.data });
    return response.data;
  } catch (error) {
    console.error("Error al enviar la factura:", error);

    // Captura el objeto de error completo
    const errorData = error.response?.data;
    let errorMessage = "Error al enviar la factura";
    let shouldResend = true; // Assume we should resend unless we find a reason not to

    // Check if the error indicates that we should NOT resend the invoice
    if (errorData && errorData.rerror) {
      if (errorData.rerror === 1262 || errorData.rerror === 1236) {
        shouldResend = false;
        errorMessage = `Error al enviar la factura: Contingencia activada (rerror: ${errorData.rerror}). No es necesario reenviar la factura.`;
      } else if (errorData.smessage?.string) {
        const errorMessages = Object.values(errorData.smessage.string);
        errorMessage = errorMessages.join('\n');
      } else {
        errorMessage = JSON.stringify(errorData); // Muestra el objeto completo para depuración
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    dispatch({ type: SEND_INVOICE_FAILURE, payload: errorMessage });

    // Muestra el error con Swal
    Swal.fire({
      icon: 'error',
      title: 'Error al enviar la factura',
      text: errorMessage,
    });

    // Only throw the error if we should resend
    if (shouldResend) {
      throw new Error(errorMessage);
    }
  }
}; 


export const createReceipt = (receipt) => async (dispatch) => {
  dispatch({ type: CREATE_RECEIPT_REQUEST });
  console.log("Dispatching createReceipt with data:", receipt); // Verificar los datos

  try {
    const response = await axios.post(`${BASE_URL}/caja/createReceipt`, receipt, {
      headers: { "Content-Type": "application/json" },
    });
    const data = response.data;

    if (response.status === 200) {
      dispatch({ type: CREATE_RECEIPT_SUCCESS, payload: data });
    } else {
      dispatch({
        type: CREATE_RECEIPT_FAILURE,
        payload: data.error || "Error al crear el recibo",
      });
    }
  } catch (error) {
    console.error("Error:", error); // Agrega más detalles para entender el error
    dispatch({ type: CREATE_RECEIPT_FAILURE, payload: error.message });
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

export const fetchAllReceipts = () => async (dispatch) => {
  try {
    dispatch({ type: FETCH_RECEIPTS_REQUEST });

    const { data } = await axios.get(`${BASE_URL}/caja/receipts`);
    console.log("API response data:", data);

    dispatch({ type: FETCH_RECEIPTS_SUCCESS, payload: data.data.receipts });
  } catch (error) {
    dispatch({
      type: FETCH_RECEIPTS_FAILURE,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
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

    // Ensure we have an array of expenses, even if empty
    const expenses = Array.isArray(response.data) ? response.data : [];

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
  export const createReservation = (id_orderDetail, reservationData) => async (dispatch) => {
    try {
      dispatch({ type: CREATE_RESERVATION_REQUEST });
  
      // Extract just the ID string if an object was passed
      const orderId = typeof id_orderDetail === 'object' ? id_orderDetail.id_orderDetail : id_orderDetail;
  
      console.log('Sending reservation request with ID:', orderId);
  
      const { data } = await axios.post(`${BASE_URL}/order/reservations/${orderId}`, reservationData);
  
      dispatch({ type: CREATE_RESERVATION_SUCCESS, payload: data });
      Swal.fire('Success', 'Reservation created successfully', 'success');
      return data; // Return the data to the component
    } catch (error) {
      dispatch({ type: CREATE_RESERVATION_FAILURE, payload: error.message });
      Swal.fire('Error', 'Failed to create reservation', 'error');
      throw error; // Re-throw the error to the component
    }
  };

  export const fetchBalance = (filters) => async (dispatch) => {
    try {
      dispatch({ type: FETCH_BALANCE_REQUEST });
  
      const { startDate, endDate, paymentMethod, pointOfSale } = filters;
      const queryParams = new URLSearchParams({
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(paymentMethod && { paymentMethod }),
        ...(pointOfSale && { pointOfSale })
      }).toString();
  
      const { data } = await axios.get(`${BASE_URL}/balance?${queryParams}`);
      
      dispatch({ 
        type: FETCH_BALANCE_SUCCESS, 
        payload: data 
      });
    } catch (error) {
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

  export const getAllReservations = () => async (dispatch) => {
    dispatch({ type: GET_ALL_RESERVATIONS_REQUEST });
    try {
      const res = await axios.get(`${BASE_URL}/reservation/all`);
      console.log('Response from getAllReservations:', res.data.message);
  
      if (!res.data.message.reservations || res.data.message.reservations.length === 0) {
        Swal.fire('Información', 'No se encontraron reservas', 'info');
        dispatch({
          type: GET_ALL_RESERVATIONS_SUCCESS,
          payload: [], // Dispatch an empty array if no reservations are found
        });
        return;
      }
  
      dispatch({
        type: GET_ALL_RESERVATIONS_SUCCESS,
        payload: res.data.message.reservations,
      });
    } catch (error) {
      console.error('Error in getAllReservations:', error);
      dispatch({
        type: GET_ALL_RESERVATIONS_FAILURE,
        payload: error.message,
      });
      Swal.fire( 'No hay reservas');
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
          orderDetails: res.data.message.orderDetails
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












