import fs from 'fs';

const p = new URL('../src/components/layout/AuthShell.jsx', import.meta.url);
let s = fs.readFileSync(p, 'utf8');

const bad = '</' + 'motion.div>';
const good = '</' + 'div>';

const pairs = [
  [`to-slate-950" />\n      ${bad}\n\n      <div className="absolute right-4`, `to-slate-950" />\n      ${good}\n\n      <div className="absolute right-4`],
  [`<ThemeToggle />\n      ${bad}\n\n      <div className="relative z-10`, `<ThemeToggle />\n      ${good}\n\n      <motion.div className="relative z-10`],
  [`Ethara Tasks</span>\n            ${bad}\n            <motion.div`, `Ethara Tasks</span>\n            ${good}\n            <motion.div`],
  [`{children}</motion.div>\n            </motion.div>\n          ${bad}`, `{children}</motion.div>\n            </motion.div>\n          ${good}`],
];

for (const [from, to] of pairs) {
  if (!s.includes(from)) {
    console.warn('pattern not found:', from.slice(0, 40));
  } else {
    s = s.replace(from, to);
  }
}

fs.writeFileSync(p, s);
console.log('done');
