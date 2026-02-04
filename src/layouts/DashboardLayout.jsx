import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, Settings, LogOut,
  Menu, Bell, Search, GraduationCap, BookOpen,
  Calendar, UserPlus, CheckSquare, X
} from 'lucide-react';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const userRole = localStorage.getItem('userRole') || 'student';

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const menus = {
    admin: [
      { name: 'Cockpit', icon: <LayoutDashboard size={20} />, path: '/portal/dashboard' },
      { name: 'Payments', icon: <CheckSquare size={20} />, path: '/portal/admin-payments' }, // <--- NEW Payment Link
      { name: 'Notices', icon: <Bell size={20} />, path: '/portal/admin-notices' },
      { name: 'Admissions', icon: <UserPlus size={20} />, path: '/portal/admissions' },
      { name: 'Staff', icon: <Users size={20} />, path: '/portal/staff' },
      { name: 'Classes', icon: <CheckSquare size={20} />, path: '/portal/admin-classes' },
      { name: 'Subjects', icon: <BookOpen size={20} />, path: '/portal/admin-subjects' },
      { name: 'Results', icon: <FileText size={20} />, path: '/portal/results' },
      { name: 'Students', icon: <GraduationCap size={20} />, path: '/portal/students' },
      { name: 'Settings', icon: <Settings size={20} />, path: '/portal/settings' },
    ],
    teacher: [
      { name: 'Workstation', icon: <LayoutDashboard size={20} />, path: '/portal/dashboard' },
      { name: 'Notice Board', icon: <Bell size={20} />, path: '/portal/noticeboard' },
      { name: 'My Classes', icon: <Users size={20} />, path: '/portal/classes' },
      { name: 'All Classes', icon: <GraduationCap size={20} />, path: '/portal/staff-classes' },
      { name: 'Subjects', icon: <BookOpen size={20} />, path: '/portal/staff-subjects' },
      { name: 'Input Scores', icon: <CheckSquare size={20} />, path: '/portal/scores' },
      { name: 'Lesson Notes', icon: <FileText size={20} />, path: '/portal/lesson-notes' },
      { name: 'Assignments', icon: <BookOpen size={20} />, path: '/portal/assignments' },
    ],
    student: [
      { name: 'My Portal', icon: <LayoutDashboard size={20} />, path: '/portal/dashboard' },
      { name: 'Payments', icon: <CheckSquare size={20} />, path: '/portal/student-payments' }, // <--- NEW Payment Link
      { name: 'Notice Board', icon: <Bell size={20} />, path: '/portal/noticeboard' },
      { name: 'Check Result', icon: <FileText size={20} />, path: '/portal/result-sheet' },
      { name: 'Timetable', icon: <Calendar size={20} />, path: '/portal/timetable' },
      { name: 'Assignments', icon: <BookOpen size={20} />, path: '/portal/assignments' },
    ]
  };

  const currentMenu = menus[userRole] || menus.student;

  const userLabels = {
    admin: { title: 'Principal', sub: 'Admin Access', badge: 'P', color: 'bg-schoolGreen' },
    teacher: { title: 'Class Teacher', sub: 'Staff Access', badge: 'T', color: 'bg-blue-600' },
    student: { title: 'Student', sub: 'JSS 2A', badge: 'S', color: 'bg-schoolGold' }
  };
  const currentUser = userLabels[userRole] || userLabels.student;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans relative overflow-hidden" >

      {/* BACKGROUND MESH */}
      < div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-green-50 to-transparent pointer-events-none z-0" ></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-schoolGold/10 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="absolute top-40 -left-20 w-72 h-72 bg-schoolGreen/5 rounded-full blur-3xl pointer-events-none z-0"></div>

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed inset-y-4 left-4 z-50 w-72 bg-schoolGreen/95 backdrop-blur-xl text-white rounded-3xl shadow-2xl 
        transform transition-transform duration-500 ease-out border border-white/20
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-[200%]'} lg:translate-x-0 lg:static lg:h-[calc(100vh-2rem)] lg:my-4 lg:ml-4
        flex flex-col
        print:hidden
      `}>

        {/* Logo Area */}
        <div className="h-24 flex items-center justify-center border-b border-white/10 relative">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg mb-2">
              <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
            </div>
            <span className="font-serif font-bold text-lg tracking-wider text-white">Al-Mumin</span>
          </div>
          {/* Close Mobile Menu */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 lg:hidden p-2 text-white/50 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 px-4">Menu</div>
          {currentMenu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${isActive
                  ? 'bg-white text-schoolGreen font-bold shadow-lg shadow-black/5'
                  : 'text-white/70 hover:bg-white/10 hover:text-white hover:shadow-inner'
                  }`}
              >
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-schoolGold"></div>}
                <span className={`mr-3 relative z-10 transition-transform group-hover:scale-110 ${isActive ? 'text-schoolGreen' : 'text-schoolGold'}`}>
                  {item.icon}
                </span>
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Mini & Logout */}
        <div className="p-4 bg-black/20 m-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${currentUser.color}`}>
              {currentUser.badge}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{currentUser.title}</p>
              <p className="text-[10px] text-white/60 truncate uppercase tracking-wider">{currentUser.sub}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2.5 bg-red-500/20 text-red-200 text-sm font-bold rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/30"
          >
            <LogOut size={16} className="mr-2" /> Sign Out
          </button>
        </div>

      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col min-w-0 h-screen z-10">

        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-6 lg:px-10 shrink-0 print:hidden relative z-40">
          {/* Mobile Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-gray-500 hover:text-schoolGreen hover:bg-white rounded-xl transition shadow-sm bg-white/50 backdrop-blur"
          >
            <Menu />
          </button>

          {/* Search Bar - Glassy */}
          <div className="hidden md:flex items-center bg-white/60 backdrop-blur-md rounded-2xl px-4 py-2.5 w-96 border border-white shadow-sm focus-within:ring-2 focus-within:ring-schoolGreen/20 transition-all hover:bg-white/80">
            <Search size={18} className="text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Search students, classes, records..."
              className="bg-transparent border-none outline-none text-sm w-full text-gray-700 font-medium placeholder-gray-400"
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-right">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
            </div>

            <button className="relative p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-400 hover:text-schoolGreen hover:-translate-y-0.5 transition-all">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Load */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 pt-0 scroll-smooth print:p-0 print:overflow-visible custom-scrollbar">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>

      </div>

      {/* Mobile Overlay */}
      {
        sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm print:hidden animate-in fade-in duration-300"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )
      }
    </div >
  );
};

export default DashboardLayout;