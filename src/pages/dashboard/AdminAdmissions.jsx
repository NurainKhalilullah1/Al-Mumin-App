import React, { useState, useEffect } from 'react';
import { Check, X, User, Plus, Save, UserPlus } from 'lucide-react';
import { getApplicants, updateApplicantStatus, saveStudent, saveMultipleStudents, getClasses } from '../../utils/db';
import { useToast } from '../../components/ToastProvider';

const AdminAdmissions = () => {
    const notify = useToast();
    const [activeTab, setActiveTab] = useState('applicants');
    const [applicants, setApplicants] = useState([]);
    const [availableClasses, setAvailableClasses] = useState([]);

    // Single Form State
    const [formData, setFormData] = useState({
        name: '', gender: 'M', classLevel: '', parentName: '', phone: ''
    });

    // Bulk Form State
    const [bulkData, setBulkData] = useState([
        { name: '', gender: 'M', classLevel: '', parentName: '', phone: '' }
    ]);

    useEffect(() => {
        loadApplicants();
        loadClasses();
    }, []);

    const loadApplicants = () => {
        setApplicants(getApplicants());
    };

    const loadClasses = () => {
        const cls = getClasses();
        setAvailableClasses(cls);
        if (cls.length > 0) {
            setFormData(prev => ({ ...prev, classLevel: cls[0].name }));
        }
    };

    const handleStatus = (id, status) => {
        const confirmMsg = status === 'Admitted' ? "Admit this student?" : "Reject this application?";
        if (window.confirm(confirmMsg)) {
            updateApplicantStatus(id, status);
            loadApplicants();
            notify.success(`Applicant marked as ${status}`);
        }
    };

    const handleRegisterSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.parentName || !formData.classLevel) return notify.error("Please fill all required fields");

        const newStudent = saveStudent(formData);
        notify.success(`Student Registered Successfully! ID: ${newStudent.id}`);

        setFormData({
            name: '', gender: 'M',
            classLevel: availableClasses.length > 0 ? availableClasses[0].name : '',
            parentName: '', phone: ''
        });
    };

    // --- BULK LOGIC ---
    const addBulkRow = () => {
        setBulkData([...bulkData, { name: '', gender: 'M', classLevel: availableClasses[0]?.name || '', parentName: '', phone: '' }]);
    };

    const removeBulkRow = (index) => {
        const newData = [...bulkData];
        newData.splice(index, 1);
        setBulkData(newData);
    };

    const handleBulkChange = (index, field, value) => {
        const newData = [...bulkData];
        newData[index][field] = value;
        setBulkData(newData);
    };

    const handleBulkSubmit = async () => {
        // Validation
        const validStudents = bulkData.filter(s => s.name && s.parentName);
        if (validStudents.length === 0) return notify.error("Please fill in at least one student's details.");

        const result = await saveMultipleStudents(validStudents);
        if (result && result.length > 0) {
            notify.success(`${result.length} students registered successfully!`);
            setBulkData([{ name: '', gender: 'M', classLevel: availableClasses[0]?.name || '', parentName: '', phone: '' }]);
        } else {
            notify.error("Failed to register students. Check console/logs.");
        }
    };

    return (
        <div className="animate-in fade-in duration-500">

            {/* HEADER & TABS */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-schoolGreen">Admissions Portal</h1>
                    <p className="text-gray-500 mt-1">Manage applications or directly register new students.</p>
                </div>

                <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 mt-4 md:mt-0 flex">
                    <button onClick={() => setActiveTab('applicants')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'applicants' ? 'bg-schoolGreen text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}>
                        View Applicants
                    </button>
                    <button onClick={() => setActiveTab('register')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center ${activeTab === 'register' ? 'bg-schoolGreen text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <Plus size={16} className="mr-2" /> Direct
                    </button>
                    <button onClick={() => setActiveTab('bulk')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center ${activeTab === 'bulk' ? 'bg-schoolGreen text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <UserPlus size={16} className="mr-2" /> Bulk
                    </button>
                </div>
            </div>

            {/* --- TAB 1: APPLICANTS --- */}
            {activeTab === 'applicants' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {applicants.map((app) => (
                        <div key={app.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group hover:shadow-md transition">
                            <div className={`absolute top-0 right-0 px-4 py-1 text-[10px] uppercase font-bold rounded-bl-xl ${app.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : app.status === 'Admitted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {app.status}
                            </div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center text-schoolGreen">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg leading-tight">{app.name}</h3>
                                    <p className="text-xs font-bold text-gray-400 uppercase">{app.class} • Age {app.age}</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600 mb-6 bg-gray-50 p-4 rounded-xl">
                                <p><span className="font-bold text-xs uppercase text-gray-400 mr-2">Parent:</span> {app.parent}</p>
                                <p><span className="font-bold text-xs uppercase text-gray-400 mr-2">Phone:</span> {app.phone}</p>
                            </div>
                            {app.status === 'Pending' ? (
                                <div className="flex gap-3">
                                    <button onClick={() => handleStatus(app.id, 'Admitted')} className="flex-1 bg-schoolGreen text-white py-2 rounded-xl font-bold text-sm hover:bg-schoolGold transition shadow-md">Admit</button>
                                    <button onClick={() => handleStatus(app.id, 'Rejected')} className="flex-1 bg-red-50 text-red-500 py-2 rounded-xl font-bold text-sm hover:bg-red-100 transition">Reject</button>
                                </div>
                            ) : <div className="text-center text-xs text-gray-400 italic font-bold">Processed</div>}
                        </div>
                    ))}
                    {applicants.length === 0 && <div className="col-span-3 text-center py-20 text-gray-400">No applicants found.</div>}
                </div>
            )}

            {/* --- TAB 2: DIRECT REGISTRATION FORM --- */}
            {activeTab === 'register' && (
                <div className="bg-white max-w-2xl mx-auto rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative min-h-[500px]">
                    <div className="bg-schoolGreen h-2 w-full"></div>
                    <form onSubmit={handleRegisterSubmit} className="p-8 md:p-10">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-800">Register Student</h2>
                            <p className="text-gray-500 text-sm">Add a new student directly.</p>
                        </div>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" required className="p-3 bg-gray-50 border rounded-xl w-full" placeholder="Full Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                <select className="p-3 bg-gray-50 border rounded-xl w-full" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                                    <option value="M">Male</option><option value="F">Female</option>
                                </select>
                            </div>
                            <select className="p-3 bg-gray-50 border rounded-xl w-full" value={formData.classLevel} onChange={e => setFormData({ ...formData, classLevel: e.target.value })}>
                                {availableClasses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" required className="p-3 bg-gray-50 border rounded-xl w-full" placeholder="Parent Name" value={formData.parentName} onChange={e => setFormData({ ...formData, parentName: e.target.value })} />
                                <input type="text" required className="p-3 bg-gray-50 border rounded-xl w-full" placeholder="Parent Phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                        </div>
                        <button type="submit" className="w-full mt-8 bg-schoolGreen text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-schoolGold transition shadow-lg">Save Registration</button>
                    </form>
                </div>
            )}

            {/* --- TAB 3: BULK ADMISSION (NEW) --- */}
            {activeTab === 'bulk' && (
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
                    <div className="bg-schoolGreen h-2 w-full"></div>
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">Bulk Admission</h2>
                                <p className="text-gray-500 text-sm">Register multiple students at once.</p>
                            </div>
                            <button onClick={addBulkRow} className="bg-gray-100 text-schoolGreen px-4 py-2 rounded-lg font-bold flex items-center hover:bg-schoolGreen hover:text-white transition">
                                <Plus size={16} className="mr-2" /> Add Row
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[800px]">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="p-3 rounded-l-lg">Student Name</th>
                                        <th className="p-3">Gender</th>
                                        <th className="p-3">Class</th>
                                        <th className="p-3">Parent Name</th>
                                        <th className="p-3">Parent Phone</th>
                                        <th className="p-3 rounded-r-lg text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {bulkData.map((row, i) => (
                                        <tr key={i}>
                                            <td className="p-2"><input type="text" className="w-full p-2 border rounded-lg" placeholder="Name" value={row.name} onChange={e => handleBulkChange(i, 'name', e.target.value)} /></td>
                                            <td className="p-2"><select className="w-full p-2 border rounded-lg" value={row.gender} onChange={e => handleBulkChange(i, 'gender', e.target.value)}><option value="M">M</option><option value="F">F</option></select></td>
                                            <td className="p-2">
                                                <select className="w-full p-2 border rounded-lg" value={row.classLevel} onChange={e => handleBulkChange(i, 'classLevel', e.target.value)}>
                                                    {availableClasses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                                </select>
                                            </td>
                                            <td className="p-2"><input type="text" className="w-full p-2 border rounded-lg" placeholder="Parent" value={row.parentName} onChange={e => handleBulkChange(i, 'parentName', e.target.value)} /></td>
                                            <td className="p-2"><input type="text" className="w-full p-2 border rounded-lg" placeholder="Phone" value={row.phone} onChange={e => handleBulkChange(i, 'phone', e.target.value)} /></td>
                                            <td className="p-2 text-center">
                                                {bulkData.length > 1 && (
                                                    <button onClick={() => removeBulkRow(i)} className="text-red-400 hover:text-red-600 font-bold px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition"><X size={16} /></button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button onClick={handleBulkSubmit} className="bg-schoolGreen text-white px-8 py-3 rounded-xl font-bold flex items-center shadow-lg hover:bg-schoolGold transition">
                                <UserPlus size={18} className="mr-2" /> Process Bulk Admission
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminAdmissions;
