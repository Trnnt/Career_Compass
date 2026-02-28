import React from 'react';

export default function OverviewTable() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_30px_120px_rgba(0,0,0,0.5)] overflow-hidden">
      <div className="px-6 py-5 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white">Project overview</h3>
        <p className="text-sm text-white/60 mt-1">
          A high-level snapshot (styled like your screenshot table).
        </p>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm">
          <tbody>
            <tr className="align-top">
              <td className="p-6 border-t border-white/10 w-[280px]">
                <p className="text-white font-semibold">
                  CareerCompass – A Personalized Career Guidance Platform
                </p>
              </td>
              <td className="p-6 border-t border-white/10 min-w-[360px]">
                <p className="text-white/80 leading-relaxed">
                  The objective of Career Compass is to guide students in identifying suitable career
                  paths based on their interests, aptitude, and academic profile. It aims to provide
                  clear career roadmaps, relevant learning resources, and skill-based recommendations
                  to reduce confusion after 10th or 12th. The platform focuses on enabling informed
                  decision-making and minimizing misaligned career choices.
                </p>
              </td>
              <td className="p-6 border-t border-white/10 min-w-[280px]">
                <p className="text-white/70 font-semibold mb-2">Service</p>
                <ul className="space-y-1 text-white/70">
                  <li>1. Basic programming knowledge</li>
                  <li>2. Java (preferred)</li>
                  <li>3. Fundamentals of Object-Oriented Programming (OOP)</li>
                </ul>
              </td>
              <td className="p-6 border-t border-white/10 min-w-[220px]">
                <p className="text-white/70 font-semibold mb-2">Owner</p>
                <p className="text-white/80">Neeraj [19761]</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

