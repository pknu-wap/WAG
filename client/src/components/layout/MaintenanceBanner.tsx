import React from 'react';

const MaintenanceBanner: React.FC = () => {
  const message = '2026년 11월 16일부터 12월 30일까지 서버 유지보수가 진행됩니다! 이 기간에는 게임 이용이 어려울 수 있어요. 유지보수가 끝나면 다시 돌아올게요!';

  const renderMessages = () => {
    return Array.from({ length: 6 }).map((_, index) => (
      <span key={index} className="maintenance-banner__item">
        {message}
        <span className="maintenance-banner__spacer">
          &nbsp;&nbsp;&nbsp;&nbsp;
        </span>
      </span>
    ));
  };

  return (
    <div className="maintenance-banner">
      <div className="maintenance-banner__track">
        <div className="maintenance-banner__inner">{renderMessages()}</div>
        <div className="maintenance-banner__inner">{renderMessages()}</div>
      </div>
    </div>
  );
};

export default MaintenanceBanner;
