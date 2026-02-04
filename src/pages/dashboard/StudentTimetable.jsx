import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { getTodaysClasses } from '../../utils/db'; // We can reuse logic or fetch full week

const StudentTimetable = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    // Mock Full Schedule (In real app, fetch from DB)
    const fullSchedule = {
        Monday: [
            { subject: 'Mathematics', time: '08:00 AM - 09:30 AM', teacher: 'Mrs. Amina', room: 'Hall A' },
            { subject: 'English', time: '10:00 AM - 11:30 AM', teacher: 'Mr. Wale', room: 'Class 2A' },
            { subject: 'Islamic Studies', time: '12:00 PM - 01:00 PM', teacher: 'Ustadh Ali', room: 'Mosque' },
        ],
        Tuesday: [
            { subject: 'Basic Science', time: '08:00 AM - 09:30 AM', teacher: 'Mr. Okon', room: 'Lab 1' },
        ],
        Wednesday: [
            { subject: 'Mathematics', time: '08:00 AM - 09:30 AM', teacher: 'Mrs. Amina', room: 'Hall A' },
            { subject: 'P.H.E', time: '10:00 AM - 11:00 AM', teacher: 'Coach Ibrahim', room: 'Field' },
        ],
        Thursday: [
            { subject: 'Social Studies', time: '08:00 AM - 09:30 AM', teacher: 'Mrs. Kuti', room: 'Class 2A' },
            { subject: 'Civic Education', time: '10:00 AM - 11:00 AM', teacher: 'Mr. Lawal', room: 'Class 2A' },
        ],
        Friday: [
            { subject: 'Review', time: '09:00 AM - 10:30 AM', teacher: 'Class Teacher', room: 'Class 2A' },
            { subject: 'Jumat', time: '01:30 PM', teacher: 'Imam', room: 'Mosque' },
        ]
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-schoolGreen">Weekly Timetable</h1>
                <p className="text-gray-500 mt-1">Class JSS 2A - 2025/2026 Session</p>
            </div>

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
                            {fullSchedule[day].map((slot, idx) => (
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
                                    </div>
                                </div>
                            ))}
                            {fullSchedule[day].length === 0 && (
                                <div className="text-center py-10 text-gray-300 text-xs italic">Free Day</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentTimetable;
