import { motion } from 'framer-motion';

const spring = { type: 'spring', stiffness: 380, damping: 30 };

export function EmptyState({ title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        scale: 1.008,
        borderColor: 'rgba(139, 92, 246, 0.35)',
        boxShadow: '0 16px 40px -20px rgba(99, 102, 241, 0.12)',
      }}
      transition={spring}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900"
    >
      <p className="text-lg font-semibold text-slate-900 dark:text-white">{title}</p>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-300">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </motion.div>
  );
}
