import React from 'react';

/** 가운데 정렬되는 공지 문구 (입장/퇴장, 정답, 라운드 안내 등) */
const NotificationMessage: React.FC<{ content: string }> = ({ content }) => (
  <span className="text-center text-sm text-light-text dark:text-dark-text">{content}</span>
);

export default NotificationMessage;
