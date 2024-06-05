import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

type WrapperProps = {
  children: ReactNode;
  // 필요한 다른 props가 있다면 여기에 추가합니다.
};

const Wrapper: React.FC<WrapperProps> = ({ children, ...rest }) => {
  const pageEffect = {
    initial: {
      opacity: 0
    },
    in: {
      opacity: 1
    },
    out: {
      opacity: 0
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      transition={{ duration: 0.5 }}
      variants={pageEffect}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

export default Wrapper;
