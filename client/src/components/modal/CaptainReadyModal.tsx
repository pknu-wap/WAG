import React from "react";
import { useRecoilState } from "recoil";
import { captainReadyToGameModalState } from "../../recoil/recoil";
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
    maxWidth: "550px",
    minWidth: "250px",
    height: "auto",
    minHeight: "310px",
    maxHeight: "500px",
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

const CaptainReadyToModal: React.FC<ModalProps> = ({ children, onRequestClose }) => {
  const [isOpen, setIsOpen] = useRecoilState(captainReadyToGameModalState);

  const baseClassName = "w-5/6 max-w-[650px] min-w-[250px] h-auto min-h-[310px] max-h-[600px] z-150 rounded-lg shadow-md bg-light-bg dark:bg-dark-bg overflow-auto";

  const closeModal = (e: React.MouseEvent) => {
    if ((e.target as Element).id === "overlay") {
      setIsOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          style={customModalStyles.overlay}
          id="overlay"
          onClick={closeModal}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
        >
          <motion.div
            className={baseClassName}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
            exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
          >
            <div className="p-3">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CaptainReadyToModal;
