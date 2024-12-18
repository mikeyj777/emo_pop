// EnhancedClusteringMoods.jsx
import React, { useState, useEffect, useCallback } from 'react';
import MoodButton from './ui/MoodButton';
import SelectionPanel from './ui/SelectionPanel';
import { moodData } from '../utils/moodData';

const EnhancedClusteringMoods = () => {
  const [moods, setMoods] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [draggedMood, setDraggedMood] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [dragCurrentPos, setDragCurrentPos] = useState(null);
  const [isSelectionVisible, setIsSelectionVisible] = useState(false);

  const generateMoodPhysics = () => {
    const category = moodData.categories[Math.floor(Math.random() * moodData.categories.length)];
    const moodType = category.moods[Math.floor(Math.random() * category.moods.length)];
    const size = Math.random() * 20 + 80;
    
    let position = findNonOverlappingPosition(size);
    
    return {
      id: Date.now() + Math.random(),
      x: position.x,
      y: position.y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      size,
      createdAt: Date.now(),
      category: category.name,
      ...moodType
    };
  };

  const findNonOverlappingPosition = (size) => {
    let attempts = 0;
    let position;
    const padding = size * 1.2;

    do {
      position = {
        x: padding + Math.random() * (window.innerWidth - padding * 2),
        y: padding + Math.random() * (window.innerHeight - padding * 2)
      };
      attempts++;
    } while (
      isOverlapping(position, size) && 
      attempts < 50
    );

    return position;
  };

  const isOverlapping = (position, size) => {
    return moods.some(mood => {
      const dx = mood.x - position.x;
      const dy = mood.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < (mood.size + size) / 1.5;
    });
  };

  const calculateAttraction = (mood1, mood2) => {
    if (mood1.isDragging || mood2.isDragging) return { fx: 0, fy: 0 };
    
    const dx = mood2.x - mood1.x;
    const dy = mood2.y - mood1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < (mood1.size + mood2.size) / 1.5) {
      return {
        fx: -(dx / distance) * 0.8,
        fy: -(dy / distance) * 0.8
      };
    }
    
    if (mood1.category === mood2.category && distance < 300) {
      const force = 0.3 * (1 / Math.pow(distance, 2));
      return {
        fx: (dx / distance) * Math.min(force, 0.1),
        fy: (dy / distance) * Math.min(force, 0.1)
      };
    }
    
    return { fx: 0, fy: 0 };
  };

  const updatePositions = useCallback(() => {
    setMoods(prevMoods => 
      prevMoods.map(mood => {
        if (mood.isDragging) return mood;

        const brownianX = (Math.random() - 0.5) * 0.3;
        const brownianY = (Math.random() - 0.5) * 0.3;
        
        const attraction = prevMoods.reduce((acc, otherMood) => {
          if (otherMood.id === mood.id) return acc;
          const { fx, fy } = calculateAttraction(mood, otherMood);
          return { fx: acc.fx + fx, fy: acc.fy + fy };
        }, { fx: 0, fy: 0 });

        let newVx = (mood.vx + brownianX + attraction.fx) * 0.95;
        let newVy = (mood.vy + brownianY + attraction.fy) * 0.95;
        
        let newX = mood.x + newVx;
        let newY = mood.y + newVy;
        
        const padding = mood.size / 2;
        if (newX < padding || newX > window.innerWidth - padding) {
          newVx *= -0.8;
          newX = Math.max(padding, Math.min(newX, window.innerWidth - padding));
        }
        if (newY < padding || newY > window.innerHeight - padding) {
          newVy *= -0.8;
          newY = Math.max(padding, Math.min(newY, window.innerHeight - padding));
        }
        
        return { ...mood, x: newX, y: newY, vx: newVx, vy: newVy };
      })
    );
  }, []);

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

  useEffect(() => {
    const generationInterval = setInterval(() => {
      if (moods.length < 5) {
        setMoods(prev => [...prev, generateMoodPhysics()]);
      }
    }, 2000);

    return () => clearInterval(generationInterval);
  }, [moods.length]);

  useEffect(() => {
    const animationInterval = setInterval(updatePositions, 50);
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setMoods(prev => prev.filter(mood => (now - mood.createdAt) < 15000));
    }, 1000);

    return () => {
      clearInterval(animationInterval);
      clearInterval(cleanupInterval);
    };
  }, [updatePositions]);

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