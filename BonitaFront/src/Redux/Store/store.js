// store.js
import { createStore, applyMiddleware, compose } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Utiliza el almacenamiento local
import { thunk } from 'redux-thunk';
import rootReducer from '../Reducer/reducer';

// Configuración de redux-persist
const persistConfig = {
  key: 'root', // Clave de almacenamiento
  storage, // Configuración del almacenamiento (localStorage)
};

// Crea un reducer persistido
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Combina applyMiddleware y la configuración de Redux DevTools en una sola función usando compose
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// Crea la tienda de Redux
export const store = createStore(
  persistedReducer, // Usa el reducer persistido
  composeEnhancers(applyMiddleware(thunk))
);

// Crea el persistor
export const persistor = persistStore(store);


