import Button from "../button/Button"

interface onClickProps {
    onOpenModal: () => void;
}

const Modal = ({ onOpenModal }: onClickProps) => {
    return (
        <div className="h-screen w-full fixed left-0 top-0 flex justify-center item-center bg-black bg-opacity-70 text-center">
            <div className="bg-white rounded w-10/12 md:w-1/3">
                <div className="border-b px-4 py-2 flex justify-between items-center">
                    {/* 모달 이름 */}
                    <h3 className="font-extrabold">Warning</h3>
                </div>
                <div className="text-sm px-4 py-8">
                    {/* 모달 주 컨텐츠 */}
                    {"이름을 지어주세요(예시)"}
                </div>
                <div className="flex justify-end items-center-w-100 border-t p-3">
                    {/* 모달 액션 */}
                    <Button onClick={onOpenModal} size="md">확인</Button>
                </div>
            </div>

        </div>
    )
}

export default Modal