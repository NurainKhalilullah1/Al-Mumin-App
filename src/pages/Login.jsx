import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useToast } from '../components/ToastProvider';

const Login = () => {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const notify = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (role === 'admin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) throw error;

        notify.success("Welcome back, Admin!");
        localStorage.setItem('userRole', 'admin'); // <--- Fix: Set Role
        navigate('/portal/dashboard');
      }
      else if (role === 'student') {
        // Authenticate against 'students' table
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('admission_number', email.trim()) // Using email input field for Admission Number
          .eq('password', password.trim())
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Login Error:", error);
          throw error;
        }
        if (!data) throw new Error("Invalid Student ID or Password");

        localStorage.setItem('userRole', 'student');
        localStorage.setItem('currentUser', JSON.stringify(data));
        const studentName = data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Student';
        notify.success(`Welcome, ${studentName}!`);
        navigate('/portal/dashboard');
      }
      else if (role === 'teacher' || role === 'staff') {
        // 'teacher' in UI usually maps to 'staff' in DB
        const { data, error } = await supabase
          .from('staff')
          .select('*')
          .eq('email', email.trim()) // Trim Logic
          .eq('password', password.trim()) // Trim Logic
          .limit(1) // Handle duplicates
          .maybeSingle(); // Prevent 406/JSON error

        if (error) {
          console.error("Login Error:", error);
          throw new Error("Login Error: " + error.message);
        }

        if (!data) throw new Error("Invalid Staff Email or Password");

        localStorage.setItem('userRole', 'teacher');
        localStorage.setItem('currentUser', JSON.stringify(data));
        const staffName = data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Staff Member';
        notify.success(`Welcome, ${staffName}!`);
        navigate('/portal/dashboard');
      }
    } catch (err) {
      notify.error(err.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">

      {/* --- LEFT SIDE: NAVY BLUE --- */}
      <div className="hidden lg:flex lg:w-1/2 bg-schoolGreen relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <img
          src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          alt="School Building"
        />

        <div className="relative z-10 text-center text-white p-12 max-w-lg">

          {/* --- REAL LOGO HERE --- */}
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl border-4 border-schoolGold p-2">
            <img
              src="/logo.png"
              alt="Al-Mumin Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <h1 className="text-5xl font-serif font-bold mb-6">Welcome Back</h1>
          <p className="text-gray-200 text-lg leading-relaxed font-light">
            "Seeking Knowledge From Cradle To Grave"
          </p>
        </div>
      </div>

      {/* --- RIGHT SIDE: FORM --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 bg-cream relative">
        <Link to="/" className="absolute top-8 left-8 flex items-center text-gray-400 hover:text-schoolGreen transition text-sm font-bold uppercase tracking-widest">
          <ArrowLeft size={16} className="mr-2" /> Back Home
        </Link>

        <div className="w-full max-w-md bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 relative">

          {/* --- MOBILE/FORM LOGO --- */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-schoolGold p-2">
              <img src="/logo.png" alt="School Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-schoolGreen mb-2">Portal Login</h2>
            <p className="text-gray-500 text-sm">Select your role to continue.</p>
          </div>

          <div className="bg-gray-100 p-1.5 rounded-xl flex mb-8">
            {['student', 'teacher', 'admin'].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2.5 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${role === r
                  ? 'bg-white text-schoolGreen shadow-md scale-105'
                  : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                {role === 'student' ? 'Admission Number' : 'Email Address'}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-schoolGold transition-colors" />
                </div>
                <input
                  type={role === 'student' ? "text" : "email"}
                  placeholder={role === 'student' ? "AMS/2026/001" : "admin@almumin.com"}
                  className="block w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-schoolGold focus:bg-white transition-all outline-none font-medium"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-schoolGold transition-colors" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="block w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-schoolGold focus:bg-white transition-all outline-none font-medium"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-schoolGold text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-schoolGreen transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center group disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Access Portal'}
              {!loading && <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />}
            </button>
          </form>

        </div>

        <div className="mt-8 flex items-center space-x-2 text-gray-400 text-xs uppercase tracking-widest">
          <ShieldCheck size={14} />
          <span>Secured by Al-Mumin IT</span>
        </div>
      </div>
    </div>
  );
};

export default Login;