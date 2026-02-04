import React, { useState, useEffect } from 'react';
import { GraduationCap, User } from 'lucide-react';
import { getClasses } from '../../utils/db';

const StaffClasses = () => {
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        setClasses(getClasses());
    }, []);

    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-schoolGreen">School Classes</h1>
                <p className="text-gray-500 mt-1">Overview of all class arms in the school.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((cls) => (
                    <div key={cls.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-green-50 text-schoolGreen rounded-xl flex items-center justify-center">
                                <GraduationCap size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl text-gray-800">{cls.name}</h3>
                                <span className="text-xs font-bold uppercase bg-gray-100 px-2 py-1 rounded text-gray-500">{cls.level}</span>
                            </div>
                        </div>
                        <div className="border-t border-gray-100 pt-4 flex items-center gap-2 text-gray-600">
                            <User size={16} />
                            <span className="text-sm font-bold">{cls.formTeacher || 'No Teacher Assigned'}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StaffClasses;
