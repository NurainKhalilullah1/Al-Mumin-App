import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Megaphone, CheckCircle, XCircle } from 'lucide-react';
import { getNotices, saveNotice, deleteNotice } from '../../utils/db';
import { useToast } from '../../components/ToastProvider';

const AdminNotices = () => {
    const notify = useToast();
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ id: null, message: '', audience: 'Public', showOnTicker: true, active: true });

    useEffect(() => {
        loadNotices();
    }, []);

    const loadNotices = async () => {
        setLoading(true);
        const data = await getNotices();
        setNotices(data);
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.message) return notify.error("Message is required");
        await saveNotice(formData);
        loadNotices();
        setShowModal(false);
        setFormData({ id: null, message: '', audience: 'Public', showOnTicker: true, active: true });
        notify.success("Notice published!");
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this notice?")) {
            await deleteNotice(id);
            loadNotices();
            notify.success("Notice deleted");
        }
    };

    const toggleStatus = async (notice) => {
        await saveNotice({ ...notice, active: !notice.active });
        loadNotices();
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-schoolGreen">Notice Board</h1>
                    <p className="text-gray-500 mt-1">Broadcast messages to the website ticker or dashboards.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-schoolGreen text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center shadow-lg hover:bg-schoolGold transition"
                >
                    <Plus size={18} className="mr-2" /> New Notice
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {notices.map((n) => (
                    <div key={n.id} className={`bg-white p-6 rounded-2xl border shadow-sm relative group transition ${n.active ? 'border-l-4 border-l-schoolGreen' : 'border-l-4 border-l-gray-300 opacity-60'}`}>
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button onClick={() => toggleStatus(n)} className="text-gray-400 hover:text-schoolGreen" title="Toggle Active">
                                {n.active ? <CheckCircle size={18} /> : <XCircle size={18} />}
                            </button>
                            <button onClick={() => handleDelete(n.id)} className="text-gray-400 hover:text-red-500" title="Delete">
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div className="flex items-start gap-4 pr-16">
                            <div className="bg-orange-50 text-orange-600 p-3 rounded-xl">
                                <Megaphone size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg mb-1 leading-snug">{n.message}</h3>
                                <div className="flex gap-2 mt-2">
                                    <span className="text-[10px] uppercase font-bold bg-gray-100 px-2 py-1 rounded text-gray-500">{n.audience}</span>
                                    {n.showOnTicker && <span className="text-[10px] uppercase font-bold bg-green-100 text-green-700 px-2 py-1 rounded">On Ticker</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative animate-in zoom-in-95">
                        <h2 className="text-2xl font-bold text-schoolGreen mb-6">Post New Notice</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Message</label>
                                <textarea required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-schoolGreen min-h-[100px]" value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} placeholder="Type your announcement..."></textarea>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Audience</label>
                                <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" value={formData.audience} onChange={e => setFormData({ ...formData, audience: e.target.value })}>
                                    <option value="Public">Public (Everyone)</option>
                                    <option value="Staff">Staff Only</option>
                                    <option value="Student">Students Only</option>
                                    <option value="All">All Internals</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                                <input type="checkbox" checked={formData.showOnTicker} onChange={e => setFormData({ ...formData, showOnTicker: e.target.checked })} className="w-5 h-5 text-schoolGreen rounded" />
                                <label className="text-sm font-bold text-gray-700">Display on Website Ticker?</label>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl">Cancel</button>
                                <button type="submit" className="flex-1 bg-schoolGreen text-white py-3 rounded-xl font-bold shadow-lg hover:bg-schoolGold transition">Post Notice</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminNotices;
