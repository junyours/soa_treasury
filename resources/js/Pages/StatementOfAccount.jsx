import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function StatementOfAccount({ auth }) {
    // Helper function to format number with exactly 2 decimal places (truncated, not rounded)
    const formatCurrency = (num) => {
        if (!num || num === 0) return '';
        const truncated = Math.floor(num * 100) / 100;
        return truncated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // Format currency with 2 decimal places (no rounding)
    const formatCurrencyTwoDecimals = (amount) => {
        if (amount === 0 || amount === '') return '';
        return amount.toLocaleString('en-US', {
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
        // If cents is odd, round to nearest even cent
        if (cents % 2 !== 0) {
            // Round to nearest even cent (either up or down)
            return (cents + 1) / 100; // Always round up to next even cent
        }
        return cents / 100;
    };
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState('all');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [preparedBy, setPreparedBy] = useState((auth?.user?.name || '').toUpperCase());
    const [certifiedCorrectBy, setCertifiedCorrectBy] = useState('LALAINE M. CARILIMAN');
    const [saveMessage, setSaveMessage] = useState('');
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, targetId: null });
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [taxAmnestyEnabled, setTaxAmnestyEnabled] = useState(false);

    // Locations list
    const locations = [
        'Awang', 'Barra', 'Igpit', 'Malanang', 'Taboc', 'Poblacion',
        'Bonbon', 'L-Bonbon', 'Patag', 'Bagocboc', 'Tingalan',
        'Cauyonan', 'Limonda', 'Nangcaon'
    ];

    // Kind options
    const kindOptions = [
        'AGRI.LAND', 'RES.LAND', 'COM.LAND', 'RES.BLDG',
        'COM.BLDG', 'AGRI/RES.LAND', 'RES/COM.LAND', 'RES/COM.BLDG'
    ];

    // Payment year options
    const paymentYearOptions = [
        '2026', '2025', '2024', '2023', '2016-2022', '2008-2015', '2002-2007', '2001-1996'
    ];

    // Number of years options
    const yearOptions = ['', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Dynamic statements data
    const [statements, setStatements] = useState([
        {
            id: 1,
            declaredOwner: '',
            location: '',
            blockLotNo: '',
            taxDecNo: '',
            kind: '',
            assessedValue: 0,
            paymentYear: '',
            noOfYears: '',
            fullPayment: 0,
            penaltyDiscount: 0,
            penaltyDiscountInput: '',
            penaltyDiscountType: '',
            total: 0,
            isUnderlined: false
        },
        {
            id: 2,
            declaredOwner: '',
            location: '',
            blockLotNo: '',
            taxDecNo: '',
            kind: '',
            assessedValue: 0,
            paymentYear: '',
            noOfYears: '',
            fullPayment: 0,
            penaltyDiscount: 0,
            penaltyDiscountInput: '',
            penaltyDiscountType: '',
            total: 0,
            isUnderlined: false
        },
        {
            id: 3,
            declaredOwner: '',
            location: '',
            blockLotNo: '',
            taxDecNo: '',
            kind: '',
            assessedValue: 0,
            paymentYear: '',
            noOfYears: '',
            fullPayment: 0,
            penaltyDiscount: 0,
            penaltyDiscountInput: '',
            penaltyDiscountType: '',
            total: 0,
            isUnderlined: false
        },
        {
            id: 4,
            declaredOwner: '',
            location: '',
            blockLotNo: '',
            taxDecNo: '',
            kind: '',
            assessedValue: 0,
            paymentYear: '',
            noOfYears: '',
            fullPayment: 0,
            penaltyDiscount: 0,
            total: 0,
            isUnderlined: false
        }
    ]);

    // Environmental fee
    const [enviFee, setEnviFee] = useState(0);

    // Save history for undo functionality
    const saveToHistory = (newState) => {
        const historyItem = {
            statements: JSON.parse(JSON.stringify(newState.statements)),
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
            setStatements(previousState.statements);
            setEnviFee(previousState.enviFee);
            setPreparedBy(previousState.preparedBy?.toUpperCase() || '');
            setCertifiedCorrectBy(previousState.certifiedCorrectBy?.toUpperCase() || '');
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

    // Initialize history with default state
    useEffect(() => {
        saveToHistory({
            statements: statements,
            enviFee: enviFee,
            preparedBy: preparedBy,
            certifiedCorrectBy: certifiedCorrectBy
        });
    }, []);

    // Load data from localStorage on component mount
    useEffect(() => {
        const savedStatements = localStorage.getItem('statementOfAccountData');
        const savedEnviFee = localStorage.getItem('enviFee');
        const savedPreparedBy = localStorage.getItem('preparedBy');
        const savedCertifiedCorrectBy = localStorage.getItem('certifiedCorrectBy');

        if (savedStatements) {
            try {
                const parsedStatements = JSON.parse(savedStatements);
                setStatements(parsedStatements);
            } catch (error) {
                console.error('Error loading saved statements:', error);
            }
        }

        if (savedEnviFee) {
            setEnviFee(parseFloat(savedEnviFee));
        }

        if (savedPreparedBy) {
            setPreparedBy(savedPreparedBy.toUpperCase());
        }

        if (savedCertifiedCorrectBy) {
            setCertifiedCorrectBy(savedCertifiedCorrectBy.toUpperCase());
        }
    }, []);

    // Save statements to localStorage whenever they change
    useEffect(() => {
        if (statements.length > 0) {
            localStorage.setItem('statementOfAccountData', JSON.stringify(statements));
        }
    }, [statements]);

    // Save enviFee to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('enviFee', enviFee.toString());
        // Save to history when enviFee changes
        if (history.length > 0) { // Don't save initial state
            setTimeout(() => {
                saveToHistory({
                    statements: statements,
                    enviFee: enviFee,
                    preparedBy: preparedBy,
                    certifiedCorrectBy: certifiedCorrectBy
                });
            }, 0);
        }
    }, [enviFee]);

    // Save preparedBy to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('preparedBy', preparedBy);
        // Save to history when preparedBy changes
        if (history.length > 0) { // Don't save initial state
            setTimeout(() => {
                saveToHistory({
                    statements: statements,
                    enviFee: enviFee,
                    preparedBy: preparedBy,
                    certifiedCorrectBy: certifiedCorrectBy
                });
            }, 0);
        }
    }, [preparedBy]);

    // Save certifiedCorrectBy to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('certifiedCorrectBy', certifiedCorrectBy);
        // Save to history when certifiedCorrectBy changes
        if (history.length > 0) { // Don't save initial state
            setTimeout(() => {
                saveToHistory({
                    statements: statements,
                    enviFee: enviFee,
                    preparedBy: preparedBy,
                    certifiedCorrectBy: certifiedCorrectBy
                });
            }, 0);
        }
    }, [certifiedCorrectBy]);

    // Recalculate when tax amnesty toggle changes
    useEffect(() => {
        // Trigger recalculation for all statements when tax amnesty toggle changes
        setStatements(prevStatements => {
            return prevStatements.map(statement => {
                const updatedStatement = { ...statement };
                const assessedValue = parseFloat(updatedStatement.assessedValue) || 0;
                const paymentYear = updatedStatement.paymentYear;

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
                    
                    if (updatedStatement.penaltyDiscountType === 'tax_diff') {
                        // Tax Diff: Total equals Basic/SEF only (no penalty/discount)
                        penaltyAmount = 0;
                        total = roundToEven(fullPayment);
                    } else {
                        // Regular penalty/discount calculation
                        penaltyAmount = fullPayment * penaltyRate;
                        total = roundToEven(fullPayment + penaltyAmount);
                    }

                    updatedStatement.fullPayment = fullPayment;
                    updatedStatement.penaltyDiscount = penaltyAmount;
                    updatedStatement.total = total;
                    updatedStatement.noOfYears = years;
                }

                return updatedStatement;
            });
        });
    }, [taxAmnestyEnabled]);

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
            } else if (year <= currentYear - 3) {
                // Three or more years ago: 72%
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
        
        // Handle year range (e.g., "2020-2022")
        if (paymentYear.includes('-')) {
            const [startYear, endYear] = paymentYear.split('-').map(y => parseInt(y.trim()));
            if (!isNaN(startYear) && !isNaN(endYear)) {
                const years = endYear - startYear + 1;
                
                // Only apply tax amnesty for April-July 2026
                if (currentYear === 2026 && currentMonth >= 4 && currentMonth <= 7) {
                    // For tax amnesty, we need to calculate the average penalty rate for the range
                    let totalPenaltyRate = 0;
                    
                    for (let year = startYear; year <= endYear; year++) {
                        if (year === 2026) {
                            // 2026: Different penalty rates per month
                            if (currentMonth === 4) totalPenaltyRate += 0.08;      // April: 8%
                            else if (currentMonth === 5) totalPenaltyRate += 0.10;  // May: 10%
                            else if (currentMonth === 6) totalPenaltyRate += 0.12;  // June: 12%
                            else if (currentMonth === 7) totalPenaltyRate += 0.14;  // July: 14%
                        } else if (year === 2025) {
                            // 2025: Different penalty rates per month
                            if (currentMonth === 4) totalPenaltyRate += 0.32;      // April: 32%
                            else if (currentMonth === 5) totalPenaltyRate += 0.34;  // May: 34%
                            else if (currentMonth === 6) totalPenaltyRate += 0.36;  // June: 36%
                            else if (currentMonth === 7) totalPenaltyRate += 0.36;  // July: 36%
                        } else if (year === 2024) {
                            // 2024: Different penalty rates per month
                            if (currentMonth === 4) totalPenaltyRate += 0.44;      // April: 44%
                            else if (currentMonth === 5) totalPenaltyRate += 0.46;  // May: 46%
                            else if (currentMonth === 6) totalPenaltyRate += 0.48;  // June: 48%
                            else if (currentMonth === 7) totalPenaltyRate += 0.48;  // July: 48%
                        } else if (year <= 2023) {
                            // 2023 and below: No penalty
                            totalPenaltyRate += 0;
                        }
                    }
                    
                    // Return average penalty rate for the range
                    return { years, penaltyRate: totalPenaltyRate / years };
                }
            }
        }
        
        // Handle single year
        const year = parseInt(paymentYear);
        if (!isNaN(year)) {
            // Only apply tax amnesty for April-July 2026
            if (currentYear === 2026 && currentMonth >= 4 && currentMonth <= 7) {
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
        }
        
        // If not in tax amnesty period, use regular calculation
        return calculateYearsAndPenalty(paymentYear);
    };

    // Handle context menu
    const handleContextMenu = (event, id) => {
        event.preventDefault();
        event.stopPropagation();
        setContextMenu({
            visible: true,
            x: event.clientX,
            y: event.clientY,
            targetId: id
        });
    };

    // Hide context menu
    const hideContextMenu = () => {
        setContextMenu({ visible: false, x: 0, y: 0, targetId: null });
    };

    // Handle underline toggle for individual row
    const handleUnderlineToggle = (id) => {
        setStatements(prevStatements => {
            const newStatements = prevStatements.map(statement => {
                if (statement.id === id) {
                    return { ...statement, isUnderlined: !statement.isUnderlined };
                }
                return statement;
            });
            
            // Save to history
            setTimeout(() => {
                saveToHistory({
                    statements: newStatements,
                    enviFee: enviFee,
                    preparedBy: preparedBy,
                    certifiedCorrectBy: certifiedCorrectBy
                });
            }, 0);
            
            return newStatements;
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
    const handleTaxDiffSelect = (id) => {
        setStatements(prevStatements => {
            const newStatements = prevStatements.map(statement => {
                if (statement.id === id) {
                    const updatedStatement = { ...statement, penaltyDiscountType: 'tax_diff' };
                    
                    // Recalculate with Tax Diff logic
                    const assessedValue = parseFloat(updatedStatement.assessedValue) || 0;
                    const paymentYear = updatedStatement.paymentYear;
                    
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
                    
                    updatedStatement.fullPayment = fullPayment;
                    updatedStatement.penaltyDiscount = 0;
                    updatedStatement.total = total;
                    updatedStatement.noOfYears = years;
                    
                    return updatedStatement;
                }
                return statement;
            });
            
            // Save to history
            setTimeout(() => {
                saveToHistory({
                    statements: newStatements,
                    enviFee: enviFee,
                    preparedBy: preparedBy,
                    certifiedCorrectBy: certifiedCorrectBy
                });
            }, 0);
            
            return newStatements;
        });
    };

    // Handle removing Tax Diff (switch back to normal)
    const handleRemoveTaxDiff = (id) => {
        setStatements(prevStatements => {
            const newStatements = prevStatements.map(statement => {
                if (statement.id === id) {
                    const updatedStatement = { ...statement, penaltyDiscountType: '' };
                    
                    // Recalculate with normal logic
                    const assessedValue = parseFloat(updatedStatement.assessedValue) || 0;
                    const paymentYear = updatedStatement.paymentYear;
                    
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
                    
                    updatedStatement.fullPayment = fullPayment;
                    updatedStatement.penaltyDiscount = penaltyAmount;
                    updatedStatement.total = total;
                    updatedStatement.noOfYears = years;
                    
                    return updatedStatement;
                }
                return statement;
            });

            // Save to history
            setTimeout(() => {
                saveToHistory({
                    statements: newStatements,
                    enviFee: enviFee,
                    preparedBy: preparedBy,
                    certifiedCorrectBy: certifiedCorrectBy
                });
            }, 0);
            
            return newStatements;
        });
    };

    // Update statement field with automatic penalty calculation
    const updateStatement = (id, field, value) => {
        setStatements(prevStatements => {
            const newStatements = prevStatements.map(statement => {
                if (statement.id === id) {
                    const updatedStatement = { ...statement, [field]: value };

                    // Recalculate values when payment year or assessed value changes
                    if (field === 'paymentYear' || field === 'assessedValue') {
                        const assessedValue = parseFloat(updatedStatement.assessedValue) || 0;
                        const paymentYear = updatedStatement.paymentYear;

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
                        
                        if (updatedStatement.penaltyDiscountType === 'tax_diff') {
                            // Tax Diff: Total equals Basic/SEF only (no penalty/discount)
                            penaltyAmount = 0;
                            total = roundToEven(fullPayment);
                        } else {
                            // Regular penalty/discount calculation
                            penaltyAmount = fullPayment * penaltyRate;
                            total = roundToEven(fullPayment + penaltyAmount);
                        }

                        updatedStatement.fullPayment = fullPayment;
                        updatedStatement.penaltyDiscount = penaltyAmount;
                        updatedStatement.total = total;
                        updatedStatement.noOfYears = years;
                    }

                    // Handle fullPayment changes in Tax Diff mode
                    if (field === 'fullPayment' && updatedStatement.penaltyDiscountType === 'tax_diff') {
                        // In Tax Diff mode, Total equals fullPayment
                        updatedStatement.total = parseFloat(value) || 0;
                    }

                    return updatedStatement;
                }
                return statement;
            });
            
            // Save to history after state change
            setTimeout(() => {
                saveToHistory({
                    statements: newStatements,
                    enviFee: enviFee,
                    preparedBy: preparedBy,
                    certifiedCorrectBy: certifiedCorrectBy
                });
            }, 0);
            
            return newStatements;
        });
    };

    // Calculate RPT total (sum of all statement totals, excluding environmental fee)
    const rptTotal = roundToEven(statements.reduce((sum, statement) => sum + (parseFloat(statement.total) || 0), 0));
    
    // Calculate grand total
    const grandTotal = roundToEven(rptTotal + (parseFloat(enviFee) || 0));

    const filteredStatements = statements.filter(statement =>
        (selectedYear === 'all' || statement.paymentYear === selectedYear) &&
        (statement.declaredOwner.toLowerCase().includes(searchTerm.toLowerCase()) ||
            statement.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            statement.blockLotNo.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handlePayment = (statement) => {
        setSelectedPayment(statement);
        setShowPaymentModal(true);
    };

    const addRow = () => {
        const newId = Math.max(...statements.map(s => s.id), 0) + 1;
        const newStatement = {
            id: newId,
            declaredOwner: '',
            location: '',
            blockLotNo: '',
            taxDecNo: '',
            kind: '',
            assessedValue: '',
            paymentYear: '',
            noOfYears: '',
            fullPayment: '',
            penaltyDiscount: '',
            penaltyDiscountInput: '',
            penaltyDiscountType: '',
            total: '',
            status: 'unpaid',
            isUnderlined: false
        };
        
        const newStatements = [...statements, newStatement];
        setStatements(newStatements);
        
        // Save to history
        setTimeout(() => {
            saveToHistory({
                statements: newStatements,
                enviFee: enviFee,
                preparedBy: preparedBy,
                certifiedCorrectBy: certifiedCorrectBy
            });
        }, 0);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage('');

        try {
            // Generate professional SOA batch ID (e.g., SOA-2026-001)
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const sequence = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
            const batchId = `SOA-${year}-${sequence}`;

            const statementsToSave = statements.map(statement => ({
                batch_id: batchId,
                declared_owner: statement.declaredOwner || '',
                location: statement.location || '',
                block_lot_no: statement.blockLotNo || '',
                tax_dec_no: statement.taxDecNo || '',
                kind: statement.kind || '',
                assessed_value: statement.assessedValue || 0,
                payment_year: statement.paymentYear || '',
                no_of_years: statement.noOfYears || 1,
                full_payment: statement.fullPayment || 0,
                penalty_discount: statement.penaltyDiscount || 0,
                total: statement.total || 0,
                envi_fee: enviFee || 0,
                grand_total: grandTotal || 0,
                certified_by: certifiedCorrectBy || '',
                status: statement.status || 'draft',
                isUnderlined: statement.isUnderlined || false,
                penaltyDiscountType: statement.penaltyDiscountType || ''
            })).filter(statement =>
                statement.declared_owner ||
                statement.location ||
                statement.assessed_value > 0 ||
                statement.total > 0
            );

            if (statementsToSave.length === 0) {
                setSaveMessage('Please enter at least some data before saving.');
                setIsSaving(false);
                return;
            }

            // Refresh CSRF token before making request
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

            // Get CSRF token with multiple fallback methods
            const getCsrfToken = () => {
                // Try meta tag first
                const metaTag = document.querySelector('meta[name="csrf-token"]');
                if (metaTag) {
                    const token = metaTag.getAttribute('content') || metaTag.content;
                    if (token) return token;
                }
                // Try hidden input
                const hiddenInput = document.querySelector('input[name="_token"]');
                if (hiddenInput) {
                    return hiddenInput.value;
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

            const csrfToken = getCsrfToken();
            console.log('CSRF Token:', csrfToken ? 'Found' : 'Not found');
            console.log('CSRF Token length:', csrfToken?.length || 0);

            if (!csrfToken) {
                setSaveMessage('CSRF token not found. Please refresh the page and try again.');
                setIsSaving(false);
                return;
            }

            const requestData = {
                batch_id: batchId,
                prepared_by: preparedBy,
                certified_by: certifiedCorrectBy,
                statements: statementsToSave
            };
            console.log('Request data:', requestData);

            const response = await fetch('/api/statements/multiple', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify(requestData)
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            if (!response.ok) {
                const errorText = await response.text();
                console.log('Error response:', errorText);
                throw new Error(`Failed to save statement: ${response.status} ${response.statusText}`);
            }

            if (response.ok) {
                setSaveMessage(`Statement of Account saved successfully! SOA Reference: ${batchId}`);
                setIsSaving(false);
                // Clear localStorage and form after successful save
                localStorage.removeItem('statementOfAccountData');
                localStorage.removeItem('enviFee');
                localStorage.removeItem('preparedBy');
                localStorage.removeItem('certifiedCorrectBy');
                setTimeout(() => {
                    setStatements([
                        {
                            id: 1,
                            declaredOwner: '',
                            location: '',
                            blockLotNo: '',
                            taxDecNo: '',
                            kind: '',
                            assessedValue: '',
                            paymentYear: '',
                            noOfYears: 1,
                            fullPayment: '',
                            penaltyDiscount: '',
                            penaltyDiscountInput: '',
                            penaltyDiscountType: '',
                            total: '',
                            status: 'unpaid',
                            isUnderlined: false
                        },
                        {
                            id: 2,
                            declaredOwner: '',
                            location: '',
                            blockLotNo: '',
                            taxDecNo: '',
                            kind: '',
                            assessedValue: 0,
                            paymentYear: '',
                            noOfYears: '',
                            fullPayment: 0,
                            penaltyDiscount: 0,
                            penaltyDiscountInput: '',
                            penaltyDiscountType: '',
                            total: 0,
                            status: 'unpaid',
                            isUnderlined: false
                        },
                        {
                            id: 3,
                            declaredOwner: '',
                            location: '',
                            blockLotNo: '',
                            taxDecNo: '',
                            kind: '',
                            assessedValue: 0,
                            paymentYear: '',
                            noOfYears: '',
                            fullPayment: 0,
                            penaltyDiscount: 0,
                            penaltyDiscountInput: '',
                            penaltyDiscountType: '',
                            total: 0,
                            status: 'unpaid',
                            isUnderlined: false
                        },
                        {
                            id: 4,
                            declaredOwner: '',
                            location: '',
                            blockLotNo: '',
                            taxDecNo: '',
                            kind: '',
                            assessedValue: 0,
                            paymentYear: '',
                            noOfYears: '',
                            fullPayment: 0,
                            penaltyDiscount: 0,
                            penaltyDiscountType: '',
                            total: 0,
                            isDeduction: false,
                            deductionValues: [],
                            isDeductionResult: false
                        }
                    ]);
                    setEnviFee(0);
                    setPreparedBy(auth?.user?.name || '');
                    setCertifiedCorrectBy('Lalaine M. Cariliman');
                    setSaveMessage('');
                }, 3000);
            } else {
                const errorData = await response.json();
                console.error('Save error:', errorData);
                setSaveMessage(`Failed to save statement: ${errorData.message || 'Unknown error'}`);
                setIsSaving(false);
            }
        } catch (error) {
            console.error('Save error:', error);
            setSaveMessage(`Failed to save statement: ${error.message}`);
            setIsSaving(false);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            Statement Of Account
                        </h2>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Statement of Account" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Controls */}
                    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4 mb-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <div className="text-xs text-gray-600">
                                    <span className="font-medium">Tips:</span> Right-click for underline options or use the underline button
                                </div>
                                <button
                                    onClick={undo}
                                    disabled={!canUndo}
                                    className={`flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-medium transition-all transform ${
                                        canUndo 
                                            ? 'bg-orange-500 hover:bg-orange-600 text-white hover:shadow-md hover:scale-105' 
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                    title="Undo last change (Ctrl+Z)"
                                >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                    </svg>
                                    Undo
                                </button>
                            </div>
                            <button
                                onClick={addRow}
                                className="flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm hover:shadow-md transform hover:scale-105 transition-transform"
                                title="Add a new row for additional entries"
                            >
                                <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                                Add Row
                            </button>
                        </div>
                    </div>

                    {/* Tax Amnesty Toggle */}
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6">
                        <div className="flex items-center justify-between">
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
                    </div>

                    {/* Save Message */}
                    {saveMessage && (
                        <div className={`mb-4 p-4 rounded-lg ${saveMessage.includes('success')
                                ? 'bg-green-100 border border-green-400 text-green-700'
                                : 'bg-red-100 border border-red-400 text-red-700'
                            }`}>
                            {saveMessage}
                        </div>
                    )}

                    {/* Statement Document - Exact Image Match */}
                    <div className="bg-white shadow-lg border-2 border-gray-800 overflow-hidden">
                        {/* Header Section */}
                        <div className="bg-white p-4">
                            {/* Top Header - Centered Logo and Text */}
                            <div className="relative flex items-center justify-center mb-4">

                                {/* Logo (Left side, close to text) */}
                                <img
                                    src="/images/Untitled.png"
                                    alt="Logo"
                                    className="absolute left-1/2 -translate-x-[230px] h-20 w-20 object-contain"
                                />

                                {/* Centered Text */}
                                <div className="text-center">
                                    <p className="text-base font-medium text-gray-900">
                                        Province of Misamis Oriental
                                    </p>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        MUNICIPALITY OF OPOL
                                    </h1>
                                    <h1 className="text-lg font-bold text-gray-900">
                                        Municipal Treasurer's Office
                                    </h1>
                                </div>
                            </div>

                            {/* Statement of Account Banner */}
                            <div className="bg-blue-600 text-white py-3 px-4 rounded mb-4">
                                <h2 className="text-lg font-bold text-center">STATEMENT OF ACCOUNT</h2>
                            </div>

                            {/* Statement Table for StatementOfAccount */}
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border-2 border-gray-800">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border border-gray-800 px-2 py-1 text-xs font-bold text-left">Declared Owner</th>
                                            <th className="border border-gray-800 px-2 py-1 text-xs font-bold text-left">Location</th>
                                            <th className="border border-gray-800 px-2 py-1 text-xs font-bold text-left">Block & Lot No.</th>
                                            <th className="border border-gray-800 px-2 py-1 text-xs font-bold text-left">Tax Dec. No.</th>
                                            <th className="border border-gray-800 px-2 py-1 text-xs font-bold text-left">KIND</th>
                                            <th className="border border-gray-800 px-2 py-1 text-xs font-bold text-left">ASSESSED VALUE</th>
                                            <th className="border border-gray-800 px-2 py-1 text-xs font-bold text-left">PAYMENT YEAR</th>
                                            <th className="border border-gray-800 px-2 py-1 text-xs font-bold text-left">BASIC/SEF</th>
                                            <th className="border border-gray-800 px-2 py-1 text-xs font-bold text-left">PENALTY/Discount</th>
                                            <th className="border border-gray-800 px-2 py-1 text-xs font-bold text-left">TOTAL</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStatements.map((statement) => (
                                            <tr key={statement.id} className="hover:bg-gray-50 transition-colors">
                                                <td 
                                                    className="border border-gray-800 px-2 py-1 text-xs cursor-text hover:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    contentEditable
                                                    suppressContentEditableWarning={true}
                                                    onBlur={(e) => updateStatement(statement.id, 'declaredOwner', e.target.textContent)}
                                                    dangerouslySetInnerHTML={{ __html: statement.declaredOwner }}
                                                />
                                                <td className="border border-gray-800 px-2 py-1 text-xs">
                                                    <select
                                                        value={statement.location || ''}
                                                        onChange={(e) => updateStatement(statement.id, 'location', e.target.value)}
                                                        className="w-full px-1 py-0 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                                                    >
                                                        <option value=""></option>
                                                        {locations.map(location => (
                                                            <option key={location} value={location}>{location}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td 
                                                    className="border border-gray-800 px-2 py-1 text-xs cursor-text hover:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    contentEditable
                                                    suppressContentEditableWarning={true}
                                                    onBlur={(e) => updateStatement(statement.id, 'blockLotNo', e.target.textContent)}
                                                    dangerouslySetInnerHTML={{ __html: statement.blockLotNo }}
                                                />
                                                <td 
                                                    className="border border-gray-800 px-2 py-1 text-xs cursor-text hover:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    contentEditable
                                                    suppressContentEditableWarning={true}
                                                    onBlur={(e) => updateStatement(statement.id, 'taxDecNo', e.target.textContent)}
                                                    dangerouslySetInnerHTML={{ __html: statement.taxDecNo }}
                                                />
                                                <td className="border border-gray-800 px-2 py-1 text-xs">
                                                    <select
                                                        value={statement.kind || ''}
                                                        onChange={(e) => updateStatement(statement.id, 'kind', e.target.value)}
                                                        className="w-full px-1 py-0 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                                                    >
                                                        <option value=""></option>
                                                        {kindOptions.map(kind => (
                                                            <option key={kind} value={kind}>{kind}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="border border-gray-800 px-2 py-1 text-xs">
                                                    <div className="flex items-center space-x-1">
                                                        <div 
                                                            className="flex-1 px-1 py-0 text-xs cursor-text hover:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-500 text-right"
                                                            contentEditable
                                                            suppressContentEditableWarning={true}
                                                            onBlur={(e) => updateStatement(statement.id, 'assessedValue', parseFloat(e.target.textContent) || 0)}
                                                            dangerouslySetInnerHTML={{ __html: statement.assessedValue !== 0 ? statement.assessedValue : '' }}
                                                            onContextMenu={(e) => handleContextMenu(e, statement.id)}
                                                        />
                                                        <button
                                                            onClick={() => handleUnderlineToggle(statement.id)}
                                                            className={`p-1 rounded transition-colors flex-shrink-0 ${
                                                                statement.isUnderlined 
                                                                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                                                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                                            }`}
                                                            title={statement.isUnderlined ? 'Remove underline' : 'Add underline'}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9a2 2 0 00-2-2H9a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    {statement.isUnderlined && (
                                                        <div className="border-b-2 border-gray-800 mt-1"></div>
                                                    )}
                                                </td>
                                                <td className="border border-gray-800 px-2 py-1 text-xs">
                                                    <input
                                                        type="text"
                                                        value={statement.paymentYear || ''}
                                                        onChange={(e) => updateStatement(statement.id, 'paymentYear', e.target.value)}
                                                        className="w-full px-1 py-0 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-transparent"
                                                        placeholder="Year"
                                                    />
                                                </td>
                                                <td className="border border-gray-800 px-2 py-1 text-xs text-right font-medium">
                                                    {statement.penaltyDiscountType === 'tax_diff' ? (
                                                        <div 
                                                            className="w-full px-1 py-0 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-green-50 cursor-text hover:bg-green-100"
                                                            contentEditable
                                                            suppressContentEditableWarning={true}
                                                            onBlur={(e) => {
                                                                const numValue = parseFloat(e.target.textContent) || 0;
                                                                updateStatement(statement.id, 'fullPayment', numValue);
                                                            }}
                                                            dangerouslySetInnerHTML={{ __html: statement.fullPayment !== 0 ? parseFloat(statement.fullPayment).toFixed(2) : '' }}
                                                        />
                                                    ) : (
                                                        <span className="text-gray-700">
                                                            {statement.fullPayment !== 0 ? formatCurrency(statement.fullPayment) : ''}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="border border-gray-800 px-2 py-1 text-xs text-right bg-gray-50">
                                                    <div className="space-y-1">
                                                        {statement.penaltyDiscountType === 'tax_diff' ? (
                                                            <div className="flex items-center justify-between p-1 bg-green-50 rounded border border-green-200">
                                                                <span className="text-xs font-medium text-green-700">{taxAmnestyEnabled ? 'Tax Amnesty' : 'Tax Diff'}</span>
                                                                <button
                                                                    onClick={() => handleRemoveTaxDiff(statement.id)}
                                                                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                                                    title="Switch to normal calculation"
                                                                >
                                                                    Change
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center space-x-1 p-1 hover:bg-gray-100 rounded transition-colors">
                                                                <div 
                                                                    className="w-full px-1 py-0 text-xs border-0 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 cursor-text hover:bg-white text-right"
                                                                    contentEditable
                                                                    suppressContentEditableWarning={true}
                                                                    onBlur={(e) => {
                                                                        const value = e.target.textContent.replace(/[^\d.-]/g, '');
                                                                        const numValue = parseFloat(value) || 0;
                                                                        updateStatement(statement.id, 'penaltyDiscount', numValue);
                                                                    }}
                                                                    dangerouslySetInnerHTML={{ __html: statement.penaltyDiscount !== 0 ? formatCurrencyTwoDecimals(statement.penaltyDiscount) : '' }}
                                                                />
                                                                <button
                                                                    onClick={() => handleTaxDiffSelect(statement.id)}
                                                                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline whitespace-nowrap transition-colors font-medium"
                                                                    title="Remove penalty/discount calculation"
                                                                >
                                                                    {taxAmnestyEnabled ? 'Tax Amnesty' : 'Tax Diff'}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="border border-gray-800 px-2 py-1 text-xs text-right font-bold">
                                                    {statement.total !== 0 ? (
                                                        <div className={`font-bold ${
                                                            statement.penaltyDiscountType === 'tax_diff' ? 'text-green-700' : 'text-gray-900'
                                                        }`}>
                                                            {formatCurrency(statement.total)}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">0.00</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan="9" className="border border-gray-800 px-2 py-1 text-xs font-bold text-right bg-yellow-50">RPT TOTAL</td>
                                            <td className="border border-gray-800 px-2 py-1 text-xs text-right font-bold bg-yellow-50">
                                                {rptTotal !== 0 ? formatCurrency(rptTotal) : ''}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan="9" className="border border-gray-800 px-2 py-1 text-xs font-bold text-right">ENVIRONMENTAL PROTECTION FEE</td>
                                            <td className="border border-gray-800 px-2 py-1 text-xs relative">
                                                <input
                                                    type="text"
                                                    value={enviFee || ''}
                                                    onChange={(e) => setEnviFee(parseFloat(e.target.value) || 0)}
                                                    className="w-full px-1 py-0 text-xs text-right font-bold border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    step="0.01"
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan="9" className="border border-gray-800 px-2 py-1 text-xs font-bold text-right">GRAND TOTAL</td>
                                            <td className="border border-gray-800 px-2 py-1 text-xs text-right font-bold">
                                                {grandTotal !== 0 ? formatCurrency(grandTotal) : ''}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Notice */}
                            <div className="mt-4 text-left">
                                <p className="text-xs text-gray-600 italic">
                                    "Please disregard this notice if payment has been made."
                                </p>
                            </div>

                            {/* Signature Section */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="text-center">
                                    <p className="text-xs font-medium text-gray-900 mb-6">Prepared by:</p>
                                    <div className="border-t border-gray-800 pt-2">
                                        <input
                                            type="text"
                                            value={preparedBy}
                                            onChange={(e) => setPreparedBy(e.target.value.toUpperCase())}
                                            className="text-sm font-bold text-gray-900 text-center bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded w-full"
                                            placeholder="Enter name"
                                        />
                                        <p className="text-xs text-gray-700">MTO STAFF</p>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-medium text-gray-900 mb-6">Certified Correct By:</p>
                                    <div className="border-t border-gray-800 pt-2">
                                        <input
                                            type="text"
                                            value={certifiedCorrectBy}
                                            onChange={(e) => setCertifiedCorrectBy(e.target.value.toUpperCase())}
                                            className="text-sm font-bold text-gray-900 text-center bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded w-full"
                                            placeholder="Enter name"
                                        />
                                        <p className="text-xs text-gray-700">ACTING MUNICIPAL TREASURER</p>
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
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
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
                        </div>
                    </div>

                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedPayment && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Process Payment</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Payment Details</label>
                                    <div className="mt-1 p-3 bg-gray-50 rounded">
                                        <p className="text-sm"><strong>Owner:</strong> ADIODETA {selectedPayment.declaredOwner}</p>
                                        <p className="text-sm"><strong>Year:</strong> {selectedPayment.paymentYear}</p>
                                        <p className="text-sm"><strong>Amount:</strong> ₱{formatCurrency(selectedPayment.total)}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                                    <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                        <option>Cash</option>
                                        <option>Check</option>
                                        <option>Bank Transfer</option>
                                        <option>Credit Card</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Reference Number</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Enter reference number"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        alert('Payment processed successfully!');
                                        setShowPaymentModal(false);
                                    }}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Process Payment
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
                        onClick={() => handleUnderlineToggle(contextMenu.targetId)}
                        className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-100 transition-colors flex items-center justify-between ${
                            statements.find(s => s.id === contextMenu.targetId)?.isUnderlined 
                                ? 'text-blue-700 bg-blue-50' 
                                : 'text-gray-700 hover:bg-blue-50'
                        }`}
                    >
                        <span>{statements.find(s => s.id === contextMenu.targetId)?.isUnderlined ? 'Remove Underline' : 'Add Underline'}</span>
                        <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9a2 2 0 00-2-2H9a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </button>
                </div>
            )}
        </AuthenticatedLayout>
    );
}