'use client';
import React from 'react';

// Badge Component
const Badge = ({ bgColor, title, glowColor }) => (
  <div className="flex flex-col items-center text-center">
    <div
      className={`
        w-40 h-40 md:w-48 md:h-48 
        ${bgColor} 
        rounded-2xl 
        shadow-lg 
        hover:shadow-2xl hover:-translate-y-1 transition-all duration-300
        ${glowColor}
      `}
    >
      {/* Optional: Add <Image /> here */}
    </div>
    <p className="mt-4 font-semibold text-gray-200">{title}</p>
  </div>
);

const LandingPage = () => {
  const badges = [
    { title: 'Bronze Contributor', bgColor: 'bg-teal-900', glowColor: 'hover:shadow-teal-500/40' },
    { title: 'Silver Committer', bgColor: 'bg-lime-900', glowColor: 'hover:shadow-lime-500/40' },
    { title: 'Golden Pull Request', bgColor: 'bg-slate-800', glowColor: 'hover:shadow-blue-500/40' },
    { title: 'Diamond Issue Solver', bgColor: 'bg-slate-700', glowColor: 'hover:shadow-gray-400/40' },
    { title: 'Legendary Code Ninja', bgColor: 'bg-indigo-900', glowColor: 'hover:shadow-indigo-500/40' },
  ];

  return (
    <div
      className="text-white font-sans min-h-screen"
      style={{
        background: 'linear-gradient(to bottom, #2c0e3a, #120c18, #000000)',
      }}
    >
      <main className="container mx-auto px-6">
        
        {/* ========= Hero Section ========= */}
        <section className="min-h-[60vh] flex flex-col items-center justify-center text-center py-20">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight max-w-3xl">
            Turn your open-source journey into a game.
          </h1>
          <p className="mt-4 text-lg text-gray-300 max-w-xl">
            Earn badges, climb leaderboards, and showcase your GitHub milestones.
          </p>
          <button className="mt-8 px-8 py-3 bg-[#6D28D9] hover:bg-[#5B21B6] rounded-lg font-semibold transition-colors duration-300">
            Login with GitHub
          </button>
        </section>

        {/* ========= Achievements Section ========= */}
        <section className="py-20">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold">
              Collect & Showcase Your Achievements
            </h2>
            <p className="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">
              Celebrate every milestone with unique, beautifully designed badges.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {badges.map((badge) => (
              <Badge key={badge.title} {...badge} />
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

export default LandingPage;
