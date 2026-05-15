import { createContext, useCallback, useContext, useState } from 'react';
import { Modal } from './Modal.jsx';
import { Button } from './Button.jsx';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);

  const confirm = useCallback(
    ({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'danger' }) =>
      new Promise((resolve) => {
        setState({
          title,
          message,
          confirmLabel,
          cancelLabel,
          variant,
          resolve,
        });
      }),
    []
  );

  const close = (result) => {
    state?.resolve(result);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={Boolean(state)}
        title={state?.title || 'Confirm'}
        onClose={() => close(false)}
        size="sm"
        footer={
          <>
            <Button variant="secondary" type="button" onClick={() => close(false)}>
              {state?.cancelLabel || 'Cancel'}
            </Button>
            <Button
              variant={state?.variant === 'danger' ? 'danger' : 'primary'}
              type="button"
              onClick={() => close(true)}
            >
              {state?.confirmLabel || 'Confirm'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">{state?.message}</p>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
}
