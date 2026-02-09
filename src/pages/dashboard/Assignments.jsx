import React, { useState, useEffect, useRef } from 'react';
import { Plus, FileText, Calendar, Trash2, X, Upload, Save, CheckCircle, RefreshCw } from 'lucide-react';
import { saveAssignment, getAssignments } from '../../utils/db'; // Ensure saveAssignment is updated to accept file name/url

const Assignments = () => {
  const userRole = localStorage.getItem('userRole');
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('view'); // 'view' or 'post'
  const [tasks, setTasks] = useState([]);

  // Form State
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [form, setForm] = useState({
    classLevel: 'JSS 2',
    subject: 'Mathematics',
    title: '',
    dueDate: '',
    description: ''
  });

  // Load assignments on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const data = await getAssignments();
    setTasks(data || []);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        alert("Please upload a PDF file.");
      }
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    // Pass filename if selected
    const attachment = selectedFile ? selectedFile.name : null;

    await saveAssignment(form.classLevel, form.subject, form.title, form.dueDate, form.description, attachment);

    // Reset and Switch Tab
    await fetchTasks();
    alert("Assignment Posted Successfully!");
    setForm({ ...form, title: '', description: '', dueDate: '' });
    setSelectedFile(null);
    setActiveTab('view');
  };

  return (
    <div className="animate-in fade-in duration-500">

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-schoolGreen">Assignments</h1>
          <p className="text-gray-500 mt-1">Manage homework and project files.</p>
        </div>

        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 mt-4 md:mt-0 flex self-end">
          <button
            onClick={() => setActiveTab('view')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center ${activeTab === 'view' ? 'bg-schoolGreen text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <FileText size={16} className="mr-2" /> View All
          </button>
          {userRole !== 'student' && (
            <button
              onClick={() => setActiveTab('post')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center ${activeTab === 'post' ? 'bg-schoolGreen text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Plus size={16} className="mr-2" /> Post New
            </button>
          )}
        </div>
      </div>

      {/* --- TAB 1: VIEW ASSIGNMENTS --- */}
      {activeTab === 'view' && (
        <div className="grid grid-cols-1 gap-4">
          {tasks.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <FileText size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-700">No Assignments Yet</h3>
              <p className="text-gray-500 text-sm">Click "Post New" to create homework.</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between hover:border-schoolGreen transition group">

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{task.title}</h3>
                    <div className="flex flex-wrap items-center text-xs text-gray-500 gap-3 mt-1">
                      <span className="font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-600">{task.classLevel}</span>
                      <span className="font-bold text-schoolGreen">{task.subject}</span>
                      <span className="flex items-center"><Calendar size={12} className="mr-1" /> Due: {task.dueDate}</span>
                      {task.attachment && <span className="flex items-center text-blue-600"><Upload size={12} className="mr-1" /> {task.attachment}</span>}
                    </div>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-1">{task.description}</p>
                  </div>
                </div>

                <div className="mt-4 md:mt-0 flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right mr-4">
                    <span className="block font-bold text-2xl text-gray-800">{task.submissions}</span>
                    <span className="text-[10px] uppercase font-bold text-gray-400">Submissions</span>
                  </div>
                  {userRole !== 'student' && (
                    <button className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition">
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {/* --- TAB 2: POST ASSIGNMENT --- */}
      {activeTab === 'post' && (
        <div className="bg-white max-w-2xl mx-auto rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative fade-in">
          <div className="bg-schoolGreen h-2 w-full"></div>
          <form onSubmit={handleCreate} className="p-8 md:p-10 space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">New Assignment</h2>
              <p className="text-gray-500 text-sm">Create a new homework task or project.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Class</label>
                <select
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-schoolGreen"
                  value={form.classLevel}
                  onChange={e => setForm({ ...form, classLevel: e.target.value })}
                >
                  {["JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject</label>
                <select
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-schoolGreen"
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                >
                  {["Mathematics", "English", "Physics", "Chemistry", "Biology"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Assignment Title</label>
              <input
                type="text" required
                placeholder="e.g. Algebra Worksheet 2"
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-schoolGreen"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Due Date</label>
              <input
                type="date" required
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-schoolGreen"
                value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Instructions</label>
              <textarea
                rows="4"
                placeholder="Describe the task..."
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-schoolGreen resize-none"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              ></textarea>
            </div>

            {/* File Upload Simulation */}
            <div
              onClick={() => fileInputRef.current.click()}
              className={`border-2 border-dashed ${selectedFile ? 'border-schoolGreen bg-green-50' : 'border-gray-300 hover:bg-gray-50'} rounded-xl p-6 text-center cursor-pointer transition group`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="application/pdf"
              />

              {selectedFile ? (
                <div className="flex flex-col items-center text-schoolGreen">
                  <CheckCircle size={32} className="mb-2" />
                  <span className="text-sm font-bold">{selectedFile.name}</span>
                  <span className="text-xs text-green-600 mt-1">Change File</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-400 group-hover:text-schoolGreen group-hover:scale-105 transition-transform">
                  <Upload size={32} className="mb-2" />
                  <span className="text-xs font-bold uppercase">Click to attach PDF (Optional)</span>
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={() => setActiveTab('view')}
                className="flex-1 py-4 rounded-xl font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-schoolGreen text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-schoolGold transition shadow-lg"
              >
                Post Assignment
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default Assignments;