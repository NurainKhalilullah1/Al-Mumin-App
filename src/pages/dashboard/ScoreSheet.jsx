// src/pages/dashboard/ScoreSheet.jsx
import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
// ... imports
import { saveScore, getSubjects } from '../../utils/db'; // Import getSubjects

const ScoreSheet = () => {
  // --- CONFIGURATION ---
  const CLASSES = ["JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"];

  // FETCH FROM DB
  const allSubjects = getSubjects();
  const SUBJECTS = {
    junior: allSubjects.filter(s => s.type === 'Junior').map(s => s.name),
    senior: allSubjects.filter(s => s.type === 'Senior').map(s => s.name)
  };

  const MOCK_STUDENTS = [
    { id: 'AMS/2024/005', name: 'Abdullahi Musa' },
    { id: 'AMS/2024/006', name: 'Fatima Yusuf' },
    { id: 'AMS/2024/007', name: 'Ibrahim Sadiq' },
  ];

  // --- STATE ---
  const [activeTerm, setActiveTerm] = useState('First Term');
  const [activeClass, setActiveClass] = useState('JSS 1');
  // Initialize with first available subject, safe check
  const [activeSubject, setActiveSubject] = useState(SUBJECTS.junior[0] || "Mathematics");
  const [inputs, setInputs] = useState({});

  // Smart Subject Switcher
  const isJunior = activeClass.startsWith("JSS");
  const currentSubjects = isJunior ? SUBJECTS.junior : SUBJECTS.senior;

  // Reset subject if class type changes (e.g. JSS to SS)
  useEffect(() => {
    setActiveSubject(currentSubjects[0] || "");
  }, [isJunior]);

  const handleInputChange = (studentId, field, value) => {
    setInputs(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value }
    }));
  };

  const handleSaveAll = () => {
    MOCK_STUDENTS.forEach(student => {
      const data = inputs[student.id];
      if (data) {
        saveScore(
          student.id, activeTerm, activeSubject,
          data.test1, data.test2, data.midTerm, data.exam
        );
      }
    });
    alert(`Saved ${activeSubject} scores for ${activeClass}`);
  };

  return (
    <div className="animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-schoolGreen">Input Scores</h1>
            <p className="text-gray-500 text-sm">Select Class & Subject to load sheet.</p>
          </div>
          <button onClick={handleSaveAll} className="flex items-center bg-schoolGreen text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-schoolGold transition">
            <Save size={18} className="mr-2" /> Save Sheet
          </button>
        </div>

        {/* FILTERS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Class</label>
            <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold text-sm"
              value={activeClass} onChange={(e) => setActiveClass(e.target.value)}>
              {CLASSES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Subject</label>
            <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold text-sm"
              value={activeSubject} onChange={(e) => setActiveSubject(e.target.value)}>
              {currentSubjects.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Term</label>
            <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold text-sm"
              value={activeTerm} onChange={(e) => setActiveTerm(e.target.value)}>
              <option>First Term</option>
              <option>Second Term</option>
              <option>Third Term</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-schoolGreen text-white text-xs uppercase">
              <th className="p-4 w-1/4 sticky left-0 bg-schoolGreen z-10">Student Name</th>
              <th className="p-4 text-center">Test 1 (10)</th>
              <th className="p-4 text-center">Test 2 (10)</th>
              <th className="p-4 text-center">Mid-Term (20)</th>
              <th className="p-4 text-center">Exam (60)</th>
              <th className="p-4 text-center">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {MOCK_STUDENTS.map((student) => {
              const sData = inputs[student.id] || {};
              const total = (parseInt(sData.test1) || 0) + (parseInt(sData.test2) || 0) + (parseInt(sData.midTerm) || 0) + (parseInt(sData.exam) || 0);

              return (
                <tr key={student.id} className="hover:bg-gray-50 transition group">
                  <td className="p-4 sticky left-0 bg-white group-hover:bg-gray-50 z-10 border-r border-gray-100">
                    <p className="font-bold text-gray-800 text-sm">{student.name}</p>
                    <p className="text-xs text-gray-400">{student.id}</p>
                  </td>
                  <td className="p-2 text-center"><input type="number" className="w-16 p-2 text-center border border-gray-200 rounded-lg outline-none focus:border-schoolGreen" placeholder="-" onChange={(e) => handleInputChange(student.id, 'test1', e.target.value)} /></td>
                  <td className="p-2 text-center"><input type="number" className="w-16 p-2 text-center border border-gray-200 rounded-lg outline-none focus:border-schoolGreen" placeholder="-" onChange={(e) => handleInputChange(student.id, 'test2', e.target.value)} /></td>
                  <td className="p-2 text-center"><input type="number" className="w-16 p-2 text-center border border-gray-200 rounded-lg outline-none focus:border-schoolGreen bg-blue-50/30" placeholder="-" onChange={(e) => handleInputChange(student.id, 'midTerm', e.target.value)} /></td>
                  <td className="p-2 text-center"><input type="number" className="w-16 p-2 text-center border border-gray-200 rounded-lg outline-none focus:border-schoolGreen bg-yellow-50/30" placeholder="-" onChange={(e) => handleInputChange(student.id, 'exam', e.target.value)} /></td>
                  <td className="p-4 text-center"><span className={`font-bold block py-1 px-3 rounded-lg ${total >= 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{total}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScoreSheet;