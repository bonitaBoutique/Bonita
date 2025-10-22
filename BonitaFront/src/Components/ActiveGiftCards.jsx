import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Importa axios
import Navbar2 from './Navbar2';
import { BASE_URL } from '../Config'; // Asegúrate que BASE_URL esté definida y exportada
// ✅ Importar utilidades de fecha para Colombia
import { formatDateForDisplay } from '../utils/dateUtils';

const ActiveGiftCards = () => {
  const navigate = useNavigate();
  // No necesitamos dispatch si no usamos Redux para esto

  // Estado local para almacenar las gift cards activas, carga y error
  const [activeCards, setActiveCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Lógica para obtener las GiftCards activas usando Axios
    const fetchCards = async () => {
      setLoading(true);
      setError(null);
      try {
        // 🔍 PRIMER PASO: Obtener lista de usuarios con gift cards
        const response = await axios.get(`${BASE_URL}/caja/active-giftcards`);
        
        // 🔍 DEBUG: Log completo de la respuesta inicial
        console.log('🔍 [ActiveGiftCards] Respuesta inicial del API:', response.data);
        console.log('🔍 [ActiveGiftCards] activeCards array inicial:', response.data?.activeCards);

        // Verifica si la respuesta tiene datos y la propiedad activeCards
        if (response.data && response.data.activeCards) {
          const initialCards = response.data.activeCards;
          
          // 🔍 SEGUNDO PASO: Obtener saldo real para cada tarjeta
          const cardsWithRealBalance = await Promise.all(
            initialCards.map(async (card) => {
              try {
                // 🔍 Verificar que tenemos el email
                if (!card.email) {
                  console.warn(`⚠️ [ActiveGiftCards] Tarjeta ${card.n_document} no tiene email, usando balance original`);
                  return {
                    ...card,
                    originalBalance: card.balance, // Guardar monto original
                    balance: card.balance // Mantener el mismo balance como saldo disponible
                  };
                }
                
                // 🔍 Usar el mismo endpoint que RedeemGiftCard para obtener saldo real
                const balanceRes = await axios.get(`${BASE_URL}/giftcard/balance/${encodeURIComponent(card.email)}`);
                const realBalance = balanceRes.data.saldo || 0;
                
                // 🔍 DEBUG: Comparar saldo original vs real
                console.log(`🔍 [ActiveGiftCards] Tarjeta ${card.n_document}:`, {
                  documento: card.n_document,
                  nombre: `${card.first_name} ${card.last_name}`,
                  email: card.email,
                  'balance original (desde /active-giftcards)': card.balance,
                  'saldo real (desde /giftcard/balance)': realBalance,
                  'diferencia': card.balance - realBalance
                });
                
                // Retornar card con saldo real Y monto original preservado
                return {
                  ...card,
                  originalBalance: card.balance, // 🔍 SIEMPRE guardar el monto original ANTES de reemplazar
                  balance: realBalance // 🔍 REEMPLAZAR con saldo real
                };
              } catch (balanceError) {
                console.error(`❌ [ActiveGiftCards] Error obteniendo saldo para ${card.email}:`, balanceError);
                // Si falla, mantener balance original pero guardar originalBalance también
                return {
                  ...card,
                  originalBalance: card.balance, // Guardar monto original
                  balance: card.balance // Si falla la consulta, usar monto original como disponible
                };
              }
            })
          );
          
          // 🔍 Filtrar solo tarjetas con saldo > 0
          const cardsWithBalance = cardsWithRealBalance.filter(card => card.balance > 0);
          
          console.log('🔍 [ActiveGiftCards] Tarjetas con saldo real > 0:', cardsWithBalance);
          
          setActiveCards(cardsWithBalance);
        } else {
          // Si no hay datos o la estructura es inesperada, establece un array vacío
          setActiveCards([]);
          console.warn("La respuesta de la API no contiene 'activeCards' o está vacía:", response.data);
        }

      } catch (err) {
        console.error("Error al cargar GiftCards activas:", err);
        // Intenta obtener un mensaje de error más específico si está disponible
        const errorMessage = err.response?.data?.message || err.message || 'Error desconocido al cargar GiftCards activas';
        setError(errorMessage);
        setActiveCards([]); // Limpia las tarjetas en caso de error
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
    // El array de dependencias vacío [] asegura que se ejecute solo al montar
  }, []);

  // Muestra mensaje de carga
  if (loading) return (
    <>
      <Navbar2 />
      <p className="text-center mt-16">Cargando GiftCards activas...</p>
    </>
  );

  // Muestra mensaje de error
  if (error) return (
    <>
      <Navbar2 />
      <p className="text-center mt-16 text-red-500">Error: {error}</p>
    </>
  );

  // Renderiza la tabla con los datos
  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar2 />
      <div className="container mx-auto p-4 mt-16"> {/* Añadido mt-16 para espacio debajo del Navbar */}
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          GiftCards Activas
        </h1>
        
        {/* 📊 INFO: Explicación de las columnas */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <p className="text-sm text-blue-800">
            <strong>� Saldo Total Disponible:</strong> Suma de todas las GiftCards activas del cliente. Puede tener múltiples tarjetas.
          </p>
        </div>

        {activeCards.length === 0 ? (
          <p className="text-gray-600">No hay GiftCards activas con saldo.</p>
        ) : (
          <div className="overflow-x-auto bg-white shadow rounded-lg"> {/* Contenedor con sombra y bordes redondeados */}
            <table className="min-w-full leading-normal">
              <thead>
                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Documento</th>
                  <th className="py-3 px-6 text-left">Nombre Cliente</th>
                  <th className="py-3 px-6 text-left">Email</th>
                  <th className="py-3 px-6 text-right">💰 Saldo Total</th>
                  <th className="py-3 px-6 text-left">📅 Fecha Creación</th>
                  <th className="py-3 px-6 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-sm">
                {activeCards.map((card, index) => {
                  // 🔍 DEBUG: Log del saldo consolidado
                  console.log(`✅ [ActiveGiftCards] Cliente ${index + 1}:`, {
                    documento: card.n_document,
                    nombre: `${card.first_name} ${card.last_name}`,
                    email: card.email,
                    'saldo consolidado': card.balance
                  });
                  
                  return (
                    <tr key={card.n_document} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-6 text-left whitespace-nowrap">
                        {card.n_document}
                      </td>
                      <td className="py-3 px-6 text-left">
                        {card.first_name} {card.last_name}
                      </td>
                      <td className="py-3 px-6 text-left text-sm text-gray-600">
                        {card.email || 'Sin email'}
                      </td>
                      <td className="py-3 px-6 text-right font-bold text-green-600 text-lg">
                        ${card.balance?.toLocaleString('es-CO') ?? 0}
                      </td>
                      <td className="py-3 px-6 text-left text-sm text-gray-600">
                        {card.created_at ? formatDateForDisplay(card.created_at, true) : 'N/A'}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <button
                          onClick={() => navigate(`/giftcard/redeem/${card.n_document}`)}
                          className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
                        >
                          🎁 Usar Saldo
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveGiftCards;