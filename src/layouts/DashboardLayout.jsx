import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, Settings, LogOut,
  Menu, Bell, Search, GraduationCap, BookOpen,
  Calendar, UserPlus, CheckSquare, X
} from 'lucide-react';
import { getClasses, getStudents, getStaff, getAssignments, getLessonNotes } from '../utils/db'; // Added new imports
import { useToast } from '../components/ToastProvider';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const userRole = localStorage.getItem('userRole') || 'student';

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    toast.success('You have successfully signed out.');
    navigate('/login');
  };

  const menus = {
    admin: [
      { name: 'Workspace', icon: <LayoutDashboard size={20} />, path: '/portal/dashboard' },
      { name: 'Payments', icon: <CheckSquare size={20} />, path: '/portal/admin-payments' },
      { name: 'Notices', icon: <Bell size={20} />, path: '/portal/admin-notices' },
      { name: 'Admissions', icon: <UserPlus size={20} />, path: '/portal/admissions' },
      { name: 'Staff', icon: <Users size={20} />, path: '/portal/staff' },
      { name: 'Staff Leave', icon: <Calendar size={20} />, path: '/portal/staff-leave' },
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
      { name: 'Admission', icon: <UserPlus size={20} />, path: '/portal/staff-admission' },
      { name: 'Staff Leave', icon: <Calendar size={20} />, path: '/portal/staff-leave' },
    ],
    student: [
      { name: 'My Portal', icon: <LayoutDashboard size={20} />, path: '/portal/dashboard' },
      { name: 'Payments', icon: <CheckSquare size={20} />, path: '/portal/student-payments' },
      { name: 'Notice Board', icon: <Bell size={20} />, path: '/portal/noticeboard' },
      { name: 'Check Result', icon: <FileText size={20} />, path: '/portal/result-sheet' },
      { name: 'Timetable', icon: <Calendar size={20} />, path: '/portal/timetable' },
      { name: 'Assignments', icon: <BookOpen size={20} />, path: '/portal/assignments' },
      { name: 'Lesson Notes', icon: <FileText size={20} />, path: '/portal/lesson-notes' },
    ]
  };

  const currentMenu = menus[userRole] || menus.student;

  // --- DYNAMIC USER DATA ---
  const [displayUser, setDisplayUser] = useState({
    title: 'Loading...',
    sub: '...',
    badge: 'U',
    color: 'bg-gray-400'
  });

  React.useEffect(() => {
    const loadUser = async () => {
      const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

      if (userRole === 'admin') {
        // Fetch latest profile or use defaults
        const { getAdminProfile } = await import('../utils/db');
        const profile = await getAdminProfile();
        setDisplayUser({
          title: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.name || 'Administrator',
          sub: profile.role || 'Admin Access',
          badge: 'A',
          color: 'bg-schoolGreen',
          avatar: profile.passport_url // <--- Add Avatar
        });
      } else if (userRole === 'teacher') {
        // Fetch latest staff profile
        const { getStaffByEmail } = await import('../utils/db');
        let staffProfile = storedUser;
        if (storedUser.email) {
          const fresh = await getStaffByEmail(storedUser.email);
          if (fresh) staffProfile = fresh;
        }

        setDisplayUser({
          title: staffProfile.name || `${staffProfile.first_name || ''} ${staffProfile.last_name || ''}`.trim() || 'Staff Member',
          sub: staffProfile.subject || staffProfile.role || 'Teacher',
          badge: 'T',
          color: 'bg-blue-600',
          avatar: staffProfile.passport_url
        });
      } else {
        // Student - Resolve Class Name if missing
        let className = storedUser.classLevel;

        // If classLevel is missing or looks like an ID (number), try to fetch the real name
        if (!className || !isNaN(className)) {
          try {
            const classId = storedUser.current_class_id || storedUser.class_id || className; // fallback to className if it was actually an ID
            if (classId) {
              const classes = await getClasses();
              // Loose equality check for string/number ID mismatch
              const foundClass = classes.find(c => c.id == classId);
              if (foundClass) {
                className = foundClass.name;
              }
            }
          } catch (err) {
            console.error("Error resolving class name:", err);
          }
        }

        setDisplayUser({
          title: storedUser.name || `${storedUser.first_name || ''} ${storedUser.last_name || ''}`.trim() || 'Student',
          sub: className || storedUser.department || 'Student Access',
          badge: 'S',
          color: 'bg-schoolGold',
          avatar: storedUser.passport_url
        });
      }

    };
    loadUser(); // Load immediately

    // Listen for storage events to update avatar immediately across tabs/components
    const handleStorageChange = () => loadUser();
    window.addEventListener('storage', handleStorageChange);
    // Custom event for same-tab updates
    window.addEventListener('user-updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('user-updated', handleStorageChange);
    };
  }, [userRole]);

  const currentUser = displayUser;

  // --- SEARCH LOGIC ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  React.useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchQuery.length < 2) {
        setSearchResults(null);
        return;
      }

      setSearching(true);
      const query = searchQuery.toLowerCase();

      // 1. Pages
      const menuResults = currentMenu.filter(m => m.name.toLowerCase().includes(query)).map(m => ({ type: 'Page', ...m }));

      try {
        const [classes, students, staff, assignments, notes] = await Promise.all([
          getClasses(),
          getStudents(),
          getStaff(),
          getAssignments(), // Fetch Assignments
          getLessonNotes()  // Fetch Lesson Notes
        ]);

        // 2. Classes
        const classResults = classes.filter(c => c.name.toLowerCase().includes(query)).map(c => ({ type: 'Class', name: c.name, id: c.id }));

        // 3. Students
        const studentResults = students.filter(s => s.name.toLowerCase().includes(query)).map(s => ({ type: 'Student', name: s.name, detail: s.classLevel || s.class, id: s.id }));

        // 4. Staff
        const staffResults = staff.filter(s => s.name.toLowerCase().includes(query)).map(s => ({ type: 'Staff', name: s.name, detail: s.role, id: s.id }));

        // 5. Assignments
        const assignmentResults = (assignments || []).filter(a => a.title.toLowerCase().includes(query)).map(a => ({ type: 'Assignment', name: a.title, detail: `${a.subject} (${a.classLevel})`, id: a.id }));

        // 6. Lesson Notes
        const noteResults = (notes || []).filter(n => n.topic.toLowerCase().includes(query)).map(n => ({ type: 'Lesson Note', name: n.topic, detail: `Week ${n.week}`, id: n.id }));

        setSearchResults([
          ...menuResults,
          ...classResults,
          ...studentResults,
          ...staffResults,
          ...assignmentResults,
          ...noteResults
        ].slice(0, 10)); // Increased limit
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchQuery, currentMenu]);

  const handleSearchResultClick = (result) => {
    setSearchQuery('');
    setSearchResults(null);

    if (result.type === 'Page') {
      navigate(result.path);
    } else if (result.type === 'Class') {
      if (userRole === 'teacher') {
        navigate('/portal/classes', { state: { selectedClassName: result.name } });
      } else {
        navigate('/portal/students', { state: { selectedClassName: result.name } });
      }
    } else if (result.type === 'Student') {
      if (userRole === 'teacher') {
        navigate('/portal/classes', { state: { selectedClassName: result.detail } });
      } else {
        navigate('/portal/students', { state: { selectedClassName: result.detail, highlightStudentId: result.id } });
      }
    } else if (result.type === 'Staff') {
      navigate('/portal/staff');
    } else if (result.type === 'Assignment') {
      navigate('/portal/assignments');
    } else if (result.type === 'Lesson Note') {
      navigate('/portal/lesson-notes');
    }
  };

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
            <span className="font-serif font-bold text-lg tracking-wider text-white">Al-Mumin Schools</span>
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
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${currentUser.color} overflow-hidden`}>
              {currentUser.avatar ? <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" /> : currentUser.badge}
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








          {/* Search Bar - Glassy & Functional */}
          <div className="hidden md:flex flex-col relative z-50">
            <div className="flex items-center bg-white/60 backdrop-blur-md rounded-2xl px-4 py-2.5 w-96 border border-white shadow-sm focus-within:ring-2 focus-within:ring-schoolGreen/20 transition-all hover:bg-white/80">
              <Search size={18} className="text-gray-400 mr-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students, classes, or pages..."
                className="bg-transparent border-none outline-none text-sm w-full text-gray-700 font-medium placeholder-gray-400"
              />
              {searching && <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-schoolGreen rounded-full"></div>}
            </div>

            {/* Results Dropdown */}
            {searchResults && (searchQuery.length > 1) && (
              <div className="absolute top-14 left-0 w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                {searchResults.length > 0 ? (
                  <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto">
                    {searchResults.map((res, idx) => (
                      <div key={idx} onClick={() => handleSearchResultClick(res)} className="px-4 py-3 hover:bg-schoolGreen/5 cursor-pointer transition flex items-center gap-3 group">
                        <div className={`p-2 rounded-lg ${res.type === 'Page' ? 'bg-blue-50 text-blue-500' : res.type === 'Student' ? 'bg-purple-50 text-purple-500' : 'bg-orange-50 text-orange-500'}`}>
                          {res.type === 'Page' ? <LayoutDashboard size={14} /> : res.type === 'Student' ? <GraduationCap size={14} /> : res.type === 'Class' ? <CheckSquare size={14} /> : <UserPlus size={14} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-700 group-hover:text-schoolGreen">{res.name}</p>
                          {res.detail && <p className="text-[10px] text-gray-400 uppercase tracking-wider">{res.detail}</p>}
                          {!res.detail && <p className="text-[10px] text-gray-400 uppercase tracking-wider">{res.type}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-gray-400">No results found.</div>
                )}
              </div>
            )}
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