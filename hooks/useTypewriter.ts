import { useState, useEffect } from 'react';

export const useTypewriter = (text: string, speed: number = 20, onComplete?: () => void) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    setDisplayText(''); // Reset on text change
    if (text) {
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setDisplayText(prevText => prevText + text.charAt(i));
          i++;
        } else {
          clearInterval(typingInterval);
          if (onComplete) {
            onComplete();
          }
        }
      }, speed);

      // Cleanup function to clear interval if component unmounts or text changes
      return () => {
        clearInterval(typingInterval);
      };
    }
  }, [text, speed, onComplete]);

  return displayText;
};