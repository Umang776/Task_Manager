import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../ThemeToggle.jsx';

export function AuthShell({ children, title, subtitle }) {
  return (
    <motion.div
      className="relative flex min-h-screen overflow-hidden bg-slate-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -left-32 top-0 h-[480px] w-[480px] rounded-full bg-violet-600/30 blur-[120px]"
          animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-24 bottom-0 h-[420px] w-[420px] rounded-full bg-cyan-500/20 blur-[100px]"
          animate={{ x: [0, -30, 0], y: [0, -25, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/50 via-slate-950 to-slate-950" />
      </div>

      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      <motion.div className="relative z-10 flex w-full flex-col lg:flex-row">
        <motion.aside
          className="hidden flex-1 flex-col justify-between p-12 lg:flex"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <motion.div>
            <Link to="/login" className="inline-flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-lg font-bold text-white shadow-lg shadow-violet-500/30">
                E
              </span>
              <span className="text-xl font-bold tracking-tight text-white">Ethara Tasks</span>
            </Link>
            <motion.p
              className="mt-8 max-w-md text-3xl font-bold leading-tight text-white"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Ship work with clarity. Projects, tasks, and your team in one place.
            </motion.p>
            <motion.p
              className="mt-4 max-w-sm text-slate-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              <span className="font-semibold text-violet-300">Admin</span> accounts use your{' '}
              <span className="font-semibold text-violet-300">@ethara.ai</span> email.{' '}
              <span className="font-semibold text-slate-300">Members</span> can use any email.
            </motion.p>
          </motion.div>
          <p className="text-xs text-slate-600">© Ethara · Internal task management</p>
        </motion.aside>

        <motion.div
          className="flex flex-1 items-center justify-center px-4 py-12 lg:px-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.45 }}
        >
          <div className="w-full max-w-md">
            <div className="mb-6 lg:hidden">
              <span className="text-lg font-bold text-white">Ethara Tasks</span>
            </div>
            <motion.div
              className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl"
              whileHover={{ boxShadow: '0 25px 50px -12px rgba(139, 92, 246, 0.15)' }}
            >
              <h1 className="text-2xl font-bold text-white">{title}</h1>
              {subtitle ? <p className="mt-2 text-sm text-slate-400">{subtitle}</p> : null}
              <motion.div className="mt-8">{children}</motion.div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
