import { Toaster } from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext.jsx';

export function ThemedToaster() {
  const { dark } = useTheme();
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        className: dark
          ? '!bg-slate-800 !text-slate-100 !border !border-slate-600'
          : '!bg-white !text-slate-900 !border !border-slate-200',
      }}
    />
  );
}
