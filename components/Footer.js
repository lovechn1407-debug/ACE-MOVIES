import Link from 'next/link';
import { Film, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-[#060609] py-12 px-4 sm:px-8 lg:px-16 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#e50914] flex items-center justify-center text-white">
            <Film className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-white tracking-wider">
            ACE<span className="text-[#e50914]">MOVIES</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/admin" className="hover:text-white transition-colors flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-[#e50914]" />
            Admin Dashboard
          </Link>
          <span>Server-side TMDB Proxy Powered</span>
        </div>

        <p className="text-xs text-gray-500 text-center md:text-right">
          &copy; {new Date().getFullYear()} ACE Movies. Built for high performance & Vercel deployment.
        </p>
      </div>
    </footer>
  );
}
