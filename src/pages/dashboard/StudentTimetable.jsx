import React, { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';
import { getClassTimetable, getStudentSubjects } from '../../utils/db';
import { supabase } from '../../supabaseClient';

const StudentTimetable = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const [schedule, setSchedule] = useState({});
    const [loading, setLoading] = useState(true);
    const [studentClass, setStudentClass] = useState('Loading...');
    const [sessionTerm, setSessionTerm] = useState('2025/2026 Session');

    useEffect(() => {
        const fetchTimetable = async () => {
            const userStr = localStorage.getItem('currentUser');
            if (!userStr) return;
            const user = JSON.parse(userStr);

            try {
                // 1. Get Fresh Student Details (to ensure we have class_id)
                const { data: student, error } = await supabase
                    .from('students')
                    .select('*, classes(id, name)')
                    .eq('id', user.id)
                    .single();

                if (error || !student) {
                    // Fallback to local storage if DB fetch fails
                    console.warn("Could not fetch fresh student profile, trying local data");
                }

                const classId = student?.classes?.id || user.current_class_id;
                const className = student?.classes?.name || user.classLevel || "Unassigned";
                setStudentClass(className);

                if (classId) {
                    const data = await getClassTimetable(classId);

                    // Transform flat DB rows to Grouped Object
                    const grouped = {
                        Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: []
                    };

                    // Initialize all days to empty array first (already done above)

                    if (data && data.length > 0) {
                        data.forEach(item => {
                            if (grouped[item.day]) {
                                grouped[item.day].push({
                                    subject: item.subject,
                                    time: `${item.start_time} - ${item.end_time}`,
                                    teacher: item.teacher || 'Unassigned',
                                    room: item.room || 'Classroom'
                                });
                            }
                        });

                        // Sort by start time if possible (simple string sort might work for 08:00 vs 10:00)
                        Object.keys(grouped).forEach(day => {
                            grouped[day].sort((a, b) => a.time.localeCompare(b.time));
                        });
                    }
                    setSchedule(grouped);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTimetable();
    }, []);

    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-serif font-bold text-schoolGreen">Weekly Timetable</h1>
                <p className="text-gray-500 mt-1 text-sm md:text-base">Class {studentClass} - {sessionTerm}</p>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-400">Loading schedule...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {days.map((day) => (
                        <div key={day} className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition">
                            <div className={`p-4 font-bold text-center uppercase tracking-widest text-xs text-white ${day === new Date().toLocaleDateString('en-US', { weekday: 'long' })
                                ? 'bg-schoolGold'
                                : 'bg-schoolGreen'
                                }`}>
                                {day}
                            </div>

                            <div className="p-4 space-y-4 flex-1">
                                {schedule[day] && schedule[day].length > 0 ? (
                                    schedule[day].map((slot, idx) => (
                                        <div key={idx} className="bg-gray-50 p-3 rounded-xl border border-gray-100 relative group hover:border-schoolGreen transition">
                                            <div className="absolute left-0 top-3 bottom-3 w-1 bg-gray-200 rounded-r-lg group-hover:bg-schoolGreen transition"></div>
                                            <div className="pl-3">
                                                <h4 className="font-bold text-gray-800 text-sm mb-1">{slot.subject}</h4>
                                                <div className="flex items-center text-[10px] text-gray-500 font-bold uppercase mb-1">
                                                    <Clock size={10} className="mr-1" /> {slot.time}
                                                </div>
                                                <div className="flex items-center text-[10px] text-gray-400">
                                                    <MapPin size={10} className="mr-1" /> {slot.room}
                                                </div>
                                                {slot.teacher && slot.teacher !== 'Unassigned' && (
                                                    <div className="text-[9px] text-schoolGreen font-bold mt-1 truncate">
                                                        {slot.teacher}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-gray-300 text-xs italic">
                                        No classes scheduled
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentTimetable;
