import React, { useState, useEffect } from 'react';
import { Plus, FileText, Calendar, Trash2, X, Upload } from 'lucide-react';
import { saveAssignment, getAssignments } from '../../utils/db';

const Assignments = () => {
  // --- STATE ---
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [form, setForm] = useState({
    classLevel: 'JSS 2',
    subject: 'Mathematics',
    title: '',
    dueDate: '',
    description: ''
  });

  // Load assignments on mount
  useEffect(() => {
    setTasks(getAssignments());
  }, []);

  const handleCreate = (e) => {
    e.preventDefault();
    saveAssignment(form.classLevel, form.subject, form.title, form.dueDate, form.description);
    setTasks(getAssignments()); // Refresh list
    setShowModal(false); // Close modal
    setForm({ ...form, title: '', description: '' }); // Reset form
  };

  return (
    <div className="animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-schoolGreen">Assignments</h1>
          <p className="text-gray-500 mt-1">Manage homework and project files.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-schoolGreen text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center shadow-lg hover:bg-schoolGold transition"
        >
          <Plus size={18} className="mr-2" /> Create New Assignment
        </button>
      </div>

      {/* --- ASSIGNMENT LIST --- */}
      <div className="grid grid-cols-1 gap-4">
        {tasks.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <FileText size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-700">No Assignments Yet</h3>
            <p className="text-gray-500 text-sm">Click "Create New" to post homework.</p>
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
                  <div className="flex items-center text-xs text-gray-500 gap-3 mt-1">
                    <span className="font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-600">{task.classLevel}</span>
                    <span className="font-bold text-schoolGreen">{task.subject}</span>
                    <span className="flex items-center"><Calendar size={12} className="mr-1"/> Due: {task.dueDate}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-1">{task.description}</p>
                </div>
              </div>

              <div className="mt-4 md:mt-0 flex items-center gap-4">
                <div className="text-right hidden md:block mr-4">
                  <span className="block font-bold text-2xl text-gray-800">{task.submissions}</span>
                  <span className="text-[10px] uppercase font-bold text-gray-400">Submissions</span>
                </div>
                <button className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition">
                  <Trash2 size={20} />
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* --- CREATE MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-serif font-bold text-schoolGreen mb-6">Post Homework</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Class</label>
                  <select 
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-schoolGreen"
                    value={form.classLevel}
                    onChange={e => setForm({...form, classLevel: e.target.value})}
                  >
                    {["JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject</label>
                  <select 
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-schoolGreen"
                    value={form.subject}
                    onChange={e => setForm({...form, subject: e.target.value})}
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
                  onChange={e => setForm({...form, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Due Date</label>
                <input 
                  type="date" required
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-schoolGreen"
                  value={form.dueDate}
                  onChange={e => setForm({...form, dueDate: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Instructions</label>
                <textarea 
                  rows="3"
                  placeholder="Describe the task..."
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-schoolGreen resize-none"
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                ></textarea>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-400 hover:bg-gray-50 hover:border-schoolGreen cursor-pointer transition">
                <Upload className="mx-auto mb-2" size={24} />
                <span className="text-xs font-bold uppercase">Click to attach PDF (Optional)</span>
              </div>

              <button 
                type="submit"
                className="w-full bg-schoolGreen text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-schoolGold transition shadow-lg mt-4"
              >
                Post Assignment
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default Assignments;