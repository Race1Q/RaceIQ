// frontend/src/components/BackToTopButton/BackToTopButton.tsx

import { useState, useEffect } from 'react';
import { IconButton, Fade } from '@chakra-ui/react';
import { ArrowUp } from 'lucide-react';
import { useThemeColor } from '../../context/ThemeColorContext';

const BackToTopButton = () => {
  const { accentColorWithHash, accentColorDark } = useThemeColor();
  const [isVisible, setIsVisible] = useState(false);

  // --- Logic remains the same ---
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);
  // --- End of logic ---

  return (
    <Fade in={isVisible}>
      <IconButton
        aria-label="Scroll to top"
        icon={<ArrowUp size="24px" />}
        onClick={scrollToTop}
        // --- Style props based on your theme.ts ---
        position="fixed"
        bottom="lg" // <-- Uses 'lg' from your theme's space tokens
        right="lg" // <-- Uses 'lg' from your theme's space tokens
        zIndex="overlay"
        size="lg" // Controls width/height for the button
        bg={accentColorWithHash}
        color="staticWhite"
        borderRadius="full" // Chakra's token for 50%
        boxShadow="lg"
        transition="transform 0.2s ease-in-out, background-color 0.2s ease-in-out"
        _hover={{
          bg: accentColorDark,
          transform: 'translateY(-3px)',
        }}
      />
    </Fade>
  );
};

export default BackToTopButton;