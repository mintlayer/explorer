import { ReactNode, Dispatch, SetStateAction, MouseEvent } from "react";

interface ModalProps {
  active: boolean;
  setActive: Dispatch<SetStateAction<boolean>>;
  children: ReactNode | string;
}

export const Modal = ({ active, setActive, children }: ModalProps) => {
  const handleModalClick = (e: MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className={`fixed top-0 left-0 w-screen h-screen bg-black/80 z-99 flex items-center justify-center opacity-100`} onClick={() => setActive(false)}>
      <div className={`p-5 w-4/5 md:w-1/2 2xl:w-1/3 z-100 bg-white rounded`} onClick={handleModalClick}>
        <div className="flex flex-col h-full justify-between items-center">{children}</div>
      </div>
    </div>
  );
};
