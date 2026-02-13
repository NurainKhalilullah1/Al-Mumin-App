import React, { useState, useEffect } from 'react';
import { User, Bell, Lock, Save, Moon, RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from '../../components/ToastProvider';
import { getAdminProfile, saveAdminProfile, startNewSession, getAdminPreferences, saveAdminPreferences, supabase } from '../../utils/db'; // Import helpers

const Settings = () => {
    const notify = useToast();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);

    // Profile State
    const [profile, setProfile] = useState({
        name: '', email: '', phone: '', role: '', signature: null
    });
    const [uploading, setUploading] = useState(false);

    // Preferences State
    const [preferences, setPreferences] = useState({
        emailNotifications: true, smsAlerts: false, newsletter: true, notifyTeachers: true
    });

    // Password State
    const [security, setSecurity] = useState({
        current: '', newPass: '', confirmPass: ''
    });

    // Session Switch State
    const [showSessionModal, setShowSessionModal] = useState(false);
    const [newSessionName, setNewSessionName] = useState('');

    useEffect(() => {
        const loadSettings = async () => {
            setLoading(true);
            const prof = await getAdminProfile();
            const prefs = await getAdminPreferences();
            setProfile(prof);
            setPreferences(prefs);
            setLoading(false);
        };
        loadSettings();
    }, []);

    const handleSaveProfile = async () => {
        await saveAdminProfile(profile);
        notify.success("Profile & Signature updated successfully!");
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileName = `signature-${Date.now()}.png`;
            const { data, error } = await supabase.storage
                .from('payment-proofs') // Reusing existing bucket or create 'signatures'
                .upload(fileName, file);

            if (error) throw error;

            // Get Public URL
            const { data: publicData } = supabase.storage
                .from('payment-proofs')
                .getPublicUrl(fileName);

            setProfile({ ...profile, signature: publicData.publicUrl });
            notify.success("Signature uploaded!");
        } catch (error) {
            console.error("Upload Error:", error);
            notify.error("Failed to upload signature");
        } finally {
            setUploading(false);
        }
    };

    const handleSavePreferences = async (key) => {
        const newPrefs = { ...preferences, [key]: !preferences[key] };
        setPreferences(newPrefs);
        await saveAdminPreferences(newPrefs);
        notify.success("Preference saved.");
    };

    const handleUpdatePassword = () => {
        if (!security.current || !security.newPass || !security.confirmPass) {
            return notify.error("Please fill all password fields.");
        }
        if (security.newPass !== security.confirmPass) {
            return notify.error("New passwords do not match.");
        }
        if (security.newPass.length < 6) {
            return notify.error("Password must be at least 6 characters.");
        }

        // Mock API Call
        setTimeout(() => {
            notify.success("Password updated successfully!");
            setSecurity({ current: '', newPass: '', confirmPass: '' });
        }, 500);
    };

    const handleSwitchSession = async () => {
        if (!newSessionName) return notify.error("Please enter a name for the current session (e.g. 2024/2025) to archive it.");

        const success = await startNewSession(newSessionName);
        if (success) {
            notify.success("Session switched successfully! Data archived.");
            setShowSessionModal(false);
            window.location.reload();
        }
    };

    return (
        <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">

            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-schoolGreen">Settings</h1>
                    <p className="text-gray-500 mt-1">Manage your profile and preferences.</p>
                </div>
                <button
                    onClick={() => setShowSessionModal(true)}
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center border border-red-100 hover:bg-red-100 transition"
                >
                    <RefreshCw size={14} className="mr-2" /> Switch Session
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-8">

                {/* SIDEBAR TABS */}
                <div className="w-full md:w-64 flex flex-col gap-2">
                    <SettingsTab label="Profile" icon={<User size={18} />} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                    <SettingsTab label="Notifications" icon={<Bell size={18} />} active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
                    <SettingsTab label="Security" icon={<Lock size={18} />} active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
                    <SettingsTab label="Appearance" icon={<Moon size={18} />} active={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')} />
                </div>

                {/* CONTENT AREA */}
                <div className="flex-1 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm relative">

                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-4">Personal Information</h2>

                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-24 h-24 rounded-full bg-schoolGreen text-white flex items-center justify-center text-3xl font-serif font-bold">
                                    {profile.name.charAt(0)}
                                </div>
                                <div>
                                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold uppercase cursor-not-allowed opacity-60">Change Avatar</button>
                                    <p className="text-xs text-gray-400 mt-2">Coming Soon</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormInput label="Full Name" value={profile.name} onChange={(val) => setProfile({ ...profile, name: val })} />
                                <FormInput label="Email Address" value={profile.email} onChange={(val) => setProfile({ ...profile, email: val })} />
                                <FormInput label="Phone Number" value={profile.phone} onChange={(val) => setProfile({ ...profile, phone: val })} />
                                <FormInput label="Role" value={profile.role} disabled />
                                <FormInput label="Role" value={profile.role} disabled />
                            </div>

                            {/* SIGNATURE UPLOAD */}
                            <div className="border-t border-gray-100 pt-6 mt-2">
                                <h3 className="text-sm font-bold text-gray-700 mb-4">Principal's Signature</h3>
                                <div className="flex items-center gap-6">
                                    <div className="w-40 h-20 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 relative overflow-hidden group">
                                        {profile.signature ? (
                                            <img src={profile.signature} alt="Signature" className="w-full h-full object-contain" />
                                        ) : (
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">No Signature</p>
                                        )}
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                            <label htmlFor="sig-upload" className="text-white text-xs font-bold cursor-pointer underline">Change</label>
                                        </div>
                                    </div>
                                    <div>
                                        <input
                                            type="file"
                                            id="sig-upload"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileUpload}
                                        />
                                        <label
                                            htmlFor="sig-upload"
                                            className={`bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-gray-50 cursor-pointer transition ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                                        >
                                            {uploading ? 'Uploading...' : 'Upload Signature Image'}
                                        </label>
                                        <p className="text-[10px] text-gray-400 mt-2">Recommended: PNG with transparent background.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button onClick={handleSaveProfile} className="bg-schoolGreen text-white px-8 py-3 rounded-xl font-bold flex items-center shadow-lg hover:bg-schoolGold transition">
                                    <Save size={18} className="mr-2" /> Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-4">Preferences</h2>
                            <div className="space-y-4">
                                <Toggle
                                    label="Email Notifications"
                                    desc="Receive updates on assignments and results via email."
                                    checked={preferences.emailNotifications}
                                    onChange={() => handleSavePreferences('emailNotifications')}
                                />
                                <Toggle
                                    label="SMS Alerts"
                                    desc="Get urgent school announcements on your phone."
                                    checked={preferences.smsAlerts}
                                    onChange={() => handleSavePreferences('smsAlerts')}
                                />
                                <Toggle
                                    label="Newsletter"
                                    desc="Weekly digest of school activities."
                                    checked={preferences.newsletter}
                                    onChange={() => handleSavePreferences('newsletter')}
                                />
                                <div className="border-t border-gray-100 my-4 pt-4">
                                    <Toggle
                                        label="Notify Class Teachers on Payment"
                                        desc="When a student pays, send a notification to their class teacher."
                                        checked={preferences.notifyTeachers}
                                        onChange={() => handleSavePreferences('notifyTeachers')}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-4">Password & Security</h2>
                            <div className="space-y-4 max-w-md">
                                <FormInput
                                    label="Current Password" type="password"
                                    value={security.current}
                                    onChange={(val) => setSecurity({ ...security, current: val })}
                                />
                                <FormInput
                                    label="New Password" type="password"
                                    value={security.newPass}
                                    onChange={(val) => setSecurity({ ...security, newPass: val })}
                                />
                                <FormInput
                                    label="Confirm New Password" type="password"
                                    value={security.confirmPass}
                                    onChange={(val) => setSecurity({ ...security, confirmPass: val })}
                                />
                                <button onClick={handleUpdatePassword} className="bg-schoolGreen text-white px-6 py-3 rounded-xl font-bold text-sm shadow mt-2">Update Password</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'appearance' && (
                        <div className="text-center py-10">
                            <Moon size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-bold text-gray-600">Dark Mode Coming Soon</h3>
                            <p className="text-gray-400 text-sm">We are working on a easier-on-the-eyes theme.</p>
                        </div>
                    )}

                </div>
            </div>

            {/* SESSION SWITCH MODAL */}
            {showSessionModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full animate-in zoom-in duration-300">
                        <div className="flex items-center text-red-600 mb-4">
                            <AlertTriangle size={32} className="mr-3" />
                            <h2 className="text-2xl font-bold">Switch Session?</h2>
                        </div>
                        <p className="text-gray-600 mb-6">
                            This action will <strong>ARCHIVE</strong> all current term data (Results, Payments, Attendance) and start a fresh session.
                            <br /><br />
                            Students will be automatically promoted (e.g. JSS1 to JSS2).
                        </p>

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Name of Session to Archive</label>
                            <input
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-xl focus:border-red-500 outline-none"
                                placeholder="e.g. 2024/2025 Session"
                                value={newSessionName}
                                onChange={(e) => setNewSessionName(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setShowSessionModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition">Cancel</button>
                            <button onClick={handleSwitchSession} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition shadow-lg">Confirm Switch</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

// --- HELPERS ---

const SettingsTab = ({ label, icon, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all font-bold text-sm ${active ? 'bg-schoolGreen text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
            }`}
    >
        {icon} {label}
    </button>
);

const FormInput = ({ label, value, type = "text", disabled = false, onChange }) => (
    <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>
        <input
            type={type}
            value={value} // Controlled
            disabled={disabled}
            onChange={onChange ? (e) => onChange(e.target.value) : undefined}
            className={`w-full p-3 rounded-xl border outline-none focus:border-schoolGreen ${disabled ? 'bg-gray-100 text-gray-500 border-transparent' : 'bg-gray-50 border-gray-200'}`}
        />
    </div>
);

const Toggle = ({ label, desc, checked = false, onChange }) => (
    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition" onClick={onChange}>
        <div>
            <h3 className="font-bold text-gray-800">{label}</h3>
            <p className="text-xs text-gray-400">{desc}</p>
        </div>
        <div className={`w-12 h-6 rounded-full relative transition-colors ${checked ? 'bg-schoolGreen' : 'bg-gray-200'}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${checked ? 'left-7' : 'left-1'}`}></div>
        </div>
    </div>
);

export default Settings;
