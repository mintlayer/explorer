'use client'

import { ReactNode, Dispatch, SetStateAction, MouseEvent, useEffect } from "react";

interface ModalProps {
  active: boolean;
  setActive: Dispatch<SetStateAction<boolean>>;
  children: ReactNode | string;
}

export const Modal = ({ active, setActive, children }: ModalProps) => {
  const handleModalClick = (e: MouseEvent) => {
    e.stopPropagation();
  };

  useEffect(() => {
    if (active) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 overflow-y-auto" onClick={() => setActive(false)}>
      <div className="flex min-h-screen items-center justify-center px-4 py-20">
        <div className="w-full max-w-[630px] rounded-xl bg-white shadow-xl p-6" onClick={handleModalClick}>
          {children}
        </div>
      </div>
    </div>
  );
};
