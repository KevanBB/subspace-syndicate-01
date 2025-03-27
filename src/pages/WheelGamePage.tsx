
import React from 'react';
import WheelGame from '@/components/games/WheelGame';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

const WheelGamePage: React.FC = () => {
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Spin to Win!</h1>
        <div className="max-w-3xl mx-auto bg-black/30 backdrop-blur-sm p-8 rounded-lg shadow-xl border border-white/10">
          <WheelGame />
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default WheelGamePage;
