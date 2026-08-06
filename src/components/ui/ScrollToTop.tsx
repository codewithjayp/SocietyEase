import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * ScrollToTop Component
 * 
 * This component renders a fixed button at the bottom-right corner of the screen
 * that allows users to quickly scroll back to the top of the page.
 * It only appears after the user has scrolled down a certain distance.
 */
const ScrollToTop = () => {
  // State to track if the button should be visible
  const [isVisible, setIsVisible] = useState(false);

  // Effect to add a scroll event listener
  useEffect(() => {
    // Function to check scroll position and toggle visibility
    const toggleVisibility = () => {
      // If the user has scrolled more than 300px, show the button
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Attach the scroll event listener
    window.addEventListener('scroll', toggleVisibility);

    // Cleanup function to remove the listener when the component unmounts
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Function to smoothly scroll to the top of the page
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Render nothing if the button shouldn't be visible
  if (!isVisible) {
    return null;
  }

  // Render the button
  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300 z-50 flex items-center justify-center group"
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform duration-300" />
    </button>
  );
};

export default ScrollToTop;
