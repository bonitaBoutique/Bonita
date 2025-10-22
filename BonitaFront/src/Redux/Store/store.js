
// Importa configureStore de Redux Toolkit en lugar de createStore y applyMiddleware
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../Reducer/reducer'; // Mantienes el rootReducer
import promotionReducer from '../promotionSlice'; // ✅ Nuevo: Reducer de promociones


// Crea la tienda con configureStore (no necesitas thunk, ya está incluido)
export const store = configureStore({
  reducer: {
    ...rootReducer, // Spread del rootReducer existente
    promotions: promotionReducer, // ✅ Nuevo: Agregar slice de promociones
  },
  devTools: import.meta.env !== 'production', // Habilita Redux DevTools solo en desarrollo
});


