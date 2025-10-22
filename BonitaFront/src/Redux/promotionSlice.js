/**
 * Redux Slice: Promotions
 * Descripción: Gestión del estado de promociones
 * Autor: Sistema de Promociones
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../Config'; // ✅ Importar BASE_URL del config

// ==================== ASYNC THUNKS ====================

/**
 * Obtener la promoción activa vigente
 */
export const fetchActivePromotion = createAsyncThunk(
  'promotions/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/promotions/active`);
      return response.data.data; // Puede ser null si no hay promoción activa
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Obtener todas las promociones (historial)
 */
export const fetchAllPromotions = createAsyncThunk(
  'promotions/fetchAll',
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/promotions`, {
        params: { page, limit },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Crear una nueva promoción
 */
export const createPromotion = createAsyncThunk(
  'promotions/create',
  async (promotionData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/promotions`, promotionData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Actualizar una promoción existente
 */
export const updatePromotion = createAsyncThunk(
  'promotions/update',
  async ({ id, promotionData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE_URL}/promotions/${id}`, promotionData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Activar/Desactivar una promoción
 */
export const togglePromotion = createAsyncThunk(
  'promotions/toggle',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${BASE_URL}/promotions/${id}/toggle`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Eliminar una promoción
 */
export const deletePromotion = createAsyncThunk(
  'promotions/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/promotions/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ==================== SLICE ====================

const promotionSlice = createSlice({
  name: 'promotions',
  initialState: {
    activePromotion: null, // Promoción activa actual
    allPromotions: [], // Lista de todas las promociones
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    },
    loading: false,
    error: null,
  },
  reducers: {
    // Limpiar error
    clearError: (state) => {
      state.error = null;
    },
    // Limpiar promoción activa (útil para refrescar)
    clearActivePromotion: (state) => {
      state.activePromotion = null;
    },
  },
  extraReducers: (builder) => {
    // ============ FETCH ACTIVE PROMOTION ============
    builder
      .addCase(fetchActivePromotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivePromotion.fulfilled, (state, action) => {
        state.loading = false;
        state.activePromotion = action.payload;
      })
      .addCase(fetchActivePromotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ============ FETCH ALL PROMOTIONS ============
    builder
      .addCase(fetchAllPromotions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPromotions.fulfilled, (state, action) => {
        state.loading = false;
        state.allPromotions = action.payload.promotions;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllPromotions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ============ CREATE PROMOTION ============
    builder
      .addCase(createPromotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPromotion.fulfilled, (state, action) => {
        state.loading = false;
        state.allPromotions = [action.payload, ...state.allPromotions];
        
        // Si se crea activa, actualizar activePromotion
        if (action.payload.is_active) {
          state.activePromotion = action.payload;
        }
      })
      .addCase(createPromotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ============ UPDATE PROMOTION ============
    builder
      .addCase(updatePromotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePromotion.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.allPromotions.findIndex(
          (p) => p.id_promotion === action.payload.id_promotion
        );
        if (index !== -1) {
          state.allPromotions[index] = action.payload;
        }
        
        // Si es la promoción activa, actualizarla
        if (state.activePromotion?.id_promotion === action.payload.id_promotion) {
          state.activePromotion = action.payload;
        }
      })
      .addCase(updatePromotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ============ TOGGLE PROMOTION ============
    builder
      .addCase(togglePromotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(togglePromotion.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.allPromotions.findIndex(
          (p) => p.id_promotion === action.payload.id_promotion
        );
        
        if (index !== -1) {
          state.allPromotions[index].is_active = action.payload.is_active;
        }
        
        // Actualizar promoción activa
        if (action.payload.is_active) {
          // Buscar la promoción completa
          const fullPromotion = state.allPromotions[index];
          state.activePromotion = fullPromotion;
        } else if (state.activePromotion?.id_promotion === action.payload.id_promotion) {
          state.activePromotion = null;
        }
      })
      .addCase(togglePromotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ============ DELETE PROMOTION ============
    builder
      .addCase(deletePromotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePromotion.fulfilled, (state, action) => {
        state.loading = false;
        state.allPromotions = state.allPromotions.filter(
          (p) => p.id_promotion !== action.payload
        );
        
        // Si era la activa, limpiarla
        if (state.activePromotion?.id_promotion === action.payload) {
          state.activePromotion = null;
        }
      })
      .addCase(deletePromotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearActivePromotion } = promotionSlice.actions;
export default promotionSlice.reducer;
