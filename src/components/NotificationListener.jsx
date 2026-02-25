import React, { useEffect } from 'react';
import { supabase } from '../utils/db';
import { useToast } from './ToastProvider';

const NotificationListener = () => {
    const toast = useToast();

    useEffect(() => {
        // Check if an active user is logged in
        const userStr = localStorage.getItem('currentUser');
        if (!userStr) return;

        const user = JSON.parse(userStr);

        // Set up Realtime listener for the 'notifications' table
        // We listen for any new INSERT events on the notifications table
        const subscription = supabase
            .channel('public:notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, payload => {
                const newNotif = payload.new;

                // If the notification is targeted at this user
                if (newNotif.user_id === user.id) {
                    toast.info(newNotif.message);
                }
            })
            .subscribe();

        // Listener for 'notices' (Global School Notices)
        const noticeSub = supabase
            .channel('public:notices')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notices' }, payload => {
                const newNotice = payload.new;

                // Let's show global active notices to relevant audiences
                if (newNotice.active) {
                    const role = localStorage.getItem('userRole'); // 'student', 'teacher', 'admin'
                    if (
                        newNotice.audience === 'All' ||
                        newNotice.audience === 'Public' ||
                        (newNotice.audience === 'Student' && role === 'student') ||
                        (newNotice.audience === 'Staff' && (role === 'teacher' || role === 'admin'))
                    ) {
                        toast.info(`🔔 New Notice: ${newNotice.message}`);
                    }
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
            supabase.removeChannel(noticeSub);
        };
    }, [toast]);

    return null; // This component doesn't render anything visible
};

export default NotificationListener;
