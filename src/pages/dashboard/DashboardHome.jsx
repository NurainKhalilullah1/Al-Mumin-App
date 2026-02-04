import React from 'react';
import AdminView from './AdminView';
import StudentView from './StudentView';
import TeacherView from './TeacherView';

const DashboardHome = () => {
  // Read role from storage
  const userRole = localStorage.getItem('userRole') || 'student';

  // Render the correct dashboard
  if (userRole === 'admin') return <AdminView />;
  if (userRole === 'teacher') return <TeacherView />;
  return <StudentView />;
};

export default DashboardHome;