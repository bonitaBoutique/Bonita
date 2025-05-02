import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Importa axios
import Navbar2 from './Navbar2';
import { BASE_URL } from '../Config'; // Asegúrate que BASE_URL esté definida y exportada

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
        // Realiza la petición GET al endpoint del backend
        const response = await axios.get(`${BASE_URL}/caja/active-giftcards`);

        // Verifica si la respuesta tiene datos y la propiedad activeCards
        if (response.data && response.data.activeCards) {
          setActiveCards(response.data.activeCards);
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
          GiftCards Activas (Saldo disponible)
        </h1>

        {activeCards.length === 0 ? (
          <p className="text-gray-600">No hay GiftCards activas con saldo.</p>
        ) : (
          <div className="overflow-x-auto bg-white shadow rounded-lg"> {/* Contenedor con sombra y bordes redondeados */}
            <table className="min-w-full leading-normal">
              <thead>
                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Documento</th>
                  <th className="py-3 px-6 text-left">Nombre Cliente</th>
                  <th className="py-3 px-6 text-right">Saldo Disponible</th> {/* Alineado a la derecha */}
                  <th className="py-3 px-6 text-center">Acciones</th> {/* Centrado */}
                </tr>
              </thead>
              <tbody className="text-gray-700 text-sm"> {/* Texto un poco más oscuro */}
                {activeCards.map((card) => (
                  <tr
                    key={card.n_document}
                    className="border-b border-gray-200 hover:bg-gray-50" /* Efecto hover sutil */
                  >
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      {card.n_document}
                    </td>
                    <td className="py-3 px-6 text-left">
                      {card.first_name} {card.last_name}
                    </td>
                    <td className="py-3 px-6 text-right font-medium"> {/* Saldo en negrita */}
                      ${card.balance?.toLocaleString('es-CO') ?? 0} {/* Formato moneda Colombia */}
                    </td>
                    <td className="py-3 px-6 text-center">
                      <button
                        onClick={() => navigate(`/giftcard/redeem/${card.n_document}`)} // Navega al componente de canje
                        className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out" // Estilo mejorado
                      >
                        Usar Saldo
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveGiftCards;