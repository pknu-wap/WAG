import React from "react";
import ReactModal from "react-modal";
import { useRecoilState } from "recoil";

import { readyToGameModalState } from "../../recoil/recoil";
import { motion } from "framer-motion";
import { CSSProperties } from "react";



const customModalStyles = {
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    width: "100%",
    height: "100%", // 여기서 높이를 100%로 수정
    zIndex: 10,
    position: "fixed" as CSSProperties["position"], // 타입 명시
    top: 0,
    left: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  } as CSSProperties, // 전체 스타일 객체에 타입 적용
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
  } as CSSProperties, // 전체 스타일 객체에 타입 적용
};

interface ModalProps {
  children: React.ReactNode;
  onRequestClose: () => void;
}

const ReadyToGameModal: React.FC<ModalProps> = ({ children, onRequestClose }) => {
  const [isOpen] = useRecoilState(readyToGameModalState);


  // 모달을 닫을 때 onRequestClose 함수 호출
  const closeModal = (e: React.MouseEvent) => {
    if ((e.target as Element).id === "overlay") {
      onRequestClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (

    <div style={customModalStyles.overlay} id="overlay" onClick={closeModal}>
    <motion.div
      style={customModalStyles.content}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { delay: 0.1 },
      }}

    >
      <div className="p-3">{children}</div>
    </motion.div>
  </div>
  );
};

export default ReadyToGameModal;
