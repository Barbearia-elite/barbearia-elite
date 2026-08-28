import React from 'react';
import { motion } from 'motion/react';

interface LogoProps {
  className?: string;
  animate?: boolean;
}

export default function Logo({ className = "w-10 h-10", animate = false }: LogoProps) {
  return (
    <motion.svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial={animate ? { opacity: 0, rotate: -180, scale: 0.8 } : false}
      animate={animate ? { opacity: 1, rotate: 0, scale: 1 } : false}
      transition={{ duration: 1, type: "spring", bounce: 0.4 }}
    >
      {/* Outer abstract ring */}
      <motion.circle 
        cx="50" cy="50" r="48" 
        stroke="currentColor" 
        strokeWidth="2"
        className="text-matte-lighter"
        initial={animate ? { pathLength: 0 } : false}
        animate={animate ? { pathLength: 1 } : false}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      
      {/* Scissors Icon */}
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-offwhite">
        <path d="M 35 70 L 65 30" />
        <path d="M 65 70 L 35 30" />
        <circle cx="30" cy="75" r="7" />
        <circle cx="70" cy="75" r="7" />
      </g>
      
      {/* Elite Text */}
      <text 
        x="50" y="24" 
        fill="currentColor" 
        className="text-offwhite"
        fontSize="12" 
        fontFamily="sans-serif" 
        fontWeight="bold" 
        textAnchor="middle"
        letterSpacing="2"
      >
        ELITE
      </text>
      
      {/* Inner Accent */}
      <circle cx="50" cy="50" r="3" className="fill-crimson" />
    </motion.svg>
  );
}
