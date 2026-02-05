import React, { useState, useEffect } from 'react';
import { Megaphone, Calendar } from 'lucide-react';
import { getNotices } from '../../utils/db'; // Will fetch all then filter

const NoticeBoard = () => {
    const [notices, setNotices] = useState([]);

    // In a real app, filter by user role (Staff vs Student)
    // For demo, we show everything relevant to "All" or their Role
    const userRole = localStorage.getItem('userRole') || 'student';

    useEffect(() => {
        const fetchNotices = async () => {
            const allNotices = await getNotices();
            // Simple Filter Logic
            const filtered = (allNotices || []).filter(n => n.active && (
                n.audience === 'Public' ||
                n.audience === 'All' ||
                (userRole === 'teacher' && n.audience === 'Staff') ||
                (userRole === 'student' && n.audience === 'Student')
            ));
            setNotices(filtered);
        };
        fetchNotices();
    }, [userRole]);

    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-schoolGreen">School Bulletins</h1>
                <p className="text-gray-500 mt-1 uppercase text-xs font-bold tracking-widest">Stay Updated</p>
            </div>

            <div className="space-y-4">
                {notices.map((n) => (
                    <div key={n.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-6 hover:shadow-md transition">
                        <div className="hidden md:flex flex-col items-center justify-center w-20 bg-green-50 text-schoolGreen rounded-xl shrink-0">
                            <Calendar size={24} className="mb-1" />
                            <span className="text-[10px] font-bold uppercase">Recent</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{n.message}</h3>
                            <div className="flex gap-2">
                                <span className="text-[10px] uppercase font-bold bg-schoolGold text-white px-2 py-0.5 rounded">{n.audience}</span>
                                <span className="text-[10px] font-bold text-gray-400 flex items-center"><Megaphone size={10} className="mr-1" /> Official Announcement</span>
                            </div>
                        </div>
                    </div>
                ))}

                {notices.length === 0 && (
                    <div className="text-center py-20 text-gray-400">
                        <p>No new announcements at this time.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NoticeBoard;
