import React from 'react';
import { FiX, FiPackage, FiShoppingBag, FiDollarSign, FiUser, FiCalendar, FiFileText, FiGift, FiAlertCircle } from 'react-icons/fi';

const ReturnDetailModal = ({ isOpen, onClose, returnData }) => {
  if (!isOpen || !returnData) return null;

  // Calcular totales y diferencias
  const totalReturned = parseFloat(returnData.total_returned || 0);
  const totalNewPurchase = parseFloat(returnData.total_new_purchase || 0);
  const differenceAmount = parseFloat(returnData.difference_amount || 0);

  // Determinar tipo de transacción
  const getTransactionType = () => {
    if (differenceAmount > 0) return { type: 'refund', label: 'Reembolso', color: 'text-green-600' };
    if (differenceAmount < 0) return { type: 'payment', label: 'Pago adicional', color: 'text-red-600' };
    return { type: 'exchange', label: 'Cambio directo', color: 'text-blue-600' };
  };

  const transactionType = getTransactionType();

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              🔄 Detalle de Devolución
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              ID: {returnData.id_return} | {formatDate(returnData.return_date)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Resumen Financiero */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <FiPackage size={20} />
                <span className="font-semibold">Total Devuelto</span>
              </div>
              <p className="text-2xl font-bold text-red-900">
                ${totalReturned.toLocaleString('es-CO')}
              </p>
              <p className="text-xs text-red-600 mt-1">
                {returnData.returned_products?.length || 0} producto(s)
              </p>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <FiShoppingBag size={20} />
                <span className="font-semibold">Nueva Compra</span>
              </div>
              <p className="text-2xl font-bold text-green-900">
                ${totalNewPurchase.toLocaleString('es-CO')}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {returnData.new_products?.length || 0} producto(s)
              </p>
            </div>

            <div className={`${differenceAmount >= 0 ? 'bg-blue-50 border-blue-500' : 'bg-orange-50 border-orange-500'} border-l-4 p-4 rounded-lg`}>
              <div className={`flex items-center gap-2 ${differenceAmount >= 0 ? 'text-blue-700' : 'text-orange-700'} mb-2`}>
                <FiDollarSign size={20} />
                <span className="font-semibold">Diferencia</span>
              </div>
              <p className={`text-2xl font-bold ${transactionType.color}`}>
                ${Math.abs(differenceAmount).toLocaleString('es-CO')}
              </p>
              <p className={`text-xs ${differenceAmount >= 0 ? 'text-blue-600' : 'text-orange-600'} mt-1 font-medium`}>
                {transactionType.label}
              </p>
            </div>
          </div>

          {/* Información del Cliente y Cajero */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 text-gray-700 mb-3">
                <FiUser size={18} />
                <span className="font-semibold">Cliente</span>
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-medium text-gray-900">
                  {returnData.originalReceipt?.buyer_name || 'Cliente genérico'}
                </p>
                <p className="text-gray-600">
                  📧 {returnData.originalReceipt?.buyer_email || 'Sin email'}
                </p>
                <p className="text-gray-600">
                  📞 {returnData.originalReceipt?.buyer_phone || 'Sin teléfono'}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 text-gray-700 mb-3">
                <FiUser size={18} />
                <span className="font-semibold">Cajero</span>
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-medium text-gray-900">
                  {`${returnData.cashier?.first_name || ''} ${returnData.cashier?.last_name || ''}`.trim() || 'Sin asignar'}
                </p>
                <p className="text-gray-600">
                  🆔 {returnData.cashier?.n_document || 'N/A'}
                </p>
                <p className="text-gray-600">
                  📧 {returnData.cashier?.email || 'Sin email'}
                </p>
              </div>
            </div>
          </div>

          {/* Información de Recibos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 text-yellow-700 mb-2">
                <FiFileText size={18} />
                <span className="font-semibold">Recibo Original</span>
              </div>
              <p className="text-lg font-mono text-gray-900">#{returnData.original_receipt_id}</p>
              <p className="text-xs text-gray-600 mt-1">
                {formatDate(returnData.originalReceipt?.createdAt)}
              </p>
            </div>

            {returnData.new_receipt_id && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <FiFileText size={18} />
                  <span className="font-semibold">Nuevo Recibo</span>
                </div>
                <p className="text-lg font-mono text-gray-900">#{returnData.new_receipt_id}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {formatDate(returnData.newReceipt?.createdAt)}
                </p>
              </div>
            )}
          </div>

          {/* Motivo General */}
          {returnData.reason && (
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-orange-700 mb-2">
                <FiAlertCircle size={18} />
                <span className="font-semibold">Motivo de Devolución</span>
              </div>
              <p className="text-gray-800">{returnData.reason}</p>
            </div>
          )}

          {/* GiftCard Info */}
          {returnData.giftcard_id && (
            <div className="bg-pink-50 border-l-4 border-pink-400 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-pink-700 mb-2">
                <FiGift size={18} />
                <span className="font-semibold">Gift Card Generada</span>
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-mono text-lg text-gray-900">#{returnData.giftcard_id}</p>
                <p className="text-gray-700">
                  💳 Saldo: <span className="font-bold">${(returnData.giftcard?.balance || 0).toLocaleString('es-CO')}</span>
                </p>
                <p className="text-gray-600">
                  Estado: <span className={`font-medium ${returnData.giftcard?.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                    {returnData.giftcard?.status || 'N/A'}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Método de Pago de la Diferencia */}
          {differenceAmount !== 0 && returnData.payment_method && (
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 text-purple-700 mb-2">
                <FiDollarSign size={18} />
                <span className="font-semibold">Método de Pago</span>
              </div>
              <p className="text-gray-800 font-medium">{returnData.payment_method}</p>
              {returnData.payment_reference && (
                <p className="text-xs text-gray-600 mt-1">Ref: {returnData.payment_reference}</p>
              )}
            </div>
          )}

          {/* Productos Devueltos */}
          {returnData.returned_products && returnData.returned_products.length > 0 && (
            <div className="border border-red-200 rounded-lg overflow-hidden">
              <div className="bg-red-100 px-4 py-3 border-b border-red-200">
                <h3 className="font-semibold text-red-900 flex items-center gap-2">
                  <FiPackage size={18} />
                  Productos Devueltos ({returnData.returned_products.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Detalles</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {returnData.returned_products.map((product, index) => (
                      <tr key={`returned-${product.id_product}-${index}`} className="hover:bg-red-50">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{product.product_name}</p>
                          {product.marca && <p className="text-xs text-gray-500">Marca: {product.marca}</p>}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {product.sizes && <span className="block">Talla: {product.sizes}</span>}
                          {product.colors && <span className="block">Color: {product.colors}</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {product.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                          ${parseFloat(product.unit_price || 0).toLocaleString('es-CO')}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-red-600">
                          ${(parseFloat(product.unit_price || 0) * parseInt(product.quantity || 0)).toLocaleString('es-CO')}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700">
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                            {product.reason || 'Sin especificar'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Productos Nuevos */}
          {returnData.new_products && returnData.new_products.length > 0 && (
            <div className="border border-green-200 rounded-lg overflow-hidden">
              <div className="bg-green-100 px-4 py-3 border-b border-green-200">
                <h3 className="font-semibold text-green-900 flex items-center gap-2">
                  <FiShoppingBag size={18} />
                  Productos Nuevos ({returnData.new_products.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Detalles</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Stock Actual</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {returnData.new_products.map((product, index) => (
                      <tr key={`new-${product.id_product}-${index}`} className="hover:bg-green-50">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{product.product_name}</p>
                          {product.marca && <p className="text-xs text-gray-500">Marca: {product.marca}</p>}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {product.sizes && <span className="block">Talla: {product.sizes}</span>}
                          {product.colors && <span className="block">Color: {product.colors}</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {product.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                          ${parseFloat(product.unit_price || 0).toLocaleString('es-CO')}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                          ${(parseFloat(product.unit_price || 0) * parseInt(product.quantity || 0)).toLocaleString('es-CO')}
                        </td>
                        <td className="px-4 py-3 text-center text-xs">
                          <span className={`px-2 py-1 rounded ${
                            product.current_stock > 10 
                              ? 'bg-green-100 text-green-800' 
                              : product.current_stock > 0 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.current_stock || 0} unidades
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Estado y Notas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 text-gray-700 mb-2">
                <FiCalendar size={18} />
                <span className="font-semibold">Estado</span>
              </div>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                returnData.status === 'Procesada' ? 'bg-green-100 text-green-800' :
                returnData.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {returnData.status}
              </span>
            </div>

            {returnData.notes && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 text-gray-700 mb-2">
                  <FiFileText size={18} />
                  <span className="font-semibold">Notas</span>
                </div>
                <p className="text-sm text-gray-800">{returnData.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnDetailModal;
