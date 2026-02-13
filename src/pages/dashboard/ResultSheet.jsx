import React, { useEffect, useState } from 'react';
import { Printer, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getStudentAttendanceStats, getAvailableResultTerms, getStudentResultsByTerm, getPsychomotor, getClassRemark, getAdminProfile } from '../../utils/db';

const ResultSheet = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [viewState, setViewState] = useState('selection'); // 'selection' or 'report'
  const [availableTerms, setAvailableTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState('');

  // Data for Report
  const [studentProfile, setStudentProfile] = useState(null);
  const [termResult, setTermResult] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState({ total: 0, present: 0 });

  useEffect(() => {
    // Initial Load: Check User & Available Terms
    const init = async () => {
      const userStr = localStorage.getItem('currentUser');
      if (!userStr) return;
      const user = JSON.parse(userStr);

      // 1. Set Profile Basic Info
      const fullName = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || "Student";
      setStudentProfile({
        id: user.id,
        name: fullName,
        admNo: user.admission_number || "N/A",
        class: user.class_level || user.classLevel || "N/A",
        session: "2025/2026" // Default or fetch
      });

      // 2. Fetch Available Terms from DB
      const terms = await getAvailableResultTerms(user.id);
      setAvailableTerms(terms);
      setLoading(false);
    };
    init();
  }, []);

  const handleCheckResult = async () => {
    if (!selectedTerm || !studentProfile) return;
    setLoading(true);

    // Fetch Specific Result
    const data = await getStudentResultsByTerm(studentProfile.id, selectedTerm);
    const attStats = await getStudentAttendanceStats(studentProfile.id);
    const psychomotor = await getPsychomotor(studentProfile.id, selectedTerm);
    const remark = await getClassRemark(studentProfile.class, selectedTerm); // Use profile class or fetch from DB if needed

    // Fetch Principal Signature (Admin Profile)
    const adminProfile = await getAdminProfile();

    setTermResult({ ...data, psychomotor, principalRemark: remark, signature: adminProfile.signature });
    setAttendanceStats(attStats);
    setViewState('report');
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-schoolGreen border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // --- VIEW 1: SELECTION SCREEN ---
  if (viewState === 'selection') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center border border-gray-100">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-schoolGreen">
            <Printer size={32} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">Check Results</h2>
          <p className="text-gray-500 text-sm mb-8">Select a term to view your approved report sheet.</p>

          <div className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Select Term</label>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 font-bold text-gray-700 outline-none focus:border-schoolGreen transition appearance-none"
              >
                <option value="">-- Choose Term --</option>
                {availableTerms.map(term => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
            </div>

            {availableTerms.length === 0 && (
              <div className="p-4 bg-yellow-50 text-yellow-700 text-xs rounded-xl flex items-center">
                <AlertCircle size={16} className="mr-2" />
                No results found for your account yet.
              </div>
            )}

            <button
              onClick={handleCheckResult}
              disabled={!selectedTerm}
              className="w-full py-4 rounded-xl bg-schoolGreen text-white font-bold shadow-lg shadow-green-200 hover:bg-schoolGold transition disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              View Result Sheet
            </button>

            <button onClick={() => navigate(-1)} className="w-full py-4 text-gray-400 font-bold text-xs hover:text-gray-600">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: REPORT SHEET ---
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex flex-col items-center print:bg-white print:p-0 print:block">
      <style>
        {`
          @media print {
            @page { size: A4; margin: 0; }
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            .result-page { page-break-after: always; width: 100%; height: 100vh; overflow: hidden; padding: 2rem; }
            .result-page:last-child { page-break-after: auto; }
            .print-hidden { display: none !important; }
          }
        `}
      </style>

      {/* CONTROLS */}
      <div className="w-full max-w-[210mm] flex justify-between items-center mb-6 print:hidden">
        <button onClick={() => setViewState('selection')} className="flex items-center text-gray-600 hover:text-schoolGreen font-bold">
          <X size={20} className="mr-2" /> Close View
        </button>
        <button onClick={handlePrint} className="flex items-center bg-schoolGreen text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-schoolGold transition">
          <Printer size={18} className="mr-2" /> Print Result
        </button>
      </div>

      {/* REPORT CARD */}
      <div className="result-page bg-white w-full max-w-[210mm] min-h-[297mm] p-8 md:p-12 shadow-2xl relative overflow-hidden mb-8 print:mb-0 print:shadow-none print:w-full print:max-w-none">

        {/* WATERMARK */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <img src="/logo.png" className="w-[500px]" alt="Watermark" />
        </div>

        {/* HEADER */}
        <div className="flex items-center justify-between border-b-4 border-schoolGreen pb-4 mb-6">
          <img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain" />
          <div className="text-center">
            <h1 className="font-serif font-bold text-2xl text-schoolGreen uppercase tracking-wide">Al-Mumin College</h1>
            <p className="text-gray-600 text-xs font-bold tracking-widest uppercase mt-1">Seeking Knowledge From Cradle To Grave</p>
            <p className="text-[10px] text-gray-500 mt-1">12, Al-Mumin Avenue, GRA, Ilorin.</p>
          </div>
          <div className="w-20 h-20 bg-gray-100 border border-gray-300 flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase text-center p-1">
            Passport
          </div>
        </div>

        {/* STUDENT INFO */}
        <div className="bg-schoolGreen/5 border border-schoolGreen p-3 rounded-lg mb-6 print:bg-transparent print:border-gray-300">
          <h2 className="text-center font-bold text-schoolGreen uppercase underline mb-2 text-sm">
            Student Report Sheet - {termResult?.termName}
          </h2>
          <div className="grid grid-cols-4 gap-y-2 gap-x-4 text-xs">
            <div><span className="font-bold text-gray-500 uppercase block">Name:</span> <span className="font-serif font-bold text-sm text-gray-900">{studentProfile?.name}</span></div>
            <div><span className="font-bold text-gray-500 uppercase block">Adm No:</span> <span className="font-bold text-gray-900">{studentProfile?.admNo}</span></div>
            <div><span className="font-bold text-gray-500 uppercase block">Class:</span> <span className="font-bold text-gray-900">{studentProfile?.class}</span></div>
            <div><span className="font-bold text-gray-500 uppercase block">Session:</span> <span className="font-bold text-gray-900">{studentProfile?.session}</span></div>
          </div>
        </div>

        {/* --- MAIN SCORES TABLE --- */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs mb-6 border-collapse border border-gray-300 min-w-[600px] md:min-w-0">
            <thead>
              <tr className="bg-schoolGreen text-white uppercase text-[10px] print:bg-gray-200 print:text-black">
                <th className="border border-gray-300 p-2 text-left w-1/3 min-w-[150px]">Subject</th>
                <th className="border border-gray-300 p-1 text-center w-12">T1 (10)</th>
                <th className="border border-gray-300 p-1 text-center w-12">T2 (10)</th>
                <th className="border border-gray-300 p-1 text-center w-12">Mid (20)</th>
                <th className="border border-gray-300 p-1 text-center w-12">Exam (60)</th>
                <th className="border border-gray-300 p-1 text-center w-12 font-bold bg-schoolGreen/20 text-black">Total</th>
                <th className="border border-gray-300 p-1 text-center w-12">Grade</th>
                <th className="border border-gray-300 p-2 text-left min-w-[100px]">Remark</th>
              </tr>
            </thead>
            <tbody>
              {termResult?.isPending ? (
                <tr>
                  <td colSpan="8" className="text-center p-8 text-gray-500 italic border border-gray-300">
                    <AlertCircle className="inline-block mr-2 text-schoolGold" size={20} />
                    Results for this term are currently awaiting approval. Please check back later.
                  </td>
                </tr>
              ) : termResult?.results.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center p-8 text-gray-500 italic border border-gray-300">
                    No approved results recorded for this term yet.
                  </td>
                </tr>
              ) : (
                termResult?.results.map((row, rIndex) => (
                  <tr key={rIndex} className="even:bg-gray-50 print:even:bg-transparent">
                    <td className="border border-gray-300 p-2 font-bold text-gray-800">{row.subject}</td>

                    {/* BREAKDOWN COLUMNS */}
                    <td className="border border-gray-300 p-1 text-center text-gray-600">{row.test1 || '-'}</td>
                    <td className="border border-gray-300 p-1 text-center text-gray-600">{row.test2 || '-'}</td>
                    <td className="border border-gray-300 p-1 text-center text-gray-600">{row.midTerm || '-'}</td>
                    <td className="border border-gray-300 p-1 text-center text-gray-600 font-bold">{row.exam || '-'}</td>

                    {/* TOTAL & GRADE */}
                    <td className="border border-gray-300 p-1 text-center font-bold text-schoolGreen bg-green-50">{row.total}</td>
                    <td className={`border border-gray-300 p-1 text-center font-bold ${row.grade === 'F' ? 'text-red-600' : 'text-gray-800'}`}>{row.grade || '-'}</td>
                    <td className="border border-gray-300 p-2 text-[10px] uppercase font-bold text-gray-500 truncate max-w-[150px]">{row.remark}</td>
                  </tr>
                )))}
            </tbody>
          </table>
        </div>

        {/* BOTTOM SECTION */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-bold text-schoolGreen uppercase text-[10px] mb-1 border-b border-gray-300">Affective Domain</h3>
            <table className="w-full text-[10px] border border-gray-300">
              <tbody>
                {['punctuality', 'neatness', 'politeness', 'honesty', 'leadership'].map((item) => (
                  <tr key={item} className="border-b border-gray-300">
                    <td className="p-1 pl-2 font-bold text-gray-600 capitalize">{item}</td>
                    <td className="p-1 text-center font-bold">
                      {termResult?.psychomotor?.[item] || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="font-bold text-schoolGreen uppercase text-[10px] mb-1 border-b border-gray-300">Attendance</h3>
            <div className="border border-gray-300 p-2 rounded bg-gray-50 text-center print:bg-transparent">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="block text-xl font-bold text-gray-800">{attendanceStats.total || '-'}</span><span className="text-[10px] uppercase text-gray-500">Opened</span></div>
                <div><span className="block text-xl font-bold text-schoolGreen">{attendanceStats.present || '-'}</span><span className="text-[10px] uppercase text-gray-500">Present</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 mt-8">
          <div className="border-b border-gray-300 pb-1">
            <span className="uppercase text-[10px] font-bold text-gray-500 mr-2">Principal's Remark:</span>
            <span className="font-serif italic text-xs text-gray-800">{termResult?.principalRemark || "Excellent performance. Keep it up!"}</span>
          </div>
          <div className="flex justify-between items-end pt-4">
            <div className="text-center">
              {termResult?.signature ? (
                <img src={termResult.signature} alt="Principal Signature" className="h-12 mx-auto mb-1" />
              ) : (
                <div className="h-12 flex items-end justify-center">
                  <div className="w-24 border-b border-black mb-1"></div>
                </div>
              )}
              <p className="text-[10px] font-bold uppercase text-gray-500">Principal's Signature</p>
            </div>
            <div className="text-center">
              <p className="font-serif font-bold text-sm text-schoolGreen">{new Date().toLocaleDateString()}</p>
              <div className="w-24 border-b border-black mb-1"></div>
              <p className="text-[10px] font-bold uppercase text-gray-500">Date</p>
            </div>
            <div className="text-center opacity-80">
              <div className="w-16 h-16 rounded-full border-2 border-blue-900 text-blue-900 flex items-center justify-center text-[8px] font-bold uppercase transform -rotate-12">
                Official Stamp
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResultSheet;