import React, { useState, useEffect } from 'react';
import { getPayments, verifyPayment, getSchoolFees, getAdminBankDetails, saveAdminBankDetails } from '../../utils/db';
import { CreditCard, CheckCircle, Clock, FileText, Search, Download, AlertCircle, Settings as SettingsIcon, X } from 'lucide-react';
import { useToast } from '../../components/ToastProvider';

const AdminPayments = () => {
    const [payments, setPayments] = useState([]);
    const [stats, setStats] = useState({ totalRevenue: 0, pending: 0, verified: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const toast = useToast();

    const [showSettings, setShowSettings] = useState(false);
    const [bankDetails, setBankDetails] = useState({ bankName: '', accountNumber: '', accountName: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const allPayments = await getPayments();
        setPayments(allPayments);
        const bank = await getAdminBankDetails();
        setBankDetails(bank);

        // Calc Stats
        const revenue = allPayments
            .filter(p => p.status === 'Verified')
            .reduce((acc, curr) => acc + parseInt(curr.amount), 0);

        const pendingCount = allPayments.filter(p => p.status === 'Pending').length;
        const verifiedCount = allPayments.filter(p => p.status === 'Verified').length;

        setStats({ totalRevenue: revenue, pending: pendingCount, verified: verifiedCount });
    };

    const handleVerify = async (id) => {
        // Optimistic UI Update or Force Reload
        const success = await verifyPayment(id);
        if (success) {
            toast.success('Payment verified successfully');
            // Manually update local state to reflect change immediately
            setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'Verified' } : p));

            // Recalculate stats based on new state
            setStats(prev => ({
                ...prev,
                pending: prev.pending - 1,
                verified: prev.verified + 1,
            }));
            loadData(); // Ensure consistent sync
        } else {
            toast.error('Failed to verify payment.');
        }
    };

    const filteredPayments = payments.filter(p => {
        const term = searchTerm.toLowerCase();
        return (
            (p.studentName && p.studentName.toLowerCase().includes(term)) ||
            (p.id && p.id.toLowerCase().includes(term)) ||
            (p.classLevel && p.classLevel.toLowerCase().includes(term)) ||
            (p.status && p.status.toLowerCase().includes(term)) ||
            String(p.amount).includes(term)
        );
    });

    useEffect(() => {
        if (showSettings) {
            if (showSettings) {
                const loadSettings = async () => {
                    const details = await getAdminBankDetails();
                    setBankDetails(details);
                };
                loadSettings();
            }
        }
    }, [showSettings]);

    const handleExport = () => {
        if (filteredPayments.length === 0) {
            toast.error("No data to export");
            return;
        }

        const headers = ['Transaction ID', 'Student', 'Class', 'Amount', 'Date', 'Method', 'Status'];
        const csvRows = [
            headers.join(','),
            ...filteredPayments.map(p => [
                p.id,
                `"${p.studentName}"`,
                p.classLevel,
                p.amount,
                p.date,
                p.method,
                p.status
            ].join(','))
        ];

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "Payment_History.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Payment & Revenue</h1>
                    <p className="text-gray-500">Manage student fees and verify transactions</p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setShowSettings(true)}
                        className="flex items-center px-4 py-2 bg-schoolGold/10 text-schoolGold border border-schoolGold/20 rounded-xl hover:bg-schoolGold hover:text-white transition shadow-sm font-bold"
                    >
                        <SettingsIcon size={18} className="mr-2" /> Bank Settings
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition shadow-sm font-medium"
                    >
                        <Download size={18} className="mr-2" /> Export Report
                    </button>
                </div>
            </div>

            {/* Bank Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md p-6 rounded-3xl shadow-2xl m-4">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                            <h3 className="text-xl font-bold text-gray-800">Bank Account Settings</h3>
                            <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-red-500 transition">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Bank Name</label>
                                <input
                                    type="text"
                                    value={bankDetails.bankName || ''}
                                    onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-schoolGreen/20 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Account Number</label>
                                <input
                                    type="text"
                                    value={bankDetails.accountNumber || ''}
                                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-schoolGreen/20 outline-none font-mono tracking-widest"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Account Name</label>
                                <input
                                    type="text"
                                    value={bankDetails.accountName || ''}
                                    onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-schoolGreen/20 outline-none"
                                />
                            </div>
                            <div className="pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        console.log("Saving details:", bankDetails);
                                        saveAdminBankDetails(bankDetails);
                                        toast.success('Bank details updated successfully!');
                                        setShowSettings(false);
                                    }}
                                    className="w-full py-3 bg-schoolGreen text-white font-bold rounded-xl hover:bg-green-900 transition shadow-lg"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-schoolGreen text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-white/70 font-medium mb-1">Total Revenue Collected</p>
                        <h2 className="text-3xl font-bold">₦{stats.totalRevenue.toLocaleString()}</h2>
                    </div>
                    <CreditCard className="absolute right-4 bottom-4 text-white/10 w-24 h-24" />
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 font-medium mb-1">Pending Verifications</p>
                        <h2 className="text-3xl font-bold text-orange-500">{stats.pending}</h2>
                    </div>
                    <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-500">
                        <Clock size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 font-medium mb-1">Verified Transactions</p>
                        <h2 className="text-3xl font-bold text-green-500">{stats.verified}</h2>
                    </div>
                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                        <CheckCircle size={24} />
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center">
                        <FileText size={20} className="mr-2 text-schoolGold" /> Transaction History
                    </h3>
                    <div className="relative w-full md:w-64">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search transactions, students, or class..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-schoolGreen/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium text-sm uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Transaction ID</th>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Class</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Method</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/50 text-sm">
                            {filteredPayments.length > 0 ? (
                                filteredPayments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-gray-500">{payment.id}</td>
                                        <td className="px-6 py-4 font-bold text-gray-700">{payment.studentName}</td>
                                        <td className="px-6 py-4 text-gray-600">{payment.classLevel}</td>
                                        <td className="px-6 py-4 font-bold text-gray-800">₦{parseInt(payment.amount).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-gray-600">{payment.date}</td>
                                        <td className="px-6 py-4 text-gray-600">{payment.method}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${payment.status === 'Verified'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                {payment.status === 'Verified' && <CheckCircle size={12} className="mr-1" />}
                                                {payment.status === 'Pending' && <Clock size={12} className="mr-1" />}
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {payment.status === 'Pending' ? (
                                                <button
                                                    onClick={() => handleVerify(payment.id)}
                                                    className="text-schoolGreen hover:text-green-700 font-bold text-xs bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition"
                                                >
                                                    Verify
                                                </button>
                                            ) : (
                                                <button className="text-gray-400 font-medium text-xs cursor-not-allowed">
                                                    Archived
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <AlertCircle size={48} className="mb-2 opacity-20" />
                                            <p>No payment records found matching your search.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPayments;
