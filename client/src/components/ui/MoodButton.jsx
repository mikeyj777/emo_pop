import React from 'react';

const MoodButton = ({ mood, isDragging, isDragged, onMouseDown }) => {
  return (
    <div
      id={`mood-${mood.id}`}
      className={`mood-button ${isDragging ? 'dragging' : ''} ${isDragged ? 'dragged' : ''}`}
      style={{
        transform: `translate(${mood.x}px, ${mood.y}px)`,
        width: `${mood.size}px`,
        height: `${mood.size}px`,
      }}
      onMouseDown={(e) => onMouseDown(e, mood)}
    >
      <span className="mood-text">{mood.text}</span>
    </div>
  );
};

export default MoodButton;