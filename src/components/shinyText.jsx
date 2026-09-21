import React from 'react';

const ShinyText = ({ text, disabled = false, speed = 4, className = '' }) => {
  const animationDuration = `${speed}s`;

  return (
    <span
      className={`shiny-text ${disabled ? '!animation-none' : ''} ${className}`}
      style={{
        animationDuration: animationDuration,
      }}
    >
      {text}
    </span>
  );
};

export default ShinyText;


  // tailwind.config.js
  // module.exports = {
  //   theme: {
  //     extend: {
  //       keyframes: {
  //         shine: {
  //           '0%': { 'background-position': '100%' },
  //           '100%': { 'background-position': '-100%' },
  //         },
  //       },
  //       animation: {
  //         shine: 'shine 5s linear infinite',
  //       },
  //     },
  //   },
  //   plugins: [],
  // };
