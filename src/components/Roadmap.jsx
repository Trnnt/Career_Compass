import React from 'react';

const Roadmap = ({ steps }) => {
  if (!steps?.length) return null;

  return (
    <div className="mt-6">
      <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">
        Your step-by-step roadmap
      </h4>
      <div className="relative pl-8 border-l-2 border-indigo-500/50 space-y-6">
        {steps.map((step, index) => (
          <div key={index} className="relative">
            <div className="absolute -left-8 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
              {index + 1}
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <h5 className="font-semibold text-white">{step.title}</h5>
              <p className="text-white/70 text-sm mt-1">{step.details}</p>
              {step.resource && (
                <span className="inline-block mt-2">
                  {step.resourceUrl ? (
                    <a
                      href={step.resourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-link hover:underline text-sm"
                    >
                      Resource: {step.resource}
                    </a>
                  ) : (
                    <span className="text-emerald-400/90 text-sm">
                      Resource: {step.resource}
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Roadmap;
