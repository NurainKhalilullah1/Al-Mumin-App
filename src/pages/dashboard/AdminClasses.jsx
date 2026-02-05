import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, GraduationCap, CheckCircle } from 'lucide-react';
import { getClasses, saveClass, deleteClass, getStaff, getStudentsByClass } from '../../utils/db'; // New DB functions
import { useToast } from '../../components/ToastProvider';

const AdminClasses = () => {
    const notify = useToast();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({ id: null, name: '', level: 'JSS 1', formTeacher: '' });

    const [teachers, setTeachers] = useState([]);

    const [viewClass, setViewClass] = useState(null);
    const [classStudents, setClassStudents] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [classesData, staffData] = await Promise.all([getClasses(), getStaff()]);
        setClasses(classesData);
        setTeachers(staffData.filter(s => s.role === 'Teacher' || s.role === 'Admin'));
        setLoading(false);
    };

    const loadClasses = async () => {
        const data = await getClasses();
        setClasses(data);
    };

    const loadClassStudents = async (className) => {
        const students = await getStudentsByClass(className);
        setClassStudents(students);
    };

    const handleViewClass = async (cls) => {
        setViewClass(cls);
        await loadClassStudents(cls.name);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) return notify.error("Class Name is required");

        const result = await saveClass(formData);

        if (!result.success) {
            notify.error("Failed to save class: " + (result.error?.message || "Unknown error"));
            return;
        }

        loadClasses();
        setShowModal(false);
        setFormData({ id: null, name: '', level: 'JSS 1', formTeacher: '' });
        notify.success("Class saved successfully!");
    };

    const handleEdit = (cls, e) => {
        e.stopPropagation(); // Prevent opening view modal
        setFormData(cls);
        setShowModal(true);
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation(); // Prevent opening view modal
        if (window.confirm("Delete this class?")) {
            await deleteClass(id);
            loadClasses();
            notify.success("Class deleted.");
        }
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-schoolGreen">Class Management</h1>
                    <p className="text-gray-500 mt-1">Manage class arms, levels, and class teachers.</p>
                </div>
                <button
                    onClick={() => { setFormData({ id: null, name: '', level: 'JSS 1', formTeacher: '' }); setShowModal(true); }}
                    className="bg-schoolGreen text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center shadow-lg hover:bg-schoolGold transition"
                >
                    <Plus size={18} className="mr-2" /> Add New Class
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((cls) => (
                    <div
                        key={cls.id}
                        onClick={() => handleViewClass(cls)}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative group hover:shadow-md transition cursor-pointer"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition flex gap-2">
                            <button onClick={(e) => handleEdit(cls, e)} className="p-2 bg-gray-100 rounded-lg text-gray-500 hover:text-schoolGreen"><Edit2 size={14} /></button>
                            <button onClick={(e) => handleDelete(cls.id, e)} className="p-2 bg-red-50 rounded-lg text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-green-50 text-schoolGreen rounded-xl flex items-center justify-center">
                                <GraduationCap size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl text-gray-800">{cls.name}</h3>
                                <span className="text-xs font-bold uppercase bg-gray-100 px-2 py-1 rounded text-gray-500">{cls.level}</span>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-4 mt-2">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Class Teacher</p>
                            <p className="text-sm font-bold text-gray-700">{cls.form_teacher || cls.formTeacher || 'Not Assigned'}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* CLASS STUDENTS MODAL */}
            {viewClass && (
                <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setViewClass(null)} className="absolute top-5 right-5 text-gray-400 hover:text-red-500"><X size={24} /></button>
                        <h2 className="text-2xl font-bold text-schoolGreen mb-2">{viewClass.name} - Students</h2>
                        <p className="text-gray-500 text-sm mb-6">Total Students: {classStudents.length}</p>

                        <div className="space-y-2">
                            {classStudents.length > 0 ? classStudents.map((s, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">{s.first_name[0]}</div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{s.name}</p>
                                            <p className="text-xs text-gray-400">{s.admission_number || s.id}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded border border-gray-100">{s.gender === 'M' || s.gender === 'Male' ? 'Male' : 'Female'}</span>
                                </div>
                            )) : (
                                <div className="text-center py-10 text-gray-400">
                                    <p>No students found in this class.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT/CREATE MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative animate-in zoom-in-95">
                        <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-red-500"><X size={24} /></button>
                        <h2 className="text-2xl font-bold text-schoolGreen mb-6">{formData.id ? 'Edit Class' : 'Add New Class'}</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Class Name</label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-schoolGreen" placeholder="e.g. JSS 1A" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Level</label>
                                <select value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-schoolGreen">
                                    {['JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3'].map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Class Teacher (Optional)</label>
                                <select
                                    value={formData.formTeacher}
                                    onChange={e => setFormData({ ...formData, formTeacher: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-schoolGreen"
                                >
                                    <option value="">-- Select Teacher --</option>
                                    {teachers.map(t => (
                                        <option key={t.id} value={t.name}>{t.name} ({t.subject || 'Staff'})</option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="w-full mt-4 bg-schoolGreen text-white py-3 rounded-xl font-bold uppercase hover:bg-schoolGold transition">Save Class</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminClasses;
