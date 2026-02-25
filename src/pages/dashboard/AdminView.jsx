import React, { useState, useEffect } from 'react';
import {
  Users, CreditCard, TrendingUp, UserPlus,
  FileText, CheckCircle, Upload, ArrowRight, RefreshCw,
  Calendar, UserMinus, Send, Clock, MessageSquare, Briefcase, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getDashboardStats, checkPendingResults, getRecentActivities,
  getFinancialTrends, getOverallAttendance, getStaffLeaves, getTermCountdown, sendBulkMessage
} from '../../utils/db';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';

const AdminView = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ students: 0, fees: 0, admissions: 0, staff: 0 });
  const [hasPendingResults, setHasPendingResults] = useState(false);
  const [activities, setActivities] = useState([]);

  // New Features State
  const [financialData, setFinancialData] = useState([]);
  const [attendanceData, setAttendanceData] = useState(null);
  const [staffLeaves, setStaffLeaves] = useState([]);
  const [termCountdown, setTermCountdown] = useState(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const fetchStats = async () => {
    const data = await getDashboardStats();
    setStats(data);

    const pending = await checkPendingResults();
    if (pending && pending.hasPending) setHasPendingResults(true);

    const acts = await getRecentActivities();
    setActivities(acts || []);

    // Fetch New Feature Data
    setFinancialData(await getFinancialTrends());
    setAttendanceData(await getOverallAttendance());
    setStaffLeaves(await getStaffLeaves());
    setTermCountdown(await getTermCountdown());
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (amount) => {
    if (amount >= 1000000) return `₦${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `₦${(amount / 1000).toFixed(1)}K`;
    return `₦${amount}`;
  };

  return (
    <div>
      {/* --- WELCOME HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-schoolGreen">Principal's Workspace</h1>
          <p className="text-gray-500 mt-1">{getTimeGreeting()}, Principal.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={() => setIsMessageModalOpen(true)} className="bg-schoolGreen text-white px-4 py-2.5 rounded-xl border border-transparent shadow-md shadow-schoolGreen/20 hover:bg-schoolGold transition flex items-center justify-center gap-2 font-bold text-sm w-full md:w-auto">
            <Send size={18} /> Broadcast
          </button>
          <button onClick={fetchStats} className="bg-white text-gray-500 p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 hover:text-schoolGreen transition shadow-sm flex items-center justify-center w-full md:w-auto" title="Refresh Data">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="animate-in fade-in duration-500">
        {/* PENDING RESULTS ALERT */}
        {hasPendingResults && (
          <div onClick={() => navigate('/portal/results')} className="mb-8 bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-orange-100 transition group shadow-sm">
            <div className="flex items-center text-orange-800">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-white transition">
                <FileText className="text-orange-600" size={20} />
              </div>
              <div>
                <h3 className="font-bold">Pending Results require Approval</h3>
                <p className="text-sm text-orange-700">Some class results have been uploaded but not yet approved.</p>
              </div>
            </div>
            <div className="bg-white text-orange-600 px-4 py-2 rounded-lg font-bold text-sm shadow-sm group-hover:shadow-md transition">
              Review Now
            </div>
          </div>
        )}

        {/* TOP STATS GRID & COUNTDOWN */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Students" value={stats.students} icon={<Users />} color="bg-blue-600" />
            <StatCard title="Fees Collected" value={formatCurrency(stats.fees)} icon={<CreditCard />} color="bg-green-600" />
            <StatCard title="New Admissions" value={stats.admissions} icon={<UserPlus />} color="bg-orange-500" />
            <StatCard title="Staff Members" value={stats.staff} icon={<Briefcase />} color="bg-purple-600" />
          </div>

          {/* Term Countdown Widget */}
          <div className="bg-gradient-to-br from-schoolGreen to-emerald-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-center">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-wider mb-1">{termCountdown?.currentTerm || 'Current Term'}</p>
            <h3 className="text-4xl font-black mb-1">{termCountdown?.days || 0}<span className="text-lg font-normal ml-1 text-emerald-100">days</span></h3>
            <p className="text-xs text-emerald-200 font-medium mb-3">Before Term Ends</p>
            <div className="w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
              <div className="bg-schoolGold h-1.5 rounded-full" style={{ width: `${termCountdown?.percentage || 0}%` }}></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* MAIN COLUMN (Charts & Activities) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Financial Overview Chart */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    <TrendingUp className="text-schoolGreen" size={20} /> Financial Trends
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Income vs Expenses (Simulated)</p>
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={financialData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorFees" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={(val) => `₦${val / 1000}k`} />
                    <RechartsTooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`₦${value.toLocaleString()}`, undefined]}
                    />
                    <Area type="monotone" dataKey="fees" name="Income" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorFees)" />
                    <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Live Activity Feed */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <Activity className="text-blue-500" size={20} /> Live Activity Feed
                </h3>
              </div>
              <div className="space-y-6">
                {activities.length === 0 ? (
                  <p className="text-gray-400 text-sm">No recent activities.</p>
                ) : (
                  activities.map((act, idx) => (
                    <ActivityItem
                      key={idx}
                      icon={
                        act.type === 'admission' ? <Users /> :
                          act.type === 'payment' ? <CreditCard /> :
                            act.type === 'result' ? <Upload /> : <FileText />
                      }
                      title={act.title}
                      desc={act.desc}
                      time={!isNaN(Date.parse(act.time)) ? new Date(act.time).toLocaleDateString() : act.time}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (Widgets & Actions) */}
          <div className="space-y-8">

            {/* Today's Attendance Widget */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="w-full mb-4 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Today's Attendance</h3>
              </div>

              {/* Custom Circular Progress */}
              <div className="relative w-32 h-32 flex items-center justify-center mt-2 mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-green-500 drop-shadow-md"
                    strokeDasharray={2 * Math.PI * 56}
                    strokeDashoffset={2 * Math.PI * 56 * (1 - (attendanceData?.percentage || 0) / 100)}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-gray-800">{attendanceData?.percentage || 0}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full text-center">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Present</p>
                  <p className="text-xl font-bold text-gray-800">{attendanceData?.present || 0}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                  <p className="text-[10px] uppercase font-bold text-red-400 mb-1">Absent/Late</p>
                  <p className="text-xl font-bold text-red-600">{attendanceData ? attendanceData.absent + attendanceData.late : 0}</p>
                </div>
              </div>
            </div>

            {/* Staff Leave Tracker */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                <UserMinus className="text-orange-500" size={20} /> Staff Leaves
              </h3>
              <div className="space-y-4">
                {staffLeaves.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">All staff are present.</p>
                ) : (
                  staffLeaves.map(leave => (
                    <div key={leave.id} className="p-3 border border-gray-100 rounded-xl hover:bg-gray-50 flex flex-col gap-1 transition">
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-sm text-gray-800">{leave.name}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${leave.status.includes('Absent') ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                          {leave.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{leave.reason}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                <CheckCircle className="text-purple-500" size={20} /> Quick Shortcuts
              </h3>
              <div className="space-y-3">
                <ActionBtn label="New Admission" onClick={() => navigate('/portal/admissions')} />
                <ActionBtn label="Post New Notice" onClick={() => navigate('/portal/notices')} />
                <ActionBtn label="Manage Results" onClick={() => navigate('/portal/results')} />
                <ActionBtn label="Verify Payments" onClick={() => navigate('/portal/verify-payments')} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BULK MESSAGE MODAL */}
      {isMessageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100">
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-gray-100">
              <h3 className="font-bold text-gray-800 flex items-center gap-2"><Send size={18} className="text-schoolGreen" /> Broadcast Message</h3>
              <button onClick={() => setIsMessageModalOpen(false)} className="text-gray-400 hover:text-red-500 transition font-bold text-xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Send To</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-schoolGreen/20 focus:border-schoolGreen outline-none transition">
                  <option>All Parents & Guardians</option>
                  <option>All Staff Members</option>
                  <option>Specific Class (JSS 1)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Message</label>
                <textarea rows="4" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-schoolGreen/20 focus:border-schoolGreen outline-none transition resize-none" placeholder="Type your broadcast message here..."></textarea>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                  <input type="checkbox" className="accent-schoolGreen w-4 h-4" defaultChecked /> SMS
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                  <input type="checkbox" className="accent-schoolGreen w-4 h-4" defaultChecked /> Email
                </label>
              </div>
              <button onClick={() => setIsMessageModalOpen(false)} className="w-full bg-schoolGreen text-white font-bold text-sm py-3.5 rounded-xl shadow-md hover:bg-schoolGold transition mt-2">
                Send Broadcast
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- HELPER COMPONENTS ---

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center hover:-translate-y-1 transition-transform group">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${color} group-hover:scale-110 transition`}>
        {React.cloneElement(icon, { size: 18 })}
      </div>
    </div>
    <div>
      <h3 className="text-2xl font-black text-gray-800 leading-none">{value}</h3>
      <p className="text-gray-400 text-xs font-bold mt-1 tracking-wide">{title}</p>
    </div>
  </div>
);

const ActivityItem = ({ icon, title, desc, time }) => (
  <div className="flex items-start">
    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 mr-4 shrink-0 mt-0.5 border border-gray-100">
      {React.cloneElement(icon, { size: 14 })}
    </div>
    <div>
      <p className="text-sm font-bold text-gray-800 leading-snug">{title}</p>
      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
    </div>
    <span className="ml-auto text-[10px] text-gray-400 font-medium whitespace-nowrap">{time}</span>
  </div>
);

const ActionBtn = ({ label, count, onClick }) => (
  <button onClick={onClick} className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 text-gray-700 rounded-xl font-bold text-sm border border-gray-100 hover:bg-gray-100 hover:border-gray-200 transition-colors group">
    {label}
    <div className="flex items-center">
      {count && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full mr-2">{count}</span>}
      <ArrowRight size={16} className="text-gray-300 group-hover:text-schoolGreen transition-colors" />
    </div>
  </button>
);

export default AdminView;