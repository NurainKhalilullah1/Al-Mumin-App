import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Calendar, Download,
  FileText, CheckCircle, Award
} from 'lucide-react';
import { getAssignments, getStudentStats, getTodaysClasses, getNotices } from '../../utils/db'; // <--- IMPORT DB

const StudentView = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  // State for Real Data
  const [assignmentList, setAssignmentList] = useState([]);
  const [stats, setStats] = useState(null);
  const [todaysClasses, setTodaysClasses] = useState([]);
  const [latestNotice, setLatestNotice] = useState(null);

  useEffect(() => {
    // 1. Fetch Assignments
    setAssignmentList(getAssignments());

    // 2. Fetch Stats
    setStats(getStudentStats("AMS/2024/005"));

    // 3. Fetch Timetable
    setTodaysClasses(getTodaysClasses());

    // 4. Fetch Latest Notice
    const notices = getNotices().filter(n => n.active && (n.audience === 'Student' || n.audience === 'All' || n.audience === 'Public'));
    if (notices.length > 0) setLatestNotice(notices[notices.length - 1]);
  }, []);

  if (!stats) return <div className="p-10 text-center">Loading Portal...</div>;

  return (
    <div>
      {/* --- WELCOME HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-schoolGreen">Student Portal</h1>
          <p className="text-gray-500 mt-1">Welcome back, <span className="font-bold text-gray-800">Abdullah Musa (JSS 2A)</span>.</p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <TabButton label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <TabButton label="Check Results" active={activeTab === 'results'} onClick={() => setActiveTab('results')} />
          <TabButton
            label="Assignments"
            active={activeTab === 'assignments'}
            count={assignmentList.length} // Show Real Count
            onClick={() => setActiveTab('assignments')}
          />
        </div>
      </div>

      {/* 1. DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="animate-in fade-in duration-500">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-green-50 p-6 rounded-2xl border border-green-200 flex items-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4"><CheckCircle size={24} /></div>
              <div>
                <p className="text-green-800 font-bold text-lg">{stats.feesPaid ? 'Fees Paid' : 'Unpaid'}</p>
                <p className="text-green-600 text-xs">{stats.feesPaid ? 'No outstanding balance' : 'Contact Bursary'}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-4"><Calendar size={24} /></div>
              <div>
                <p className="text-gray-800 font-bold text-lg">{stats.attendance}% Present</p>
                <p className="text-gray-400 text-xs">{stats.attendanceRemark}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center">
              <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 mr-4"><Award size={24} /></div>
              <div>
                <p className="text-gray-800 font-bold text-lg">{stats.behavior}</p>
                <p className="text-gray-400 text-xs">{stats.behaviorRemark}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">Today's Classes</h3>
              <div className="space-y-4">
                {todaysClasses.length > 0 ? (
                  todaysClasses.map((c, i) => (
                    <ClassItem
                      key={i}
                      subject={c.subject}
                      time={c.time}
                      teacher={c.teacher}
                      status={c.status}
                      active={c.status === 'Ongoing'}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-sm italic">No classes scheduled for today.</p>
                )}
              </div>
            </div>

            <div className="bg-schoolGreen text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-serif font-bold text-xl mb-2">School Notice</h3>
                <p className="text-green-100 text-sm mb-6 leading-relaxed">
                  {latestNotice ? latestNotice.message : "The Prophet (SAW) said: \"Seeking knowledge is an obligation upon every Muslim.\""}
                </p>
                <button onClick={() => navigate('/portal/noticeboard')} className="bg-schoolGold text-schoolGreen px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white transition">View All Notices</button>
              </div>
              <div className="absolute -bottom-10 -right-10 opacity-10 text-white"><BookOpen size={150} /></div>
            </div>
          </div>
        </div>
      )}

      {/* 2. RESULTS TAB */}
      {activeTab === 'results' && (
        <div className="animate-in fade-in duration-500">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 bg-schoolGreen/10 text-schoolGreen rounded-full flex items-center justify-center mx-auto mb-4"><FileText size={32} /></div>
            <h3 className="text-2xl font-serif font-bold text-gray-800 mb-2">Check Your Result</h3>
            <p className="text-gray-500 mb-8">Select the session and term to view or download your report sheet.</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <select className="p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none"><option>2025/2026 Session</option></select>
              <select className="p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none"><option>1st Term</option><option>2nd Term</option></select>
            </div>
            <button onClick={() => navigate('/portal/result-sheet')} className="w-full bg-schoolGreen text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-schoolGold transition shadow-lg">View Result</button>
          </div>
        </div>
      )}

      {/* 3. ASSIGNMENTS TAB (Now Connected to DB) */}
      {activeTab === 'assignments' && (
        <div className="animate-in fade-in duration-500 space-y-4">
          {assignmentList.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p>No active assignments from your teachers.</p>
            </div>
          ) : (
            assignmentList.map((task) => (
              <div key={task.id} className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between group hover:border-schoolGreen transition cursor-pointer">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 mr-4 group-hover:bg-schoolGreen group-hover:text-white transition">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{task.title}</h4>
                    <p className="text-xs text-gray-500">{task.subject} • Due: {task.dueDate}</p>
                    <p className="text-xs text-gray-400 mt-1">{task.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">Pending</span>
                  <button className="text-gray-400 hover:text-schoolGreen"><Download size={20} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};

// Helpers
const TabButton = ({ label, active, onClick, count }) => (
  <button onClick={onClick} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center ${active ? 'bg-schoolGreen text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>
    {label}
    {count > 0 && <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-white text-schoolGreen' : 'bg-red-100 text-red-600'}`}>{count}</span>}
  </button>
);

const ClassItem = ({ subject, time, teacher, status, active }) => (
  <div className={`flex items-center p-4 rounded-xl border ${active ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
    <div className={`w-2 h-12 rounded-full mr-4 ${active ? 'bg-schoolGreen' : 'bg-gray-200'}`}></div>
    <div><h4 className="font-bold text-gray-800">{subject}</h4><p className="text-xs text-gray-500">{teacher}</p></div>
    <div className="ml-auto text-right"><p className="font-bold text-gray-900 text-sm">{time}</p><span className={`text-[10px] uppercase font-bold tracking-wider ${active ? 'text-green-600' : 'text-gray-400'}`}>{status}</span></div>
  </div>
);

export default StudentView;