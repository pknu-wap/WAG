import React, { useState } from 'react';
import Button from '../components/button/Button';
import RadioButton from '../components/radioButton/RadioButton';
import FullLayout from "../components/layout/FullLayout";

function CreateRoom() {
  const [isPrivate, setIsPrivate] = useState<string | null>("false"); //일단은 공개방을 default로

  const radioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsPrivate(event.target.value);
  };

  const renderButton = () => {
    if (isPrivate === null) {
      return <p>방 공개 / 비공개 여부를 선택해주십시오</p>;//체크가 안된 상태를 defult로 만들 수도 있음
    } else if (isPrivate === '1') {
      return <Button size="lg">공개방 생성</Button>;
    } else {
      return <Button size="lg">비공개방 생성</Button>;
    }
  };

  return (
    <FullLayout>
      <div className="p-4">
        <div className="justify-center text-6xl mb-20">방 만들기</div>
        <div className="rounded-xl font-extrabold min-w-44 ">방 공개 / 비공개 여부 선택</div>
        <div className="grid grid-cols-1 md:grid-cols-2 mt-5 gap-2">
          <RadioButton
            id="public"
            label="공개"
            value="false"
            name="roomType"
            onChange={radioChange}
            checked={isPrivate === 'false'}
          />
          <RadioButton
            id="private"
            label="비공개"
            value="true"
            name="roomType"
            onChange={radioChange}
          />
        </div>

        <div className="mt-12">
          {renderButton()}
        </div>
      </div>
    </FullLayout>
    
  );
}

export default CreateRoom;
