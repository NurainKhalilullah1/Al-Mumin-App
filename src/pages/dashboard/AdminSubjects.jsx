import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, BookOpen, User, Layers } from 'lucide-react';
import { getSubjects, saveSubject, deleteSubject } from '../../utils/db';
import { useToast } from '../../components/ToastProvider';

const AdminSubjects = () => {
    const notify = useToast();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Junior'); // Junior vs Senior
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({ id: null, name: '', type: 'Junior', department: 'General', teacher: '' });

    useEffect(() => {
        loadSubjects();
    }, []);

    const loadSubjects = async () => {
        setLoading(true);
        const data = await getSubjects();
        setSubjects(data);
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) return notify.error("Subject Name is required");

        // If Junior, force department to General
        const finalData = {
            ...formData,
            department: formData.type === 'Junior' ? 'General' : formData.department
        };

        const result = await saveSubject(finalData);
        if (!result.success) {
            notify.error("Failed to save subject. " + (result.error?.message || ""));
            return;
        }

        loadSubjects();
        setShowModal(false);
        resetForm();
        notify.success("Subject saved successfully!");
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this subject?")) {
            await deleteSubject(id);
            loadSubjects();
            notify.success("Subject deleted.");
        }
    };

    const resetForm = () => {
        setFormData({ id: null, name: '', type: activeTab, department: activeTab === 'Junior' ? 'General' : 'Science', teacher: '' });
    };

    const openModal = () => {
        resetForm();
        setShowModal(true);
    };

    const handleEdit = (sub) => {
        setFormData(sub);
        setShowModal(true);
    };

    // Filter Logic
    const filteredSubjects = subjects.filter(s => {
        // Fallback for legacy data without 'type'
        const type = s.type || (['Science', 'Arts', 'Commercial'].includes(s.department) ? 'Senior' : 'Junior');
        return type === activeTab;
    });

    // Group Senior by Dept
    const seniorGrouped = activeTab === 'Senior'
        ? filteredSubjects.reduce((acc, sub) => {
            acc[sub.department] = [...(acc[sub.department] || []), sub];
            return acc;
        }, {})
        : null;

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-schoolGreen">Subject Management</h1>
                    <p className="text-gray-500 mt-1">Manage Junior & Senior Details.</p>
                </div>

                <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 flex">
                        <button onClick={() => setActiveTab('Junior')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'Junior' ? 'bg-schoolGreen text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}>Junior School</button>
                        <button onClick={() => setActiveTab('Senior')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'Senior' ? 'bg-schoolGreen text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}>Senior School</button>
                    </div>

                    <button
                        onClick={openModal}
                        className="bg-schoolGreen text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center shadow-lg hover:bg-schoolGold transition"
                    >
                        <Plus size={18} className="mr-2" /> New Subject
                    </button>
                </div>
            </div>

            {/* JUNIOR VIEW (Simple List) */}
            {activeTab === 'Junior' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSubjects.map((sub) => (
                        <SubjectCard key={sub.id} sub={sub} onEdit={handleEdit} onDelete={handleDelete} />
                    ))}
                    {filteredSubjects.length === 0 && <p className="text-gray-400 col-span-3">No Junior subjects found.</p>}
                </div>
            )}

            {/* SENIOR VIEW (Grouped) */}
            {activeTab === 'Senior' && (
                <div className="space-y-8">
                    {Object.entries(seniorGrouped).map(([dept, subs]) => (
                        <div key={dept} className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                            <h3 className="font-bold text-xl text-slate-700 mb-4 flex items-center"><Layers size={20} className="mr-2 opacity-50" /> {dept} Department</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {subs.map((sub) => (
                                    <SubjectCard key={sub.id} sub={sub} onEdit={handleEdit} onDelete={handleDelete} />
                                ))}
                            </div>
                        </div>
                    ))}
                    {Object.keys(seniorGrouped).length === 0 && <p className="text-gray-400">No Senior subjects found.</p>}
                </div>
            )}

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative animate-in zoom-in-95">
                        <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-red-500"><X size={24} /></button>
                        <h2 className="text-2xl font-bold text-schoolGreen mb-6">{formData.id ? 'Edit Subject' : 'Add New Subject'}</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Type Toggle in Form */}
                            <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
                                <button type="button" onClick={() => setFormData({ ...formData, type: 'Junior' })} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition ${formData.type === 'Junior' ? 'bg-white shadow text-schoolGreen' : 'text-gray-400'}`}>Junior</button>
                                <button type="button" onClick={() => setFormData({ ...formData, type: 'Senior' })} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition ${formData.type === 'Senior' ? 'bg-white shadow text-schoolGreen' : 'text-gray-400'}`}>Senior</button>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Subject Name</label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-schoolGreen" placeholder="e.g. Mathematics" />
                            </div>

                            {formData.type === 'Senior' && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Department</label>
                                    <select value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-schoolGreen">
                                        <option value="General">General (All Seniors)</option>
                                        <option value="Science">Science</option>
                                        <option value="Arts">Arts</option>
                                        <option value="Commercial">Commercial</option>
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Assigned Teacher</label>
                                <input type="text" value={formData.teacher} onChange={e => setFormData({ ...formData, teacher: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-schoolGreen" placeholder="Teacher Name" />
                            </div>
                            <button type="submit" className="w-full mt-4 bg-schoolGreen text-white py-3 rounded-xl font-bold uppercase hover:bg-schoolGold transition">Save Subject</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const SubjectCard = ({ sub, onEdit, onDelete }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative group hover:shadow-md transition">
        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition flex gap-2">
            <button onClick={() => onEdit(sub)} className="p-2 bg-gray-100 rounded-lg text-gray-500 hover:text-schoolGreen"><Edit2 size={14} /></button>
            <button onClick={() => onDelete(sub.id)} className="p-2 bg-red-50 rounded-lg text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
        </div>

        <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <BookOpen size={24} />
            </div>
            <div>
                <h3 className="font-bold text-lg text-gray-800 leading-tight">{sub.name}</h3>
                <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-700 px-2 py-1 rounded mt-1 inline-block">{sub.department}</span>
            </div>
        </div>

        <div className="border-t border-gray-100 pt-4 mt-2 flex items-center gap-2 text-gray-500">
            <User size={14} />
            <p className="text-sm font-bold">{sub.teacher || 'Unassigned'}</p>
        </div>
    </div>
);

export default AdminSubjects;
