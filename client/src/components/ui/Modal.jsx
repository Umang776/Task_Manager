import { AnimatePresence, motion } from 'framer-motion';

export function Modal({ open, title, children, onClose, footer, size = 'md' }) {
  const maxW = size === 'lg' ? 'max-w-2xl' : size === 'sm' ? 'max-w-sm' : 'max-w-lg';

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            type="button"
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className={`relative z-10 w-full ${maxW} overflow-hidden rounded-2xl border border-white/20 bg-white/95 shadow-2xl shadow-violet-900/10 backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/95`}
          >
            <motion.div
              className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500"
              layoutId="modal-accent"
            />
            <motion.div layout className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.08, rotate: 90, backgroundColor: 'rgba(148, 163, 184, 0.15)' }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800"
              >
                ✕
              </motion.button>
            </motion.div>
            <motion.div layout className="max-h-[70vh] overflow-y-auto px-6 py-4">
              {children}
            </motion.div>
            {footer ? (
              <motion.div layout className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
                {footer}
              </motion.div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
