import React, { useState, useEffect } from 'react';
import { User, Lock, Save, Camera } from 'lucide-react';
import { useToast } from '../../components/ToastProvider';
import { supabase } from '../../utils/db'; // Ensure this exports supabase client

const StudentSettings = () => {
    const notify = useToast();
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Profile State
    const [profile, setProfile] = useState({
        id: '',
        firstName: '',
        lastName: '',
        admissionNumber: '',
        classLevel: '',
        passportUrl: null
    });

    // Password State
    const [security, setSecurity] = useState({
        current: '',
        newPass: '',
        confirmPass: ''
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setLoading(true);
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
            const user = JSON.parse(userStr);
            // Fetch fresh data from DB to get latest passport
            const { data, error } = await supabase
                .from('students')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) {
                setProfile({
                    id: data.id,
                    firstName: data.first_name,
                    lastName: data.last_name,
                    admissionNumber: data.admission_number,
                    classLevel: data.current_class_id, // This is ID, ideally join or store Name. For now, display.
                    passportUrl: data.passport_url
                });
            }
        }
        setLoading(false);
    };

    const handlePassportUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileName = `student-passport-${profile.id}-${Date.now()}`;
            const { data, error } = await supabase.storage
                .from('passports')
                .upload(fileName, file);

            if (error) throw error;

            // Get Public URL
            const { data: publicData } = supabase.storage
                .from('passports')
                .getPublicUrl(fileName);

            const publicUrl = publicData.publicUrl;

            // Update Database
            const { error: dbError } = await supabase
                .from('students')
                .update({ passport_url: publicUrl })
                .eq('id', profile.id);

            if (dbError) throw dbError;

            setProfile(prev => ({ ...prev, passportUrl: publicUrl }));

            // Update LocalStorage too so refresh persists basic info if used there
            const userStr = localStorage.getItem('currentUser');
            if (userStr) {
                const u = JSON.parse(userStr);
                u.passport_url = publicUrl;
                localStorage.setItem('currentUser', JSON.stringify(u));
            }

            notify.success("Passport uploaded successfully!");
        } catch (error) {
            console.error("Upload Error:", error);
            notify.error("Failed to upload passport.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-500 max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-serif font-bold text-schoolGreen mb-2">Student Settings</h1>
            <p className="text-gray-500 mb-8">Manage your profile and passport.</p>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* PASSPORT SECTION */}
                    <div className="w-full md:w-1/3 flex flex-col items-center">
                        <div className="w-48 h-48 rounded-full border-4 border-gray-100 overflow-hidden bg-gray-50 relative group mb-4">
                            {profile.passportUrl ? (
                                <img src={profile.passportUrl} alt="Passport" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <User size={64} />
                                </div>
                            )}

                            {/* OVERLAY */}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                                <label htmlFor="passport-upload" className="cursor-pointer text-white flex flex-col items-center">
                                    <Camera size={32} className="mb-1" />
                                    <span className="text-xs font-bold uppercase">Change Photo</span>
                                </label>
                            </div>
                        </div>

                        <input
                            type="file"
                            id="passport-upload"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePassportUpload}
                            disabled={uploading}
                        />

                        {uploading && <p className="text-xs text-schoolGreen font-bold animate-pulse">Uploading...</p>}

                        <div className="text-center mt-2">
                            <h2 className="font-bold text-xl text-gray-800">{profile.firstName} {profile.lastName}</h2>
                            <p className="text-sm text-gray-500">{profile.admissionNumber}</p>
                        </div>
                    </div>

                    {/* DETAILS SECTION */}
                    <div className="flex-1 space-y-6">
                        <h3 className="font-bold text-lg text-gray-700 border-b border-gray-100 pb-2">Personal Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">First Name</label>
                                <input type="text" value={profile.firstName} disabled className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-500 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Last Name</label>
                                <input type="text" value={profile.lastName} disabled className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-500 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Admission No</label>
                                <input type="text" value={profile.admissionNumber} disabled className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-500 cursor-not-allowed" />
                            </div>
                            {/* 
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Class</label>
                                <input type="text" value={profile.classLevel} disabled className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-500 cursor-not-allowed" />
                            </div>
                             */}
                        </div>

                        <div className="pt-6 relative opacity-50 pointer-events-none">
                            <div className="absolute inset-0 z-10 flex items-center justify-center">
                                <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded text-xs font-bold">Password Change Disabled</span>
                            </div>
                            <h3 className="font-bold text-lg text-gray-700 border-b border-gray-100 pb-2 mb-4">Security</h3>
                            <div className="space-y-4">
                                <input type="password" placeholder="Current Password" className="w-full p-3 rounded-xl border border-gray-200" />
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="password" placeholder="New Password" className="w-full p-3 rounded-xl border border-gray-200" />
                                    <input type="password" placeholder="Confirm Password" className="w-full p-3 rounded-xl border border-gray-200" />
                                </div>
                                <button className="bg-schoolGreen text-white px-6 py-3 rounded-xl font-bold">Update Password</button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default StudentSettings;
