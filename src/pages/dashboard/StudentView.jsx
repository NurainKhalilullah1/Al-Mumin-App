import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Calendar, Download,
  FileText, CheckCircle, Award
} from 'lucide-react';
import { getAssignments, getStudentStats, getTodaysClasses, getNotices, getStudentAttendanceStats, getStudentFeeStatus, getDailyAdheeth } from '../../utils/db'; // <--- IMPORT DB

const StudentView = () => {
  const navigate = useNavigate();

  // State for Real Data
  const [assignmentList, setAssignmentList] = useState([]);
  const [studentName, setStudentName] = useState('Loading...');
  const [studentClass, setStudentClass] = useState('');
  const [stats, setStats] = useState(null);
  const [todaysClasses, setTodaysClasses] = useState([]);
  const [latestNotice, setLatestNotice] = useState(null);
  const [dailyAdheeth, setDailyAdheeth] = useState(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  useEffect(() => {
    // 1. Fetch Assignments
    const fetchTasks = async () => {
      const tasks = await getAssignments();
      setAssignmentList(tasks);
    };
    fetchTasks();

    // 2. Fetch Stats
    // setStats(getStudentStats("AMS/2024/005")); // OLD MOCK

    const fetchRealStats = async () => {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        setStudentName(user.name || `${user.first_name} ${user.last_name}` || 'Student');
        setStudentClass(user.classLevel || user.current_class_id || ''); // Add fallback logic here if needed

        // Fetch real attendance
        const attStats = await getStudentAttendanceStats(user.id);

        // Fetch real fee status
        const feeStats = await getStudentFeeStatus(user.id);

        setStats(prev => ({
          ...prev,
          feesPaid: feeStats.status === 'Fully Paid',
          outstanding: feeStats.outstanding,
          behavior: 'Excellent', // Keep mock until Behavior module exists
          behaviorRemark: 'Keep it up!',
          attendance: attStats.percentage,
          presentCount: attStats.present,
          absentCount: attStats.absent,
          attendanceRemark: attStats.percentage >= 90 ? 'Excellent' : attStats.percentage >= 75 ? 'Good' : 'Needs Improvement'
        }));
      }
    };
    fetchRealStats();

    // 3. Fetch Daily Adheeth
    const fetchAdheeth = async () => {
      const adheeth = await getDailyAdheeth();
      setDailyAdheeth(adheeth);
    };
    fetchAdheeth();

    // 4. Fetch Latest Notice
    const fetchNotices = async () => {
      const notices = await getNotices();
      const activeNotices = notices.filter(n => n.active && (n.audience === 'Student' || n.audience === 'All' || n.audience === 'Public'));
      if (activeNotices.length > 0) setLatestNotice(activeNotices[0]); // Get first/latest
    };
    fetchNotices();
  }, []);

  if (!stats) return <div className="p-10 text-center">Loading Portal...</div>;

  return (
    <div>
      {/* --- WELCOME HEADER --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4">
        {/* Header Text - Aligned Left as requested */}
        <div className="w-full lg:w-auto text-left">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-schoolGreen">Student Portal</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">{getGreeting()}, <span className="font-bold text-gray-800">{studentName}</span>.</p>
        </div>

        {/* Navigation Buttons - Grid on Mobile */}
        <div className="w-full lg:w-auto grid grid-cols-2 lg:flex lg:flex-wrap gap-2">
          {/* Direct Navigation Buttons */}
          <button onClick={() => navigate('/portal/dashboard')} className="justify-center px-4 py-3 md:py-2.5 rounded-lg text-sm font-bold bg-schoolGreen text-white shadow-md transition-all whitespace-nowrap col-span-2 md:col-span-1 lg:flex-none">
            Dashboard
          </button>
          <button onClick={() => navigate('/portal/result-sheet')} className="justify-center px-4 py-3 md:py-2.5 rounded-lg text-sm font-bold bg-white text-gray-500 hover:bg-gray-100 transition-all flex items-center whitespace-nowrap border border-gray-100 shadow-sm lg:flex-none">
            Check Results
          </button>
          <button onClick={() => navigate('/portal/assignments')} className="justify-center px-4 py-3 md:py-2.5 rounded-lg text-sm font-bold bg-white text-gray-500 hover:bg-gray-100 transition-all flex items-center whitespace-nowrap border border-gray-100 shadow-sm lg:flex-none">
            Assignments
            {assignmentList.length > 0 && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">{assignmentList.length}</span>}
          </button>
          <button onClick={() => navigate('/portal/lesson-notes')} className="justify-center px-4 py-3 md:py-2.5 rounded-lg text-sm font-bold bg-white text-gray-500 hover:bg-gray-100 transition-all flex items-center whitespace-nowrap border border-gray-100 shadow-sm lg:flex-none">
            Lesson Notes
          </button>
          <button onClick={() => navigate('/portal/timetable')} className="justify-center px-4 py-3 md:py-2.5 rounded-lg text-sm font-bold bg-white text-gray-500 hover:bg-gray-100 transition-all flex items-center whitespace-nowrap border border-gray-100 shadow-sm lg:flex-none col-span-2 md:col-span-1">
            Timetable
          </button>
        </div>
      </div>

      {/* --- DASHBOARD WIDGETS --- */}
      <div className="animate-in fade-in duration-500">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-green-50 p-6 rounded-2xl border border-green-200 flex items-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4 shrink-0"><CheckCircle size={24} /></div>
            <div>
              <p className="text-green-800 font-bold text-lg">{stats.feesPaid ? 'Fees Paid' : 'Unpaid'}</p>
              <p className="text-green-600 text-xs">{stats.feesPaid ? 'No outstanding balance' : 'Contact Bursary'}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-gray-800 font-bold text-lg mb-1">Attendance</p>
              <div className="text-xs text-gray-500 space-y-1">
                <p><span className="font-bold text-green-600">{stats.presentCount}</span> Days Present</p>
                <p><span className="font-bold text-red-400">{stats.absentCount}</span> Days Absent</p>
              </div>
            </div>

            {/* CIRCULAR PROGRESS RING */}
            <div className="relative w-16 h-16 shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                <path className="text-schoolGreen transition-all duration-1000 ease-out" strokeDasharray={`${stats.attendance}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-schoolGreen">{stats.attendance}%</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center">
            <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 mr-4 shrink-0"><Award size={24} /></div>
            <div>
              <p className="text-gray-800 font-bold text-lg">{stats.behavior}</p>
              <p className="text-gray-400 text-xs">{stats.behaviorRemark}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-5"></div>
            <div className="w-16 h-16 bg-schoolGold/10 rounded-full flex items-center justify-center text-schoolGold mb-4 group-hover:scale-110 transition-transform">
              <BookOpen size={32} />
            </div>
            <h3 className="font-serif font-bold text-2xl text-schoolGreen mb-2">Daily Adheeth</h3>
            <p className="text-gray-600 italic text-lg max-w-lg leading-relaxed">
              "{dailyAdheeth ? dailyAdheeth.content : "Loading..."}"
            </p>
            <p className="text-sm font-bold text-schoolGold mt-4 uppercase tracking-widest">
              — {dailyAdheeth ? dailyAdheeth.source : "..."}
            </p>
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