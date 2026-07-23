'use client';

import { CheckCircle } from 'lucide-react';

export default function ToastNotification({ message }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl bg-[#12131a]/95 text-white border border-[#e50914]/40 shadow-2xl shadow-black backdrop-blur-md animate-bounce">
      <CheckCircle className="w-5 h-5 text-[#e50914]" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
