import React from 'react';

const MoodButton = ({ mood, category, style, onMouseDown }) => {
  // Get a color variable based on mood category
  
  return (
    <div
      className={`mood-button ${category}`}
      style={{
        ...style,
        backgroundColor: mood.bgColor,
        transform: mood.isDragging ? 'translate(-50%, -50%) scale(1.1)' : 'translate(-50%, -50%)',
      }}
      onMouseDown={onMouseDown}
    >
      {mood.text}
    </div>
  );
};

export default MoodButton;