// src/components/Header.tsx
import { motion } from "framer-motion";
import CustomLink from "./CustomLink";

export default function Header() {
  return (
    <header className="w-full py-4 px-6 flex items-center justify-between bg-transparent">
      <div className="flex items-center gap-3">
        {/* shared logo in header */}
        <motion.div layoutId="site-logo" className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-indigo-800 shadow">
          {/* simplified small logo copy (keeps visual continuity) */}
          <svg className="w-6 h-6" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <defs>
              <linearGradient id="gh" x1="0" x2="1">
                <stop offset="0" stopColor="#fff" stopOpacity="0.98" />
                <stop offset="1" stopColor="#7fe8ff" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            <path d="M -6 4 L 6 4 L 0 -6 Z" transform="translate(60,60) scale(0.4)" fill="url(#gh)" />
          </svg>
        </motion.div>

        <h2 className="text-lg font-semibold">Mi Portfolio</h2>
      </div>

      <nav className="flex gap-4 items-center">
        <CustomLink to="/" className="text-sm">Home</CustomLink>
        <CustomLink to="/about" className="text-sm">About</CustomLink>
      </nav>
    </header>
  );
}
