// src/pages/dashboard/ScoreSheet.jsx
import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
// ... imports
import { saveScore, getSubjects, getStudentsByClass, getClasses, getStaffByEmail, getScoresByContext, savePsychomotor, getPsychomotor } from '../../utils/db'; // Import helpers

const ScoreSheet = () => {
  // --- STATE ---
  const [activeTerm, setActiveTerm] = useState('First Term');
  const [activeClass, setActiveClass] = useState('');
  const [availableClasses, setAvailableClasses] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const [isAssigned, setIsAssigned] = useState(false);

  // Psychomotor State
  const [editingStudent, setEditingStudent] = useState(null);
  const [psychomotorScores, setPsychomotorScores] = useState({
    punctuality: 5, neatness: 5, politeness: 5, honesty: 5, leadership: 5
  });

  // 1. Initial Load: Classes & Subjects
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      // Fetch Subjects
      const subjectsData = await getSubjects();
      setAllSubjects(subjectsData || []);

      // Fetch Classes
      const classesData = await getClasses();
      setAvailableClasses(classesData);

      // Handle Staff Assignment
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        const profile = await getStaffByEmail(user.email);

        if (profile?.assignedClass) {
          setActiveClass(profile.assignedClass);
          setIsAssigned(true);
        } else if (classesData.length > 0) {
          // Default to first class if not assigned
          setActiveClass(classesData[0].name);
        }
      } else if (classesData.length > 0) {
        setActiveClass(classesData[0].name);
      }
      setLoading(false);
    };
    init();
  }, []);

  // 2. Fetch Students when Class Changes
  useEffect(() => {
    if (!activeClass) return;
    const fetchStudents = async () => {
      const data = await getStudentsByClass(activeClass);
      setStudents(data || []);
    };
    fetchStudents();
  }, [activeClass]);

  // Derived Data
  const isJunior = activeClass.startsWith("JSS");
  const juniorSubjects = allSubjects.filter(s => s.type === 'Junior').map(s => s.name);
  const seniorSubjects = allSubjects.filter(s => s.type === 'Senior').map(s => s.name);
  const currentSubjects = isJunior ? juniorSubjects : seniorSubjects;

  // Initialize with first available subject
  const [activeSubject, setActiveSubject] = useState("Mathematics");



  // Reset subject if class type changes (e.g. JSS to SS)
  // Reset subject if class type changes (e.g. JSS to SS) or subjects load
  useEffect(() => {
    setActiveSubject(currentSubjects[0] || "");
  }, [isJunior, allSubjects]);

  // Handle Score Loading on change of Class, Subject, or Term
  useEffect(() => {
    if (!activeClass || !activeSubject || !activeTerm) return;

    const loadExistingScores = async () => {
      const existingScores = await getScoresByContext(activeClass, activeSubject, activeTerm);

      const newInputs = {};
      existingScores.forEach(res => {
        newInputs[res.student_id] = {
          test1: res.test1,
          test2: res.test2,
          midTerm: res.mid_term,
          exam: res.exam,
          total: res.total
        };
      });
      setInputs(newInputs);
    };

    loadExistingScores();
  }, [activeClass, activeSubject, activeTerm]);

  const handleInputChange = (studentId, field, value) => {
    setInputs(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value }
    }));
  };

  const handleSaveAll = () => {
    // Determine Role for Approval Status
    const userStr = localStorage.getItem('currentUser');
    let isStaff = true;
    if (userStr) {
      const user = JSON.parse(userStr);
      // Simple check: active staff might be "admin" too, but usually explicit role check is better.
      // Here we rely on the component usage.
      // However, we can check localStorage 'userRole' which DashboardHome uses.
    }
    const role = localStorage.getItem('userRole');
    const approvalStatus = role === 'admin' ? 'Approved' : 'Pending';

    students.forEach(student => {
      const data = inputs[student.id];
      if (data) {
        saveScore(
          student.id, activeTerm, activeSubject,
          data.test1, data.test2, data.midTerm, data.exam,
          approvalStatus // Pass calculated status
        );
      }
    });
    const msg = role === 'admin' ?
      `Saved & Approved ${activeSubject} scores for ${activeClass}` :
      `Saved ${activeSubject} scores for ${activeClass} (Pending Approval)`;

    alert(msg);
  };

  const openPsychomotorModal = async (student) => {
    setEditingStudent(student);
    // Fetch existing
    const existing = await getPsychomotor(student.id, activeTerm);
    if (existing && existing.id) {
      setPsychomotorScores({
        punctuality: existing.punctuality || 5,
        neatness: existing.neatness || 5,
        politeness: existing.politeness || 5,
        honesty: existing.honesty || 5,
        leadership: existing.leadership || 5
      });
    } else {
      setPsychomotorScores({ punctuality: 5, neatness: 5, politeness: 5, honesty: 5, leadership: 5 });
    }
  };

  const savePsychomotorScores = async () => {
    if (!editingStudent) return;
    const { success } = await savePsychomotor(editingStudent.id, activeTerm, psychomotorScores);
    if (success) {
      alert(`Skills saved for ${editingStudent.name}`);
      setEditingStudent(null);
    } else {
      alert("Failed to save skills");
    }
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
            <select
              className={`w-full p-3 border rounded-xl outline-none font-bold text-sm transition-all ${isAssigned ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
              value={activeClass}
              onChange={(e) => setActiveClass(e.target.value)}
              disabled={isAssigned}
            >
              {availableClasses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            {isAssigned && <p className="text-[10px] text-green-600 font-bold mt-1 ml-1">Locked to your assigned class</p>}
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
              <th className="p-4 text-center">Skills</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students
              .filter(student => {
                // Filter students based on Subject Department
                const subjectObj = allSubjects.find(s => s.name === activeSubject);
                if (!subjectObj) return true; // Safety

                // Junior Logic
                if (activeClass.startsWith('JSS')) return true; // All juniors take all subjects usually

                // Senior Logic
                if (subjectObj.department === 'General') return true; // Everyone takes General (Math/Eng)

                // Specific Department (e.g. Physics -> Science)
                // If student has no department, maybe show them to be safe (or hide? Safe to show)
                if (!student.department) return true;

                return student.department === subjectObj.department;
              })
              .length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-400 font-bold">No eligible students found in {activeClass} for {activeSubject}.</td></tr>
            ) : students
              .filter(student => {
                // REPEAT FILTER for Map (Optimization: Move filter up to state or variable)
                const subjectObj = allSubjects.find(s => s.name === activeSubject);
                if (!subjectObj) return true;
                if (activeClass.startsWith('JSS')) return true;
                if (subjectObj.department === 'General') return true;
                if (!student.department) return true;
                return student.department === subjectObj.department;
              })
              .map((student) => {
                const sData = inputs[student.id] || {};
                const total = (parseInt(sData.test1) || 0) + (parseInt(sData.test2) || 0) + (parseInt(sData.midTerm) || 0) + (parseInt(sData.exam) || 0);

                return (
                  <tr key={student.id} className="hover:bg-gray-50 transition group">
                    <td className="p-4 sticky left-0 bg-white group-hover:bg-gray-50 z-10 border-r border-gray-100">
                      <p className="font-bold text-gray-800 text-sm">{student.name}</p>
                      <p className="text-xs text-gray-400">{student.id}</p>
                    </td>
                    <td className="p-2 text-center"><input type="number" className="w-16 p-2 text-center border border-gray-200 rounded-lg outline-none focus:border-schoolGreen" placeholder="-" value={sData.test1 || ''} onChange={(e) => handleInputChange(student.id, 'test1', e.target.value)} /></td>
                    <td className="p-2 text-center"><input type="number" className="w-16 p-2 text-center border border-gray-200 rounded-lg outline-none focus:border-schoolGreen" placeholder="-" value={sData.test2 || ''} onChange={(e) => handleInputChange(student.id, 'test2', e.target.value)} /></td>
                    <td className="p-2 text-center"><input type="number" className="w-16 p-2 text-center border border-gray-200 rounded-lg outline-none focus:border-schoolGreen bg-blue-50/30" placeholder="-" value={sData.midTerm || ''} onChange={(e) => handleInputChange(student.id, 'midTerm', e.target.value)} /></td>
                    <td className="p-2 text-center"><input type="number" className="w-16 p-2 text-center border border-gray-200 rounded-lg outline-none focus:border-schoolGreen bg-yellow-50/30" placeholder="-" value={sData.exam || ''} onChange={(e) => handleInputChange(student.id, 'exam', e.target.value)} /></td>
                    <td className="p-4 text-center"><span className={`font-bold block py-1 px-3 rounded-lg ${total >= 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{total}</span></td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => openPsychomotorModal(student)}
                        className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1 rounded-lg text-xs font-bold transition"
                      >
                        Rate Skills
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>


      {/* PSYCHOMOTOR MODAL */}
      {
        editingStudent && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-gray-800 mb-1">Psychomotor Skills</h3>
              <p className="text-sm text-gray-500 mb-6">Rate {editingStudent.name} (1-5)</p>

              <div className="space-y-4">
                {['punctuality', 'neatness', 'politeness', 'honesty', 'leadership'].map(skill => (
                  <div key={skill} className="flex items-center justify-between">
                    <label className="text-sm font-bold uppercase text-gray-600">{skill}</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(val => (
                        <button
                          key={val}
                          onClick={() => setPsychomotorScores({ ...psychomotorScores, [skill]: val })}
                          className={`w-8 h-8 rounded-full font-bold text-xs transition ${psychomotorScores[skill] === val
                            ? 'bg-schoolGreen text-white scale-110 shadow-lg'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setEditingStudent(null)}
                  className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={savePsychomotorScores}
                  className="flex-1 py-3 bg-schoolGreen text-white font-bold rounded-xl shadow-lg hover:bg-schoolGold transition"
                >
                  Save Scores
                </button>
              </div>
            </div>
          </div>
        )
      }

    </div >
  );
};

export default ScoreSheet;