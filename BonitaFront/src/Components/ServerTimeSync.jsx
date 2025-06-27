import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getServerTime } from '../Redux/Actions/actions';

const ServerTimeSync = ({ children, showDebug = false }) => {
  const dispatch = useDispatch();
  const serverTime = useSelector((state) => state.serverTime);

  // ✅ Sincronizar con servidor al montar el componente
  useEffect(() => {
    console.log('🕒 [ServerTimeSync] Iniciando sincronización con servidor...');
    dispatch(getServerTime());
  }, [dispatch]);

  // ✅ Sincronización periódica cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🕒 [ServerTimeSync] Sincronización automática...');
      dispatch(getServerTime());
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [dispatch]);

  // ✅ Debug info (opcional)
  if (showDebug && serverTime?.current) {
    console.log('🕒 [ServerTimeSync] Estado actual del servidor:', {
      fecha: serverTime.current.date,
      hora: serverTime.current.time,
      timezone: serverTime.current.timezone,
      loading: serverTime.loading
    });
  }

  // ✅ Renderizar children con contexto de servidor
  return (
    <>
      {showDebug && serverTime?.current && (
        <div className="fixed top-16 right-4 bg-blue-100 border border-blue-300 rounded-lg p-2 text-xs text-blue-800 z-50">
          <div className="font-semibold">Servidor (Colombia):</div>
          <div>📅 {serverTime.current.date}</div>
          <div>🕒 {serverTime.current.time}</div>
          {serverTime.loading && (
            <div className="text-blue-600 animate-pulse">
              ⏳ Sincronizando...
            </div>
          )}
        </div>
      )}
      {children}
    </>
  );
};

export default ServerTimeSync;