import React from 'react';
import {
  Users, CreditCard, TrendingUp, UserPlus,
  FileText, CheckCircle, Upload, ArrowRight, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, checkPendingResults, getRecentActivities } from '../../utils/db';

const AdminView = () => {
  const navigate = useNavigate();
  const [stats, setStats] = React.useState({
    students: 0,
    fees: 0,
    admissions: 0,
    staff: 0
  });
  const [hasPendingResults, setHasPendingResults] = React.useState(false);
  const [activities, setActivities] = React.useState([]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const fetchStats = async () => {
    const data = await getDashboardStats();
    setStats(data);

    // Check pending results
    const pending = await checkPendingResults();
    if (pending && pending.hasPending) setHasPendingResults(true);

    // Fetch Activities
    const acts = await getRecentActivities();
    setActivities(acts || []);
  };

  React.useEffect(() => {
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-schoolGreen">Principal's Workspace</h1>
          <p className="text-gray-500 mt-1">{getTimeGreeting()}, Principal.</p>
        </div>
        <button onClick={fetchStats} className="bg-white text-gray-500 p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 hover:text-schoolGreen transition shadow-sm flex items-center gap-2 font-bold text-sm" title="Refresh Data">
          <RefreshCw size={18} /> Refresh Data
        </button>
      </div>

      <div className="animate-in fade-in duration-500">

        {/* PENDING RESULTS ALERT */}
        {hasPendingResults && (
          <div onClick={() => navigate('/portal/results')} className="mb-8 bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-orange-100 transition group">
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total Students" value={stats.students} icon={<Users />} color="bg-blue-600" />
          <StatCard title="Fees Collected" value={formatCurrency(stats.fees)} sub="Verified Payments" icon={<CreditCard />} color="bg-green-600" />
          <StatCard title="Pending Admissions" value={stats.admissions} sub="Action Needed" icon={<UserPlus />} color="bg-orange-500" />
          <StatCard title="Number of Staff" value={stats.staff} icon={<CheckCircle />} color="bg-purple-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Recent Activity Feed */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800">Live Activity Feed</h3>
              <button className="text-sm text-schoolGreen font-bold hover:underline" onClick={fetchStats}>Refresh</button>
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
                    time={new Date(act.time).toLocaleDateString()}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right: Quick Actions */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <h3 className="font-bold text-gray-800 mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <ActionBtn label="New Admission" onClick={() => navigate('/portal/admissions')} />
              <ActionBtn label="Post New Notice" onClick={() => navigate('/portal/notices')} />
              <ActionBtn label="Manage Results" onClick={() => navigate('/portal/results')} />
              <ActionBtn label="View Students" onClick={() => navigate('/portal/students')} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

// --- HELPER COMPONENTS ---

const StatCard = ({ title, value, sub, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center hover:-translate-y-1 transition-transform">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white mr-4 shadow-lg ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800 leading-none mt-1">{value}</h3>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  </div>
);

const ActivityItem = ({ icon, title, desc, time }) => (
  <div className="flex items-start">
    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 mr-4 shrink-0 mt-1">
      {React.cloneElement(icon, { size: 14 })}
    </div>
    <div>
      <p className="text-sm font-bold text-gray-800">{title}</p>
      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
    </div>
    <span className="ml-auto text-[10px] text-gray-400 font-medium">{time}</span>
  </div>
);

const ActionBtn = ({ label, count, onClick }) => (
  <button onClick={onClick} className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 text-gray-700 rounded-xl font-bold text-sm border border-gray-200 hover:bg-gray-100 transition-colors group">
    {label}
    <div className="flex items-center">
      {count && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full mr-2">{count}</span>}
      <ArrowRight size={16} className="text-gray-300 group-hover:text-schoolGreen transition-colors" />
    </div>
  </button>
);

export default AdminView;