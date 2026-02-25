import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Calendar, Download, FileText, CheckCircle, Award,
  LayoutDashboard, Settings, Clock, Star, TrendingUp, ChevronRight, Bookmark
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import {
  getAssignments, getNotices, getStudentAttendanceStats, getStudentFeeStatus,
  getDailyAdheeth, getTermCountdown, getStudentPerformanceTrends,
  getRecentGradesSnippet, getStudentAchievements
} from '../../utils/db';
import { useToast } from '../../components/ToastProvider';

const StudentView = () => {
  const navigate = useNavigate();
  const notify = useToast();

  const [studentName, setStudentName] = useState('Loading...');
  const [assignmentList, setAssignmentList] = useState([]);
  const [stats, setStats] = useState(null);
  const [latestNotice, setLatestNotice] = useState(null);
  const [dailyAdheeth, setDailyAdheeth] = useState(null);

  // New Features State
  const [termCountdown, setTermCountdown] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);
  const [recentGrades, setRecentGrades] = useState([]);
  const [achievements, setAchievements] = useState([]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  useEffect(() => {
    const fetchAllData = async () => {
      const userStr = localStorage.getItem('currentUser');
      let currentUser = null;
      if (userStr) {
        currentUser = JSON.parse(userStr);
        setStudentName(currentUser.name || `${currentUser.first_name} ${currentUser.last_name}` || 'Student');

        if (!currentUser.passport_url) {
          notify.error("Action Required: Please upload your passport photo in Settings.");
        }

        // Base Data
        setAssignmentList(await getAssignments());
        setDailyAdheeth(await getDailyAdheeth());

        const notices = await getNotices();
        const activeNotices = notices.filter(n => n.active && (n.audience === 'Student' || n.audience === 'All'));
        if (activeNotices.length > 0) setLatestNotice(activeNotices[0]);

        // Stats
        const attStats = await getStudentAttendanceStats(currentUser.id);
        const feeStats = await getStudentFeeStatus(currentUser.id);
        setStats({
          feesPaid: feeStats.status === 'Fully Paid',
          attendance: attStats.percentage,
          presentCount: attStats.present,
          absentCount: attStats.absent,
          behavior: 'Excellent'
        });

        // New Advanced Features Data
        setTermCountdown(await getTermCountdown());
        setPerformanceData(await getStudentPerformanceTrends(currentUser.id));
        setRecentGrades(await getRecentGradesSnippet(currentUser.id));
        setAchievements(await getStudentAchievements(currentUser.id));
      }
    };
    fetchAllData();
  }, []);

  if (!stats) return <div className="p-10 text-center animate-pulse text-gray-500 font-bold">Loading Academic Portal...</div>;

  return (
    <div className="animate-in fade-in duration-500 relative pb-10">

      {/* HEADER & NAV */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4 relative z-10">
        <div className="w-full lg:w-auto text-left">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-schoolGreen">Student Portal</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">{getGreeting()}, <span className="font-bold text-gray-800">{studentName}</span>.</p>
        </div>

        <div className="w-full lg:w-auto grid grid-cols-2 lg:flex lg:flex-wrap gap-2">
          <NavButton icon={<LayoutDashboard size={16} />} label="Dashboard" onClick={() => navigate('/portal/dashboard')} isPrimary />
          <NavButton icon={<FileText size={16} />} label="Check Results" onClick={() => navigate('/portal/result-sheet')} />
          <NavButton
            icon={<BookOpen size={16} />}
            label="Assignments"
            badge={assignmentList.length}
            onClick={() => navigate('/portal/assignments')}
          />
          <NavButton icon={<Download size={16} />} label="Lesson Notes" onClick={() => navigate('/portal/lesson-notes')} />
          <NavButton icon={<Calendar size={16} />} label="Timetable" onClick={() => navigate('/portal/timetable')} />
          <NavButton icon={<Settings size={16} />} label="Settings" onClick={() => navigate('/portal/student-settings')} />
        </div>
      </div>

      {/* QUICK STATUS WIDGETS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 relative z-10">
        <StatusCard
          icon={<CheckCircle size={24} />} color="bg-green-50 text-green-600 border-green-200"
          title={stats.feesPaid ? 'Fees Cleared' : 'Pending Fees'}
          subtitle={stats.feesPaid ? 'Ready for exams' : 'Contact Bursary'}
        />

        {/* Attendance Ring */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-gray-800 font-bold text-lg mb-1">Attendance</p>
            <div className="text-xs text-gray-500 space-y-1">
              <p><span className="font-bold text-green-600">{stats.presentCount}</span> Days Present</p>
              <p><span className="font-bold text-red-400">{stats.absentCount}</span> Days Absent</p>
            </div>
          </div>
          <div className="relative w-16 h-16 shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-gray-100" d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32" fill="none" stroke="currentColor" strokeWidth="3" />
              <path className="text-schoolGreen transition-all duration-1000 ease-out" strokeDasharray={`${stats.attendance}, 100`} d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-schoolGreen">{stats.attendance}%</div>
          </div>
        </div>

        {/* Term Countdown */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl shadow-md flex items-center text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition duration-700"></div>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white mr-4 shrink-0 relative z-10"><Clock size={24} /></div>
          <div className="relative z-10 w-full">
            <div className="flex justify-between items-end mb-1">
              <p className="font-bold text-lg leading-none">{termCountdown?.days || 0} Days</p>
              <p className="text-[10px] uppercase font-bold text-blue-100">{termCountdown?.currentTerm}</p>
            </div>
            <p className="text-blue-100 text-xs mb-2">Remaining in Term</p>
            <div className="w-full bg-black/20 rounded-full h-1.5">
              <div className="bg-white h-1.5 rounded-full" style={{ width: `${termCountdown?.percentage || 0}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">

        {/* LEFT COLUMN (Span 8) */}
        <div className="lg:col-span-8 space-y-8">

          {/* GAMIFIED ACHIEVEMENTS */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2"><Star size={20} className="text-yellow-500" /> My Badges</h3>
              <span className="text-xs font-bold text-schoolGreen bg-green-50 px-3 py-1 rounded-lg">Honor Roll Student</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {achievements.map(ach => (
                <div key={ach.id} className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex flex-col items-center text-center hover:bg-white hover:shadow-md transition group">
                  <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition ${ach.color}`}>
                    {ach.icon === 'Star' ? <Star size={20} /> : ach.icon === 'TrendingUp' ? <TrendingUp size={20} /> : <Award size={20} />}
                  </div>
                  <p className="font-bold text-gray-800 text-sm">{ach.title}</p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-bold">{ach.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* PERFORMANCE CHART */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-[350px] flex flex-col">
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2"><TrendingUp size={20} className="text-blue-500" /> Academic Growth</h3>
              <p className="text-xs text-gray-400 mt-1">Average score progression over terms</p>
            </div>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="term" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} domain={['dataMin - 10', 100]} />
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="average" name="Term Average" stroke="#16a34a" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (Span 4) */}
        <div className="lg:col-span-4 space-y-8">

          {/* Upcoming Deadlines / Assignments */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-[320px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2"><Clock size={18} className="text-red-500" /> Deadlines</h3>
              <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100">Tasks</span>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {assignmentList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                  <CheckCircle size={32} className="text-gray-300 mb-2" />
                  <p className="text-sm font-bold text-gray-500">All caught up!</p>
                </div>
              ) : (
                assignmentList.slice(0, 4).map((task, idx) => (
                  <div key={idx} onClick={() => navigate('/portal/assignments')} className="bg-red-50/50 border border-red-100 p-3 rounded-xl flex items-start gap-3 hover:bg-red-50 cursor-pointer transition">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-red-500 font-bold shrink-0 shadow-sm text-sm border border-red-100">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm line-clamp-1">{task.title}</p>
                      <p className="text-xs text-red-500 font-bold mt-1">Due Soon</p>
                    </div>
                    <ChevronRight size={14} className="ml-auto text-red-300 mt-2" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Grades Snippet */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2"><Award size={18} className="text-purple-500" /> Recent Grades</h3>
            </div>
            <div className="space-y-3">
              {recentGrades.map((g, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <p className="font-bold text-sm text-gray-800">{g.subject}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{g.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-gray-800">{g.score}%</span>
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${g.grade === 'A' ? 'bg-green-100 text-green-700' : g.grade === 'B' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                      {g.grade}
                    </span>
                  </div>
                </div>
              ))}
              <button onClick={() => navigate('/portal/result-sheet')} className="w-full mt-2 text-xs font-bold text-schoolGreen hover:text-schoolGold transition">View Full Report Card &rarr;</button>
            </div>
          </div>

          {/* Notice Banner */}
          <div className="bg-gradient-to-br from-schoolGreen to-emerald-800 p-6 rounded-3xl shadow-md text-white relative overflow-hidden group hover:shadow-lg transition">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition duration-700"></div>
            <h3 className="font-bold text-lg mb-2 relative z-10">School Notice</h3>
            <p className="text-sm text-green-50 mb-4 relative z-10 leading-relaxed max-w-[90%]">
              {latestNotice ? latestNotice.message : "Welcome to the new academic term. Work hard and stay focused."}
            </p>
            <button onClick={() => navigate('/portal/noticeboard')} className="bg-white/20 hover:bg-white text-white hover:text-schoolGreen backdrop-blur-sm px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 w-max relative z-10">
              All Notices <ChevronRight size={14} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- HELPERS ---

const NavButton = ({ icon, label, isPrimary, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`justify-center px-4 py-3 md:py-2.5 rounded-xl text-sm font-bold flex items-center transition flex-1 min-w-max md:flex-none
    ${isPrimary ? 'bg-schoolGreen text-white shadow-md shadow-schoolGreen/20 hover:bg-schoolGold' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 shadow-sm'}`}
  >
    <span className={`${isPrimary ? 'text-white' : 'text-gray-400'} mr-2`}>{icon}</span> {label}
    {badge > 0 && (
      <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-md ${isPrimary ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>
        {badge}
      </span>
    )}
  </button>
);

const StatusCard = ({ icon, color, title, subtitle }) => (
  <div className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center hover:shadow-md transition`}>
    <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-gray-800 font-bold text-lg">{title}</p>
      <p className="text-gray-400 text-xs mt-0.5 font-medium">{subtitle}</p>
    </div>
  </div>
);

export default StudentView;