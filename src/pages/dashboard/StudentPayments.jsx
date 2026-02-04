import React, { useState, useEffect } from 'react';
import { getStudentFeeStatus, getAdminBankDetails, savePayment, getPayments } from '../../utils/db';
import { CreditCard, Upload, History, DollarSign, AlertTriangle, CheckCircle, Copy, Clock } from 'lucide-react';
import { useToast } from '../../components/ToastProvider';

const StudentPayments = () => {
    // Mock Student ID (In real app, get from auth context)
    const STUDENT_ID = 'AMS/2024/001';
    const STUDENT_NAME = 'Abdullahi Musa';
    const CLASS_LEVEL = 'JSS 2';

    const [feeStatus, setFeeStatus] = useState(null);
    const [bankDetails, setBankDetails] = useState({});
    const [history, setHistory] = useState([]);
    const [amount, setAmount] = useState('');
    const [showForm, setShowForm] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setFeeStatus(getStudentFeeStatus(STUDENT_ID));
        setBankDetails(getAdminBankDetails());
        const allPayments = getPayments();
        setHistory(allPayments.filter(p => p.studentId === STUDENT_ID));
    };

    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!amount || amount <= 0) return;

        const paymentData = {
            studentId: STUDENT_ID,
            studentName: STUDENT_NAME,
            classLevel: CLASS_LEVEL,
            amount: amount,
            method: 'Transfer',
            receiptRef: `REF-${Date.now().toString().slice(-6)}` // Mock Receipt
        };

        const newPayment = savePayment(paymentData);
        // addToast('Payment claim submitted!', 'success'); // Replaced by Modal

        setShowForm(false);
        setAmount('');
        setShowSuccess(true); // Show Success Modal
        loadData();
    };

    if (!feeStatus) return <div className="p-10 text-center">Loading...</div>;

    if (showSuccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in-95 duration-300">
                <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full border border-green-100">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Submitted!</h2>
                    <p className="text-gray-500 mb-6">
                        Your payment claim has been sent to the admin for verification.
                        Your fee status will update automatically once approved.
                    </p>
                    <button
                        onClick={() => setShowSuccess(false)}
                        className="w-full py-3 bg-schoolGreen text-white font-bold rounded-xl hover:bg-green-900 transition"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">My School Fees</h1>
                    <p className="text-gray-500">View outstanding fees and payment history</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Fee Status Card */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-lg font-bold text-gray-500 mb-6 uppercase tracking-wider">Fee Status</h2>

                        <div className="flex flex-col gap-1 mb-8">
                            <span className="text-5xl font-black text-gray-800">
                                ₦{feeStatus.outstanding.toLocaleString()}
                            </span>
                            <span className="text-gray-500 font-medium">Outstanding Balance</span>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                <span className="text-gray-500">Total School Fees</span>
                                <span className="font-bold text-gray-800">₦{feeStatus.totalFee.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                <span className="text-gray-500">Amount Paid</span>
                                <span className="font-bold text-green-600">₦{feeStatus.totalPaid.toLocaleString()}</span>
                            </div>
                            {feeStatus.totalPending > 0 && (
                                <div className="flex justify-between items-center py-3 border-b border-gray-100 bg-orange-50/50 px-2 -mx-2 rounded-lg">
                                    <span className="text-orange-600 font-medium flex items-center">
                                        <Clock size={16} className="mr-2" /> Pending Verification
                                    </span>
                                    <span className="font-bold text-orange-600">₦{feeStatus.totalPending.toLocaleString()}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-8">
                            <div className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold ${feeStatus.status === 'Fully Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {feeStatus.status === 'Fully Paid' ? <CheckCircle size={18} className="mr-2" /> : <AlertTriangle size={18} className="mr-2" />}
                                {feeStatus.status}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Make Payment Section */}
                <div className="space-y-6">
                    {/* Bank Details */}
                    <div className="bg-schoolGreen text-white rounded-3xl p-8 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                        <h3 className="text-white/80 font-medium mb-6 flex items-center">
                            <CreditCard size={20} className="mr-2" /> School Account Details
                        </h3>

                        <div className="mb-6">
                            <p className="text-white/60 text-sm mb-1">Bank Name</p>
                            <p className="text-xl font-bold">{bankDetails.bankName}</p>
                        </div>
                        <div className="mb-6">
                            <p className="text-white/60 text-sm mb-1">Account Number</p>
                            <div className="flex items-center gap-3">
                                <p className="text-3xl font-mono font-bold tracking-widest">{bankDetails.accountNumber}</p>
                                <button
                                    onClick={() => { navigator.clipboard.writeText(bankDetails.accountNumber); addToast('Copied!', 'success') }}
                                    className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
                                >
                                    <Copy size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="">
                            <p className="text-white/60 text-sm mb-1">Account Name</p>
                            <p className="text-lg font-medium">{bankDetails.accountName}</p>
                        </div>
                    </div>

                    {/* Action Button */}
                    {!showForm ? (
                        <button
                            onClick={() => setShowForm(true)}
                            className="w-full py-4 bg-schoolGold text-schoolGreen font-bold rounded-2xl shadow-lg shadow-schoolGold/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center text-lg"
                        >
                            <Upload size={24} className="mr-3" /> I Have Made Payment
                        </button>
                    ) : (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 animate-in slide-in-from-top-4 duration-300">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-800">Submit Payment Proof</h3>
                                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">Close</button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Amount Paid (₦)</label>
                                    <input
                                        type="number"
                                        required
                                        min="1000"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-schoolGreen/20 focus:border-schoolGreen outline-none transition"
                                        placeholder="e.g. 50000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Date of Payment</label>
                                    <input type="date" required className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Upload Receipt (PDF/Image)</label>
                                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 transition cursor-pointer">
                                        <Upload size={24} className="mb-2" />
                                        <span className="text-sm">Click to browse mock file</span>
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-3 bg-schoolGreen text-white font-bold rounded-xl hover:bg-green-900 transition shadow-lg shadow-green-900/10">
                                    Submit Claim
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center">
                        <History size={20} className="mr-2 text-schoolGold" /> Payment History
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium text-sm">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Method</th>
                                <th className="px-6 py-4">Reference</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {history.length > 0 ? history.map(p => (
                                <tr key={p.id}>
                                    <td className="px-6 py-4 text-gray-600">{p.date}</td>
                                    <td className="px-6 py-4 font-bold text-gray-800">₦{parseInt(p.amount).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold ${p.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{p.method}</td>
                                    <td className="px-6 py-4 font-mono text-xs text-gray-400">{p.receiptRef}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-400">No payment history found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default StudentPayments;
