import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, BookOpen, FileText, CheckSquare, Plus, Upload, Clock, Calendar, Bell, ChevronRight,
  TrendingUp, Award, Cake, MessageSquare, Briefcase, Activity, CheckCircle, Circle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import {
  getNotices, getNotifications, getStaffStats, getStaffActivities,
  getClassPerformanceTrends, getUpcomingBirthdays, getStaffTodos, saveStaffTodo, sendDirectParentMessage,
  getStudentsByClass
} from '../../utils/db';

const TeacherView = () => {
  const [greeting, setGreeting] = useState('Welcome back');
  const [userName, setUserName] = useState('Teacher');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [stats, setStats] = useState({ classes: 0, pendingScores: 0 });
  const [latestNotices, setLatestNotices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  // New Features State
  const [performanceData, setPerformanceData] = useState([]);
  const [birthdays, setBirthdays] = useState([]);
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [myStudents, setMyStudents] = useState([]);
  const [messageData, setMessageData] = useState({ studentId: '', type: 'General Update', message: '' });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const fetchData = async () => {
      const userStr = localStorage.getItem('currentUser');
      let currentUser = null;
      if (userStr) {
        currentUser = JSON.parse(userStr);
        setUserName(currentUser.name || `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || 'Teacher');
        setUser(currentUser);
      }

      // 1. Notices & Notifications
      const notices = await getNotices();
      const all = notices.filter(n => n.active && (n.audience === 'Staff' || n.audience === 'All'));
      setLatestNotices(all.slice(-3).reverse());

      if (currentUser) {
        const notifs = await getNotifications(currentUser.id);
        setNotifications(notifs.slice(0, 3));

        // 2. Stats & Activities
        setStats(await getStaffStats(currentUser.name, currentUser.subject));
        setRecentActivities(await getStaffActivities(currentUser.email, currentUser.subject));

        // 3. New Advanced Features
        const assignedClass = currentUser.assigned_class || 'JSS 1';
        setPerformanceData(await getClassPerformanceTrends(assignedClass));
        setBirthdays(await getUpcomingBirthdays('class'));
        setTodos(await getStaffTodos(currentUser.id || currentUser.email));
        setMyStudents(await getStudentsByClass(assignedClass));
      }
    };
    fetchData();
  }, []);

  // Valid Fallback Schedule
  const schedule = [
    { time: '08:00 AM', subject: 'Mathematics', class: 'JSS 1A' },
    { time: '09:30 AM', subject: 'Basic Science', class: 'JSS 2B' }
  ];

  const handleToggleTodo = async (id) => {
    const newTodos = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTodos(newTodos);
    if (user) await saveStaffTodo(user.id || user.email, newTodos);
  };

  const handleAddTodo = async (e) => {
    if (e.key === 'Enter' && newTodoText.trim() !== '') {
      const newTodo = { id: Date.now(), text: newTodoText.trim(), completed: false };
      const newTodos = [newTodo, ...todos];
      setTodos(newTodos);
      setNewTodoText('');
      if (user) await saveStaffTodo(user.id || user.email, newTodos);
    }
  };

  const handleDeleteTodo = async (id) => {
    const newTodos = todos.filter(t => t.id !== id);
    setTodos(newTodos);
    if (user) await saveStaffTodo(user.id || user.email, newTodos);
  };

  return (
    <div className="animate-in fade-in duration-500 relative">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start md:items-end mb-8 relative z-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-schoolGreen">Teacher's Desk</h1>
          <p className="text-gray-500 mt-1">{greeting}, <span className="font-bold text-gray-800">{userName}</span>.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={() => setIsMessagingOpen(true)} className="bg-white text-gray-600 px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 hover:text-schoolGreen transition shadow-sm flex items-center justify-center gap-2 font-bold text-sm">
            <MessageSquare size={18} /> Contact Parent
          </button>
          <button onClick={() => navigate('/portal/assignments')} className="bg-schoolGreen text-white px-4 py-2.5 rounded-xl border border-transparent shadow-md shadow-schoolGreen/20 hover:bg-schoolGold transition flex items-center justify-center gap-2 font-bold text-sm w-full md:w-auto">
            <Plus size={18} /> New Assignment
          </button>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative z-10">
        <GlassStatCard icon={<Users />} color="bg-blue-600" label="My Classes" value={stats.classes} sub="Form & Subject" onClick={() => navigate('/portal/staff-classes')} />
        <GlassStatCard icon={<CheckSquare />} color="bg-orange-500" label="Pending Scores" value={stats.pendingScores} sub="Requires action" onClick={() => navigate('/portal/scores')} />
        <GlassStatCard icon={<BookOpen />} color="bg-purple-600" label="My Subjects" value={stats.mySubjects || "View"} sub="Syllabus linked" onClick={() => navigate('/portal/staff-subjects')} />
        <GlassStatCard icon={<FileText />} color="bg-green-600" label="Lesson Notes" value="Upload" sub="Weekly submission" onClick={() => navigate('/portal/lesson-notes')} />
      </div>

      {/* THREE COLUMN GRID FOR ADVANCED FEATURES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">

        {/* LEFT & CENTER (Span 8) */}
        <div className="lg:col-span-8 space-y-8">

          {/* Upcoming Deadline Alert Banner */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-3xl p-6 shadow-md relative overflow-hidden flex items-center justify-between">
            <div className="flex items-center gap-4 relative z-10">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <Clock size={28} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Score Entry Deadline Approaching</h3>
                <p className="text-red-100 text-sm">You have 3 days left to upload your First Term CA scores.</p>
              </div>
            </div>
            <button onClick={() => navigate('/portal/scores')} className="hidden sm:block bg-white text-red-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-50 transition shadow-sm relative z-10">
              Go to Score Sheet
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Performance Mini Chart */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-[320px] flex flex-col">
              <div className="mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2"><TrendingUp size={18} className="text-blue-500" /> Class Performance</h3>
                <p className="text-xs text-gray-400">Average scores by subject</p>
              </div>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="average" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Timetable / Schedule */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-[320px] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2"><Calendar size={18} className="text-schoolGreen" /> Today's Schedule</h3>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {schedule.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No classes today.</p>
                ) : (
                  schedule.map((item, idx) => (
                    <div key={idx} className="bg-gray-50 border border-gray-100 p-3 rounded-2xl flex gap-3 hover:border-green-200 transition group">
                      <div className="bg-white shrink-0 p-2 rounded-xl text-center shadow-sm w-16 flex flex-col justify-center items-center border border-gray-100">
                        <span className="text-green-600 font-black text-sm leading-tight">{item.time.split(' ')[0]}</span>
                        <span className="text-[9px] font-bold text-gray-400">{item.time.split(' ')[1]}</span>
                      </div>
                      <div className="flex flex-col flex-1 justify-center">
                        <p className="font-bold text-gray-800 text-sm">{item.subject}</p>
                        <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-0.5"><Users size={12} /> {item.class}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Updates & Activities */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2"><Bell size={18} className="text-schoolGold" /> Recent Updates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">School Notices</h4>
                {latestNotices.map((n, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 shrink-0"></div>
                    <div><p className="text-sm text-gray-700 font-medium">{n.message}</p></div>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Your Activity</h4>
                {recentActivities.slice(0, 3).map((a, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0"></div>
                    <div>
                      <p className="text-sm text-gray-700 font-medium">{a.text}</p>
                      <p className="text-[10px] text-gray-400">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (Span 4) */}
        <div className="lg:col-span-4 space-y-8">

          {/* Interactive To-Do List */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-[340px] flex flex-col">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><CheckSquare size={18} className="text-purple-500" /> Personal Tasks</h3>
            <div className="flex gap-2 mb-4 shrink-0">
              <input
                type="text"
                placeholder="Add a new task (Press Enter)..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-300 transition"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                onKeyDown={handleAddTodo}
              />
            </div>
            <div className="flex-1 overflow-y-auto pr-1 space-y-2">
              {todos.map(todo => (
                <div key={todo.id} className="flex items-start gap-3 group">
                  <button onClick={() => handleToggleTodo(todo.id)} className="mt-0.5 focus:outline-none shrink-0">
                    {todo.completed ? <CheckCircle size={18} className="text-green-500" /> : <Circle size={18} className="text-gray-300 group-hover:text-purple-400" />}
                  </button>
                  <p className={`text-sm flex-1 cursor-pointer select-none ${todo.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`} onClick={() => handleToggleTodo(todo.id)}>
                    {todo.text}
                  </p>
                  <button onClick={() => handleDeleteTodo(todo.id)} className="text-xs text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition shrink-0">&times;</button>
                </div>
              ))}
              {todos.length === 0 && <p className="text-center text-sm text-gray-400 py-4">All caught up!</p>}
            </div>
          </div>

          {/* Student Birthdays */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Cake size={18} className="text-pink-500" /> Upcoming Birthdays</h3>
            <div className="space-y-3">
              {birthdays.map((b, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-pink-50 text-pink-900 rounded-xl border border-pink-100">
                  <div>
                    <p className="font-bold text-sm">{b.name}</p>
                    <p className="text-xs opacity-70">Turning {b.ageTurning} on {b.date}</p>
                  </div>
                  <Cake size={16} className="text-pink-400" />
                </div>
              ))}
              {birthdays.length === 0 && <p className="text-sm text-gray-400 text-center">No birthdays this month.</p>}
            </div>
          </div>

        </div>
      </div>

      {/* PARENT MESSAGING MODAL */}
      {isMessagingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100">
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-gray-100">
              <h3 className="font-bold text-gray-800 flex items-center gap-2"><MessageSquare size={18} className="text-schoolGreen" /> Direct Message</h3>
              <button onClick={() => setIsMessagingOpen(false)} className="text-gray-400 hover:text-red-500 transition font-bold text-xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Student</label>
                <select
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-schoolGreen/20 focus:border-schoolGreen outline-none transition"
                  value={messageData.studentId}
                  onChange={(e) => setMessageData({ ...messageData, studentId: e.target.value })}
                >
                  <option value="">-- Choose a student in your class --</option>
                  {myStudents.map(student => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Message Type</label>
                <select
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-schoolGreen/20 focus:border-schoolGreen outline-none transition"
                  value={messageData.type}
                  onChange={(e) => setMessageData({ ...messageData, type: e.target.value })}
                >
                  <option>General Update</option>
                  <option>Behavioral Note</option>
                  <option>Academic Praise</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Message</label>
                <textarea
                  rows="3"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-schoolGreen/20 focus:border-schoolGreen outline-none transition resize-none"
                  value={messageData.message}
                  onChange={(e) => setMessageData({ ...messageData, message: e.target.value })}
                ></textarea>
              </div>
              <button
                onClick={() => {
                  if (messageData.studentId && messageData.message) {
                    setIsMessagingOpen(false);
                    setMessageData({ studentId: '', type: 'General Update', message: '' });
                  } else {
                    alert('Please select a student and type a message');
                  }
                }}
                className="w-full bg-schoolGreen text-white font-bold text-sm py-3.5 rounded-xl shadow-md hover:bg-schoolGold transition mt-2"
              >
                Send to Parent
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// --- SUB COMPONENTS ---

const GlassStatCard = ({ icon, color, label, value, sub, onClick }) => (
  <div onClick={onClick} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer group">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${color} group-hover:scale-110 transition`}>
        {React.cloneElement(icon, { size: 18 })}
      </div>
    </div>
    <div>
      <h3 className="text-2xl font-black text-gray-800 leading-none">{value}</h3>
      <p className="text-gray-400 text-xs font-bold mt-1 tracking-wide">{label}</p>
      {/* <p className="text-[10px] text-gray-300 mt-1">{sub}</p> */}
    </div>
  </div>
);

export default TeacherView;