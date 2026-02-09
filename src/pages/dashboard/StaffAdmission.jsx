import React, { useState, useEffect } from 'react';
import { UserPlus, Save, RefreshCw } from 'lucide-react';
import { saveApplicant, getClasses, getStaffByEmail } from '../../utils/db'; // Added getStaffByEmail
import { useToast } from '../../components/ToastProvider';

const StaffAdmission = () => {
    const notify = useToast();
    const [availableClasses, setAvailableClasses] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        gender: 'M',
        age: '',
        classLevel: '',
        parentName: '',
        parentPhone: ''
    });
    const [isAssigned, setIsAssigned] = useState(false);


    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        // Load Classes
        const cls = await getClasses();
        setAvailableClasses(cls);

        // Check Assignment
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
            const user = JSON.parse(userStr);
            const profile = await getStaffByEmail(user.email);
            if (profile?.assignedClass) {
                // LOCK to assigned class
                setFormData(prev => ({ ...prev, classLevel: profile.assignedClass }));
                setIsAssigned(true);
            } else if (cls.length > 0) {
                setFormData(prev => ({ ...prev, classLevel: cls[0].name }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.parentName || !formData.classLevel || !formData.age) {
            return notify.error("Please fill all required fields");
        }

        setLoading(true);
        try {
            const userStr = localStorage.getItem('currentUser');
            const user = userStr ? JSON.parse(userStr) : {}; // Get logged in staff ID

            await saveApplicant({
                ...formData,
                parentPhone: formData.parentPhone || 'N/A',
                createdBy: user.id // Pass Staff ID for notification
            });
            notify.success("Application submitted for Admin approval.");
            setFormData({
                name: '', gender: 'M', age: '',
                classLevel: availableClasses.length > 0 ? availableClasses[0].name : '',
                parentName: '', parentPhone: ''
            });
        } catch (error) {
            console.error(error);
            notify.error("Failed to submit application.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-serif font-bold text-schoolGreen">Student Admission</h1>
                    <p className="text-gray-500 mt-1">Submit new student details for administrative approval.</p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
                    <div className="bg-schoolGreen h-2 w-full"></div>
                    <form onSubmit={handleSubmit} className="p-8 md:p-10">
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Full Name</label>
                                    <input type="text" required className="p-3 bg-gray-50 border rounded-xl w-full font-bold text-gray-700 outline-none focus:ring-2 focus:ring-schoolGreen/20"
                                        placeholder="e.g. Musa Ibrahim"
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Gender</label>
                                    <select className="p-3 bg-gray-50 border rounded-xl w-full font-bold text-gray-700 outline-none"
                                        value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                    >
                                        <option value="M">Male</option>
                                        <option value="F">Female</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Class</label>
                                    <select
                                        className={`p-3 border rounded-xl w-full font-bold outline-none ${isAssigned ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50 text-gray-700'}`}
                                        value={formData.classLevel}
                                        onChange={e => setFormData({ ...formData, classLevel: e.target.value })}
                                        disabled={isAssigned}
                                    >
                                        {availableClasses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                    {isAssigned && <p className="text-[10px] text-green-600 font-bold mt-1">Locked to your assigned class</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Age</label>
                                    <input type="number" required className="p-3 bg-gray-50 border rounded-xl w-full font-bold text-gray-700 outline-none"
                                        placeholder="e.g. 12"
                                        value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4">
                                <h3 className="text-sm font-bold text-schoolGreen uppercase tracking-widest mb-4">Academic Info</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(formData.classLevel.startsWith('SS') || formData.classLevel.includes('Senior')) && (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Department</label>
                                            <select className="p-3 bg-gray-50 border rounded-xl w-full font-bold text-gray-700 outline-none"
                                                value={formData.department || ''} onChange={e => setFormData({ ...formData, department: e.target.value })}
                                            >
                                                <option value="">Select Department</option>
                                                <option value="Science">Science</option>
                                                <option value="Art">Art</option>
                                                <option value="Commercial">Commercial</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4">
                                <h3 className="text-sm font-bold text-schoolGreen uppercase tracking-widest mb-4">Guardian Info</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input type="text" required className="p-3 bg-gray-50 border rounded-xl w-full"
                                        placeholder="Parent Name"
                                        value={formData.parentName} onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                                    />
                                    <input type="text" required className="p-3 bg-gray-50 border rounded-xl w-full"
                                        placeholder="Phone Number"
                                        value={formData.parentPhone} onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full mt-8 bg-schoolGreen text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-schoolGold transition shadow-lg flex justify-center items-center">
                            {loading ? <RefreshCw className="animate-spin mr-2" /> : <UserPlus className="mr-2" size={20} />}
                            {loading ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StaffAdmission;
