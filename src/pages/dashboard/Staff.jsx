import React, { useState, useEffect } from 'react';
import {
    Users, Search, Plus, Trash2, Edit,
    Mail, Phone, Briefcase, Filter, X, RefreshCw
} from 'lucide-react';
import { getStaff, saveStaff, deleteStaff, getClasses } from '../../utils/db';
import { useToast } from '../../components/ToastProvider';

const Staff = () => {
    const notify = useToast(); // Add useToast hook
    const [staffList, setStaffList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    // Form State
    const [form, setForm] = useState({
        id: '', name: '', role: 'Teacher',
        department: 'Science', subject: '',
        phone: '', email: '', assignedClass: '', password: ''
    });
    const [availableClasses, setAvailableClasses] = useState([]);

    const fetchStaff = async () => {
        const data = await getStaff();
        setStaffList(data);
        setFilteredList(data);

        // Also load classes for dropdown
        const classes = await getClasses();
        setAvailableClasses(classes);
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    // Search & Filter Logic
    useEffect(() => {
        let result = staffList;

        if (search) {
            result = result.filter(s =>
                s.name.toLowerCase().includes(search.toLowerCase()) ||
                s.subject?.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (filterRole !== 'All') {
            result = result.filter(s => s.role === filterRole);
        }

        setFilteredList(result);
    }, [search, filterRole, staffList]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await saveStaff(form);

        if (result && result.success && result.password) {
            // New Staff Created
            alert(`Staff Created Successfully!\n\nName: ${result.name}\nEmail: ${result.email}\nPassword: ${result.password}\n\nPlease copy these details.`);
            notify.success("Staff Created with Credentials");
        } else if (result && result.success === false) {
            notify.error("Error saving staff member");
        } else {
            notify.success("Staff updated successfully");
        }

        fetchStaff();
        setShowModal(false);
        resetForm();
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to remove this staff member?')) {
            deleteStaff(id);
            fetchStaff();
        }
    };

    const openEdit = (staff) => {
        setForm(staff);
        setIsEdit(true);
        setShowModal(true);
    };

    const resetForm = () => {
        setForm({ id: '', name: '', role: 'Teacher', department: 'Science', subject: '', phone: '', email: '' });
        setIsEdit(false);
    };

    return (
        <div className="animate-in fade-in duration-500">

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-schoolGreen">Staff Directory</h1>
                    <p className="text-gray-500 mt-1">Manage teachers and non-academic staff.</p>
                </div>
                <div className="flex gap-2 mt-4 md:mt-0">
                    <button onClick={fetchStaff} className="bg-white text-gray-500 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 hover:text-schoolGreen transition shadow-sm" title="Refresh Data">
                        <RefreshCw size={20} />
                    </button>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="bg-schoolGreen text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center shadow-lg hover:bg-schoolGold transition"
                    >
                        <Plus size={18} className="mr-2" /> Add New Staff
                    </button>
                </div>
            </div>

            {/* --- CONTROLS --- */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or subject..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl outline-none focus:ring-1 focus:ring-schoolGreen"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={20} className="text-gray-400" />
                    <select
                        className="bg-gray-50 py-2.5 px-4 rounded-xl outline-none text-sm font-bold text-gray-700"
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                    >
                        <option>All</option>
                        <option>Admin</option>
                        <option>Teacher</option>
                        <option>Support</option>
                    </select>
                </div>
            </div>

            {/* --- STAFF GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredList.map((staff) => (
                    <div key={staff.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition group relative overflow-hidden">

                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 bg-white/80 backdrop-blur-sm rounded-bl-2xl">
                            <button onClick={() => openEdit(staff)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-full"><Edit size={16} /></button>
                            <button onClick={() => handleDelete(staff.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full"><Trash2 size={16} /></button>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded-full bg-schoolGreen/10 flex items-center justify-center text-schoolGreen text-xl font-serif font-bold">
                                {staff.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg leading-tight">{staff.name}</h3>
                                <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded mt-1 ${staff.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                                    staff.role === 'Teacher' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {staff.role}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm text-gray-600">
                            <div className="flex items-center gap-3">
                                <Briefcase size={16} className="text-gray-400" />
                                <span>{staff.department} {staff.subject && `• ${staff.subject}`}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone size={16} className="text-gray-400" />
                                <span>{staff.phone}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail size={16} className="text-gray-400" />
                                <span className="truncate">{staff.email}</span>
                            </div>
                        </div>

                    </div>
                ))}
            </div>

            {filteredList.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                    <Users size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No staff members found.</p>
                </div>
            )}

            {/* --- MODAL --- */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">

                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-serif font-bold text-schoolGreen mb-6">
                            {isEdit ? 'Edit Profile' : 'Add New Staff'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                                <input
                                    type="text" required
                                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-schoolGreen"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role</label>
                                    <select
                                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-schoolGreen"
                                        value={form.role}
                                        onChange={e => setForm({ ...form, role: e.target.value })}
                                    >
                                        <option>Teacher</option>
                                        <option>Admin</option>
                                        <option>Support</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Department</label>
                                    <select
                                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-schoolGreen"
                                        value={form.department}
                                        onChange={e => setForm({ ...form, department: e.target.value })}
                                    >
                                        <option>Science</option>
                                        <option>Arts</option>
                                        <option>Commercial</option>
                                        <option>Languages</option>
                                        <option>Admin</option>
                                        <option>Junior School</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Mathematics"
                                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-schoolGreen"
                                    value={form.subject}
                                    onChange={e => setForm({ ...form, subject: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                                    <input
                                        type="tel" required
                                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-schoolGreen"
                                        value={form.phone}
                                        onChange={e => setForm({ ...form, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <input
                                        type="email" required
                                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-schoolGreen"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Assigned Class & Password Display */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Assign Class (Optional)</label>
                                    <select
                                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-schoolGreen"
                                        value={form.assignedClass || ''}
                                        onChange={e => setForm({ ...form, assignedClass: e.target.value })}
                                    >
                                        <option value="">-- None --</option>
                                        {availableClasses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                                    <input
                                        type="text"
                                        readOnly
                                        className="w-full p-3 bg-gray-100 rounded-xl border border-gray-200 text-gray-500 cursor-not-allowed"
                                        value={form.password || '(Auto-generated)'}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-schoolGreen text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-schoolGold transition shadow-lg mt-4"
                            >
                                {isEdit ? 'Update Staff Member' : 'Save Staff Member'}
                            </button>
                        </form>

                    </div>
                </div>
            )}

        </div>
    );
};

export default Staff;
