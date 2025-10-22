

// Importa configureStore de Redux Toolkit en lugar de createStore y applyMiddleware
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../Reducer/reducer'; // Mantienes el rootReducer (es una función)
import promotionReducer from '../promotionSlice'; // ✅ Reducer de promociones


// ✅ SOLUCIÓN: Crear un wrapper reducer que combine ambos
const combinedReducer = (state, action) => {
  // Primero ejecutar el rootReducer existente
  const rootState = rootReducer(state, action);
  
  // Luego agregar el estado de promociones
  return {
    ...rootState,
    promotions: promotionReducer(state?.promotions, action),
  };
};

// Crea la tienda con el reducer combinado
export const store = configureStore({
  reducer: combinedReducer,
  devTools: import.meta.env.MODE !== 'production', // Habilita Redux DevTools solo en desarrollo
});



