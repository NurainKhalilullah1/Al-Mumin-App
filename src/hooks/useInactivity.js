import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';

const useInactivity = (timeout = 300000) => { // 5 minutes = 300000ms
    const timerRef = useRef(null);
    const navigate = useNavigate();
    const notify = useToast();

    const resetTimer = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(handleLogout, timeout);
    };

    const handleLogout = () => {
        const userRole = localStorage.getItem('userRole');
        if (userRole) {
            localStorage.removeItem('userRole');
            localStorage.removeItem('currentUser');
            notify.error("Session expired due to inactivity.");
            navigate('/404'); // User requested 404 page specifically
        }
    };

    useEffect(() => {
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

        // Set initial timer
        resetTimer();

        // Add listeners
        events.forEach(event => window.addEventListener(event, resetTimer));

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, [navigate]);

    return null;
};

export default useInactivity;
