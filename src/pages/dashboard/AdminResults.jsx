import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle, AlertTriangle, ArrowLeft, Download, FileText } from 'lucide-react';
import { useToast } from '../../components/ToastProvider';
import { getClasses, getStudentsByClass, getSubjects } from '../../utils/db';

const AdminResults = () => {
    const notify = useToast();
    const [viewMode, setViewMode] = useState('overview'); // 'overview' | 'class-detail'
    const [selectedClass, setSelectedClass] = useState(null);
    const [classes, setClasses] = useState([]);

    // Data for Spreadsheet
    const [classResults, setClassResults] = useState([]);
    const [classSubjects, setClassSubjects] = useState([]); // Store subjects for the selected class

    const [selectedTerm, setSelectedTerm] = useState('First Term');

    useEffect(() => {
        setClasses(getClasses());
    }, []);

    // Effect to refresh results when Class or Term changes
    useEffect(() => {
        if (!selectedClass) return;
        generateResults();
    }, [selectedClass, selectedTerm]);

    const generateResults = () => {
        if (!selectedClass) return;

        // 1. Determine Class Level (Junior vs Senior)
        const isSenior = selectedClass.name.startsWith('SS');
        const levelType = isSenior ? 'Senior' : 'Junior';

        // 2. Fetch & Filter Subjects
        const allSubjects = getSubjects();
        const filteredSubjects = allSubjects.filter(s => s.type === levelType);
        setClassSubjects(filteredSubjects);

        // 3. Fetch Students & Generate Mock Scores for these subjects
        const students = getStudentsByClass(selectedClass.name);

        const mockRows = students.map(s => {
            const studentRow = {
                id: s.id,
                name: s.name,
                scores: {}
            };

            let totalScore = 0;

            filteredSubjects.forEach(sub => {
                // Generate random score between 40 and 100
                // Slight randomization based on term to show difference
                const baseRandom = selectedTerm === 'First Term' ? 0.6 : selectedTerm === 'Second Term' ? 0.4 : 0.8;
                const score = Math.floor(Math.random() * 60) + 40;
                studentRow.scores[sub.name] = score; // Key by subject name
                totalScore += score;
            });

            // Calculate Average
            const avg = filteredSubjects.length > 0 ? totalScore / filteredSubjects.length : 0;

            return {
                ...studentRow,
                avg: parseFloat(avg.toFixed(1))
            };
        });

        // 4. Sort by Average (Position)
        mockRows.sort((a, b) => b.avg - a.avg);

        setClassResults(mockRows);
    };

    const handleClassClick = (cls) => {
        setSelectedClass(cls);
        setViewMode('class-detail');
        // generateResults() will be called by the useEffect
    };

    const handleExport = () => {
        if (!selectedClass || classResults.length === 0) return;

        // 1. Create Headers
        const subjectHeaders = classSubjects.map(s => s.name);
        const headers = ['Student Name', ...subjectHeaders, 'Average', 'Position', 'Status'];

        // 2. Create Rows
        const csvRows = [
            headers.join(','), // Header Row
            ...classResults.map((row, index) => {
                const scores = classSubjects.map(sub => row.scores[sub.name] || 0);
                const status = row.avg >= 50 ? 'Passed' : 'Failed';
                return [
                    `"${row.name}"`, // Quote name in case of commas
                    ...scores,
                    row.avg,
                    index + 1,
                    status
                ].join(',');
            })
        ];

        // 3. Generate Blob & Download
        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${selectedClass.name}_Results_${selectedTerm.replace(' ', '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        notify.success(`Exported ${selectedTerm} results successfully!`);
    };

    return (
        <div className="animate-in fade-in duration-500">

            {/* OVERVIEW MODE */}
            {viewMode === 'overview' && (
                <>
                    <div className="mb-8">
                        <h1 className="text-3xl font-serif font-bold text-schoolGreen">Result Master Sheet</h1>
                        <p className="text-gray-500 mt-1">Select a class to view the full result spreadsheet.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classes.map((cls) => (
                            <div
                                key={cls.id}
                                onClick={() => handleClassClick(cls)}
                                className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-schoolGreen/20 hover:border-schoolGreen transition cursor-pointer group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-green-50 text-schoolGreen rounded-xl flex items-center justify-center group-hover:bg-schoolGreen group-hover:text-white transition">
                                        <FileText size={24} />
                                    </div>
                                    <span className="text-xs font-bold uppercase bg-gray-100 px-2 py-1 rounded text-gray-500">{cls.level || 'General'}</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-1">{cls.name}</h3>
                                <p className="text-sm text-gray-400 font-bold">{cls.formTeacher || 'No Form Teacher'}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* CLASS DETAIL MODE (SPREADSHEET) */}
            {viewMode === 'class-detail' && selectedClass && (
                <div className="animate-in slide-in-from-right duration-300">
                    <button
                        onClick={() => setViewMode('overview')}
                        className="flex items-center text-gray-500 hover:text-schoolGreen font-bold mb-6 transition"
                    >
                        <ArrowLeft size={18} className="mr-2" /> Back to Classes
                    </button>

                    <div className="flex flex-col md:flex-row justify-between items-end mb-6">
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-schoolGreen">{selectedClass.name} Results</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-gray-500">Broad sheet for: </p>
                                <select
                                    value={selectedTerm}
                                    onChange={(e) => setSelectedTerm(e.target.value)}
                                    className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-sm font-bold text-schoolGreen focus:outline-none focus:ring-2 focus:ring-schoolGreen/20"
                                >
                                    <option>First Term</option>
                                    <option>Second Term</option>
                                    <option>Third Term</option>
                                </select>
                                <span className="text-gray-400">2025/2026 Session</span>
                            </div>
                        </div>
                        <button
                            onClick={handleExport}
                            className="bg-schoolGreen text-white px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide shadow hover:bg-schoolGold transition flex items-center"
                        >
                            <Download size={16} className="mr-2" /> Export {selectedTerm} (CSV)
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-600 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 sticky left-0 bg-gray-50 z-10 border-r border-gray-200">Student Name</th>
                                    {classSubjects.map(sub => (
                                        <th key={sub.id} className="p-4 text-center border-r border-gray-100 min-w-[100px]">{sub.name}</th>
                                    ))}
                                    <th className="p-4 text-center bg-blue-50 text-blue-700 border-r border-gray-200">Average</th>
                                    <th className="p-4 text-center text-gray-700 border-r border-gray-200">Position</th>
                                    <th className="p-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {classResults.map((res, i) => (
                                    <tr key={res.id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 font-bold text-gray-800 sticky left-0 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-gray-100">{res.name}</td>

                                        {classSubjects.map(sub => (
                                            <td key={sub.id} className="p-4 text-center text-gray-600 border-r border-gray-50">
                                                {res.scores[sub.name] || '-'}
                                            </td>
                                        ))}

                                        <td className="p-4 text-center font-bold text-blue-700 bg-blue-50/50 border-r border-blue-100">{res.avg}%</td>
                                        <td className="p-4 text-center font-bold border-r border-gray-100">{i + 1}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${res.avg >= 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {res.avg >= 50 ? 'Passed' : 'Failed'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {classResults.length === 0 && (
                                    <tr>
                                        <td colSpan={classSubjects.length + 4} className="p-8 text-center text-gray-400 italic">No students found in this class yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminResults;
