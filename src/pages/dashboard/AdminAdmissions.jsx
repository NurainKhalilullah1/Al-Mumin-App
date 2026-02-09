import React, { useState, useEffect } from 'react';
import { Check, X, User, Plus, Save, UserPlus, RefreshCw, CheckSquare } from 'lucide-react';
import { getApplicants, updateApplicantStatus, saveStudent, saveMultipleStudents, getClasses, getSchoolFees } from '../../utils/db'; // Added getSchoolFees
import { useToast } from '../../components/ToastProvider';

const AdminAdmissions = () => {
    const notify = useToast();
    const [activeTab, setActiveTab] = useState('applicants');
    const [applicants, setApplicants] = useState([]);
    const [availableClasses, setAvailableClasses] = useState([]);

    // Approval Modal State
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [admissionFee, setAdmissionFee] = useState(0);
    const [selectedDepartment, setSelectedDepartment] = useState(''); // New State
    const [showApprovalModal, setShowApprovalModal] = useState(false);

    // Single Form State
    const [formData, setFormData] = useState({
        name: '', gender: 'M', classLevel: '', parentName: '', phone: '', department: ''
    });

    // Bulk Form State
    const [bulkData, setBulkData] = useState([
        { name: '', gender: 'M', classLevel: '', parentName: '', phone: '' }
    ]);

    useEffect(() => {
        loadApplicants();
        loadClasses();
    }, []);

    const [showHistory, setShowHistory] = useState(false); // New State

    const loadApplicants = async () => {
        const data = await getApplicants();
        // Default: Show only Pending. If showHistory is true, show all.
        if (showHistory) {
            setApplicants(data);
        } else {
            setApplicants(data.filter(app => app.status === 'Pending'));
        }
    };

    // Re-load when filter changes
    useEffect(() => {
        loadApplicants();
    }, [showHistory]);

    const loadClasses = async () => {
        const cls = await getClasses();
        setAvailableClasses(cls);
        if (cls.length > 0) {
            setFormData(prev => ({ ...prev, classLevel: cls[0].name }));
        }
    };

    const initiateAdmission = (applicant) => {
        const fees = getSchoolFees();
        const defaultFee = fees[applicant.class_level] || 150000;

        setSelectedApplicant(applicant);
        setAdmissionFee(defaultFee);
        // Default department if available in applicant (future proof) or empty
        setSelectedDepartment('');
        setShowApprovalModal(true);
    };

    const confirmAdmission = async () => {
        if (!selectedApplicant) return;

        // Pass department in a way updateApplicantStatus/saveStudent can handle
        // We'll leverage the 'fee' hack or update updateApplicantStatus signature?
        // updateApplicantStatus takes (id, status, fee). 
        // We need to pass department too. 
        // Best way: Update updateApplicantStatus to accept an options object or extra arg.
        // OR better: Just call saveStudent directly here? No, updateApplicantStatus handles notification/status update.
        // Let's modify updateApplicantStatus in db.js to accept extra data? 
        // OR: Update applicant record with department FIRST, then approve.

        // Strategy: We will temporarily specificy Department in the function call by modifying db.js later OR:
        // Current db.js: updateApplicantStatus calls saveStudent with applicant details.
        // It reads applicant from DB. So we must UPDATE applicant in DB with department first if we want it to persist?
        // Or simply pass the overrides to updateApplicantStatus.

        // Let's update updateApplicantStatus signature in next step. For now, pass it as 4th arg.
        await updateApplicantStatus(selectedApplicant.id, 'Admitted', admissionFee, selectedDepartment);

        loadApplicants();
        notify.success(`Applicant ${selectedApplicant.name} admitted to ${selectedApplicant.class_level} ${selectedDepartment ? '(' + selectedDepartment + ')' : ''}`);
        setShowApprovalModal(false);
        setSelectedApplicant(null);
    };

    const handleReject = async (id) => {
        if (window.confirm("Reject this application?")) {
            await updateApplicantStatus(id, 'Rejected');
            loadApplicants();
            notify.success(`Applicant marked as Rejected`);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.parentName || !formData.classLevel) return notify.error("Please fill all required fields");

        const newStudent = await saveStudent(formData);

        if (newStudent && newStudent.success && newStudent.password) {
            alert(`Student Registered!\n\nName: ${newStudent.name}\nID: ${newStudent.id}\nPassword: ${newStudent.password}`);
            notify.success(`Student Registered! ID: ${newStudent.id}`);
        } else {
            notify.success(`Student Registered Successfully!`);
        }

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
        <div className="animate-in fade-in duration-500 relative">

            {/* HEADER & TABS */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-schoolGreen">Admissions Portal</h1>
                    <p className="text-gray-500 mt-1">Manage applications or directly register new students.</p>
                </div>
                <div className="flex gap-2 self-end mb-4 md:mb-0">
                    <button onClick={() => setShowHistory(!showHistory)} className={`p-2.5 rounded-xl border transition shadow-sm ${showHistory ? 'bg-schoolGreen text-white border-schoolGreen' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`} title={showHistory ? "Hide Processed" : "Show History"}>
                        <CheckSquare size={20} />
                    </button>
                    <button onClick={loadApplicants} className="bg-white text-gray-500 p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 hover:text-schoolGreen transition shadow-sm" title="Refresh Applicants">
                        <RefreshCw size={20} />
                    </button>
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
                                    <p className="text-xs font-bold text-gray-400 uppercase">{app.class_level} • Age {app.age}</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600 mb-6 bg-gray-50 p-4 rounded-xl">
                                <p><span className="font-bold text-xs uppercase text-gray-400 mr-2">Parent:</span> {app.parent_name}</p>
                                <p><span className="font-bold text-xs uppercase text-gray-400 mr-2">Phone:</span> {app.parent_phone}</p>
                            </div>
                            {app.status === 'Pending' ? (
                                <div className="flex gap-3">
                                    <button onClick={() => initiateAdmission(app)} className="flex-1 bg-schoolGreen text-white py-2 rounded-xl font-bold text-sm hover:bg-schoolGold transition shadow-md">Admit</button>
                                    <button onClick={() => handleReject(app.id)} className="flex-1 bg-red-50 text-red-500 py-2 rounded-xl font-bold text-sm hover:bg-red-100 transition">Reject</button>
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
                            {(formData.classLevel.startsWith('SS') || formData.classLevel.includes('Senior')) && (
                                <select className="p-3 bg-gray-50 border rounded-xl w-full" value={formData.department || ''} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                                    <option value="">Select Department</option>
                                    <option value="Science">Science</option>
                                    <option value="Art">Art</option>
                                    <option value="Commercial">Commercial</option>
                                </select>
                            )}
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

            {/* --- ADMISSION APPROVAL MODAL --- */}
            {showApprovalModal && selectedApplicant && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Approve Admission</h2>
                        <p className="text-gray-500 text-sm mb-6">Set the school fee for <strong>{selectedApplicant.name}</strong>.</p>

                        <div className="bg-gray-50 p-4 rounded-xl mb-6 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Applicant:</span>
                                <span className="font-bold text-gray-800">{selectedApplicant.name}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Class:</span>
                                <span className="font-bold text-gray-800">{selectedApplicant.class_level}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Parent:</span>
                                <span className="font-bold text-gray-800">{selectedApplicant.parent_name}</span>
                            </div>
                        </div>

                        {(selectedApplicant.class_level.startsWith('SS') || selectedApplicant.class_level.includes('Senior')) && (
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Department</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-schoolGreen"
                                    value={selectedDepartment}
                                    onChange={(e) => setSelectedDepartment(e.target.value)}
                                >
                                    <option value="">Select Department</option>
                                    <option value="Science">Science</option>
                                    <option value="Art">Art</option>
                                    <option value="Commercial">Commercial</option>
                                </select>
                            </div>
                        )}

                        <div className="mb-8">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Total School Fee (₦)</label>
                            <input
                                type="number"
                                value={admissionFee}
                                onChange={(e) => setAdmissionFee(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 font-bold text-lg text-gray-800 focus:ring-2 focus:ring-schoolGreen focus:border-transparent outline-none transition"
                            />
                            <p className="text-xs text-gray-400 mt-2">Adjust this amount if the student has a scholarship or discount.</p>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setShowApprovalModal(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition">
                                Cancel
                            </button>
                            <button onClick={confirmAdmission} className="flex-1 py-3 rounded-xl font-bold text-white bg-schoolGreen hover:bg-schoolGold transition shadow-lg">
                                Confirm Admission
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminAdmissions;
