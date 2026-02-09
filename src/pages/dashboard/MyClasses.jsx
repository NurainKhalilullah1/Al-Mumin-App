import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Users, Calendar, Save, Search, User } from 'lucide-react';
import { getStudentsByClass, saveAttendance, getAttendance, getStaffByEmail } from '../../utils/db';

const CLASSES = ["JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"];

const MyClasses = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.selectedClassName ? 'students' : 'register'); // Default to students if class pre-selected
  const [currentClass, setCurrentClass] = useState(location.state?.selectedClassName || 'JSS 2');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Today's date
  const [students, setStudents] = useState([]);

  // Attendance State: { 'AMS/001': 'present', 'AMS/002': 'absent' }
  const [attendance, setAttendance] = useState({});
  const [isAssigned, setIsAssigned] = useState(false);

  // Auto-select Assigned Class
  useEffect(() => {
    const checkAssignment = async () => {
      if (location.state?.selectedClassName) return; // Respect search navigation

      try {
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
          const user = JSON.parse(userStr);
          // Fetch full profile including assigned class
          const profile = await getStaffByEmail(user.email);
          if (profile?.assignedClass) {
            setCurrentClass(profile.assignedClass);
            setIsAssigned(true);
          }
        }
      } catch (error) {
        console.error("Error auto-selecting class:", error);
      }
    };
    checkAssignment();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Load Students
        const classList = await getStudentsByClass(currentClass); // Async wait
        setStudents(classList || []);

        // 2. Load Existing Attendance
        const existingRecord = await getAttendance(currentClass, date); // Async wait
        if (existingRecord && Object.keys(existingRecord).length > 0) {
          setAttendance(existingRecord);
        } else {
          setAttendance({});
        }
      } catch (error) {
        console.error("Error fetching class data:", error);
      }
    };
    fetchData();
  }, [currentClass, date]);

  const handleMark = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    await saveAttendance(currentClass, date, attendance);
    alert('Attendance Saved!');
  };

  return (
    <div className="animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-schoolGreen">My Class Manager</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-gray-500">Manage Class:</span>
            {isAssigned ? (
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-schoolGreen">{currentClass}</span>
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full uppercase font-bold border border-green-200">Assigned</span>
              </div>
            ) : (
              <select
                className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-1 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-schoolGreen/20"
                value={currentClass}
                onChange={(e) => setCurrentClass(e.target.value)}
              >
                {CLASSES.map(cls => <option key={cls} value={cls}>{cls}</option>)}
              </select>
            )}
          </div>
        </div>

        {/* TABS */}
        <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm mt-4 md:mt-0">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'students' ? 'bg-schoolGreen text-white shadow' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Student List
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'register' ? 'bg-schoolGreen text-white shadow' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Attendance Register
          </button>
        </div>
      </div>

      {/* --- TAB 1: STUDENT PROFILES --- */}
      {activeTab === 'students' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <div key={student.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center hover:border-schoolGreen transition cursor-pointer group">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mr-4 ${student.gender === 'M' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                {student.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{student.name}</h3>
                <p className="text-xs text-gray-400 font-bold uppercase">{student.id}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] bg-gray-100 px-2 py-1 rounded font-bold text-gray-600">JSS 2A</span>
                  <span className="text-[10px] bg-green-100 px-2 py-1 rounded font-bold text-green-600">Active</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- TAB 2: ATTENDANCE REGISTER --- */}
      {activeTab === 'register' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          {/* TOOLBAR */}
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 gap-4 md:gap-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2">
                <Calendar size={16} className="text-gray-400 mr-2" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="outline-none text-sm font-bold text-gray-700 bg-transparent"
                />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase hidden md:inline">Marking Register for {date}</span>
            </div>
            <button
              onClick={handleSaveAttendance}
              className="flex items-center bg-schoolGreen text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow hover:bg-schoolGold transition"
            >
              <Save size={16} className="mr-2" /> Save Register
            </button>
          </div>

          {/* LIST */}
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4 text-center">Present</th>
                <th className="p-4 text-center">Absent</th>
                <th className="p-4 text-center">Late</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student) => {
                const status = attendance[student.id];
                return (
                  <tr key={student.id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                      <p className="font-bold text-gray-800 text-sm">{student.name}</p>
                      <p className="text-xs text-gray-400">{student.id}</p>
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleMark(student.id, 'present')}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mx-auto transition ${status === 'present' ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300'}`}
                      >
                        {status === 'present' && <div className="w-2 h-2 bg-white rounded-full" />}
                      </button>
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleMark(student.id, 'absent')}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mx-auto transition ${status === 'absent' ? 'border-red-500 bg-red-500 text-white' : 'border-gray-300'}`}
                      >
                        {status === 'absent' && <div className="w-2 h-2 bg-white rounded-full" />}
                      </button>
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleMark(student.id, 'late')}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mx-auto transition ${status === 'late' ? 'border-yellow-500 bg-yellow-500 text-white' : 'border-gray-300'}`}
                      >
                        {status === 'late' && <div className="w-2 h-2 bg-white rounded-full" />}
                      </button>
                    </td>

                    <td className="p-4 text-center">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${status === 'present' ? 'bg-green-100 text-green-700' :
                        status === 'absent' ? 'bg-red-100 text-red-700' :
                          status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-400'
                        }`}>
                        {status || 'Not Marked'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

        </div>
      )}

    </div>
  );
};

export default MyClasses;