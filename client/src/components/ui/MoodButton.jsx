// components/ui/MoodButton.jsx
import React from 'react';

const MoodButton = ({ mood, isDragging, isDragged, onMouseDown }) => {
  const age = (Date.now() - mood.createdAt) / 1000;
  const opacity = Math.max(0, 1 - (age / 15));

  return (
    <button
      id={`mood-${mood.id}`}
      onMouseDown={(e) => onMouseDown(e, mood)}
      className={`mood-button ${isDragging ? 'dragging' : ''} 
                 ${isDragged ? 'dragged' : ''}`}
      style={{
        left: `${mood.x}px`,
        top: `${mood.y}px`,
        width: `${mood.size}px`,
        height: `${mood.size}px`,
        opacity,
        backgroundColor: mood.color
      }}
    >
      <span className="mood-text">{mood.mood}</span>
    </button>
  );
};

export default MoodButton;