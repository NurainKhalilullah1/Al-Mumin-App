import React, { useState, useEffect } from 'react';
import { BookOpen, User } from 'lucide-react';
import { getSubjects } from '../../utils/db';

const StaffSubjects = () => {
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getSubjects();
                setSubjects(data || []);
            } catch (error) {
                console.error("Failed to load subjects:", error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-schoolGreen">School Subjects</h1>
                <p className="text-gray-500 mt-1">Directory of subjects and departments.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((sub) => (
                    <div key={sub.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800 leading-tight">{sub.name}</h3>
                                <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-700 px-2 py-1 rounded mt-1 inline-block">{sub.department}</span>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-4 mt-2 flex items-center gap-2 text-gray-500">
                            <User size={14} />
                            <p className="text-sm font-bold">{sub.teacher || 'Unassigned'}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StaffSubjects;
