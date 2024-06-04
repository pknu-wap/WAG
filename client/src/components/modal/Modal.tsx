import React, { useState } from "react";
import { useRecoilState } from "recoil";
import { modalState } from "../../recoil/recoil";
import { motion, AnimatePresence } from "framer-motion";
import { CSSProperties } from "react";

const customModalStyles = {
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    width: "100%",
    height: "100%",
    zIndex: 10,
    position: "fixed" as CSSProperties["position"],
    top: 0,
    left: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  } as CSSProperties,
  content: {
    width: "50%",
    maxWidth: "650px",
    minWidth: "250px",
    height: "auto",
    minHeight: "310px",
    maxHeight: "400px",
    zIndex: 150,
    borderRadius: "10px",
    boxShadow: "2px 2px 2px rgba(0, 0, 0, 0.25)",
    backgroundColor: "#FFE5E5",
    overflow: "auto",
  } as CSSProperties,
};

interface ModalProps {
  children: React.ReactNode;
  onRequestClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ children, onRequestClose }) => {
  const baseClassName =
    "w-1/2 max-w-lg min-w-xs h-auto min-h-[310px] max-h-[400px] z-150 rounded-lg shadow-md overflow-auto bg-light-bg dark:bg-dark-bg";
  const [isOpen, setIsOpen] = useRecoilState(modalState);

  const closeModal = (e: React.MouseEvent) => {
    if ((e.target as Element).id === "overlay") {
      setIsOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={customModalStyles.overlay} id="overlay" onClick={closeModal}>
          <motion.div
            className={baseClassName}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { delay: 0.1 },
            }}
            exit={{ opacity: 0, y: 20, transition: { duration: 0.1 } }} // 닫힐 때 애니메이션 추가
          >
            <div className="p-3">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
