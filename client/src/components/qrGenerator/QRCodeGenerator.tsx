// QRCodeGenerator.tsx
import React from 'react';

// 이렇게 require로 불러오세요 (중요!)
const QRCode = require('qrcode.react');

interface QRCodeGeneratorProps {
  url: string;
  size?: number;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ url, size = 128 }) => {
  return (
    <div>
      <QRCode value={url} size={size} />
    </div>
  );
};

export default QRCodeGenerator;
