import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../ThemeToggle.jsx';

const ETHARA_SITE = 'https://www.ethara.ai/';

const FEATURES = [
  { title: 'Projects', desc: 'Organize workstreams and members' },
  { title: 'Task Board', desc: 'Drag, drop, and advance status' },
  { title: 'Insights', desc: 'Dashboards and activity history' },
];

export function AuthShell({ children, title, subtitle }) {
  return (
    <motion.div
      className="auth-page relative flex min-h-screen min-h-[100dvh] w-full flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 lg:grid lg:grid-cols-2 lg:grid-rows-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      {/* Ambient background */}
      <motion.div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="auth-mesh absolute inset-0" />
        <motion.div
          className="absolute -left-[20%] top-[-10%] h-[55vh] w-[55vh] rounded-full bg-violet-400/25 blur-[100px] dark:bg-violet-600/20"
          animate={{ x: [0, 30, 0], y: [0, 15, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-[15%] bottom-[-5%] h-[50vh] w-[50vh] rounded-full bg-cyan-400/20 blur-[90px] dark:bg-cyan-500/15"
          animate={{ x: [0, -25, 0], y: [0, -20, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute left-1/2 top-1/3 h-[40vh] w-[40vh] -translate-x-1/2 rounded-full bg-indigo-400/15 blur-[80px] dark:bg-indigo-600/10"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.25]">
          <div className="auth-grid h-full w-full" />
        </motion.div>
      </motion.div>

      <motion.div className="absolute right-4 top-4 z-30 lg:right-6 lg:top-6">
        <ThemeToggle variant="auth" />
      </motion.div>

      {/* Left hero — full height */}
      <motion.aside
        className="relative z-10 flex min-h-[42vh] flex-col justify-between px-6 py-10 sm:px-10 sm:py-12 lg:min-h-screen lg:px-12 lg:py-14 xl:px-16"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.05, duration: 0.5 }}
      >
        <motion.div className="max-w-xl">
          <a
            href={ETHARA_SITE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-2xl outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-950"
          >
            <img
              src="/ethara-mark.svg"
              alt=""
              width={52}
              height={52}
              className="h-12 w-12 shrink-0 rounded-2xl shadow-lg shadow-violet-500/30 sm:h-14 sm:w-14"
            />
            <div>
              <span className="block text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                Ethara Tasks
              </span>
              <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">
                Internal workspace
              </span>
            </div>
          </a>

          <motion.p
            className="mt-10 text-3xl font-bold leading-[1.15] tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
          >
            Ship work with clarity.
            <span className="mt-2 block bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-cyan-300">
              Projects, tasks, and your team.
            </span>
          </motion.p>

          <motion.p
            className="mt-6 max-w-lg text-base leading-relaxed text-slate-600 dark:text-slate-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.22 }}
          >
            <a
              href={ETHARA_SITE}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-slate-900 underline decoration-violet-500/40 underline-offset-2 hover:decoration-violet-500 dark:text-white dark:decoration-violet-400/50"
            >
              Ethara
            </a>{' '}
            builds reinforcement learning infrastructure for capable, aligned systems. This app is your
            team&apos;s hub to plan projects, track tasks, and move work forward together.
          </motion.p>

          <motion.p
            className="mt-4 text-sm text-slate-500 dark:text-slate-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.28 }}
          >
            <span className="font-medium text-violet-700 dark:text-violet-300">Admin</span> sign-in uses{' '}
            <span className="font-medium text-violet-700 dark:text-violet-300">@ethara.ai</span>.{' '}
            <span className="font-medium text-slate-700 dark:text-slate-300">Members</span> may use any email.
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-10 hidden gap-3 sm:grid sm:grid-cols-3 lg:mt-0"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 28 } }}
              className="rounded-2xl border border-slate-200/80 bg-white/60 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-white/5"
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{f.title}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <p className="mt-8 hidden text-xs text-slate-400 lg:block dark:text-slate-500">
          © {new Date().getFullYear()} Ethara ·{' '}
          <a
            href={ETHARA_SITE}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-violet-600 dark:hover:text-violet-400"
          >
            ethara.ai
          </a>
        </p>
      </motion.aside>

      {/* Right — form column, full height */}
      <motion.div
        className="relative z-10 flex flex-1 flex-col justify-center px-4 py-8 sm:px-8 sm:py-12 lg:min-h-screen lg:px-10 xl:px-14"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.45 }}
      >
        <motion.div
          className="mx-auto w-full max-w-[28rem] lg:max-w-md xl:max-w-lg"
          layout
        >
          <div className="mb-6 flex items-center justify-center gap-2 lg:hidden">
            <img src="/ethara-mark.svg" alt="" width={36} height={36} className="h-9 w-9 rounded-xl" />
            <span className="text-lg font-bold text-slate-900 dark:text-white">Ethara Tasks</span>
          </div>

          <motion.div
            className="auth-card rounded-3xl border border-slate-200/90 bg-white/85 p-7 shadow-xl shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75 dark:shadow-black/40 sm:p-9"
            whileHover={{
              boxShadow:
                '0 28px 60px -20px rgba(99, 102, 241, 0.22), 0 0 0 1px rgba(139, 92, 246, 0.08)',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="mb-8 border-b border-slate-200/80 pb-6 dark:border-white/10">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{subtitle}</p>
              ) : null}
            </div>
            {children}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
