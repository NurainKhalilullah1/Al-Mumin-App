import React, { useState, useEffect } from 'react';
import { Calendar, UserMinus, Plus, X, CheckCircle, XCircle } from 'lucide-react';
import { getStaffLeaves, saveStaffLeave, updateLeaveStatus } from '../../utils/db';
import { useToast } from '../../components/ToastProvider';

const StaffLeave = () => {
    const notify = useToast();
    const [leaves, setLeaves] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        reason: '',
        type: 'Casual Leave',
        startDate: '',
        endDate: ''
    });
    const userRole = localStorage.getItem('userRole') || 'teacher';
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    const fetchLeaves = async () => {
        const data = await getStaffLeaves();
        setLeaves(data || []);
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const staffName = currentUser.name || `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || 'Staff';

        const success = await saveStaffLeave({
            name: staffName,
            reason: formData.reason,
            leave_type: formData.type,
            start_date: formData.startDate,
            end_date: formData.endDate,
            status: 'Pending',
        });

        if (success) {
            notify.success('Leave request submitted successfully');
            setShowModal(false);
            setFormData({ reason: '', type: 'Casual Leave', startDate: '', endDate: '' });
            fetchLeaves();
        } else {
            notify.error('Failed to submit leave request');
        }
    };

    const handleAction = async (leaveId, newStatus) => {
        const success = await updateLeaveStatus(leaveId, newStatus);
        if (success) {
            notify.success(`Leave ${newStatus.toLowerCase()} successfully`);
            fetchLeaves();
        } else {
            notify.error('Action failed');
        }
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-schoolGreen">Staff Leave Management</h1>
                    <p className="text-gray-500 mt-1 uppercase text-xs font-bold tracking-widest">
                        {userRole === 'admin' ? 'Manage Staff Leaves' : 'My Leave Requests'}
                    </p>
                </div>
                {userRole !== 'admin' && (
                    <button onClick={() => setShowModal(true)} className="bg-schoolGreen text-white px-4 py-2 rounded-xl flex items-center shadow-md hover:bg-schoolGold transition">
                        <Plus size={18} className="mr-2" /> Request Leave
                    </button>
                )}
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <UserMinus className="text-orange-500" size={20} /> Latest Leave Records
                </h3>
                <div className="space-y-4">
                    {leaves.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">No leave records found.</p>
                    ) : (
                        leaves.map((leave, idx) => (
                            <div key={leave.id || idx} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 flex flex-col md:flex-row gap-4 transition items-start md:items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-bold text-sm text-gray-800">{leave.name}</p>
                                        {leave.leave_type && <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md uppercase tracking-wide border border-blue-100">{leave.leave_type}</span>}
                                    </div>
                                    <p className="text-xs text-gray-500">{leave.reason}</p>
                                    {(leave.start_date || leave.end_date) && (
                                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5 font-medium">
                                            <Calendar size={12} />
                                            {leave.start_date || '?'} to {leave.end_date || '?'}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-wide 
                                        ${leave.status === 'Approved' ? 'bg-green-100 text-green-700' : ''}
                                        ${leave.status === 'Rejected' || leave.status?.includes('Absent') ? 'bg-red-100 text-red-700' : ''}
                                        ${leave.status === 'Pending' ? 'bg-orange-100 text-orange-700' : ''}
                                    `}>
                                        {leave.status}
                                    </span>

                                    {userRole === 'admin' && leave.status === 'Pending' && (
                                        <div className="flex gap-2 mt-1">
                                            <button onClick={() => handleAction(leave.id, 'Approved')} className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition" title="Approve">
                                                <CheckCircle size={18} />
                                            </button>
                                            <button onClick={() => handleAction(leave.id, 'Rejected')} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="Reject">
                                                <XCircle size={18} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* REQUEST LEAVE MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-[99999] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md max-h-[80vh] overflow-y-auto rounded-3xl p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95">
                        <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-red-500"><X size={24} /></button>
                        <h2 className="text-2xl font-bold text-schoolGreen mb-6">Request Leave</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Leave Type</label>
                                <select
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-schoolGreen"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option>Sick Leave</option>
                                    <option>Casual Leave</option>
                                    <option>Annual Leave</option>
                                    <option>Maternity Leave</option>
                                    <option>Study Leave</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Start Date</label>
                                    <input type="date" required
                                        value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-schoolGreen text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">End Date</label>
                                    <input type="date" required
                                        value={formData.endDate}
                                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-schoolGreen text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Reason for Leave</label>
                                <textarea required rows="3"
                                    value={formData.reason}
                                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-schoolGreen resize-none text-sm"
                                    placeholder="Briefly explain your reason..."
                                />
                            </div>
                            <button type="submit" className="w-full mt-4 bg-schoolGreen text-white py-3 rounded-xl font-bold uppercase hover:bg-schoolGold transition shadow-md">Submit Request</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffLeave;
