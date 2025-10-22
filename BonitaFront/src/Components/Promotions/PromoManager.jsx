/**
 * Componente: PromoManager
 * Descripción: Panel de administración para gestionar promociones globales
 * Incluye: Crear, editar, activar/desactivar y eliminar promociones con imágenes de Cloudinary
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  fetchAllPromotions,
  fetchActivePromotion,
  createPromotion,
  updatePromotion,
  togglePromotion,
  deletePromotion,
  clearError,
} from '../../Redux/promotionSlice';
import { openCloudinaryWidget } from '../../cloudinaryConfig';

const PromoManager = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { allPromotions, activePromotion, pagination, loading, error } = useSelector(
    (state) => state.promotions
  );

  // Estado del formulario
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_percentage: '',
    image_url: '',
    start_date: '',
    end_date: '',
  });

  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [imagePreview, setImagePreview] = useState('');

  // Cargar promociones al montar
  useEffect(() => {
    dispatch(fetchAllPromotions({ page: currentPage }));
    dispatch(fetchActivePromotion());
  }, [dispatch, currentPage]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Abrir widget de Cloudinary para subir imagen
  const handleUploadImage = () => {
    openCloudinaryWidget(
      (url, publicId) => {
        console.log('✅ Imagen subida:', url);
        setFormData((prev) => ({ ...prev, image_url: url }));
        setImagePreview(url);
        
        Swal.fire({
          icon: 'success',
          title: '¡Imagen cargada!',
          text: 'La imagen se ha subido correctamente',
          timer: 2000,
          showConfirmButton: false,
        });
      },
      {
        multiple: false,
        folder: 'promotions',
        resourceType: 'image',
        formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        maxFileSize: 5000000, // 5MB
      }
    );
  };

  // Crear o actualizar promoción
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.title || !formData.description || !formData.discount_percentage) {
      Swal.fire({
        icon: 'error',
        title: 'Campos requeridos',
        text: 'Por favor completa todos los campos obligatorios',
      });
      return;
    }

    const discount = parseFloat(formData.discount_percentage);
    if (isNaN(discount) || discount < 0 || discount > 100) {
      Swal.fire({
        icon: 'error',
        title: 'Descuento inválido',
        text: 'El descuento debe estar entre 0 y 100',
      });
      return;
    }

    try {
      if (editingId) {
        // Actualizar
        await dispatch(updatePromotion({
          id: editingId,
          promotionData: formData,
        })).unwrap();

        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'La promoción se ha actualizado correctamente',
          timer: 2000,
        });
      } else {
        // Crear
        await dispatch(createPromotion(formData)).unwrap();

        Swal.fire({
          icon: 'success',
          title: '¡Creado!',
          text: 'La promoción se ha creado correctamente',
          timer: 2000,
        });
      }

      // Limpiar formulario
      resetForm();
      dispatch(fetchAllPromotions({ page: currentPage }));
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Error al guardar la promoción',
      });
    }
  };

  // Editar promoción existente
  const handleEdit = (promo) => {
    setFormData({
      title: promo.title,
      description: promo.description,
      discount_percentage: promo.discount_percentage,
      image_url: promo.image_url || '',
      // ✅ Convertir a formato datetime-local (YYYY-MM-DDTHH:mm)
      start_date: promo.start_date ? promo.start_date.slice(0, 16) : '',
      end_date: promo.end_date ? promo.end_date.slice(0, 16) : '',
    });
    setEditingId(promo.id_promotion);
    setImagePreview(promo.image_url || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Activar/Desactivar promoción
  const handleToggle = async (id, isActive) => {
    const action = isActive ? 'desactivar' : 'activar';
    
    const result = await Swal.fire({
      title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} promoción?`,
      text: isActive 
        ? 'La promoción dejará de mostrarse en la web' 
        : 'Esta promoción se mostrará en toda la web',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Sí, ${action}`,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: isActive ? '#d33' : '#10b981',
    });

    if (result.isConfirmed) {
      try {
        await dispatch(togglePromotion(id)).unwrap();
        await dispatch(fetchActivePromotion());
        
        Swal.fire({
          icon: 'success',
          title: `¡${action.charAt(0).toUpperCase() + action.slice(1)}da!`,
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || `Error al ${action} la promoción`,
        });
      }
    }
  };

  // Eliminar promoción
  const handleDelete = async (id, isActive) => {
    if (isActive) {
      Swal.fire({
        icon: 'error',
        title: 'No se puede eliminar',
        text: 'Desactiva la promoción antes de eliminarla',
      });
      return;
    }

    const result = await Swal.fire({
      title: '¿Eliminar promoción?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deletePromotion(id)).unwrap();
        
        Swal.fire({
          icon: 'success',
          title: '¡Eliminada!',
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Error al eliminar la promoción',
        });
      }
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      discount_percentage: '',
      image_url: '',
      start_date: '',
      end_date: '',
    });
    setEditingId(null);
    setImagePreview('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/panelProductos')}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al panel
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">
            🎉 Gestión de Promociones
          </h1>
          <p className="mt-2 text-gray-600">
            Crea y gestiona promociones globales con descuentos para todos los productos
          </p>
        </div>

        {/* Promoción activa actual */}
        {activePromotion && (
          <div className="mb-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">
                  ✅ Promoción Activa: {activePromotion.title}
                </h3>
                <p className="text-green-100 mb-2">{activePromotion.description}</p>
                <div className="flex items-center space-x-4">
                  <span className="bg-white text-green-600 px-3 py-1 rounded-full font-bold">
                    {activePromotion.discount_percentage}% OFF
                  </span>
                  {activePromotion.start_date && (
                    <span className="text-sm">
                      Desde: {new Date(activePromotion.start_date).toLocaleString('es-CO', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  )}
                  {activePromotion.end_date && (
                    <span className="text-sm">
                      Hasta: {new Date(activePromotion.end_date).toLocaleString('es-CO', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  )}
                </div>
              </div>
              {activePromotion.image_url && (
                <img
                  src={activePromotion.image_url}
                  alt={activePromotion.title}
                  className="w-32 h-32 object-cover rounded-lg shadow-md ml-4"
                />
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingId ? '✏️ Editar Promoción' : '➕ Nueva Promoción'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Ej: Black Friday 2025"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe la promoción..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Descuento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descuento (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="discount_percentage"
                    value={formData.discount_percentage}
                    onChange={handleChange}
                    placeholder="Ej: 20"
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Imagen */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagen Promocional
                  </label>
                  <button
                    type="button"
                    onClick={handleUploadImage}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Subir Imagen
                  </button>
                  
                  {imagePreview && (
                    <div className="mt-2 relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, image_url: '' }));
                          setImagePreview('');
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha y hora de inicio
                    </label>
                    <input
                      type="datetime-local"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha y hora de fin
                    </label>
                    <input
                      type="datetime-local"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Botones */}
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
                  >
                    {loading ? '...' : editingId ? 'Actualizar' : 'Crear'}
                  </button>
                  
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Lista de promociones */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                📋 Historial de Promociones
              </h2>

              {loading && allPromotions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Cargando promociones...</p>
                </div>
              ) : allPromotions.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-gray-600">No hay promociones creadas aún</p>
                  <p className="text-sm text-gray-500 mt-2">Crea tu primera promoción usando el formulario</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allPromotions.map((promo) => (
                    <div
                      key={promo.id_promotion}
                      className={`border rounded-lg p-4 transition-shadow hover:shadow-md ${
                        promo.is_active ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {promo.title}
                            </h3>
                            {promo.is_active && (
                              <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                                ACTIVA
                              </span>
                            )}
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full">
                              {promo.discount_percentage}% OFF
                            </span>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-2">{promo.description}</p>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            {promo.start_date && (
                              <span>
                                📅 Inicio: {new Date(promo.start_date).toLocaleString('es-CO', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            )}
                            {promo.end_date && (
                              <span>
                                🏁 Fin: {new Date(promo.end_date).toLocaleString('es-CO', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            )}
                          </div>
                        </div>

                        {promo.image_url && (
                          <img
                            src={promo.image_url}
                            alt={promo.title}
                            className="w-24 h-24 object-cover rounded-md ml-4"
                          />
                        )}
                      </div>

                      {/* Acciones */}
                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() => handleEdit(promo)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                        >
                          ✏️ Editar
                        </button>
                        
                        <button
                          onClick={() => handleToggle(promo.id_promotion, promo.is_active)}
                          className={`px-3 py-1 rounded-md transition-colors text-sm ${
                            promo.is_active
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {promo.is_active ? '🔴 Desactivar' : '🟢 Activar'}
                        </button>
                        
                        <button
                          onClick={() => handleDelete(promo.id_promotion, promo.is_active)}
                          disabled={promo.is_active}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Paginación */}
              {pagination.totalPages > 1 && (
                <div className="mt-6 flex justify-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  
                  <span className="px-4 py-2 text-gray-700">
                    Página {currentPage} de {pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                    disabled={currentPage === pagination.totalPages}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoManager;
