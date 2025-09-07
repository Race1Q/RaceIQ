// src/components/ScrollAnimationWrapper/ScrollAnimationWrapper.tsx
import React from 'react';
import { Box, SlideFade } from '@chakra-ui/react';
import { useInView } from 'react-intersection-observer';

interface ScrollAnimationWrapperProps {
  children: React.ReactNode;
  delay?: number;
  [key: string]: any; // Allow any additional props to be passed through
}

const ScrollAnimationWrapper: React.FC<ScrollAnimationWrapperProps> = ({ children, delay = 0, ...rest }) => {
  const { ref, inView } = useInView({
    // triggerOnce makes the animation run only once
    triggerOnce: true,
    // threshold is the percentage of the element that needs to be visible to trigger the animation
    threshold: 0.1,
  });

  return (
    <Box ref={ref} {...rest}>
      <SlideFade 
        in={inView} 
        offsetY="40px" // Start 40px below the final position
        transition={{
          enter: {
            duration: 0.6,
            delay: delay, // Apply the delay prop here
            ease: 'easeOut',
          },
        }}
      >
        {children}
      </SlideFade>
    </Box>
  );
};

export default ScrollAnimationWrapper;
