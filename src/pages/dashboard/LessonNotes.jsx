import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Plus, Trash2, X, CheckCircle, Clock, Paperclip } from 'lucide-react';
import { getLessonNotes, saveLessonNote, deleteLessonNote } from '../../utils/db'; // <--- DB IMPORTS
import { useToast } from '../../components/ToastProvider'; // <--- TOAST IMPORT

const LessonNotes = () => {
  const notify = useToast();

  // --- STATE ---
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState([]); // Real DB Data

  // Input States
  const [week, setWeek] = useState('Week 1');
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const fileInputRef = useRef(null);

  // FETCH NOTES ON LOAD
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const data = await getLessonNotes();
      setNotes((data || []).reverse()); // Show newest first
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  };

  // --- ACTIONS ---

  const handleDelete = (idToDelete) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      deleteLessonNote(idToDelete);
      loadNotes();
      notify.success("Lesson note deleted successfully.");
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const onUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!topic || !content) {
      notify.error("Please fill in all required fields.");
      return;
    }

    const newNote = {
      week, topic, content,
      fileName: selectedFile ? selectedFile.name : null,
      // Status & Date handled in db.js
    };

    saveLessonNote(newNote);
    loadNotes();

    // Reset Everything
    setShowModal(false);
    setTopic('');
    setContent('');
    setSelectedFile(null);
    notify.success("Lesson note uploaded! Pending approval.");
  };

  return (
    <div className="animate-in fade-in duration-500 relative min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-schoolGreen">Lesson Notes</h1>
          <p className="text-gray-500 mt-1">Manage your weekly lesson plans. Notes pending approval are yellow.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-schoolGreen text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center shadow-lg hover:bg-schoolGold transition"
        >
          <Plus size={18} className="mr-2" /> Upload New Note
        </button>
      </div>

      {/* NOTES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.length === 0 ? (
          <div className="col-span-3 text-center py-20 border-2 border-dashed border-gray-300 rounded-2xl">
            <p className="text-gray-400 font-bold mb-2">No notes found.</p>
            <p className="text-sm text-gray-500">Your uploaded lesson notes will appear here.</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className={`bg-white p-6 rounded-2xl border shadow-sm relative group transition ${note.status === 'Approved' ? 'border-gray-200' : 'border-yellow-200 bg-yellow-50/30'
              }`}>

              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                  <FileText size={20} />
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full flex items-center gap-1 ${note.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                  {note.status === 'Approved' ? <CheckCircle size={10} /> : <Clock size={10} />}
                  {note.status}
                </span>
              </div>

              <h3 className="font-bold text-gray-800 text-lg truncate">{note.topic}</h3>
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">{note.week} • {note.date}</p>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-12 leading-relaxed">{note.content}</p>

              {/* File Attachment Badge */}
              {note.fileName && (
                <div className="mb-4 flex items-center text-xs text-schoolGreen bg-green-50 px-2 py-1.5 rounded-lg w-max">
                  <Paperclip size={12} className="mr-1" />
                  <span className="truncate max-w-[150px]">{note.fileName}</span>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <button className="flex-1 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded hover:bg-schoolGreen hover:text-white transition">
                  {note.fileName ? 'Download' : 'View'}
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(note.id)}
                  className="py-2 px-3 text-xs font-bold text-red-500 bg-red-50 rounded hover:bg-red-100 hover:text-red-700 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">

            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-red-500 transition"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold text-schoolGreen mb-6">Add Lesson Note</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Week Select */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Week</label>
                <select
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-schoolGreen font-bold"
                  value={week}
                  onChange={(e) => setWeek(e.target.value)}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={`Week ${n}`}>Week {n}</option>)}
                </select>
              </div>

              {/* Topic Input */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Topic</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Intro to Algebra"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-schoolGreen"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              {/* Content Textarea */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Content</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Description..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-schoolGreen resize-none"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                ></textarea>
              </div>

              {/* --- FILE UPLOAD SECTION --- */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Attachment</label>

                {/* Hidden Real Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                />

                {/* Custom Clickable Box */}
                <div
                  onClick={onUploadClick}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${selectedFile ? 'border-schoolGreen bg-green-50' : 'border-gray-300 hover:bg-gray-50 hover:border-schoolGreen'
                    }`}
                >
                  {selectedFile ? (
                    <div className="flex items-center justify-center text-schoolGreen font-bold text-sm">
                      <CheckCircle size={18} className="mr-2" />
                      {selectedFile.name}
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      <Upload className="mx-auto mb-2" size={20} />
                      <span className="text-xs font-bold uppercase">Click to Attach File</span>
                    </div>
                  )}
                </div>

                {/* Remove File Button */}
                {selectedFile && (
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-xs text-red-500 font-bold mt-2 hover:underline"
                  >
                    Remove File
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-schoolGreen text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-schoolGold transition shadow-lg mt-2"
              >
                Save Note
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default LessonNotes;