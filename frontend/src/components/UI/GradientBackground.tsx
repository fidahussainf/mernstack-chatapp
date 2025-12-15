import React from "react";

interface GradientBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({ children, className }) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 overflow-hidden relative ${className || ''}`}>
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
      </div>
      {children}
    </div>
  );
};

export default GradientBackground;