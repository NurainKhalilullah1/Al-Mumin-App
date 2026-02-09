import React, { useEffect, useState } from 'react';
import { Printer, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getStudentResults, getStudentAttendanceStats } from '../../utils/db';

const ResultSheet = () => {
  const navigate = useNavigate();
  const [academicRecords, setAcademicRecords] = useState([]);
  const [source, setSource] = useState('loading');
  const [source, setSource] = useState('loading');
  const [studentProfile, setStudentProfile] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState({ total: 0, present: 0 });

  useEffect(() => {
    const fetchAllData = async () => {
      // 1. Get Current Student from Storage
      const userStr = localStorage.getItem('currentUser');
      if (!userStr) {
        setSource('empty');
        return;
      }
      const user = JSON.parse(userStr);

      // Set Profile
      const profile = {
        name: user.name || "Student",
        admNo: user.admission_number || "N/A",
        class: user.classLevel || user.classes?.name || "N/A",
        session: "2025/2026", // Dynamic session could be added later
      };
      setStudentProfile(profile);

      // 2. Fetch Real Data
      const realData = await getStudentResults(user.id);
      const attStats = await getStudentAttendanceStats(user.id);
      setAttendanceStats(attStats);

      if (realData && realData.length > 0) {
        // Calculate Average if real data exists
        const updatedData = realData.map(term => {
          // FILTER: Only show Approved results
          const approvedResults = term.results.filter(r => r.approvalStatus === 'Approved');
          // If NO results are approved, we might want to show a message later

          const totalScore = approvedResults.reduce((acc, curr) => acc + (curr.total || 0), 0);
          const avg = approvedResults.length > 0 ? (totalScore / approvedResults.length).toFixed(1) : 0;

          // Add a flag to indicate if approval is pending for the whole term
          const isPending = term.results.length > 0 && approvedResults.length === 0;

          return { ...term, results: approvedResults, average: avg, isPending };
        });
        setAcademicRecords(updatedData);
        setSource('real');
      } else {
        // 3. Fallback Mock Data if no results found
        setAcademicRecords([
          {
            termName: "Broadsheet Preview (Empty)",
            position: "N/A",
            outOf: "0",
            average: "0.0",
            results: []
          }
        ]);
        setSource('mock');
      }
    };

    fetchAllData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

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
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-schoolGreen font-bold">
          <X size={20} className="mr-2" /> Close View
        </button>
        <div className="flex gap-2">
          {source === 'mock' && (
            <span className="text-xs font-bold px-2 py-1 rounded uppercase bg-yellow-100 text-yellow-700 flex items-center">
              <AlertCircle size={12} className="mr-1" /> Preview Mode
            </span>
          )}
          <button onClick={handlePrint} className="flex items-center bg-schoolGreen text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-schoolGold transition">
            <Printer size={18} className="mr-2" /> Print Result
          </button>
        </div>
      </div>

      {/* RESULTS LOOP */}
      {academicRecords.map((termData, index) => (
        <div key={index} className="result-page bg-white w-full max-w-[210mm] min-h-[297mm] p-8 md:p-12 shadow-2xl relative overflow-hidden mb-8 print:mb-0 print:shadow-none print:w-full print:max-w-none">

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
              Student Report Sheet - {termData.termName}
            </h2>
            <div className="grid grid-cols-4 gap-y-2 gap-x-4 text-xs">
              <div><span className="font-bold text-gray-500 uppercase block">Name:</span> <span className="font-serif font-bold text-sm text-gray-900">{studentProfile?.name}</span></div>
              <div><span className="font-bold text-gray-500 uppercase block">Adm No:</span> <span className="font-bold text-gray-900">{studentProfile?.admNo}</span></div>
              <div><span className="font-bold text-gray-500 uppercase block">Class:</span> <span className="font-bold text-gray-900">{studentProfile?.class}</span></div>
              <div><span className="font-bold text-gray-500 uppercase block">Session:</span> <span className="font-bold text-gray-900">{studentProfile?.session}</span></div>
            </div>
          </div>

          {/* --- MAIN SCORES TABLE --- */}
          <table className="w-full text-xs mb-6 border-collapse border border-gray-300">
            <thead>
              <tr className="bg-schoolGreen text-white uppercase text-[10px] print:bg-gray-200 print:text-black">
                <th className="border border-gray-300 p-2 text-left w-1/3">Subject</th>
                <th className="border border-gray-300 p-1 text-center w-12">T1 (10)</th>
                <th className="border border-gray-300 p-1 text-center w-12">T2 (10)</th>
                <th className="border border-gray-300 p-1 text-center w-12">Mid (20)</th>
                <th className="border border-gray-300 p-1 text-center w-12">Exam (60)</th>
                <th className="border border-gray-300 p-1 text-center w-12 font-bold bg-schoolGreen/20 text-black">Total</th>
                <th className="border border-gray-300 p-1 text-center w-12">Grade</th>
                <th className="border border-gray-300 p-2 text-left">Remark</th>
              </tr>
            </thead>
            <tbody>
              {termData.isPending ? (
                <tr>
                  <td colSpan="8" className="text-center p-8 text-gray-500 italic border border-gray-300">
                    <AlertCircle className="inline-block mr-2 text-schoolGold" size={20} />
                    Results for this term are currently awaiting approval. Please check back later.
                  </td>
                </tr>
              ) : termData.results.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center p-8 text-gray-500 italic border border-gray-300">
                    No results recorded for this term yet.
                  </td>
                </tr>
              ) : (
                termData.results.map((row, rIndex) => (
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
                    <td className="border border-gray-300 p-2 text-[10px] uppercase font-bold text-gray-500">{row.remark}</td>
                  </tr>
                )))}
            </tbody>
          </table>

          {/* BOTTOM SECTION */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-bold text-schoolGreen uppercase text-[10px] mb-1 border-b border-gray-300">Affective Domain</h3>
              <table className="w-full text-[10px] border border-gray-300">
                <tbody>
                  {['Punctuality', 'Neatness', 'Politeness', 'Honesty', 'Leadership'].map((item) => (
                    <tr key={item} className="border-b border-gray-300">
                      <td className="p-1 pl-2 font-bold text-gray-600">{item}</td>
                      <td className="p-1 text-center font-bold">5</td>
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
              <span className="font-serif italic text-xs text-gray-800">Excellent performance. Keep it up!</span>
            </div>
            <div className="flex justify-between items-end pt-4">
              <div className="text-center">
                <div className="w-24 border-b border-black mb-1"></div>
                <p className="text-[10px] font-bold uppercase text-gray-500">Principal's Signature</p>
              </div>
              <div className="text-center">
                <p className="font-serif font-bold text-sm text-schoolGreen">12/04/2026</p>
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
      ))}
    </div>
  );
};

export default ResultSheet;