const express = require("express");
const router = express.Router();

// Supplier controllers
const getSuppliers = require("../controller/Suppliers/getSuppliers");
const createSupplier = require("../controller/Suppliers/createSupplier");
const updateSupplier = require("../controller/Suppliers/updateSupplier");
const deleteSupplier = require("../controller/Suppliers/deleteSupplier");
const getSupplierById = require("../controller/Suppliers/getSupplierById");
const getAccountSummary = require("../controller/Suppliers/getAccountSummary");

// Invoice controllers
const createInvoice = require("../controller/SupplierInvoices/createInvoice");
const getInvoices = require("../controller/SupplierInvoices/getInvoices");
const getInvoiceById = require("../controller/SupplierInvoices/getInvoiceById");
const updateInvoice = require("../controller/SupplierInvoices/updateInvoice");
const deleteInvoice = require("../controller/SupplierInvoices/deleteInvoice");

// Payment controllers
const createPayment = require("../controller/SupplierPayments/createPayment");
const getPayments = require("../controller/SupplierPayments/getPayments");
const getPendingPayments = require("../controller/SupplierPayments/getPendingPayments");
const deletePayment = require("../controller/SupplierPayments/deletePayment");

// ============= SUPPLIER ROUTES =============
router.get("/", getSuppliers);
router.post("/create", createSupplier);

// ============= PURCHASE INVOICE ROUTES (Facturas de Compra) =============
// ⚠️ IMPORTANTE: Rutas específicas DEBEN ir ANTES de las rutas con parámetros dinámicos /:id
router.get("/purchase-invoices", getInvoices);
router.post("/purchase-invoices/create", createInvoice);
router.get("/purchase-invoices/:id", getInvoiceById);
router.put("/purchase-invoices/:id", updateInvoice);
router.delete("/purchase-invoices/:id", deleteInvoice);

// ============= SUPPLIER PAYMENT ROUTES (Pagos a Proveedores) =============
router.get("/supplier-payments", getPayments);
router.get("/supplier-payments/pending", getPendingPayments);
router.post("/supplier-payments/create", createPayment);
router.delete("/supplier-payments/:id", deletePayment);

// ============= SUPPLIER SPECIFIC ROUTES =============
// ⚠️ Estas rutas con /:id DEBEN ir AL FINAL para no capturar rutas específicas
router.get("/:id/account-summary", getAccountSummary);
router.put("/:id", updateSupplier);
router.delete("/:id", deleteSupplier);
router.get("/:id", getSupplierById); // ⚠️ Esta DEBE ser la ÚLTIMA ruta GET

module.exports = router;
