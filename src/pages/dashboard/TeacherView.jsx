import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, BookOpen, FileText, CheckSquare,
  Plus, Upload, Clock, Calendar, Bell, ChevronRight, GraduationCap
} from 'lucide-react';
import { getNotices, getNotifications, getStaffStats, getStaffActivities } from '../../utils/db';

const TeacherView = () => {
  const [greeting, setGreeting] = useState('Welcome back');
  const [userName, setUserName] = useState('Teacher');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserName(user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Teacher');
    }
  }, []);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ classes: 0, pendingScores: 0 });
  const [latestNotices, setLatestNotices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // 0. Get User
      const userStr = localStorage.getItem('currentUser');
      let currentUser = null;
      if (userStr) {
        currentUser = JSON.parse(userStr);
        setUser(currentUser);
      }

      // 1. Notices
      const notices = await getNotices();
      const all = notices.filter(n => n.active && (n.audience === 'Staff' || n.audience === 'All' || n.audience === 'Public'));
      setLatestNotices(all.slice(-3).reverse());

      if (currentUser) {
        // 2. Personal Notifications
        const notifs = await getNotifications(currentUser.id);
        setNotifications(notifs.slice(0, 5));

        // 3. Staff Stats
        const myStats = await getStaffStats(currentUser.name);
        setStats(myStats);

        // 4. Recent Activities
        const myActivities = await getStaffActivities(currentUser.email);
        setRecentActivities(myActivities);
      }
    };
    fetchData();
  }, []);

  // Valid Fallback Schedule (since we don't have a full timetable DB yet)
  const schedule = [];

  return (
    <div className="animate-in fade-in duration-500 relative">

      {/* HEADER GREETING */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 relative z-10 gap-4">
        <div className="w-full lg:w-auto text-left">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-schoolGreen mb-2">Teacher's Desk</h1>
          <p className="text-gray-500 text-base md:text-lg">Good Morning, <span className="font-bold text-gray-800">{user?.name || 'Staff Member'}</span>.</p>
        </div>
        <div className="w-full lg:w-auto grid grid-cols-2 lg:flex gap-3">
          <button className="bg-white/50 backdrop-blur border border-white text-gray-600 px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white transition shadow-sm w-full lg:w-auto">
            View Calendar
          </button>
          <button
            onClick={() => navigate('/portal/assignments')}
            className="bg-schoolGreen text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center lg:justify-start shadow-xl shadow-green-900/10 hover:bg-schoolGold transition hover:-translate-y-1 w-full lg:w-auto"
          >
            <Plus size={18} className="mr-2" /> New Assignment
          </button>
        </div>
      </div>

      {/* GLASS STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 relative z-10">
        <GlassStatCard
          icon={<GraduationCap size={24} />}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          label="My Classes"
          value={stats.classes + " Classes"}
          sub="Class Directory"
          onClick={() => navigate('/portal/staff-classes')}
        />
        <GlassStatCard
          icon={<CheckSquare size={24} />}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
          label="Pending Scores"
          value={stats.pendingScores + " Pending"}
          sub="Input Scores"
          onClick={() => navigate('/portal/scores')}
        />
        <GlassStatCard
          icon={<BookOpen size={24} />}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          label="My Subjects"
          value="View All"
          sub="Subject Allocation"
          onClick={() => navigate('/portal/staff-subjects')}
        />
        <GlassStatCard
          icon={<FileText size={24} />}
          color="bg-gradient-to-br from-green-500 to-green-600"
          label="Lesson Notes"
          value="Upload"
          sub="Weekly Plan"
          onClick={() => navigate('/portal/lesson-notes')}
        />
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">

        {/* LEFT COLUMN - WORKFLOW */}
        <div className="lg:col-span-2 space-y-8">

          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-schoolGreen to-emerald-800 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-110 transition duration-700"></div>

            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-3xl font-serif font-bold mb-2">First Term Exams</h3>
                  <p className="text-green-100 mb-6 max-w-md text-sm leading-relaxed opacity-90">
                    Score entry portal is now open. Please ensure all CA scores are uploaded before the deadline.
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                  <Clock size={32} className="text-white" />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/portal/scores')}
                  className="bg-white text-schoolGreen px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-schoolGold hover:text-white transition shadow-lg flex items-center"
                >
                  Open Score Sheet <ChevronRight size={16} className="ml-2" />
                </button>
                <button
                  onClick={() => navigate('/portal/staff-classes')}
                  className="bg-transparent border border-white/30 text-white px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-white/10 transition flex items-center"
                >
                  View Class Lists
                </button>
              </div>
            </div>
          </div>

          {/* Schedule Card */}
          <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-gray-800 text-xl flex items-center"><Calendar className="mr-3 text-schoolGreen" size={24} /> Today's Schedule</h3>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
              </span>
            </div>
            <div className="space-y-4">
              {schedule.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">No classes scheduled for today.</p>
                </div>
              ) : (
                schedule.map((item, idx) => (
                  <div key={idx} className="flex items-center p-4 rounded-2xl hover:bg-white transition border border-transparent hover:border-gray-100 hover:shadow-lg group">
                    <div className="w-20 text-center">
                      <span className="block font-bold text-gray-800 text-sm group-hover:text-schoolGreen transition">{item.time}</span>
                    </div>
                    {/* ... render schedule item */}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - TOOLS */}
        <div className="space-y-8">

          {/* Updates Panel */}
          <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-8 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center text-lg">
              <Bell className="mr-3 text-schoolGold" size={20} /> Updates
            </h3>
            <div className="space-y-6 relative">
              {/* Line Connector */}
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-100"></div>

              {/* Real Activities */}
              {recentActivities.map((act, idx) => (
                <div key={idx} className="flex gap-4 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg text-white ${act.type === 'approval' ? 'bg-green-500 shadow-green-200' : 'bg-blue-500 shadow-blue-200'}`}>
                    {act.type === 'approval' ? <CheckSquare size={14} /> : <FileText size={14} />}
                  </div>
                  <div className="pt-1">
                    <p className="text-sm text-gray-700 font-bold leading-snug mb-1">{act.text}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{act.time}</p>
                  </div>
                </div>
              ))}

              {latestNotices.map((act, idx) => (
                <div key={`notice-${idx}`} className="flex gap-4 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg text-white bg-orange-500 shadow-orange-200`}>
                    <Bell size={14} />
                  </div>
                  <div className="pt-1">
                    <p className="text-sm text-gray-700 font-bold leading-snug mb-1">{act.message}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Notice Board</p>
                  </div>
                </div>
              ))}

              {notifications.map((notif, idx) => (
                <div key={`notif-${idx}`} className="flex gap-4 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg text-white bg-blue-500 shadow-blue-200`}>
                    <CheckSquare size={14} />
                  </div>
                  <div className="pt-1">
                    <p className="text-sm text-gray-700 font-bold leading-snug mb-1">{notif.message}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{new Date(notif.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-8 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-6 text-lg">Quick Tools</h3>
            <div className="grid grid-cols-2 gap-4">
              <ToolButton icon={<Upload size={20} />} label="Upload Notes" onClick={() => navigate('/portal/lesson-notes')} />
              <ToolButton icon={<CheckSquare size={20} />} label="Input Score" onClick={() => navigate('/portal/scores')} />
              <ToolButton icon={<Users size={20} />} label="Attendance" onClick={() => navigate('/portal/classes')} />
              <ToolButton icon={<BookOpen size={20} />} label="Syllabus" onClick={() => { }} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- SUB COMPONENTS ---

const GlassStatCard = ({ icon, color, label, value, sub, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-white shadow-sm flex flex-col justify-between h-40 group cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
  >
    <div className="flex justify-between items-start">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${color}`}>
        {icon}
      </div>
      <div className="bg-gray-50 rounded-full p-2 opacity-0 group-hover:opacity-100 transition">
        <ChevronRight size={14} className="text-gray-400" />
      </div>
    </div>
    <div>
      <h3 className="text-2xl font-bold text-gray-800 leading-none mb-1 group-hover:text-schoolGreen transition">{value}</h3>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-[10px] text-gray-300 mt-2">{sub}</p>
    </div>
  </div>
);

const ToolButton = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-lg transition group"
  >
    <div className="text-gray-400 group-hover:text-schoolGreen mb-2 transition transform group-hover:scale-110">{icon}</div>
    <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 text-center">{label}</span>
  </button>
);

export default TeacherView;