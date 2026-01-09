import React from 'react';

const MaintenanceBanner: React.FC = () => {
  const message = '2026년 1월 11일 0시에 서버가 일시 중단됩니다! 플레이에 참고 바랍니다! 1월 14일에 다시 돌아올게요!';

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
