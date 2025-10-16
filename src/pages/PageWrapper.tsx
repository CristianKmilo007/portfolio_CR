import { motion } from "framer-motion";
export default function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 28, scale: 0.995 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.56, ease: [0.22,1,0.36,1] } }}
      exit={{ opacity: 0, y: -18, transition: { duration: 0.42, ease: [0.18,0.8,0.2,1] } }}
      className="min-h-screen p-6 will-change-transform"
    >
      {children}
    </motion.main>
  );
}
