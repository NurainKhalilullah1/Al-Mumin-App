import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Filter, MoreHorizontal, User, GraduationCap, Edit2, Trash2, X, RefreshCw, ArrowLeft, Layers } from 'lucide-react';
import { getStudentsByClass, saveStudent, deleteStudent, getClasses } from '../../utils/db';
import { useToast } from '../../components/ToastProvider';

const AdminStudents = () => {
    const notify = useToast();
    const location = useLocation();
    const [viewMode, setViewMode] = useState('classes'); // 'classes' | 'students'
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Form State
    const [formData, setFormData] = useState({ id: null, name: '', classLevel: '', gender: 'M', parentPhone: '', assignedFee: 0 });

    useEffect(() => {
        loadClasses();
    }, []);

    // Handle Deep Linking from Search
    useEffect(() => {
        if (classes.length > 0 && location.state?.selectedClassName && !selectedClass) {
            const targetClass = classes.find(c => c.name === location.state.selectedClassName);
            if (targetClass) {
                handleClassClick(targetClass);
            }
        }
    }, [classes, location.state]);

    const loadClasses = async () => {
        setLoading(true);
        const data = await getClasses();
        setClasses(data);
        setLoading(false);
    };

    const handleClassClick = async (cls) => {
        setSelectedClass(cls);
        setViewMode('students');
        setLoading(true);
        const data = await getStudentsByClass(cls.name);
        setStudents(data);
        setLoading(false);
    };

    const handleBackToClasses = () => {
        setViewMode('classes');
        setSelectedClass(null);
        setStudents([]);
        setSearch('');
    };

    const handleRefresh = async () => {
        if (!selectedClass) return;
        setRefreshing(true);
        try {
            const data = await getStudentsByClass(selectedClass.name);
            setStudents(data);
            notify.success("Student list updated successfully");
        } catch (error) {
            notify.error("Failed to refresh list");
        } finally {
            setRefreshing(false);
        }
    };

    const filteredStudents = students.filter(s =>
        (s.name && s.name.toLowerCase().includes(search.toLowerCase())) ||
        (s.admission_number && s.admission_number.toLowerCase().includes(search.toLowerCase())) ||
        (s.id && String(s.id).toLowerCase().includes(search.toLowerCase()))
    );

    const handleEdit = (student) => {
        // Pre-fill form, ensuring classLevel is set to current class if available
        setFormData({
            ...student,
            classLevel: selectedClass ? selectedClass.name : student.classLevel,

            parentPhone: student.parent_phone || '',
            department: student.department || '', // Load existing department
            assignedFee: student.assigned_fee || 0
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
            await deleteStudent(id);
            // Refresh current class list
            const data = await getStudentsByClass(selectedClass.name);
            setStudents(data);
            notify.success("Student records deleted.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await saveStudent(formData);

        if (!result.success) {
            notify.error("Failed to save student: " + (result.error?.message || "Unknown error"));
            console.error(result.error);
            return;
        }

        // Refresh list
        const data = await getStudentsByClass(selectedClass.name);
        setStudents(data);
        setShowModal(false);

        if (result.password) {
            alert(`Student Updated!\n\nName: ${result.name}\nNew Password: ${result.password}\n\nPlease share these login details.`);
            notify.success("Student updated with new credentials!");
        } else {
            notify.success("Student updated successfully!");
        }
    };

    return (
        <div className="animate-in fade-in duration-500">

            {/* VIEW MODE: CLASSES LIST */}
            {viewMode === 'classes' && (
                <>
                    <div className="mb-8">
                        <h1 className="text-3xl font-serif font-bold text-schoolGreen">Student Directory</h1>
                        <p className="text-gray-500 mt-1">Select a class to manage its students.</p>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-gray-400">Loading classes...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {classes.map((cls) => (
                                <div
                                    key={cls.id}
                                    onClick={() => handleClassClick(cls)}
                                    className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-schoolGreen/20 hover:border-schoolGreen transition cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 bg-green-50 text-schoolGreen rounded-xl flex items-center justify-center group-hover:bg-schoolGreen group-hover:text-white transition">
                                            <Layers size={24} />
                                        </div>
                                        <span className="text-xs font-bold uppercase bg-gray-100 px-2 py-1 rounded text-gray-500">{cls.level || 'General'}</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-1">{cls.name}</h3>
                                    <p className="text-sm text-gray-400 font-bold">{cls.form_teacher || cls.formTeacher || 'No Class Teacher'}</p>
                                </div>
                            ))}
                            {classes.length === 0 && <p className="text-gray-400 col-span-3">No classes found.</p>}
                        </div>
                    )}
                </>
            )}

            {/* VIEW MODE: STUDENTS LIST (TABLE) */}
            {viewMode === 'students' && selectedClass && (
                <>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
                        <div>
                            <button onClick={handleBackToClasses} className="flex items-center text-gray-400 hover:text-schoolGreen font-bold mb-4 transition text-sm">
                                <ArrowLeft size={16} className="mr-2" /> Back to Classes
                            </button>
                            <h1 className="text-3xl font-serif font-bold text-schoolGreen">{selectedClass.name} Students</h1>
                            <p className="text-gray-500 mt-1">Managing {students.length} students in this class.</p>
                        </div>

                        <div className="flex gap-2 mt-4 md:mt-0">
                            <button onClick={handleRefresh} className="bg-white text-gray-500 p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 hover:text-schoolGreen transition shadow-sm" title="Refresh Data">
                                <RefreshCw size={20} className={refreshing ? "animate-spin text-schoolGreen" : ""} />
                            </button>

                            <div className="bg-white p-2 rounded-xl border border-gray-200 flex items-center shadow-sm w-72 focus-within:ring-2 ring-schoolGreen/20 transition">
                                <Search size={18} className="text-gray-400 ml-2 mr-2" />
                                <input
                                    type="text"
                                    placeholder="Search student..."
                                    className="w-full p-2 outline-none text-sm font-bold text-gray-700 placeholder-gray-300 bg-transparent"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-black/5 overflow-hidden animate-in slide-in-from-right duration-300">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-400 border-b border-gray-100 hidden md:table-header-group">
                                <tr>
                                    <th className="p-6">Student Profile</th>
                                    <th className="p-6">Gender</th>
                                    <th className="p-6">Parent Phone</th>
                                    <th className="p-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 bg-white">
                                {filteredStudents.map((student, idx) => (
                                    <React.Fragment key={idx}>
                                        {/* DESKTOP ROW */}
                                        <tr className="hover:bg-green-50/30 transition group hidden md:table-row">
                                            <td className="p-6 flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold relative shadow-md ${student.gender === 'Female' || student.gender === 'F' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    {student.name.charAt(0)}
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800 text-sm group-hover:text-schoolGreen transition">{student.name}</h3>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{student.admission_number || student.id || 'N/A'}</p>
                                                </div>
                                            </td>
                                            <td className="p-6 text-sm font-bold text-gray-500">{student.gender}</td>
                                            <td className="p-6 text-sm font-bold text-gray-500">{student.parent_phone || 'N/A'}</td>
                                            <td className="p-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleEdit(student)} className="p-2 text-gray-400 hover:text-schoolGreen hover:bg-schoolGreen/10 rounded-lg transition" title="Edit Details">
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button onClick={() => handleDelete(student.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete Student">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* MOBILE CARD (Visible only on small screens) */}
                                        <tr className="md:hidden border-b border-gray-100 last:border-0 block">
                                            <td colSpan="4" className="p-4 block">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${student.gender === 'Female' || student.gender === 'F' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                                                            {student.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-gray-800 text-sm">{student.name}</h3>
                                                            <p className="text-[10px] text-gray-400 uppercase">{student.admission_number}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button onClick={() => handleEdit(student)} className="p-2 text-gray-400 hover:text-schoolGreen bg-gray-50 rounded-lg">
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button onClick={() => handleDelete(student.id)} className="p-2 text-gray-400 hover:text-red-600 bg-red-50 rounded-lg">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex justify-between items-center text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                                                    <div><span className="font-bold uppercase text-[10px] text-gray-400 mr-1">Phone:</span>{student.parent_phone || 'N/A'}</div>
                                                    <div><span className="font-bold uppercase text-[10px] text-gray-400 mr-1">Gender:</span>{student.gender}</div>
                                                </div>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>

                        {filteredStudents.length === 0 && (
                            <div className="text-center py-20">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                    <User size={32} />
                                </div>
                                <p className="text-gray-400 font-bold">No students found in this class.</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* EDIT MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-[99999] flex items-center justify-center p-4 backdrop-blur-sm">
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
                                <p className="text-[10px] text-orange-500 mt-1">* Changing surname will regenerate password.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Class</label>
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.classLevel} // Read-only in this view because we are in specific class view
                                        className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl outline-none text-gray-500"
                                    />
                                </div>

                                {/* Department Selection (Only for Senior Classes) */}
                                {(formData.classLevel.startsWith('SS') || formData.classLevel.includes('Senior')) && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Department</label>
                                        <select
                                            value={formData.department || ''}
                                            onChange={e => setFormData({ ...formData, department: e.target.value })}
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-schoolGreen"
                                        >
                                            <option value="">Select Department</option>
                                            <option value="Science">Science</option>
                                            <option value="Art">Art</option>
                                            <option value="Commercial">Commercial</option>
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Gender</label>
                                    <select
                                        value={formData.gender}
                                        onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-schoolGreen"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Parent Phone</label>
                                <input
                                    type="text"
                                    value={formData.parentPhone}
                                    onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-schoolGreen"
                                    placeholder="e.g. 080..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Assigned Fee (₦)</label>
                                <input
                                    type="number"
                                    value={formData.assignedFee}
                                    onChange={e => setFormData({ ...formData, assignedFee: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-schoolGreen"
                                    placeholder="e.g. 50000"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Password</label>
                                <input
                                    type="text"
                                    readOnly
                                    value={formData.password || 'Hidden'}
                                    className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl outline-none text-gray-500 cursor-not-allowed"
                                />
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
