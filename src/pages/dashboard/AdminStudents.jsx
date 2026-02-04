import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, User, GraduationCap, Edit2, Trash2, X } from 'lucide-react';
import { getStudents, saveStudent, deleteStudent, getClasses } from '../../utils/db'; // Updated imports
import { useToast } from '../../components/ToastProvider';

const AdminStudents = () => {
    const notify = useToast();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ id: null, name: '', classLevel: '', gender: 'M' });

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        setLoading(true);
        const data = await getStudents();
        setStudents(data);
        setLoading(false);
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.id && s.id.toLowerCase().includes(search.toLowerCase()))
    );

    const handleEdit = (student) => {
        setFormData(student);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
            await deleteStudent(id);
            loadStudents();
            notify.success("Student records deleted.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await saveStudent(formData);
        loadStudents();
        setShowModal(false);
        notify.success("Student updated successfully!");
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-schoolGreen">Student Directory</h1>
                    <p className="text-gray-500 mt-1">Total Active Students: <span className="font-bold text-gray-800">{students.length}</span></p>
                </div>

                <div className="bg-white p-2 rounded-xl border border-gray-200 flex items-center shadow-sm w-72 focus-within:ring-2 ring-schoolGreen/20 transition">
                    <Search size={18} className="text-gray-400 ml-2 mr-2" />
                    <input
                        type="text"
                        placeholder="Search by name or ID..."
                        className="w-full p-2 outline-none text-sm font-bold text-gray-700 placeholder-gray-300 bg-transparent"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-400 border-b border-gray-100">
                        <tr>
                            <th className="p-6">Student Profile</th>
                            <th className="p-6">Class</th>
                            <th className="p-6">Gender</th>
                            <th className="p-6">Admission Date</th>
                            <th className="p-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredStudents.map((student, idx) => (
                            <tr key={idx} className="hover:bg-green-50/30 transition group">
                                <td className="p-6 flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold relative shadow-md ${student.gender === 'M' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
                                        }`}>
                                        {student.name.charAt(0)}
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-sm group-hover:text-schoolGreen transition">{student.name}</h3>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{student.id || 'N/A'}</p>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <span className="flex items-center gap-2 text-sm font-bold text-gray-600 bg-gray-100 w-max px-3 py-1 rounded-lg">
                                        <GraduationCap size={14} className="text-gray-400" />
                                        {student.classLevel || student.class}
                                    </span>
                                </td>
                                <td className="p-6 text-sm font-bold text-gray-500">{student.gender === 'M' ? 'Male' : 'Female'}</td>
                                <td className="p-6 text-sm font-bold text-gray-500">{student.joinedDate || 'Sep 2024'}</td>
                                <td className="p-6 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEdit(student)} className="p-2 text-gray-400 hover:text-schoolGreen hover:bg-schoolGreen/10 rounded-lg transition" title="Edit">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(student.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredStudents.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <User size={32} />
                        </div>
                        <p className="text-gray-400 font-bold">No students found.</p>
                    </div>
                )}
            </div>

            {/* EDIT MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative animate-in zoom-in-95">
                        <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-red-500"><X size={24} /></button>
                        <h2 className="text-2xl font-bold text-schoolGreen mb-6">Edit Student</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Student Name</label>
                                <input
                                    type="text" required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-schoolGreen"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Class Level</label>
                                <select
                                    value={formData.classLevel}
                                    onChange={e => setFormData({ ...formData, classLevel: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-schoolGreen"
                                >
                                    {['JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3'].map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Gender</label>
                                <select
                                    value={formData.gender}
                                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-schoolGreen"
                                >
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                </select>
                            </div>

                            <button type="submit" className="w-full mt-4 bg-schoolGreen text-white py-3 rounded-xl font-bold uppercase hover:bg-schoolGold transition">Save Changes</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminStudents;
