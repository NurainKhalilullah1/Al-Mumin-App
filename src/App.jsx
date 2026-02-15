import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { ToastProvider } from './components/ToastProvider'; // <--- NEW IMPORT

// Import Pages
import Home from './pages/Home';
import About from './pages/About';
import Admissions from './pages/Admissions';
import Gallery from './pages/Gallery';
import Login from './pages/Login';
import NotFound from './pages/NotFound'; // <--- NEW IMPORT

// Import Dashboard Components
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute'; // <--- IMPORT ADDED CORRECTLY
import DashboardHome from './pages/dashboard/DashboardHome';
import AdminStudents from './pages/dashboard/AdminStudents'; // <--- MISSING IMPORT FIXED
import AdminAdmissions from './pages/dashboard/AdminAdmissions'; // <--- MISSING IMPORT FIXED
import ResultSheet from './pages/dashboard/ResultSheet'; // <--- 1. MAKE SURE THIS IS IMPORTED
import ScoreSheet from './pages/dashboard/ScoreSheet';
import MyClasses from './pages/dashboard/MyClasses';
import LessonNotes from './pages/dashboard/LessonNotes';
import Assignments from './pages/dashboard/Assignments';
import Staff from './pages/dashboard/Staff';
import Settings from './pages/dashboard/Settings';
import AdminResults from './pages/dashboard/AdminResults'; // <--- NEW // <--- NEW IMPORT
import StudentTimetable from './pages/dashboard/StudentTimetable'; // <--- NEW
import AdminClasses from './pages/dashboard/AdminClasses'; // <--- NEW
import AdminSubjects from './pages/dashboard/AdminSubjects'; // <--- NEW
import StaffClasses from './pages/dashboard/StaffClasses'; // <--- NEW
import StaffSubjects from './pages/dashboard/StaffSubjects'; // <--- NEW
import AdminNotices from './pages/dashboard/AdminNotices';
import NoticeBoard from './pages/dashboard/NoticeBoard';
import AdminPayments from './pages/dashboard/AdminPayments'; // <--- NEW IMPORT
import StudentPayments from './pages/dashboard/StudentPayments'; // <--- NEW IMPORT
import StaffAdmission from './pages/dashboard/StaffAdmission'; // <--- NEW IMPORT
import StaffAdmission from './pages/dashboard/StaffAdmission'; // <--- NEW IMPORT
import StudentSettings from './pages/dashboard/StudentSettings'; // <--- NEW IMPORT
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};


function App() {
  const isNative = Capacitor.isNativePlatform();

  return (
    <BrowserRouter>
      <ToastProvider>
        <ScrollToTop />
        <Routes>
          {/* ... routes ... */}
          {/* --- PUBLIC WEBSITE ROUTES --- */}
          {/* Redirect to Login if on Mobile App, else show Landing Page */}
          <Route path="/" element={isNative ? <Navigate to="/login" replace /> : <Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/gallery" element={<Gallery />} />

          <Route path="/login" element={<Login />} />

          {/* --- PROTECTED DASHBOARD ROUTES --- */}
          <Route path="/portal" element={<ProtectedRoute />}> {/* Base Login Check */}
            <Route element={<DashboardLayout />}>

              {/* COMMON: Dashboard Home (Handles View Switching) */}
              <Route path="dashboard" element={<DashboardHome />} />
              <Route path="noticeboard" element={<NoticeBoard />} />
              <Route path="timetable" element={<StudentTimetable />} />
              <Route path="result-sheet" element={<ResultSheet />} />
              <Route path="lesson-notes" element={<LessonNotes />} />
              <Route path="assignments" element={<Assignments />} />

              {/* --- ADMIN ONLY ROUTES --- */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="students" element={<AdminStudents />} />
                <Route path="results" element={<AdminResults />} />
                <Route path="admin-classes" element={<AdminClasses />} />
                <Route path="admin-subjects" element={<AdminSubjects />} />
                <Route path="staff" element={<Staff />} />
                <Route path="settings" element={<Settings />} />
                <Route path="admin-notices" element={<AdminNotices />} />
                <Route path="admissions" element={<AdminAdmissions />} />
                <Route path="admin-payments" element={<AdminPayments />} />
              </Route>

              {/* --- STAFF/TEACHER ROUTES --- */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'staff']} />}>
                <Route path="staff-classes" element={<StaffClasses />} />
                <Route path="staff-subjects" element={<StaffSubjects />} />
                <Route path="classes" element={<MyClasses />} />
                <Route path="scores" element={<ScoreSheet />} />
                <Route path="staff-admission" element={<StaffAdmission />} />
              </Route>

              {/* --- STUDENT ROUTES --- */}
              <Route path="student-payments" element={<StudentPayments />} />
              <Route path="student-settings" element={<StudentSettings />} />

            </Route>
          </Route>

          {/* 404 - Page Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;