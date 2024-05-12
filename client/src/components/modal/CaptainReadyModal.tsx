import React from "react";
import ReactModal from "react-modal";
import { useRecoilState } from "recoil";
import { captainReadyToGameModalState, modalState } from "../../recoil/modal";

const customModalStyles: ReactModal.Styles = {
    overlay: {
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        width: "100%",
        height: "auto",
        zIndex: 10,
        position: "fixed",
        top: 0,
        left: 0,
    },
    content: {
        width: "50%",
        maxWidth: "650px",
        height: "auto",
        minHeight: "310px",
        maxHeight: "400px",
        zIndex: 150,
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        borderRadius: "10px",
        boxShadow: "2px 2px 2px rgba(0, 0, 0, 0.25)",
        backgroundColor: "#FFE5E5",
        overflow: "auto",
    },
};

interface ModalProps {
    children: React.ReactNode;
    onRequestClose: () => void;
}

const CaptainReatyToModal: React.FC<ModalProps> = ({ children, onRequestClose }) => {
    const [isOpen] = useRecoilState(captainReadyToGameModalState);

    // 모달을 닫을 때 onRequestClose 함수 호출
    const closeModal = () => {
        onRequestClose();
    };

    return (
        <ReactModal
            isOpen={isOpen}
            style={customModalStyles} // 스타일 적용
            onRequestClose={closeModal} // 모달 창 닫기 요청을 받을 때 호출
            shouldCloseOnOverlayClick={true} // 외부 클릭으로 모달 닫기 활성화
        >
            <div className="modal-content">{children}</div>
        </ReactModal>
    );
};

export default CaptainReatyToModal;