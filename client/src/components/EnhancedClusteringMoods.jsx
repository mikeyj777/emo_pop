// EnhancedClusteringMoods.jsx
import React, { useState, useEffect, useCallback } from 'react';
import MoodButton from './components/MoodButton';
import SelectionPanel from './components/SelectionPanel';
import { moodData } from './data/moodData';
import './styles/MoodClustering.css';

const EnhancedClusteringMoods = () => {
  const [moods, setMoods] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [draggedMood, setDraggedMood] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [dragCurrentPos, setDragCurrentPos] = useState(null);
  const [isSelectionVisible, setIsSelectionVisible] = useState(false);

  const handleMouseDown = (e, mood) => {
    setDraggedMood(mood);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = useCallback((e) => {
    if (!draggedMood || !dragStart) return;
    
    setDragCurrentPos({ x: e.clientX, y: e.clientY });
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) {
      setMoods(prev => prev.map(mood =>
        mood.id === draggedMood.id
          ? { 
              ...mood, 
              x: mood.x + dx,
              y: mood.y + dy,
              isDragging: true,
              vx: 0,
              vy: 0
            }
          : mood
      ));
      setDragStart({ x: e.clientX, y: e.clientY });

      const edgeThreshold = 100;
      if (e.clientX < edgeThreshold || e.clientX > window.innerWidth - edgeThreshold ||
          e.clientY < edgeThreshold || e.clientY > window.innerHeight - edgeThreshold) {
        const moodElement = document.getElementById(`mood-${draggedMood.id}`);
        if (moodElement) {
          moodElement.classList.add('nope');
          setTimeout(() => {
            setMoods(prev => prev.filter(m => m.id !== draggedMood.id));
            setDraggedMood(null);
            setDragStart(null);
            setDragCurrentPos(null);
          }, 300);
        }
      }
    }
  }, [draggedMood, dragStart]);

  const handleMouseUp = useCallback((e) => {
    if (!draggedMood || !dragStart) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) {
      setSelectedMood(draggedMood);
      setSelectedCategory(draggedMood.category);
      setIsSelectionVisible(true);
      setMoods(prev => prev.filter(m => m.id !== draggedMood.id));
    } else {
      setMoods(prev => prev.map(m => 
        m.id === draggedMood.id ? { ...m, isDragging: false } : m
      ));
    }

    setDraggedMood(null);
    setDragStart(null);
    setDragCurrentPos(null);
  }, [draggedMood, dragStart]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div className="container">
      {moods.map((mood) => (
        <MoodButton
          key={mood.id}
          mood={mood}
          isDragging={mood.isDragging}
          isDragged={draggedMood?.id === mood.id}
          onMouseDown={handleMouseDown}
        />
      ))}

      {selectedMood && (
        <SelectionPanel
          isVisible={isSelectionVisible}
          selectedMood={selectedMood}
          selectedCategory={selectedCategory}
          onToggleVisibility={() => setIsSelectionVisible(!isSelectionVisible)}
        />
      )}
    </div>
  );
};

export default EnhancedClusteringMoods;