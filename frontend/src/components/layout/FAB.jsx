import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function FAB() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/listings/create')}
      className="lg:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-14 h-14 rounded-full bg-primary text-dark shadow-lg hover:bg-primary/90 hover:scale-105 transition-all duration-150 flex items-center justify-center"
      aria-label="Create listing"
    >
      <Plus size={24} strokeWidth={2.5} />
    </button>
  );
}
