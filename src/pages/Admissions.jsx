import React from 'react';
import Navbar from '../components/Navbar';
import { Download, CheckCircle } from 'lucide-react';

const Admissions = () => {
  return (
    <div className="bg-cream min-h-screen">
      <Navbar />
      
      <div className="pt-40 pb-20 px-6 text-center bg-schoolGreen text-white">
        <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6">Join Our Community</h1>
        <p className="text-xl text-green-100 max-w-2xl mx-auto font-light">
          Your child's journey to excellence starts here. Application for 2026/2027 is now open.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-24 -mt-16">
        
        {/* CARDS CONTAINER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* LEFT: REQUIREMENTS */}
          <div className="bg-white p-10 rounded-xl shadow-xl border-t-4 border-schoolGold">
            <h2 className="text-3xl font-serif font-bold text-schoolGreen mb-8">Requirements</h2>
            <ul className="space-y-4">
              <ReqItem text="Completed Application Form" />
              <ReqItem text="2 Recent Passport Photographs" />
              <ReqItem text="Copy of Birth Certificate" />
              <ReqItem text="Last Term's Report Sheet" />
              <ReqItem text="Transfer Certificate (if applicable)" />
            </ul>
            <div className="mt-10 pt-10 border-t border-gray-100">
              <button className="w-full flex items-center justify-center bg-gray-100 text-schoolGreen font-bold py-4 rounded-lg hover:bg-schoolGreen hover:text-white transition-all">
                <Download className="mr-2" size={20} /> Download Prospectus
              </button>
            </div>
          </div>

          {/* RIGHT: PROCESS */}
          <div className="bg-white p-10 rounded-xl shadow-xl border-t-4 border-schoolGreen">
            <h2 className="text-3xl font-serif font-bold text-schoolGreen mb-8">The Process</h2>
            <div className="space-y-8">
              <Step number="01" title="Purchase Form" desc="Forms are available online or at the admin office for ₦10,000." />
              <Step number="02" title="Entrance Exam" desc="CBT test on Maths, English & General Paper. (March 15th)." />
              <Step number="03" title="Interview" desc="Successful candidates will be invited for a parent interview." />
              <Step number="04" title="Admission" desc="Provisional admission letter issued upon success." />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

const ReqItem = ({ text }) => (
  <li className="flex items-center text-gray-700">
    <CheckCircle className="text-schoolGold mr-3" size={18} /> {text}
  </li>
);

const Step = ({ number, title, desc }) => (
  <div className="flex">
    <span className="text-3xl font-serif font-bold text-gray-200 mr-4">{number}</span>
    <div>
      <h4 className="font-bold text-gray-900 text-lg">{title}</h4>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default Admissions;