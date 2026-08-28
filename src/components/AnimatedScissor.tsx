import React from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';

export default function AnimatedScissor({ isGlowing }: { isGlowing: boolean }) {
  const { scrollY } = useScroll();
  
  // Hardware-accelerated smooth spring for better performance on weaker devices
  const smoothScrollY = useSpring(scrollY, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001
  });

  // Sine wave for opening and closing blades naturally when scrolling
  // Base rotation of 10 degrees, then we add/subtract based on scroll
  const scissorOpen = useTransform(smoothScrollY, (y) => 10 + (Math.sin(y / 100) * 16));
  const scissorClose = useTransform(smoothScrollY, (y) => -10 + (-Math.sin(y / 100) * 16));
  
  // Text ring rotates subtly
  const rotateReverse = useTransform(smoothScrollY, [0, 1000], [0, -90]);

  return (
    <div className="relative w-36 h-36 sm:w-48 sm:h-48 flex items-center justify-center">
      {/* Glow behind */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: isGlowing ? 1 : 0,
          scale: isGlowing ? 1.1 : 0.8,
        }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 rounded-full bg-crimson/20 blur-xl z-0 pointer-events-none"
      />
      
      {/* Vertical Scissors Container */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
         {/* Blade 1 (Left Handle, Right Blade) - White */}
         <motion.svg 
           viewBox="0 0 100 100" 
           className="absolute w-24 h-24 sm:w-32 sm:h-32 text-offwhite drop-shadow-md"
           style={{ rotate: scissorOpen, transformOrigin: '50% 50%' }}
         >
            {/* Left Handle */}
            <circle cx="35" cy="75" r="10" fill="none" stroke="currentColor" strokeWidth="4" />
            <circle cx="35" cy="75" r="6" fill="transparent" stroke="currentColor" strokeWidth="1" opacity="0.3" />
            
            {/* Neck */}
            <line x1="41" y1="67" x2="50" y2="50" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
            
            {/* Right Blade */}
            <path d="M48 50 L60 15 C 60 15 52 18 48 50 Z" fill="currentColor" />
         </motion.svg>
         
         {/* Blade 2 (Right Handle, Left Blade) - Red/Crimson */}
         <motion.svg 
           viewBox="0 0 100 100" 
           className="absolute w-24 h-24 sm:w-32 sm:h-32 text-crimson drop-shadow-md"
           style={{ rotate: scissorClose, transformOrigin: '50% 50%' }}
         >
            {/* Right Handle */}
            <circle cx="65" cy="75" r="10" fill="none" stroke="currentColor" strokeWidth="4" />
            <circle cx="65" cy="75" r="6" fill="transparent" stroke="currentColor" strokeWidth="1" opacity="0.3" />
            
            {/* Neck */}
            <line x1="59" y1="67" x2="50" y2="50" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
            
            {/* Left Blade */}
            <path d="M52 50 L40 15 C 40 15 48 18 52 50 Z" fill="currentColor" />
            
            {/* Pivot Point - Black base, White dot */}
            <circle cx="50" cy="50" r="3.5" fill="#111" stroke="currentColor" strokeWidth="1" />
         </motion.svg>
      </div>
      
      {/* Animated text ring around the scissors */}
      <motion.svg 
        style={{ rotate: rotateReverse }}
        viewBox="0 0 100 100" 
        className="absolute inset-[-10%] w-[120%] h-[120%] text-muted pointer-events-none opacity-40"
      >
        <path id="textPath" d="M 50 50 m -40 0 a 40 40 0 1 1 80 0 a 40 40 0 1 1 -80 0" fill="none" />
        <text fontSize="7" fontWeight="500" letterSpacing="4" fill="currentColor" style={{ textTransform: 'uppercase' }}>
          <textPath href="#textPath" startOffset="0%">Barbearia Elite • </textPath>
          <textPath href="#textPath" startOffset="50%">Barbearia Elite • </textPath>
        </text>
      </motion.svg>
    </div>
  );
}
