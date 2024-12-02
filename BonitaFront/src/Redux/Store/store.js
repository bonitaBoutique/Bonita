
// Importa configureStore de Redux Toolkit en lugar de createStore y applyMiddleware
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../Reducer/reducer'; // Mantienes el rootReducer


// Crea la tienda con configureStore (no necesitas thunk, ya está incluido)
export const store = configureStore({
  reducer: rootReducer,
  devTools: import.meta.env !== 'production', // Habilita Redux DevTools solo en desarrollo
});


