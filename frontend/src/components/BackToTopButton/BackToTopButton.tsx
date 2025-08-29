import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import styles from './BackToTopButton.module.css';

const BackToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

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

  return (
    <div className={styles.buttonContainer}>
      {isVisible && (
        <button onClick={scrollToTop} className={styles.backToTopButton} aria-label="Go to top">
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  );
};

export default BackToTopButton;


