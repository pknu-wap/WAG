import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

type WrapperProps = {
  children: ReactNode;
};

const Wrapper: React.FC<WrapperProps> = ({ children, ...rest }) => {
  const pageEffect = {
    initial: {
      opacity: 0,
    },
    in: {
      opacity: 1,
    },
    out: {
      opacity: 0,
    },
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

