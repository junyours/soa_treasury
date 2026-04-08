import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function SavedStatements({ auth }) {
    // Helper function to format number with exactly 2 decimal places (rounded, not truncated)
    const formatCurrency = (num) => {
        if (!num || num === 0) return '';
        const rounded = Math.round(num * 100) / 100;
        return rounded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // Format assessed value without decimal places
    const formatAssessedValue = (num) => {
        if (!num || num === 0) return '';
        const rounded = Math.round(num);
        return rounded.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    // Format currency with 2 decimal places (proper rounding)
    const formatCurrencyTwoDecimals = (amount) => {
        if (amount === 0 || amount === '') return '';
        const rounded = Math.round(amount * 100) / 100;
        return rounded.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            useGrouping: true
        });
    };

    // Helper function to round to even cent (2 decimal places ending in even number)
    const roundToEven = (num) => {
        if (!num || num === 0) return 0;
        // Convert to cents (multiply by 100)
        const cents = Math.round(num * 100);
        // If cents is odd, round up to next even cent
        if (cents % 2 !== 0) {
            return (cents + 1) / 100; // Round up to next even cent
        }
        return cents / 100;
    };
    const [statements, setStatements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [preparedBy, setPreparedBy] = useState(auth?.user?.name || '');
    const [certifiedCorrectBy, setCertifiedCorrectBy] = useState('Lalaine M. Cariliman');
    const [enviFee, setEnviFee] = useState(0);
    const [editForms, setEditForms] = useState([]);
    const [originalStatements, setOriginalStatements] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState('NEWEST');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [statementsPerPage, setStatementsPerPage] = useState(10);
    const [selectedStatements, setSelectedStatements] = useState(new Set());
    const [activeSearchTab, setActiveSearchTab] = useState('ALL');
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, targetIndex: null });
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [taxAmnestyEnabled, setTaxAmnestyEnabled] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pagination options
    const paginationOptions = [5, 10, 20, 50, 100];

    // Location categories
    const locationCategories = {
        'Urban': ['Poblacion', 'Barra', 'Bonbon', 'L-Bonbon', 'Taboc'],
        'Coastal': ['Malanang', 'Igpit', 'Bagocboc'],
        'Upland': ['Awang', 'Patag', 'Tingalan', 'Cauyonan', 'Limonda', 'Nangcaon']
    };

    // Search tabs configuration
    const searchTabs = {
        'ALL': {
            label: 'ALL',
            description: 'Search all fields',
            fields: ['declared_owner', 'location', 'block_lot_no', 'tax_dec_no', 'kind', 'payment_year', 'batch_id']
        },
        'MTO STAFF': {
            label: 'MTO STAFF',
            description: 'Search only MTO Staff names',
            fields: ['prepared_by', 'certified_by']
        }
    };

    // Get all locations from categories
    const locations = Object.values(locationCategories).flat();

    // Handle statement selection
    const handleSelectStatement = (batchId) => {
        const newSelected = new Set(selectedStatements);
        if (newSelected.has(batchId)) {
            newSelected.delete(batchId);
        } else {
            newSelected.add(batchId);
        }
        setSelectedStatements(newSelected);
    };

    // Handle select all
    const handleSelectAll = () => {
        const currentBatchIds = groupedStatements.map(batch => batch.batch_id);
        if (selectedStatements.size === currentBatchIds.length && currentBatchIds.length > 0) {
            setSelectedStatements(new Set());
        } else {
            setSelectedStatements(new Set(currentBatchIds));
        }
    };

    // Handle print selected statements
    const handlePrintSelected = () => {
        if (selectedStatements.size === 0) {
            alert('Please select at least one statement to print.');
            return;
        }

        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        
        // Get selected batch data
        const selectedBatches = groupedStatements.filter(batch => selectedStatements.has(batch.batch_id));
        
        // Generate HTML for printing (exact match to original format)
        const printHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Print Statements</title>
                <style>
                    @media print {
                        body { margin: 0; padding: 10px; }
                        .page-break { page-break-before: always; }
                        .no-print { display: none; }
                    }
                    body { 
                        font-family: Arial, sans-serif;                         
                        padding: 10px; 
                        background: white;
                    }
                    .statement-container {
                        background: white;
                        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                        border: 2px solid rgb(31 41 55);
                        overflow: hidden;
                        margin-bottom: 30px;
                    }
.header-section {
    position: relative;
    background: white;
    padding: 16px;
    overflow: hidden;
}

/* Bottom-left watermark container */
.watermark-container{
    position:absolute;
    bottom:20px;
    left:20px;
    display:flex;
    align-items:center;
    gap:10px;
    opacity:0.15;
    z-index:0;
}

/* Watermark logo */
.watermark-logo{
    width:70px;
    height:70px;
    object-fit:contain;
}

/* Watermark text */
.watermark-text{
    font-size:16px;
    font-weight:bold;
    color:#000;
}


/* Keep content above watermark */
.header-section * {
    position: relative;
    z-index: 1;
}
.top-header {
    position: relative;
    display: flex;
    justify-content: center; /* Center the text container */
    margin-bottom: 16px;
}

.logo {
    position: absolute;      /* Keep logo out of text flow */
    left: 50%;               /* Start in center */
    transform: translateX(-230px); /* Move left close to text */
    height: 80px;
    width: 80px;
    object-fit: contain;
}

.header-text {
    text-align: center;       /* Keep text centered */
}
                    .province {
                        font-size: 16px;
                        font-weight: 500;
                        color: rgb(17 24 39);
                        margin: 0;
                    }
                    .municipality {
                        font-size: 24px;
                        font-weight: bold;
                        color: rgb(17 24 39);
                        margin: 0;
                    }
                    .office {
                        font-size: 15px;
                        font-weight: bold;
                        color: rgb(17 24 39);
                        margin: 0;
                    }
                    .statement-banner {
                        background: rgb(37 99 235);
                        color: white;
                        padding: 8px 12px;
                        border-radius: 8px;
                        margin-bottom: 12px;
                        text-align: center;
                        position: relative;
                    }
                    .statement-title {
                        font-size: 16px;
                        font-weight: bold;
                        margin: 0;
                        background: rgb(37 99 235);
                        display: inline-block;
                        padding: 6px 12px;
                        border-radius: 4px;
                    }
                    .table-container {
                        overflow-x: auto;
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        border: 2px solid rgb(31 41 55);
                    }
                    th { 
                        background: rgb(243 244 246);
                        border: 2px solid rgb(31 41 55);
                        padding: 1px 4px;
                        font-size: 10px;
                        font-weight: bold;
                        text-align: left;
                    }
                    td { 
                        border: 2px solid rgb(31 41 55);
                        padding: 1px 4px;
                        font-size: 10px;
                    }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                    .date-stamp {
                        position: absolute;
                        top: 12px;
                        right: 16px;
                        color: white;
                        font-size: 12px;
                    }
                    .totals-section {
                        text-align: right;
                        margin-top: 20px;
                        padding-right: 16px;
                    }
                    .totals-section p {
                        margin: 4px 0;
                        font-size: 14px;
                    }
                    .notice-section {
                        margin-top: 8px;
                    }
                    .notice-banner {
                        background: transparent;
                        color: rgb(17 24 39);
                        padding: 8px 16px;
                        text-align: center;
                        width: 100%;
                    }
                    .notice-text {
                        font-size: 12px;
                        font-weight: 400;
                        margin: 0;
                        font-style: italic;
                        text-align: left;
                    }
                    .signature-section {
                        margin-top: 20px;
                        padding: 12px;
                    }
                    .signature-row {
                        display: flex;
                        justify-content: space-between;
                        gap: 16px;
                    }
                    .signature-block {
                        text-align: center;
                        width: 41.666667%;
                    }
                    .signature-block p {
                        margin: 0;
                    }
                    .signature-line {
                        border-top: 1px solid rgb(31 41 55);
                        padding-top: 6px;
                        margin-top: 16px;
                    }
                    .text-xs {
                        font-size: 12px;
                    }
                    .text-sm {
                        font-size: 14px;
                    }
                    .font-medium {
                        font-weight: 500;
                    }
                    .font-bold {
                        font-weight: bold;
                    }
                    .text-gray-900 {
                        color: rgb(17 24 39);
                    }
                    .text-gray-700 {
                        color: rgb(55 65 81);
                    }
                    .mb-6 {
                        margin-bottom: 24px;
                    }
                    .text-center {
                        text-align: center;
                    }
                    .contact-section {
                        margin-top: 20px;
                        padding: 12px;
                        border-top: 1px solid rgb(31 41 55);
                    }
                    .contact-header {
                        margin-bottom: 8px;
                        text-align: center;
                    }
                    .contact-title {
                        font-size: 12px;
                        font-weight: bold;
                        color: rgb(17 24 39);
                        margin: 0;
                    }
                    .contact-info {
                        display: flex;
                        flex-direction: row;
                        justify-content: center;
                        align-items: center;
                        gap: 32px;
                        width: 100%;
                    }
                    .contact-item {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        white-space: nowrap;
                        flex-shrink: 0;
                    }
                    .contact-icon {
                        font-size: 14px;
                        width: 16px;
                        height: 16px;
                        color: rgb(37 99 235);
                    }
                    .contact-text {
                        font-size: 10px;
                        color: rgb(55 65 81);
                    }
                    
                    @media print {
                        @page {
                            margin: 0.25in;
                            size: A4 landscape;
                        }
                        
                        body {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            font-family: Arial, sans-serif;
                        }
                        
                        .statement-title {
                            background: rgb(37 99 235) !important;
                            color: white !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        
                        .notice-text {
                            font-style: italic !important;
                            color: rgb(17 24 39) !important;
                        }
                        
                        table {
                            border: 2px solid rgb(31 41 55) !important;
                            border-collapse: collapse !important;
                        }
                        
                        th, td {
                            border: 2px solid rgb(31 41 55) !important;
                            padding: 2px 8px !important;
                            font-size: 12px !important;
                        }
                        
                        th {
                            background: rgb(243 244 246) !important;
                            font-weight: bold !important;
                        }
                        
                        .signature-line {
                            border-top: 1px solid rgb(31 41 55) !important;
                        }
                        
                        .page-break {
                            page-break-before: always;
                        }
                    }
                </style>
            </head>
            <body>
                ${selectedBatches.map((batch, index) => `
                    ${index > 0 ? '<div class="page-break"></div>' : ''}
                    <div class="statement-container">
<div class="header-section">

    <div class="top-header">
            <!-- Logo -->
            <img src="/images/Untitled.png" alt="Logo" class="logo" />

            <!-- Centered Text -->
            <div class="header-text">
                <p class="province">Province of Misamis Oriental</p>
                <h1 class="municipality">MUNICIPALITY OF OPOL</h1>
                <h1 class="office">Municipal Treasurer's Office</h1>
            </div>
        </div>
                            
                            <div class="statement-banner">
                                <h2 class="statement-title">STATEMENT OF ACCOUNT</h2>
                                ${batch.created_at ? `
                                    <div class="date-stamp">
                
                                        <span>${formatDate(batch.created_at)}</span>
                                    </div>
                                ` : ''}
                            </div>

                            <div class="table-container">
                                <table class="w-full border-collapse border-2 border-gray-800 bg-white" style="table-layout: fixed;">
                                    <thead>
                                        <tr class="bg-gray-100">
                                            <th class="border border-gray-800 px-3 py-2 text-xs font-bold text-left" style="width: 150px; word-wrap: break-word;">Declared Owner</th>
                                            <th class="border border-gray-800 px-3 py-2 text-xs font-bold text-left" style="width: 100px; word-wrap: break-word;">Location</th>
                                            <th class="border border-gray-800 px-3 py-2 text-xs font-bold text-left whitespace-nowrap" style="width: 110px;">Block & Lot No.</th>
                                            <th class="border border-gray-800 px-3 py-2 text-xs font-bold text-left" style="width: 100px; word-wrap: break-word;">Tax Dec. No.</th>
                                            <th class="border border-gray-800 px-3 py-2 text-xs font-bold text-left whitespace-nowrap">KIND</th>
                                            <th class="border border-gray-800 px-3 py-2 text-xs font-bold text-right whitespace-nowrap">ASSESSED VALUE</th>
                                            <th class="border border-gray-800 px-3 py-2 text-xs font-bold text-center whitespace-nowrap">PAYMENT YEAR</th>
                                            <th class="border border-gray-800 px-3 py-2 text-xs font-bold text-right whitespace-nowrap">BASIC/SEF</th>
                                            <th class="border border-gray-800 px-3 py-2 text-xs font-bold text-right whitespace-nowrap">PENALTY/Discount</th>
                                            <th class="border border-gray-800 px-3 py-2 text-xs font-bold text-right whitespace-nowrap">TOTAL</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${batch.statements.map(statement => {
                                            // Use saved values instead of recalculating
                                            const assessedValue = parseFloat(statement.assessed_value) || 0;
                                            const fullPayment = parseFloat(statement.full_payment) || 0;
                                            const penaltyAmount = parseFloat(statement.penalty_discount) || 0;
                                            const total = parseFloat(statement.total) || 0;
                                            
                                            return `
                                            <tr>
                                                <td class="border border-gray-800 px-3 py-2 text-xs" style="width: 150px; word-wrap: break-word; vertical-align: top;">${statement.declared_owner || '-'}</td>
                                                <td class="border border-gray-800 px-3 py-2 text-xs" style="width: 100px; word-wrap: break-word; vertical-align: top;">${statement.location || '-'}</td>
                                                <td class="border border-gray-800 px-3 py-2 text-xs" style="width: 110px;">${statement.block_lot_no || '-'}</td>
                                                <td class="border border-gray-800 px-3 py-2 text-xs" style="width: 100px; word-wrap: break-word;">${statement.tax_dec_no || '-'}</td>
                                                <td class="border border-gray-800 px-3 py-2 text-xs">${statement.kind || '-'}</td>
                                                <td class="border border-gray-800 px-3 py-2 text-xs text-right bg-gray-100">
                                                <div style="position: relative;">
                                                    ${assessedValue > 0 ? formatAssessedValue(assessedValue) : ''}
                                                    ${statement.isUnderlined ? '<div style="border-bottom: 2px solid #1f2937; margin-top: 2px;"></div>' : ''}
                                                </div>
                                            </td>
                                                <td class="border border-gray-800 px-3 py-2 text-xs text-center">${statement.payment_year || '-'}</td>
                                                <td class="border border-gray-800 px-3 py-2 text-xs text-right bg-gray-100">${fullPayment > 0 ? formatCurrency(fullPayment) : ''}</td>
                                                <td class="border border-gray-800 px-3 py-2 text-xs text-right bg-gray-100">
                                                    ${statement.penaltyDiscountType === 'tax_diff' 
                                                        ? '<span class="text-green-700 font-medium">Tax Diff</span>' 
                                                        : (penaltyAmount !== 0 ? formatCurrency(penaltyAmount) : '')
                                                    }
                                                </td>
                                                <td class="border border-gray-800 px-3 py-2 text-xs text-right bg-blue-100 ${statement.penaltyDiscountType === 'tax_diff' ? 'text-green-700 font-bold' : 'font-bold'}">${total > 0 ? formatCurrency(roundToEven(total)) : ''}</td>
                                            </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan="9" class="border border-gray-800 px-3 py-2 text-xs font-bold text-right bg-gray-50">ENVI. FEE</td>
                                            <td class="border border-gray-800 px-3 py-2 text-xs text-right bg-gray-50">
                                                ${batch.envi_fee > 0 ? formatCurrency(parseFloat(batch.envi_fee)) : ''}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan="9" class="border border-gray-800 px-3 py-2 text-xs font-bold text-right bg-blue-50">GRAND TOTAL</td>
                                            <td class="border border-gray-800 px-3 py-2 text-xs text-right font-bold bg-blue-50">
                                                ${(() => {
                                                    // Use saved grand total from batch instead of recalculating
                                                    const savedGrandTotal = parseFloat(batch.grand_total) || 0;
                                                    return formatCurrency(roundToEven(savedGrandTotal));
                                                })()}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            
                            <!-- Notice Section -->
                            <div class="notice-section">
                                <div class="notice-banner">
                                    <p class="notice-text">"Please disregard this notice if payment has been made."</p>
                                </div>
                            </div>
                            
                            <!-- Signature Section -->
                            <div class="signature-section">
                                <div class="signature-row">
                                    <div class="signature-block">
                                        <p class="text-xs font-medium text-gray-900 mb-6">Prepared by:</p>
                                        <div class="signature-line">
                                            <p class="text-sm font-bold text-gray-900 text-center">${batch.prepared_by || (batch.user_id ? `User ${batch.user_id}` : 'System Generated')}</p>
                                            <p class="text-xs text-gray-700">MTO STAFF</p>
                                        </div>
                                    </div>
                                    <div class="signature-block">
                                        <p class="text-xs font-medium text-gray-900 mb-6">Certified Correct By:</p>
                                        <div class="signature-line">
                                            <p class="text-sm font-bold text-gray-900 text-center">${batch.certified_by || 'Lalaine M. Cariliman'}</p>
                                            <p class="text-xs text-gray-700">Acting Municipal Treasurer</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Contact Us Section -->
                            <div class="contact-section">
                                <div class="contact-info">
                                    <div class="contact-item">
                                        <span class="contact-title">Contact Us :</span>
                                    </div>
                                    <div class="contact-item">
                                        <svg class="contact-icon" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                        </svg>
                                        <span class="contact-text">Opol Treasury</span>
                                    </div>
                                    <div class="contact-item">
                                        <span class="contact-icon">✉️</span>
                                        <span class="contact-text">opolmuntreasureroffice@gmail.com</span>
                                    </div>
                                    <div class="contact-item">
                                        <span class="contact-icon">📞</span>
                                        <span class="contact-text">09754073090</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Bottom-left watermark -->
                            <div class="watermark-container">
                                <img src="/images/Opol-logoss.png" class="watermark-logo">
                                <span class="watermark-text">Municipal Treasurer's Office</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </body>
            </html>
        `;

        printWindow.document.write(printHTML);
        printWindow.document.close();
        printWindow.focus();
        
        // Wait for content to load, then print
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    // Filter statements by individual location (show batches that contain the location)
    const filterStatementsByLocation = (statements, location) => {
        if (location === 'NEWEST') return statements;

        return statements.filter(statement =>
            statement.location === location
        );
    };

    // Filter batches that contain selected location (keeps multiple entries intact)
    const filterBatchesByLocation = (batches, location) => {
        if (location === 'NEWEST') return batches;

        return batches.filter(batch =>
            batch.statements.some(statement => statement.location === location)
        );
    };

    // Get newest 50 batches (not individual statements)
    const getNewestStatements = (statements) => {
        // Group statements by batch first
        const batches = groupStatementsByBatch(statements);
        // Sort batches by the newest statement in each batch
        const sortedBatches = batches.sort((a, b) => {
            const aNewest = new Date(Math.max(...a.statements.map(s => new Date(s.created_at))));
            const bNewest = new Date(Math.max(...b.statements.map(s => new Date(s.created_at))));
            return bNewest - aNewest;
        });
        // Return the first 50 batches
        return sortedBatches.slice(0, 50).flatMap(batch => batch.statements);
    };

    // Search statements by multiple fields (works on batches to keep multiple entries intact)
    const searchStatements = (statements, term, activeTab = 'ALL') => {
        if (!term.trim()) return statements;

        const lowercaseTerm = term.toLowerCase();
        const searchFields = searchTabs[activeTab]?.fields || searchTabs['ALL'].fields;

        // Group statements by batch first
        const grouped = {};
        statements.forEach(statement => {
            const batchId = statement.batch_id || `individual-${statement.id}`;
            if (!grouped[batchId]) {
                grouped[batchId] = {
                    batch_id: batchId,
                    statements: [],
                    envi_fee: 0,
                    grand_total: 0,
                    created_at: statement.created_at,
                    user_id: statement.user_id,
                    prepared_by: statement.prepared_by,
                    certified_by: statement.certified_by
                };
            }
            grouped[batchId].statements.push(statement);
        });

        // Filter batches that contain matching statements based on active tab
        const matchingBatches = Object.values(grouped).filter(batch => {
            // For MTO STAFF tab, search in batch-level fields
            if (activeTab === 'MTO STAFF') {
                return (batch.prepared_by?.toLowerCase().includes(lowercaseTerm) ||
                        batch.certified_by?.toLowerCase().includes(lowercaseTerm));
            }
            
            // For other tabs, search in statement fields
            return batch.statements.some(statement => {
                return searchFields.some(field => {
                    const value = statement[field];
                    return value?.toLowerCase().includes(lowercaseTerm);
                });
            });
        });

        // Flatten back to individual statements
        return matchingBatches.flatMap(batch => batch.statements);
    };

    // Kind options
    const kindOptions = [
        'AGRI.LAND', 'RES.LAND', 'COM.LAND', 'RES.BLDG',
        'COM.BLDG', 'AGRI/RES.LAND', 'RES/COM.LAND', 'RES/COM.BLDG'
    ];

    // Payment year options
    const paymentYearOptions = [
        '2026', '2025', '2024', '2023', '2016-2022', '2008-2015', '2002-2007', '2001-1996'
    ];

    useEffect(() => {
        fetchStatements();
    }, []);

    useEffect(() => {
        setCurrentPage(1); // Reset to page 1 when filters change
    }, [selectedLocation, searchTerm, statementsPerPage]);

    // Stable update function to prevent state conflicts
    const updateFormField = (index, field, value) => {
        setEditForms(prevForms => {
            const newForms = [...prevForms];
            const updatedForm = { ...newForms[index], [field]: value };
            
            // Recalculate values when payment year or assessed value changes
            if (field === 'payment_year' || field === 'assessed_value') {
                const assessedValue = parseFloat(updatedForm.assessed_value) || 0;
                const paymentYear = updatedForm.payment_year;
                
                // Skip recalculation for Tax Diff rows - preserve existing values
                if (updatedForm.penaltyDiscountType === 'tax_diff') {
                    // For Tax Diff rows, don't recalculate fullPayment when payment_year or assessed_value changes
                    // Keep the existing fullPayment, penalty_discount (0), and total values
                    return newForms;
                }
                
                if (assessedValue > 0 && paymentYear) {
                    // Calculate years and penalty (use tax amnesty if enabled)
                    const { years, penaltyRate } = taxAmnestyEnabled 
                        ? calculateTaxAmnestyPenalty(paymentYear)
                        : calculateYearsAndPenalty(paymentYear);
                    
                    // Calculate basic/sef (2% of assessed value)
                    const basicSef = assessedValue * 0.02;
                    
                    // Calculate full payment (basic/sef * number of years)
                    const fullPayment = basicSef * years;
                    
                    // Calculate penalty/discount amount based on type
                    let penaltyAmount = 0;
                    let total = 0;
                    
                    if (updatedForm.penaltyDiscountType === 'tax_diff') {
                        // Tax Diff: Total equals Basic/SEF only (no penalty/discount)
                        penaltyAmount = 0;
                        total = roundToEven(fullPayment);
                    } else {
                        // Regular penalty/discount calculation
                        penaltyAmount = fullPayment * penaltyRate;
                        total = roundToEven(fullPayment + penaltyAmount);
                    }
                    
                    // Calculate grand total
                    const enviFee = parseFloat(updatedForm.envi_fee) || 0;
                    const grandTotal = roundToEven(total + enviFee);
                    
                    updatedForm.full_payment = fullPayment;
                    updatedForm.penalty_discount = penaltyAmount;
                    updatedForm.total = total;
                    updatedForm.grand_total = grandTotal;
                }
            }
            
            // Handle fullPayment changes in Tax Diff mode
            if (field === 'full_payment' && updatedForm.penaltyDiscountType === 'tax_diff') {
                // In Tax Diff mode, Total equals fullPayment, but ensure it's rounded to even
                updatedForm.total = roundToEven(parseFloat(value) || 0);
                // Recalculate grand total
                const enviFee = parseFloat(updatedForm.envi_fee) || 0;
                updatedForm.grand_total = roundToEven(updatedForm.total + enviFee);
            }
            
            // Also update grand total if envi_fee changes
            if (field === 'envi_fee') {
                const total = parseFloat(updatedForm.total) || 0;
                const enviFee = parseFloat(updatedForm.envi_fee) || 0;
                updatedForm.grand_total = roundToEven(total + enviFee);
            }
            
            newForms[index] = updatedForm;
            
            // Save to history after state change
            setTimeout(() => {
                saveToHistory({
                    editForms: newForms,
                    enviFee: enviFee,
                    preparedBy: preparedBy,
                    certifiedCorrectBy: certifiedCorrectBy
                });
            }, 0);
            
            return newForms;
        });
    };

    // Initialize calculations for all forms when modal opens
    const initializeCalculations = () => {
        setEditForms(prevForms => {
            return prevForms.map(form => {
                // Skip recalculation for Tax Diff rows - preserve existing values
                if (form.penaltyDiscountType === 'tax_diff') {
                    return form;
                }
                
                const assessedValue = parseFloat(form.assessed_value) || 0;
                const paymentYear = form.payment_year;
                
                if (assessedValue > 0 && paymentYear) {
                    // Calculate years and penalty (use tax amnesty if enabled)
                    const { years, penaltyRate } = taxAmnestyEnabled 
                        ? calculateTaxAmnestyPenalty(paymentYear)
                        : calculateYearsAndPenalty(paymentYear);
                    
                    // Calculate basic/sef (2% of assessed value)
                    const basicSef = assessedValue * 0.02;
                    
                    // Calculate full payment (basic/sef * number of years)
                    const fullPayment = basicSef * years;
                    
                    // Calculate penalty amount
                    const penaltyAmount = fullPayment * penaltyRate;
                    
                    // Calculate total
                    const total = roundToEven(fullPayment + penaltyAmount);
                    
                    // Calculate grand total
                    const enviFee = parseFloat(form.envi_fee) || 0;
                    const grandTotal = roundToEven(total + enviFee);
                    
                    return {
                        ...form,
                        full_payment: fullPayment,
                        penalty_discount: penaltyAmount,
                        total: total,
                        grand_total: grandTotal
                    };
                }
                return form;
            });
        });
    };

    // Trigger calculation when edit forms are loaded or when modal opens
    useEffect(() => {
        if (editForms.length > 0 && showEditModal) {
            initializeCalculations();
        }
    }, [showEditModal, editForms.length]); // Run when modal opens or forms change

    // Recalculate when tax amnesty toggle changes
    useEffect(() => {
        if (editForms.length > 0 && showEditModal) {
            initializeCalculations();
        }
    }, [taxAmnestyEnabled]); // Run when tax amnesty toggle changes

    const fetchStatements = async () => {
        try {
            const response = await fetch('/api/statements/all');
            const data = await response.json();
            setStatements(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch statements');
            setLoading(false);
        }
    };

    // Group statements by batch_id
    const groupStatementsByBatch = (statements) => {
        const grouped = {};

        statements.forEach(statement => {
            const batchId = statement.batch_id || `individual-${statement.id}`;
            if (!grouped[batchId]) {
                grouped[batchId] = {
                    batch_id: statement.batch_id,
                    statements: [],
                    envi_fee: statement.envi_fee,
                    grand_total: statement.grand_total,
                    created_at: statement.created_at,
                    prepared_by: statement.prepared_by,
                    certified_by: statement.certified_by
                };
            }
            grouped[batchId].statements.push(statement);
        });

        // Sort statements within each batch by id to maintain original sequence
        Object.keys(grouped).forEach(batchId => {
            grouped[batchId].statements.sort((a, b) => a.id - b.id);
        });

        return Object.values(grouped);
    };

    const groupedStatements = (() => {
        let filteredStatements = statements;

        // Apply location filter first (works on batches to keep multiple entries intact)
        if (selectedLocation === 'NEWEST') {
            filteredStatements = getNewestStatements(statements);
        } else {
            // Group by batch first, then filter batches
            const batches = groupStatementsByBatch(statements);
            const filteredBatches = filterBatchesByLocation(batches, selectedLocation);
            filteredStatements = filteredBatches.flatMap(batch => batch.statements);
        }

        // Then apply search filter (also works on batches)
        filteredStatements = searchStatements(filteredStatements, searchTerm, activeSearchTab);

        // Finally group by batch for display
        const allGroupedStatements = groupStatementsByBatch(filteredStatements);

        // Apply pagination
        const startIndex = (currentPage - 1) * statementsPerPage;
        const endIndex = startIndex + statementsPerPage;
        return allGroupedStatements.slice(startIndex, endIndex);
    })();

    const handleDelete = async (batchId) => {
        if (confirm('Are you sure you want to delete this entire batch? This will delete all statements in this batch.')) {
            try {
                // Get all statements in this batch
                const batchStatements = statements.filter(stmt => stmt.batch_id === batchId);
                
                if (batchStatements.length === 0) {
                    setError('No statements found in this batch');
                    return;
                }
                
                // Delete all statements in the batch individually
                const deletePromises = batchStatements.map(statement =>
                    fetch(`/api/statements/${statement.id}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                        }
                    })
                );
                
                // Wait for all deletions to complete
                await Promise.all(deletePromises);
                
                fetchStatements(); // Refresh the list
            } catch (err) {
                setError('Failed to delete batch');
            }
        }
    };

    const handleEdit = (statements) => {
        // Handle both single statement and array of statements
        const statementsToEdit = Array.isArray(statements) ? statements : [statements];
                                                                            
        // Store original statements for deletion tracking
        setOriginalStatements([...statementsToEdit]);

        // Set up for editing multiple statements
        setEditingId(statementsToEdit[0].id);
        setEditForms(statementsToEdit.map(statement => ({
            id: statement.id,
            batch_id: statement.batch_id,
            declared_owner: statement.declared_owner,
            location: statement.location,
            block_lot_no: statement.block_lot_no,
            tax_dec_no: statement.tax_dec_no,
            kind: statement.kind,
            assessed_value: statement.assessed_value,
            payment_year: statement.payment_year,
            full_payment: statement.full_payment,
            penalty_discount: statement.penalty_discount,
            total: roundToEven(parseFloat(statement.total) || 0),
            envi_fee: statement.envi_fee,
            grand_total: roundToEven(parseFloat(statement.grand_total) || 0),
            prepared_by: statement.prepared_by,
            certified_by: statement.certified_by,
            penaltyDiscountType: statement.penaltyDiscountType || '',
            isUnderlined: statement.isUnderlined === true || statement.isUnderlined === 1 ? true : false
        })));

        // Set the prepared_by and certified_by state from the database
        setPreparedBy(statementsToEdit[0].prepared_by || auth?.user?.name || '');
        setCertifiedCorrectBy(statementsToEdit[0].certified_by || 'Lalaine M. Cariliman');
        setShowEditModal(true);
    };

    // Add new row function
    const handleAddRow = () => {
        // Get batch_id from existing forms if available, otherwise create a new one
        let existingBatchId = editForms.length > 0 ? editForms[0].batch_id : null;
        let currentForms = [...editForms];
        
        // If no batch_id exists, create a new one to ensure all rows are grouped together
        if (!existingBatchId) {
            existingBatchId = `batch-${Date.now()}`;
            // Update all existing forms with the new batch_id
            currentForms = editForms.map(form => ({
                ...form,
                batch_id: existingBatchId
            }));
        }

        const newForm = {
            id: `new-${Date.now()}`, // Temporary ID for new rows
            batch_id: existingBatchId, // Use the same batch_id as existing rows
            declared_owner: '',
            location: '',
            block_lot_no: '',
            tax_dec_no: '',
            kind: '',
            assessed_value: 0,
            payment_year: '',
            full_payment: 0,
            penalty_discount: 0,
            total: 0,
            envi_fee: editForms.length > 0 ? editForms[0].envi_fee : 0,
            grand_total: 0,
            prepared_by: preparedBy,
            certified_by: certifiedCorrectBy,
            penaltyDiscountType: '',
            isUnderlined: false
        };

        setEditForms([...currentForms, newForm]);
    };

    // Delete row function
    const handleDeleteRow = (index) => {
        if (editForms.length <= 1) {
            alert('Cannot delete the last row. At least one row must remain.');
            return;
        }
        
        // Show confirmation dialog
        if (confirm('Are you sure you want to delete this row? This action cannot be undone.')) {
            const newForms = editForms.filter((_, i) => i !== index);
            setEditForms(newForms);
        }
    };

    // Calculate automatic penalty based on payment year and current date
    const calculateAutomaticPenalty = (paymentYear) => {
        if (!paymentYear) return 0;
        
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // 1-12
        
        const year = parseInt(paymentYear);
        
        if (year === currentYear) {
            // Current year: -10% for Jan-Mar, then 2% per month starting April
            if (currentMonth <= 3) {
                return -0.10; // -10%
            } else {
                const monthsOverMarch = currentMonth - 3;
                return (monthsOverMarch * 0.02); // 2% per month starting April
            }
        } else if (year === currentYear - 1) {
            // Previous year: 24% + 2% per month of current year
            return 0.24 + (currentMonth * 0.02);
        } else if (year === currentYear - 2) {
            // Two years ago: 48% + 2% per month of current year
            return 0.48 + (currentMonth * 0.02);
        } else if (year === currentYear - 3) {
            // Three years ago: 72% + 2% per month of current year
            return 0.72 ;
        }
        
        return 0; // Default for other years
    };

    const handleUpdate = async () => {
        try {
            // Calculate batch grand total (sum of all row totals + ENVI FEE)
            const batchTotal = editForms.reduce((sum, form) => sum + (parseFloat(form.total) || 0), 0);
            const batchEnviFee = editForms.length > 0 ? (parseFloat(editForms[0].envi_fee) || 0) : 0;
            const batchGrandTotal = roundToEven(batchTotal + batchEnviFee);

            // Update each statement with correct grand total and preserve all fields
            const finalForms = editForms.map(form => ({
                ...form,
                grand_total: batchGrandTotal, // All rows get same grand total
                prepared_by: preparedBy,
                certified_by: certifiedCorrectBy,
                // Preserve the new fields
                penaltyDiscountType: form.penaltyDiscountType || '',
                isUnderlined: form.isUnderlined || false
            }));

            console.log('Final forms being sent to database:', finalForms);
            console.log('First form isUnderlined in save:', finalForms[0]?.isUnderlined);

            // Helper function to get CSRF token
            const getCsrfToken = () => {
                // Try meta tag first
                const metaTag = document.querySelector('meta[name="csrf-token"]');
                if (metaTag) {
                    return metaTag.getAttribute('content') || metaTag.content;
                }
                // Try window object
                if (window.Laravel && window.Laravel.csrfToken) {
                    return window.Laravel.csrfToken;
                }
                // Try global variable
                if (window.csrfToken) {
                    return window.csrfToken;
                }
                return '';
            };

            // Refresh CSRF token before making requests
            try {
                const refreshResponse = await fetch('/api/refresh-csrf');
                if (refreshResponse.ok) {
                    const refreshData = await refreshResponse.json();
                    console.log('Fresh CSRF token:', refreshData.csrf_token);
                    // Update the meta tag with fresh token
                    const metaTag = document.querySelector('meta[name="csrf-token"]');
                    if (metaTag) {
                        metaTag.setAttribute('content', refreshData.csrf_token);
                    }
                }
            } catch (refreshError) {
                console.log('Failed to refresh CSRF token:', refreshError);
            }

            const csrfToken = getCsrfToken();
            console.log('CSRF Token:', csrfToken ? 'Found' : 'Not found');
            console.log('CSRF Token length:', csrfToken?.length || 0);
            
            if (!csrfToken) {
                setError('CSRF token not found. Please refresh the page and try again.');
                return;
            }

            // Find statements that were deleted (in original but not in current)
            const originalStatementIds = originalStatements.map(stmt => stmt.id);
            const currentStatementIds = finalForms.filter(form => !form.id.toString().startsWith('new-')).map(form => form.id);
            const deletedStatementIds = originalStatementIds.filter(id => !currentStatementIds.includes(id));
            
            console.log('Original statements:', originalStatementIds);
            console.log('Current statements:', currentStatementIds);
            console.log('Statements to delete:', deletedStatementIds);
            
            // Delete the removed statements first
            if (deletedStatementIds.length > 0) {
                const deletePromises = deletedStatementIds.map(id =>
                    fetch(`/api/statements/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'X-CSRF-TOKEN': csrfToken
                        }
                    })
                );
                
                const deleteResults = await Promise.all(deletePromises);
                console.log('Delete results:', deleteResults);
                
                // Check if any deletes failed
                const failedDeletes = deleteResults.filter(response => !response.ok);
                if (failedDeletes.length > 0) {
                    console.log('Some deletes failed:', failedDeletes);
                    setError('Failed to delete some statements. Please try again.');
                    return;
                }
            }

            // Separate existing statements from new ones
            const existingForms = finalForms.filter(form => !form.id.toString().startsWith('new-'));
            const newForms = finalForms.filter(form => form.id.toString().startsWith('new-'));

            // Update existing statements
            const updatePromises = existingForms.map(form =>
                fetch(`/api/statements/${form.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken
                    },
                    body: JSON.stringify(form)
                })
            );

            // Create new statements
            const createPromises = newForms.map(form =>
                fetch('/api/statements', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken
                    },
                    body: JSON.stringify({
                        ...form,
                        batch_id: existingForms.length > 0 ? existingForms[0].batch_id : `batch-${Date.now()}`
                    })
                })
            );

            const allResults = await Promise.all([...updatePromises, ...createPromises]);

            console.log('API responses:', allResults);

            // Check for 404 errors specifically (only for updates)
            const updateResults = allResults.slice(0, existingForms.length);
            const notFoundResults = updateResults.filter(response => response.status === 404);
            if (notFoundResults.length > 0) {
                console.log('Statements not found (404):', notFoundResults.length);
                const failedIds = existingForms.filter((form, index) => updateResults[index].status === 404).map(form => form.id);
                console.log('Failed IDs:', failedIds);
                setError(`Statements with IDs ${failedIds.join(', ')} not found or you don't have permission to edit them.`);
                return;
            }

            if (allResults.every(response => response.ok)) {
                setShowEditModal(false);
                setEditForms([]);
                setOriginalStatements([]);
                fetchStatements(); // Refresh list
            } else {
                setError('Failed to update statements');
            }
        } catch (err) {
            setError('Failed to update statements');
        }
    };

    // Save history for undo functionality
    const saveToHistory = (newState) => {
        const historyItem = {
            editForms: JSON.parse(JSON.stringify(newState.editForms)),
            enviFee: newState.enviFee,
            preparedBy: newState.preparedBy,
            certifiedCorrectBy: newState.certifiedCorrectBy,
            timestamp: Date.now()
        };
        
        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);
            newHistory.push(historyItem);
            // Keep only last 50 history items
            if (newHistory.length > 50) {
                return newHistory.slice(-50);
            }
            return newHistory;
        });
        setHistoryIndex(prev => prev + 1);
    };

    // Undo function
    const undo = () => {
        if (historyIndex > 0) {
            const previousState = history[historyIndex - 1];
            setEditForms(previousState.editForms);
            setEnviFee(previousState.enviFee);
            setPreparedBy(previousState.preparedBy);
            setCertifiedCorrectBy(previousState.certifiedCorrectBy);
            setHistoryIndex(prev => prev - 1);
        }
    };

    // Check if undo is available
    const canUndo = historyIndex > 0;

    // Keyboard shortcut handler
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Ctrl+Z for undo
            if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
                event.preventDefault();
                if (canUndo) {
                    undo();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [canUndo, historyIndex]);

    // Initialize history when modal opens
    useEffect(() => {
        if (showEditModal && editForms.length > 0) {
            saveToHistory({
                editForms: editForms,
                enviFee: enviFee,
                preparedBy: preparedBy,
                certifiedCorrectBy: certifiedCorrectBy
            });
        }
    }, [showEditModal]);

    // Handle context menu
    const handleContextMenu = (event, index) => {
        event.preventDefault();
        event.stopPropagation();
        setContextMenu({
            visible: true,
            x: event.clientX,
            y: event.clientY,
            targetIndex: index
        });
    };

    // Hide context menu
    const hideContextMenu = () => {
        setContextMenu({ visible: false, x: 0, y: 0, targetIndex: null });
    };

    // Handle underline toggle for individual row
    const handleUnderlineToggle = (index) => {
        console.log('Toggle underline called for index:', index);
        console.log('Current isUnderlined value:', editForms[index]?.isUnderlined);
        
        setEditForms(prevForms => {
            const newForms = [...prevForms];
            const currentValue = newForms[index].isUnderlined || false;
            const newValue = !currentValue;
            
            console.log('Setting isUnderlined from', currentValue, 'to', newValue);
            
            newForms[index] = { ...newForms[index], isUnderlined: newValue };
            
            // Save to history
            setTimeout(() => {
                saveToHistory({
                    editForms: newForms,
                    enviFee: enviFee,
                    preparedBy: preparedBy,
                    certifiedCorrectBy: certifiedCorrectBy
                });
            }, 0);
            
            return newForms;
        });
        hideContextMenu();
    };

    // Close context menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            hideContextMenu();
        };
        
        if (contextMenu.visible) {
            document.addEventListener('click', handleClickOutside);
            return () => {
                document.removeEventListener('click', handleClickOutside);
            };
        }
    }, [contextMenu.visible]);

    // Handle Tax Diff selection
    const handleTaxDiffSelect = (index) => {
        setEditForms(prevForms => {
            const newForms = [...prevForms];
            const updatedForm = { ...newForms[index], penaltyDiscountType: 'tax_diff' };
            
            // Recalculate with Tax Diff logic
            const assessedValue = parseFloat(updatedForm.assessed_value) || 0;
            const paymentYear = updatedForm.payment_year;
            
            // Calculate years and penalty (use tax amnesty if enabled)
            const { years } = taxAmnestyEnabled 
                ? calculateTaxAmnestyPenalty(paymentYear)
                : calculateYearsAndPenalty(paymentYear);
            
            // Calculate basic/sef (2% of assessed value)
            const basicSef = assessedValue * 0.02;
            
            // Calculate full payment (basic/sef * number of years)
            const fullPayment = basicSef * years;
            
            // Tax Diff: Total equals Basic/SEF only (no penalty/discount)
            const total = roundToEven(fullPayment);
            
            updatedForm.full_payment = fullPayment;
            updatedForm.penalty_discount = 0;
            updatedForm.total = total;
            
            newForms[index] = updatedForm;
            
            // Save to history
            setTimeout(() => {
                saveToHistory({
                    editForms: newForms,
                    enviFee: enviFee,
                    preparedBy: preparedBy,
                    certifiedCorrectBy: certifiedCorrectBy
                });
            }, 0);
            
            return newForms;
        });
    };

    // Handle removing Tax Diff (switch back to normal)
    const handleRemoveTaxDiff = (index) => {
        setEditForms(prevForms => {
            const newForms = [...prevForms];
            const updatedForm = { ...newForms[index], penaltyDiscountType: '' };
            
            // Recalculate with normal logic
            const assessedValue = parseFloat(updatedForm.assessed_value) || 0;
            const paymentYear = updatedForm.payment_year;
            
            // Calculate years and penalty (use tax amnesty if enabled)
            const { years, penaltyRate } = taxAmnestyEnabled 
                ? calculateTaxAmnestyPenalty(paymentYear)
                : calculateYearsAndPenalty(paymentYear);
            
            // Calculate basic/sef (2% of assessed value)
            const basicSef = assessedValue * 0.02;
            
            // Calculate full payment (basic/sef * number of years)
            const fullPayment = basicSef * years;
            
            // Regular penalty/discount calculation
            const penaltyAmount = fullPayment * penaltyRate;
            const total = roundToEven(fullPayment + penaltyAmount);
            
            updatedForm.full_payment = fullPayment;
            updatedForm.penalty_discount = penaltyAmount;
            updatedForm.total = total;
            
            newForms[index] = updatedForm;
             
            // Save to history
            setTimeout(() => {
                saveToHistory({
                    editForms: newForms,
                    enviFee: enviFee,
                    preparedBy: preparedBy,
                    certifiedCorrectBy: certifiedCorrectBy
                });
            }, 0);
            
            return newForms;
        });
    };

    // Calculate number of years from range and penalty
    const calculateYearsAndPenalty = (paymentYear) => {
        if (!paymentYear) return { years: 0, penaltyRate: 0 };
        
        // Handle year range (e.g., "2018-2022")
        if (paymentYear.includes('-')) {
            const [startYear, endYear] = paymentYear.split('-').map(y => parseInt(y.trim()));
            if (!isNaN(startYear) && !isNaN(endYear)) {
                const years = endYear - startYear + 1;
                // Calculate penalty: 24% per year, max 72%
                const penaltyRate = Math.min(years * 0.24, 0.72);
                return { years, penaltyRate };
            }
        }
        
        // Handle single year
        const year = parseInt(paymentYear);
        if (!isNaN(year)) {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth() + 1; // 1-12
            
            if (year === currentYear) {
                // Current year: -10% for Jan-Mar, then 2% per month starting April
                if (currentMonth <= 3) {
                    return { years: 1, penaltyRate: -0.10 };
                } else {
                    const monthsOverMarch = currentMonth - 3;
                    return { years: 1, penaltyRate: monthsOverMarch * 0.02 };
                }
            } else if (year === currentYear - 1) {
                // Previous year: 24% + 2% per month of current year
                return { years: 1, penaltyRate: 0.24 + (currentMonth * 0.02) };
            } else if (year === currentYear - 2) {
                // Two years ago: 48% + 2% per month of current year
                return { years: 1, penaltyRate: 0.48 + (currentMonth * 0.02) };
            } else if (year === currentYear - 3) {
                // Three years ago: 72% + 2% per month of current year
                return { years: 1, penaltyRate: 0.72 };
            }
            
            return { years: 1, penaltyRate: 0 };
        }
        
        return { years: 0, penaltyRate: 0 };
    };

    // Calculate penalty rates for tax amnesty (April-July 2026)
    const calculateTaxAmnestyPenalty = (paymentYear) => {
        if (!paymentYear) return { years: 1, penaltyRate: 0 };
        
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // 1-12
        
        // Only apply tax amnesty for April-July 2026
        if (currentYear === 2026 && currentMonth >= 4 && currentMonth <= 7) {
            const year = parseInt(paymentYear);
            
            if (year === 2026) {
                // 2026: Different penalty rates per month
                if (currentMonth === 4) return { years: 1, penaltyRate: 0.08 };      // April: 8%
                if (currentMonth === 5) return { years: 1, penaltyRate: 0.10 };      // May: 10%
                if (currentMonth === 6) return { years: 1, penaltyRate: 0.12 };      // June: 12%
                if (currentMonth === 7) return { years: 1, penaltyRate: 0.14 };      // July: 14%
            } else if (year === 2025) {
                // 2025: Different penalty rates per month
                if (currentMonth === 4) return { years: 1, penaltyRate: 0.32 };      // April: 32%
                if (currentMonth === 5) return { years: 1, penaltyRate: 0.34 };      // May: 34%
                if (currentMonth === 6) return { years: 1, penaltyRate: 0.36 };      // June: 36%
                if (currentMonth === 7) return { years: 1, penaltyRate: 0.36 };      // July: 36%
            } else if (year === 2024) {
                // 2024: Different penalty rates per month
                if (currentMonth === 4) return { years: 1, penaltyRate: 0.44 };      // April: 44%
                if (currentMonth === 5) return { years: 1, penaltyRate: 0.46 };      // May: 46%
                if (currentMonth === 6) return { years: 1, penaltyRate: 0.48 };      // June: 48%
                if (currentMonth === 7) return { years: 1, penaltyRate: 0.48 };      // July: 48%
            } else if (year <= 2023) {
                // 2023 and below: No penalty
                return { years: 1, penaltyRate: 0 };
            }
        }
        
        // If not in tax amnesty period, use regular calculation
        return calculateYearsAndPenalty(paymentYear);
    };

    // Calculate values automatically when form changes
    const calculateValues = (index, fieldName, value) => {
        const updatedForms = [...editForms];
        const updatedForm = { ...updatedForms[index], [fieldName]: value };

        // Always calculate when payment year or assessed value changes
        if (fieldName === 'payment_year' || fieldName === 'assessed_value') {
            const assessedValue = parseFloat(updatedForm.assessed_value) || 0;
            const paymentYear = updatedForm.payment_year;
            
            // Calculate years and penalty (use tax amnesty if enabled)
            const { years, penaltyRate } = taxAmnestyEnabled 
                ? calculateTaxAmnestyPenalty(paymentYear)
                : calculateYearsAndPenalty(paymentYear);
            
            // Calculate basic/sef (2% of assessed value)
            const basicSef = assessedValue * 0.02;
            
            // Calculate full payment (basic/sef * number of years)
            const fullPayment = basicSef * years;
            
            // Calculate penalty amount
            const penaltyAmount = fullPayment * penaltyRate;
            
            // Calculate total
            const total = roundToEven(fullPayment + penaltyAmount);
            
            updatedForm.full_payment = fullPayment;
            updatedForm.penalty_discount = penaltyAmount;
            updatedForm.total = total;
        }

        // Calculate grand total
        const total = parseFloat(updatedForm.total) || 0;
        const enviFee = parseFloat(updatedForm.envi_fee) || 0;
        updatedForm.grand_total = roundToEven(total + enviFee);

        updatedForms[index] = updatedForm;
        setEditForms(updatedForms);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    // Calculate total pages for pagination
    const getTotalPages = () => {
        let filteredStatements = statements;

        // Apply same filters as in groupedStatements but without pagination
        if (selectedLocation === 'NEWEST') {
            filteredStatements = getNewestStatements(statements);
        } else {
            const batches = groupStatementsByBatch(statements);
            const filteredBatches = filterBatchesByLocation(batches, selectedLocation);
            filteredStatements = filteredBatches.flatMap(batch => batch.statements);
        }

        filteredStatements = searchStatements(filteredStatements, searchTerm);
        const allGroupedStatements = groupStatementsByBatch(filteredStatements);

        return Math.ceil(allGroupedStatements.length / statementsPerPage);
    };

    const totalPages = getTotalPages();

    // Get total filtered statements count for display
    const getTotalFilteredStatements = () => {
        let filteredStatements = statements;

        if (selectedLocation === 'NEWEST') {
            filteredStatements = getNewestStatements(statements);
        } else {
            const batches = groupStatementsByBatch(statements);
            const filteredBatches = filterBatchesByLocation(batches, selectedLocation);
            filteredStatements = filteredBatches.flatMap(batch => batch.statements);
        }

        filteredStatements = searchStatements(filteredStatements, searchTerm, activeSearchTab);
        const allGroupedStatements = groupStatementsByBatch(filteredStatements);

        return allGroupedStatements.length;
    };

    const totalFilteredStatements = getTotalFilteredStatements();

    if (loading) {
        return (
            <AuthenticatedLayout
                header={
                    <div className="flex items-center space-x-3">
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Saved Statements
                        </h2>
                    </div>
                }
            >
                <Head title="Saved Statements" />
                <div className="py-6">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="text-center">
                            <p>Loading...</p>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    if (error) {
        return (
            <AuthenticatedLayout
                header={
                    <div className="flex items-center space-x-3">
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Saved Statements
                        </h2>
                    </div>
                }
            >
                <Head title="Saved Statements" />
                <div className="py-6">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="text-center">
                            <p className="text-red-600">{error}</p>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            Saved Statements
                        </h2>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{totalFilteredStatements} statements</span>
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    </div>
                </div>
            }
        >
            <Head title="Saved Statements" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/60">
                        <div className="px-6 py-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                    <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    All Saved Statements of Account
                                </h3>
                                <div className="flex items-center space-x-2">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h4v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                        </svg>
                                        {totalFilteredStatements} Records
                                    </span>
                                </div>
                            </div>

                            {/* Search Tabs */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                    Search Category
                                </label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {Object.entries(searchTabs).map(([key, tab]) => (
                                        <button
                                            key={key}
                                            onClick={() => setActiveSearchTab(key)}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                                                activeSearchTab === key
                                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg ring-2 ring-blue-500 ring-offset-2'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                                            }`}
                                            title={tab.description}
                                        >
                                            <span className="flex items-center">
                                                {key === 'ALL' && (
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                                    </svg>
                                                )}
                                                {key === 'MTO STAFF' && (
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    </svg>
                                                )}
                                                {tab.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                {activeSearchTab !== 'ALL' && (
                                    <div className="text-sm text-gray-600 bg-blue-50 px-4 py-3 rounded-lg border border-blue-200 flex items-center">
                                        <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h1m1-4v4m-1 4H8m8 0H8a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2z" />
                                        </svg>
                                        <span className="font-medium">Searching in:</span> {searchTabs[activeSearchTab].description}
                                    </div>
                                )}
                            </div>

                            {/* Search Bar */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Quick Search
                                </label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder={activeSearchTab === 'ALL' 
                                            ? "🔍 Search by owner, location, block/lot, tax dec, kind, payment year, or batch ID..."
                                            : activeSearchTab === 'MTO STAFF'
                                            ? "👥 Search MTO Staff names (prepared by, certified by)..."
                                            : "🔍 Search..."}
                                        className="w-full px-4 py-3 pl-12 pr-12 text-sm border border-gray-200/60 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200 group-hover:border-blue-300"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-100 rounded-r-xl transition-all duration-200 group-hover:bg-gray-50"
                                            title="Clear search"
                                        >
                                            <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                                {searchTerm && (
                                    <div className="mt-2 text-sm text-gray-600 bg-blue-50 px-4 py-3 rounded-lg border border-blue-200 flex items-center animate-pulse">
                                        <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {activeSearchTab === 'ALL' 
                                            ? `Searching for: "${searchTerm}"`
                                            : `Searching for "${searchTerm}" in ${searchTabs[activeSearchTab].label.toLowerCase()} fields`}
                                    </div>
                                )}
                            </div>

                            {/* Tax Amnesty Toggle */}
                            <div className="mb-6 flex items-center justify-between bg-amber-50 border border-amber-200 p-4 rounded-xl">
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700">Tax Amnesty Calculator</span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        (April-July 2026 special rates)
                                    </span>
                                </div>
                                <button
                                    onClick={() => setTaxAmnestyEnabled(!taxAmnestyEnabled)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                                        taxAmnestyEnabled ? 'bg-amber-600' : 'bg-gray-300'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                                            taxAmnestyEnabled ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                                <span className={`text-sm font-medium ${
                                    taxAmnestyEnabled ? 'text-amber-700' : 'text-gray-500'
                                }`}>
                                    {taxAmnestyEnabled ? 'ON' : 'OFF'}
                                </span>
                            </div>

                            {/* Selection Controls */}
                            <div className="mb-6 bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <label className="flex items-center space-x-3 cursor-pointer group hover:bg-white p-2 rounded-lg transition-all duration-200">
                                            <input
                                                type="checkbox"
                                                checked={selectedStatements.size > 0 && groupedStatements.length > 0 && selectedStatements.size === groupedStatements.length}
                                                onChange={handleSelectAll}
                                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 focus:ring-2 border-gray-300 rounded transition-all duration-200 group-hover:scale-110"
                                            />
                                            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 flex items-center">
                                                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                Select All ({selectedStatements.size} selected)
                                            </span>
                                        </label>
                                        {selectedStatements.size > 0 && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse">
                                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                {selectedStatements.size} item{selectedStatements.size !== 1 ? 's' : ''} selected
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={handlePrintSelected}
                                            disabled={selectedStatements.size === 0}
                                            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center ${
                                                selectedStatements.size > 0
                                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 ring-2 ring-blue-500 ring-offset-2'
                                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                            }`}
                                            title={selectedStatements.size === 0 ? 'Select items to print' : `Print ${selectedStatements.size} selected item${selectedStatements.size !== 1 ? 's' : ''}`}
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                            </svg>
                                            Print ({selectedStatements.size})
                                        </button>
                                        <button
                                            onClick={() => setSelectedStatements(new Set())}
                                            disabled={selectedStatements.size === 0}
                                            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center ${
                                                selectedStatements.size > 0
                                                    ? 'bg-gray-600 text-white hover:bg-gray-700 hover:shadow-md'
                                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                            }`}
                                            title={selectedStatements.size === 0 ? 'No items to clear' : 'Clear all selections'}
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Clear
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Location Filter */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Filter by Location
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                    <button
                                        onClick={() => setSelectedLocation('NEWEST')}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 flex items-center justify-center ${
                                            selectedLocation === 'NEWEST'
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg ring-2 ring-blue-500 ring-offset-2'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                                        }`}
                                        title="Show the 50 most recent statements"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        NEWEST
                                    </button>
                                    {locations.map(location => (
                                        <button
                                            key={location}
                                            onClick={() => setSelectedLocation(location)}
                                            className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                                                selectedLocation === location
                                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg ring-2 ring-blue-500 ring-offset-2'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                                            }`}
                                            title={`Filter by ${location}`}
                                        >
                                            {location}
                                        </button>
                                    ))}
                                </div>
                                {selectedLocation !== 'NEWEST' && (
                                    <div className="mt-3 text-sm text-gray-600 bg-blue-50 px-4 py-3 rounded-lg border border-blue-200 flex items-center">
                                        <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="font-medium">Showing SOA from:</span> <span className="ml-1 font-bold text-blue-700">{selectedLocation}</span>
                                    </div>
                                )}
                                {selectedLocation === 'NEWEST' && (
                                    <div className="mt-3 text-sm text-gray-600 bg-amber-50 px-4 py-3 rounded-lg border border-amber-200 flex items-center">
                                        <svg className="w-4 h-4 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="font-medium">Showing 50 newest SOA</span>
                                    </div>
                                )}
                            </div>

                            {/* Pagination Options */}
                            <div className="mb-6 bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200">
                                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                    Display Options
                                </label>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                                    <div className="flex items-center space-x-4">
                                        <label className="text-sm font-medium text-gray-700">Items per page:</label>
                                        <select
                                            value={statementsPerPage}
                                            onChange={(e) => setStatementsPerPage(parseInt(e.target.value))}
                                            className="px-4 py-2 border border-gray-200/60 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white/80 backdrop-blur-sm transition-all duration-200 hover:border-blue-300"
                                        >
                                            {paginationOptions.map(option => (
                                                <option key={option} value={option}>
                                                    {option} per page
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm text-gray-600">
                                            Currently showing <span className="font-semibold text-blue-600">{statementsPerPage}</span> statements per page
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {groupedStatements.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="h-20 w-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No saved statements found</h3>
                                    <p className="text-gray-500 text-sm mb-6">Try adjusting your search terms or filters</p>
                                    <div className="flex justify-center space-x-3">
                                        <button
                                            onClick={() => {
                                                setSearchTerm('');
                                                setSelectedLocation('NEWEST');
                                                setActiveSearchTab('ALL');
                                            }}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                        >
                                            Clear All Filters
                                        </button>
                                        <button
                                            onClick={() => fetchStatements()}
                                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                                        >
                                            Refresh Data
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-6">
                                        {groupedStatements.map((batch, index) => (
                                            <div key={batch.batch_id || `batch-${index}`} className="bg-white shadow-lg border-2 border-gray-800 overflow-hidden relative">
                                                {/* Selection Checkbox */}
                                                <div className="absolute top-2 left-2 z-10">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedStatements.has(batch.batch_id)}
                                                        onChange={() => handleSelectStatement(batch.batch_id)}
                                                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                                                    />
                                                </div>
                                                {/* Header Section */}
                                                <div className="bg-white p-4">
                                                    {/* Top Header - Centered Logo and Text */}
                                                    <div className="flex items-center justify-center mb-4 space-x-4">
                                                            <img
        src="/images/Untitled.png"
        alt="Logo"
        className="absolute left-1/2 -translate-x-[230px] h-20 w-20 object-contain"
    />
                                                        <div className="text-center">
                                                            <p className="text-base font-medium text-gray-900">Province of Misamis Oriental</p>
                                                            <h1 className="text-2xl font-bold text-gray-900">MUNICIPALITY OF OPOL</h1>
                                                            <h1 className="text-2xs font-bold text-gray-900">Municipal Treasurer's Office</h1>
                                                        </div>
                                                    </div>

                                                    {/* Statement of Account Banner */}
                                                    <div className="bg-blue-600 text-white py-3 px-4 rounded mb-4 relative">
                                                        <h2 className="text-lg font-bold text-center">STATEMENT OF ACCOUNT</h2>
                                                        {batch.created_at && (
                                                            <div className="absolute top-3 right-4 text-white text-xs">
                                                                <span className="font-medium"> </span>
                                                                <span>{formatDate(batch.created_at)}</span>
                                                            </div>
                                                        )}
                                                        {!batch.created_at && batch.statements && batch.statements.length > 0 && batch.statements[0].created_at && (
                                                            <div className="absolute top-3 right-4 text-white text-xs">
                                                                <span className="font-medium">Saved: </span>
                                                                <span>{formatDate(batch.statements[0].created_at)}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Statement Table For SavedStatements*/}
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full border-collapse border-2 border-gray-800 bg-white">
                                                            <thead>
                                                                <tr className="bg-gray-100">
                                                                    <th className="border border-gray-800 px-3 py-2 text-xs font-bold text-left" style={{width: '200px', wordWrap: 'break-word'}}>Declared Owner</th>
                                                                    <th className="border border-gray-800 px-3 py-2 text-xs font-bold text-left" style={{width: '120px', wordWrap: 'break-word'}}>Location</th>
                                                                    <th className="border border-gray-800 px-3 py-2 text-xs font-bold text-left whitespace-nowrap">Block & Lot No.</th>
                                                                    <th className="border border-gray-800 px-3 py-2 text-xs font-bold text-left whitespace-nowrap">Tax Dec. No.</th>
                                                                    <th className="border border-gray-800 px-3 py-2 text-xs font-bold text-left whitespace-nowrap">KIND</th>
                                                                    <th className="border border-gray-800 px-3 py-2 text-xs font-bold text-right whitespace-nowrap">ASSESSED VALUE</th>
                                                                    <th className="border border-gray-800 px-3 py-2 text-xs font-bold text-center whitespace-nowrap">PAYMENT YEAR</th>
                                                                    <th className="border border-gray-800 px-3 py-2 text-xs font-bold text-right whitespace-nowrap">BASIC/SEF</th>
                                                                    <th className="border border-gray-800 px-3 py-2 text-xs font-bold text-right whitespace-nowrap">PENALTY/Discount</th>
                                                                    <th className="border border-gray-800 px-3 py-2 text-xs font-bold text-right whitespace-nowrap">TOTAL</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {batch.statements.map((statement) => {
                                                                    // Use saved values instead of recalculating
                                                                    const assessedValue = parseFloat(statement.assessed_value) || 0;
                                                                    const fullPayment = parseFloat(statement.full_payment) || 0;
                                                                    const penaltyAmount = parseFloat(statement.penalty_discount) || 0;
                                                                    const total = parseFloat(statement.total) || 0;
                                                                    
                                                                    return (
                                                                    <tr key={statement.id}>
                                                                        <td className="border border-gray-800 px-3 py-2 text-xs" style={{width: '200px', wordWrap: 'break-word', verticalAlign: 'top'}}>
                                                                            {statement.declared_owner || '-'}
                                                                        </td>
                                                                        <td className="border border-gray-800 px-3 py-2 text-xs" style={{width: '120px', wordWrap: 'break-word', verticalAlign: 'top'}}>
                                                                            {statement.location || '-'}
                                                                        </td>
                                                                        <td className="border border-gray-800 px-3 py-2 text-xs">
                                                                            {statement.block_lot_no || '-'}
                                                                        </td>
                                                                        <td className="border border-gray-800 px-3 py-2 text-xs">
                                                                            {statement.tax_dec_no || '-'}
                                                                        </td>
                                                                        <td className="border border-gray-800 px-3 py-2 text-xs">
                                                                            {statement.kind || '-'}
                                                                        </td>
                                                                        <td className="border border-gray-800 px-3 py-2 text-xs text-right bg-gray-100 font-medium">
                                                                            <div className="relative">
                                                                                {statement.assessed_value > 0 ? formatAssessedValue(parseFloat(statement.assessed_value)) : ''}
                                                                                {statement.isUnderlined && (
                                                                                    <div className="border-b-2 border-gray-800 mt-1"></div>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                        <td className="border border-gray-800 px-3 py-2 text-xs text-center">
                                                                            {statement.payment_year || '-'}
                                                                        </td>
                                                                        <td className="border border-gray-800 px-3 py-2 text-xs text-right bg-gray-100 font-medium">
                                                                            {fullPayment > 0 ? formatCurrency(fullPayment) : ''}
                                                                        </td>
                                                                        <td className="border border-gray-800 px-3 py-2 text-xs text-right bg-gray-100 font-medium">
                                                                            {statement.penaltyDiscountType === 'tax_diff' 
                                                                                ? <span className="text-green-700 font-medium">Tax Diff</span> 
                                                                                : (penaltyAmount !== 0 ? formatCurrency(penaltyAmount) : '')
                                                                            }
                                                                        </td>
                                                                        <td className={`border border-gray-800 px-3 py-2 text-xs text-right bg-blue-50 font-bold ${statement.penaltyDiscountType === 'tax_diff' ? 'text-green-700' : ''}`}>
                                                                            {total > 0 ? formatCurrency(roundToEven(total)) : ''}
                                                                        </td>
                                                                    </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                            <tfoot>
                                                                <tr>
                                                                    <td colSpan="9" className="border border-gray-800 px-3 py-2 text-xs font-bold text-right bg-gray-50">ENVI. FEE</td>
                                                                    <td className="border border-gray-800 px-3 py-2 text-xs text-right bg-gray-50">
                                                                        {batch.envi_fee > 0 ? formatCurrency(parseFloat(batch.envi_fee)) : ''}
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td colSpan="9" className="border border-gray-800 px-3 py-2 text-xs font-bold text-right bg-blue-50">GRAND TOTAL</td>
                                                                    <td className="border border-gray-800 px-3 py-2 text-xs text-right font-bold bg-blue-50">
                                                                        {formatCurrency(roundToEven(parseFloat(batch.grand_total) || 0))}
                                                                    </td>
                                                                </tr>
                                                            </tfoot>
                                                        </table>
                                                    </div>

                                                    {/* Notice Section */}
                                                    <div className="text-left mt-4 mb-4">
                                                        <p className="text-xs font-medium text-gray-900 italic">"Please disregard this notice if payment has been made."</p>
                                                    </div>

                                                    {/* Signature Section */}
                                                    <div className="flex justify-between items-start mt-8">
                                                        <div className="text-center w-5/12">
                                                            <p className="text-xs font-medium text-gray-900 mb-6">Prepared by:</p>
                                                            <div className="border-t border-gray-800 pt-2">
                                                                <p className="text-sm font-bold text-gray-900">{batch.statements[0]?.prepared_by || 'Unknown User'}</p>
                                                                <p className="text-xs text-gray-700">MTO STAFF</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-center w-5/12">
                                                            <p className="text-xs font-medium text-gray-900 mb-6">Certified Correct By:</p>
                                                            <div className="border-t border-gray-800 pt-2">
                                                                <p className="text-sm font-bold text-gray-900">{batch.statements[0]?.certified_by || 'Lalaine M. Cariliman'}</p>
                                                                <p className="text-xs text-gray-700">Acting Municipal Treasurer</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 flex justify-end space-x-3 border-t border-gray-200">
                                                    <button
                                                        onClick={() => handleEdit(batch.statements)}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 flex items-center shadow-md hover:shadow-lg"
                                                        title="Edit this statement"
                                                    >
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(batch.batch_id)}
                                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 transform hover:scale-105 flex items-center shadow-md hover:shadow-lg"
                                                        title="Delete this statement"
                                                    >
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination Controls */}
                                    {totalPages > 1 && (
                                        <div className="mt-6 bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                                                <div className="text-sm text-gray-700 flex items-center">
                                                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                                    </svg>
                                                    Showing <span className="font-semibold text-blue-600 mx-1">{((currentPage - 1) * statementsPerPage) + 1}</span> to 
                                                    <span className="font-semibold text-blue-600 mx-1">{Math.min(currentPage * statementsPerPage, totalFilteredStatements)}</span> of 
                                                    <span className="font-semibold text-blue-600 mx-1">{totalFilteredStatements}</span> entries
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                        disabled={currentPage === 1}
                                                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center ${
                                                            currentPage === 1
                                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-md'
                                                        }`}
                                                    >   
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                        </svg>
                                                        Previous
                                                    </button>

                                                {/* Page Numbers */}
                                                <div className="flex items-center space-x-1">
                                                    {[...Array(totalPages)].map((_, index) => {
                                                        const pageNumber = index + 1;
                                                        const isCurrentPage = pageNumber === currentPage;
                                                        const isNearCurrentPage = Math.abs(pageNumber - currentPage) <= 2 || pageNumber === 1 || pageNumber === totalPages;

                                                        if (!isNearCurrentPage && pageNumber !== 1 && pageNumber !== totalPages) {
                                                            if (Math.abs(pageNumber - currentPage) === 3) {
                                                                return <span key={pageNumber} className="px-2 text-gray-400">...</span>;
                                                            }
                                                            return null;
                                                        }

                                                        return (
                                                            <button
                                                                key={pageNumber}
                                                                onClick={() => setCurrentPage(pageNumber)}
                                                                className={`px-3 py-1 rounded ${isCurrentPage
                                                                    ? 'bg-blue-600 text-white'
                                                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                                }`}
                                                            >
                                                                {pageNumber}
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                    <button
                                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                        disabled={currentPage === totalPages}
                                                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center ${
                                                            currentPage === totalPages
                                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-md'
                                                        }`}
                                                    >
                                                        Next
                                                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal - Full Statement of Account Format */}
            {showEditModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 overflow-y-auto h-full w-full z-50 backdrop-blur-sm">
                    <div className="relative top-5 mx-auto p-5 border-2 border-gray-800 shadow-2xl rounded-xl bg-white max-w-7xl max-h-[95vh] overflow-y-auto animate-pulse-once">
                        <div className="bg-white p-4">
                            {/* Top Header */}
                            <div className="flex items-center justify-center mb-4 space-x-4">
                                <img
                                    src="/images/Untitled.png"
                                    alt="Logo"
                                    className="absolute left-1/2 -translate-x-[230px] h-20 w-20 object-contain"
                                />
                                <div className="text-center">
                                    <p className="text-base font-medium text-gray-900">Province of Misamis Oriental</p>
                                    <h1 className="text-2xl font-bold text-gray-900">MUNICIPALITY OF OPOL</h1>
                                    <h1 className="text-2xs font-bold text-gray-900">Municipal Treasurer's Office</h1>
                                </div>
                            </div>

                            {/* Banner */}
                            <div className="bg-blue-600 text-white py-3 px-4 rounded mb-4">
                                <h2 className="text-lg font-bold text-center">EDIT STATEMENT OF ACCOUNT</h2>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center justify-between p-4 mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                                <div className="flex items-center space-x-4">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                        <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit Statements
                                    </h2>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200">
                                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h1m1-4v4m-1 4H8m8 0H8a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2z" />
                                        </svg>
                                        <span className="font-medium">Editing {editForms.length} statement{editForms.length !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => canUndo && undo()}
                                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 ${
                                            canUndo 
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg ring-2 ring-blue-500 ring-offset-2' 
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                        title="Undo last change (Ctrl+Z)"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                        </svg>
                                        Undo
                                    </button>
                                    <button
                                        onClick={handleAddRow}
                                        className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all transform hover:scale-105 ring-2 ring-green-500 ring-offset-2"
                                        title="Add a new row for additional entries"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Row
                                    </button>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border-2 border-gray-800 bg-white">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border border-gray-800 px-3 py-2 text-xs font-bold text-left" style={{width: '200px', wordWrap: 'break-word'}}>Declared Owner</th>
                                            <th className="border border-gray-800 px-3 py-2 text-xs font-bold text-left" style={{width: '120px', wordWrap: 'break-word'}}>Location</th>
                                            <th className="border border-gray-800 px-3 py-2 text-xs font-bold text-left whitespace-nowrap">Block & Lot No.</th>
                                            <th className="border border-gray-800 px-3 py-2 text-xs font-bold text-left whitespace-nowrap">Tax Dec. No.</th>
                                            <th className="border border-gray-800 px-3 py-2 text-xs font-bold text-left whitespace-nowrap">KIND</th>
                                            <th className="border border-gray-800 px-3 py-2 text-xs font-bold text-right whitespace-nowrap">ASSESSED VALUE</th>
                                            <th className="border border-gray-800 px-3 py-2 text-xs font-bold text-center whitespace-nowrap">PAYMENT YEAR</th>
                                            <th className="border border-gray-800 px-3 py-2 text-xs font-bold text-right whitespace-nowrap">BASIC/SEF</th>
                                            <th className="border border-gray-800 px-3 py-2 text-xs font-bold text-right whitespace-nowrap">PENALTY/Discount</th>
                                            <th className="border border-gray-800 px-3 py-2 text-xs font-bold text-right whitespace-nowrap">TOTAL</th>
                                            <th className="border border-gray-800 px-3 py-2 text-xs font-bold text-center whitespace-nowrap">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {editForms.map((form, index) => (
                                            <tr key={form.id}>
                                                {/* Declared Owner */}
                                                <td className="border border-gray-800 px-3 py-2 text-xs" style={{width: '200px', wordWrap: 'break-word', verticalAlign: 'top'}}>
                                                    <input
                                                        type="text"
                                                        value={form.declared_owner || ''}
                                                        onChange={(e) => updateFormField(index, 'declared_owner', e.target.value)}
                                                        className="w-full px-2 py-1 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                                                        style={{wordWrap: 'break-word'}}
                                                    />
                                                </td>

                                                {/* Location */}
                                                <td className="border border-gray-800 px-3 py-2 text-xs" style={{width: '120px', wordWrap: 'break-word', verticalAlign: 'top'}}>
                                                    <select
                                                        value={form.location || ''}
                                                        onChange={(e) => updateFormField(index, 'location', e.target.value)}
                                                        className="w-full px-2 py-1 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                                                    >
                                                        <option value=""></option>
                                                        {locations.map(loc => (
                                                            <option key={loc} value={loc}>{loc}</option>
                                                        ))}
                                                    </select>
                                                </td>

                                                {/* Block & Lot No */}
                                                <td className="border border-gray-800 px-3 py-2 text-xs">
                                                    <input
                                                        type="text"
                                                        value={form.block_lot_no || ''}
                                                        onChange={(e) => updateFormField(index, 'block_lot_no', e.target.value)}
                                                        className="w-full px-2 py-1 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                                                    />
                                                </td>

                                                {/* Tax Dec No */}
                                                <td className="border border-gray-800 px-3 py-2 text-xs">
                                                    <input
                                                        type="text"
                                                        value={form.tax_dec_no || ''}
                                                        onChange={(e) => updateFormField(index, 'tax_dec_no', e.target.value)}
                                                        className="w-full px-2 py-1 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                                                    />
                                                </td>

                                                {/* Kind */}
                                                <td className="border border-gray-800 px-3 py-2 text-xs">
                                                    <select
                                                        value={form.kind || ''}
                                                        onChange={(e) => updateFormField(index, 'kind', e.target.value)}
                                                        className="w-full px-2 py-1 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                                                    >
                                                        <option value=""></option>
                                                        {kindOptions.map(kind => (
                                                            <option key={kind} value={kind}>{kind}</option>
                                                        ))}
                                                    </select>
                                                </td>

                                                {/* Assessed Value */}
                                                <td className="border border-gray-800 px-3 py-2 text-xs">
                                                    <div className="flex items-center space-x-1">
                                                        <div className="relative flex-1">
                                                            <input
                                                                type="text"
                                                                step="0.01"
                                                                value={form.assessed_value ? formatAssessedValue(parseFloat(form.assessed_value)) : ''}
                                                                onChange={(e) => updateFormField(index, 'assessed_value', parseFloat(e.target.value) || 0)}
                                                                onContextMenu={(e) => handleContextMenu(e, index)}
                                                                className="w-full px-2 py-1 text-xs text-right border-0 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 transition-all hover:bg-gray-100"
                                                                placeholder="0"
                                                            />
                                                            {form.isUnderlined && (
                                                                <div className="border-b-2 border-gray-800 mt-1"></div>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => handleUnderlineToggle(index)}
                                                            className={`p-1 rounded transition-colors ${
                                                                form.isUnderlined 
                                                                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                                                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                                            }`}
                                                            title={form.isUnderlined ? 'Remove underline' : 'Add underline'}
                                                        >
                                                            {/* Debug: Show current state */}
                                                            {console.log(`Button render - Row ${index} isUnderlined:`, form.isUnderlined)}
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9a2 2 0 00-2-2H9a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>

                                                {/* Payment Year */}
                                                <td className="border border-gray-800 px-3 py-2 text-xs">
                                                    <input
                                                        type="text"
                                                        value={form.payment_year || ''}
                                                        onChange={(e) => updateFormField(index, 'payment_year', e.target.value)}
                                                        placeholder="e.g., 2018-2022 or 2024"
                                                        className="w-full px-2 py-1 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                                                    />
                                                </td>

                                                {/* Full Payment */}
                                                <td className="border border-gray-800 px-3 py-2 text-xs text-right bg-gray-100 font-medium">
                                                    {form.penaltyDiscountType === 'tax_diff' ? (
                                                        <input
                                                            type="number"
                                                            value={form.full_payment !== 0 ? form.full_payment : ''}
                                                            onChange={(e) => {
                                                                const numValue = parseFloat(e.target.value) || 0;
                                                                updateFormField(index, 'full_payment', numValue);
                                                            }}
                                                            className="w-full px-2 py-1 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-green-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all"
                                                            step="0.01"
                                                            min="0"
                                                            placeholder="0.00"
                                                        />
                                                    ) : (
                                                        <span className="text-gray-700">
                                                            {form.full_payment !== 0 ? formatCurrency(form.full_payment) : ''}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Penalty/Discount */}
                                                <td className="border border-gray-800 px-3 py-2 text-xs text-right bg-gray-100 font-medium">
                                                    <div className="space-y-1">
                                                        {form.penaltyDiscountType === 'tax_diff' ? (
                                                            <div className="flex items-center justify-between p-1 bg-green-50 rounded border border-green-200">
                                                                <span className="text-xs font-medium text-green-700">Tax Diff</span>
                                                                <button
                                                                    onClick={() => handleRemoveTaxDiff(index)}
                                                                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                                                    title="Switch to normal calculation"
                                                                >
                                                                    Change
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center space-x-1 p-1 hover:bg-gray-100 rounded transition-colors">
                                                                <input
                                                                    type="text"
                                                                    value={form.penalty_discount !== 0 ? formatCurrencyTwoDecimals(form.penalty_discount) : ''}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value.replace(/[^\d.-]/g, '');
                                                                        const numValue = parseFloat(value) || 0;
                                                                        updateFormField(index, 'penalty_discount', numValue);
                                                                    }}
                                                                    className="w-full px-1 py-0 text-xs border-0 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all text-right"
                                                                    step="0.01"
                                                                    placeholder="0.00"
                                                                />
                                                                <button
                                                                    onClick={() => handleTaxDiffSelect(index)}
                                                                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline whitespace-nowrap transition-colors font-medium"
                                                                    title="Remove penalty/discount calculation"
                                                                >
                                                                    Tax Diff
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Total */}
                                                <td className="border border-gray-800 px-3 py-2 text-xs text-right bg-blue-50 font-bold">
                                                    {form.total !== 0 ? (
                                                        <div className={`font-bold ${
                                                            form.penaltyDiscountType === 'tax_diff' ? 'text-green-700' : 'text-gray-900'
                                                        }`}>
                                                            {formatCurrency(roundToEven(form.total))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">0.00</span>
                                                    )}
                                                </td>
                                                {/* Actions cell */}
                                                <td className="border border-gray-800 px-3 py-2 text-xs text-center">
                                                    <div className="flex items-center justify-center space-x-1">
                                                        <button
                                                            onClick={() => handleDeleteRow(index)}
                                                            className="bg-red-500 text-white rounded px-2 py-1 text-xs hover:bg-red-600 transition-colors font-medium"
                                                            title="Delete row"
                                                            disabled={editForms.length <= 1}
                                                        >
                                                            Delete
                                                        </button>
                                                        {!form.id.toString().startsWith('new-') ? (
                                                            <span className="text-gray-500 text-xs px-2 py-1 bg-gray-100 rounded">Existing</span>
                                                        ) : (
                                                            <span className="text-green-600 text-xs px-2 py-1 bg-green-50 rounded font-medium">New</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>

                                    {/* Footer Totals */}
                                    <tfoot>
                                        <tr>
                                            <td colSpan="9" className="border border-gray-800 px-3 py-2 text-xs font-bold text-right bg-gray-50">ENVI. FEE</td>
                                            <td className="border border-gray-800 px-3 py-2 text-xs relative bg-gray-50">
                                                <input
                                                    type="text"
                                                    step="0.01"
                                                    value={editForms.length > 0 ? (editForms[0].envi_fee || '') : ''}
                                                    onChange={(e) => {
                                                        const enviFee = parseFloat(e.target.value) || 0;
                                                        // Update all forms with the same ENVI FEE
                                                        setEditForms(prevForms => {
                                                            return prevForms.map(form => {
                                                                const total = parseFloat(form.total) || 0;
                                                                return {
                                                                    ...form,
                                                                    envi_fee: enviFee,
                                                                    grand_total: total + enviFee
                                                                };
                                                            });
                                                        });
                                                    }}
                                                    className="w-full px-2 py-1 text-xs text-right font-bold border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                                />
                                            </td>
                                            <td className="border border-gray-800 px-3 py-2 bg-gray-50 text-center">
                                                <button
                                                    onClick={handleAddRow}
                                                    className="bg-green-600 text-white rounded px-2 py-1 text-xs hover:bg-green-700 transition-colors font-medium"
                                                    title="Add new row"
                                                >
                                                    + Add Row
                                                </button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan="9" className="border border-gray-800 px-3 py-2 text-xs font-bold text-right bg-blue-50">GRAND TOTAL</td>
                                            <td className="border border-gray-800 px-3 py-2 text-xs text-right font-bold bg-blue-50">
                                                {formatCurrency(roundToEven(editForms.reduce((sum, form) => sum + (parseFloat(form.total) || 0), 0) + (editForms.length > 0 ? (parseFloat(editForms[0].envi_fee) || 0) : 0)))}
                                            </td>
                                            <td className="border border-gray-800 px-3 py-2 bg-blue-50"></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Notice & Signature */}
                            <div className="text-left mt-4 mb-4">
                                <p className="text-xs font-medium text-gray-900 italic">"Please disregard this notice if payment has been made."</p>
                            </div>

                            <div className="flex justify-between items-start mt-8">
                                <div className="text-center w-5/12">
                                    <p className="text-xs font-medium text-gray-900 mb-6">Prepared by:</p>
                                    <div className="border-t border-gray-800 pt-2">
                                        <input
                                            type="text"
                                            value={preparedBy}
                                            onChange={(e) => setPreparedBy(e.target.value)}
                                            className="text-sm font-bold text-gray-900 text-center bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded w-full"
                                            placeholder="Enter name"
                                        />
                                        <p className="text-xs text-gray-700">MTO STAFF</p>
                                    </div>
                                </div>
                                <div className="text-center w-5/12">
                                    <p className="text-xs font-medium text-gray-900 mb-6">Certified Correct By:</p>
                                    <div className="border-t border-gray-800 pt-2">
                                        <input
                                            type="text"
                                            value={certifiedCorrectBy}
                                            onChange={(e) => setCertifiedCorrectBy(e.target.value)}
                                            className="text-sm font-bold text-gray-900 text-center bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded w-full"
                                            placeholder="Enter name"
                                        />
                                        <p className="text-xs text-gray-700">Acting Municipal Treasurer</p>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Us Section */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-8">
                                     <div className="flex items-center space-x-2">
                                        
                                        <span className="text-sm font-medium text-gray-700">Contact Us : </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700">Opol Treasury</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-blue-600 text-lg">✉️</span>
                                        <span className="text-sm font-medium text-gray-700">opolmuntreasureroffice@gmail.com</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-blue-600 text-lg">📞</span>
                                        <span className="text-sm font-medium text-gray-700">09754073090</span>
                                    </div>
                                </div>
                            </div>

                            {/* Success Message */}
                            {showSaveSuccess && (
                                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center animate-pulse">
                                    <svg className="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-green-800 font-medium">Statement updated successfully!</span>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-4 flex justify-end space-x-3 border-t border-gray-200">
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setValidationErrors({});
                                        setShowSaveSuccess(false);
                                    }}
                                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all duration-200 transform hover:scale-105 font-medium"
                                >
                                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    disabled={isSubmitting}
                                    className={`px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 font-medium flex items-center ${
                                        isSubmitting 
                                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                                            : 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg ring-2 ring-green-500 ring-offset-2'
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Update Statement
                                        </>
                                    )}
                                </button>
                            </div>  
                        </div>
                    </div>
                </div>
            )}

            {/* Context Menu */}
            {contextMenu.visible && (
                <div
                    className="fixed bg-white border border-gray-300 rounded-lg shadow-xl py-2 z-50 min-w-[150px]"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-3 py-1 text-xs text-gray-500 border-b border-gray-100">
                        Underline Options
                    </div>
                    <button
                        onClick={() => handleUnderlineToggle(contextMenu.targetIndex)}
                        className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-100 transition-colors flex items-center justify-between ${
                            editForms[contextMenu.targetIndex]?.isUnderlined 
                                ? 'text-blue-700 bg-blue-50' 
                                : 'text-gray-700 hover:bg-blue-50'
                        }`}
                    >
                        <span>{editForms[contextMenu.targetIndex]?.isUnderlined ? 'Remove Underline' : 'Add Underline'}</span>
                        <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9a2 2 0 00-2-2H9a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </button>
                </div>
            )}
        </AuthenticatedLayout>
    );
}