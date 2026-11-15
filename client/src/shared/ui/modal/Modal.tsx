import { ReactNode, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import classNames from 'classnames';

export interface ModalProps {
  open: boolean;
  /** 바깥(오버레이) 클릭이나 ESC 로 닫을 때. 없으면 닫히지 않음 */
  onClose?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label: string;
  children: ReactNode;
}

const SIZE = {
  sm: 'max-w-[434px] sm:max-w-[428px]',
  md: 'max-w-[434px] sm:max-w-[530px]',
  lg: 'max-w-[434px] sm:max-w-[646px]',
};

/** 공통 모달: 어두운 오버레이 + 연분홍(다크: 회색) 카드 */
const Modal = ({ open, onClose, size = 'md', className, label, children }: ModalProps) => {
  useEffect(() => {
    if (!open || !onClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose?.();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className={classNames(
              'w-full max-h-[90vh] overflow-y-auto scrollbar-thin rounded-[13px] sm:rounded-[8px] bg-light-modal dark:bg-dark-modal text-light-text dark:text-dark-text shadow-wag p-5 sm:p-6',
              SIZE[size],
              className
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.05 } }}
            exit={{ opacity: 0, y: 20, transition: { duration: 0.15 } }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
