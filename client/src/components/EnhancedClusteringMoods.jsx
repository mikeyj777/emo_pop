import React, { useState, useEffect, useCallback } from 'react';
import MoodButton from './ui/MoodButton';
import SelectionPanel from './ui/SelectionPanel';

const MOOD_LIMIT = 5;
const MOOD_GENERATION_INTERVAL = 2000;
const MOOD_LIFETIME = 15000;
const ANIMATION_INTERVAL = 50;

const EnhancedClusteringMoods = ({ items, onSelectionComplete, currentCategory }) => {
  const [moods, setMoods] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [draggedMood, setDraggedMood] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [isSelectionVisible, setIsSelectionVisible] = useState(false);
  const [availableItems, setAvailableItems] = useState([]);

  // Reset state when category changes
  useEffect(() => {
    console.info("EnhancedClusteringMoods: Category change effect triggered", {
      hasItems: !!items,
      itemsLength: items?.length,
      currentCategory,
      itemsContent: items
    });

    if (items && items.length > 0) {
      console.info("EnhancedClusteringMoods: Processing new items", {
        firstItemCategory: items[0].category,
        itemCount: items[0].items.length,
        sampleItems: items[0].items.slice(0, 3)
      });
      
      const allItems = items[0].items.map(item => ({
        text: item,
        category: currentCategory
      }));
      setAvailableItems(allItems);
      setMoods([]);
      setSelectedMood(null);
      setDraggedMood(null);
      setDragStart(null);
      setIsSelectionVisible(false);
    }
  }, [items, currentCategory]);

  const generateMoodPhysics = useCallback(() => {
    if (availableItems.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * availableItems.length);
    const selectedItem = availableItems[randomIndex];
    
    setAvailableItems(prev => prev.filter((_, index) => index !== randomIndex));
    
    const size = Math.random() * 20 + 80;
    const padding = size * 1.2;
    const x = padding + Math.random() * (window.innerWidth - padding * 2);
    const y = padding + Math.random() * (window.innerHeight - padding * 2);
    
    return {
      id: Date.now() + Math.random(),
      x,
      y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      size,
      createdAt: Date.now(),
      category: currentCategory,
      text: selectedItem.text
    };
  }, [availableItems, currentCategory]);

  // Mood generation interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (moods.length < MOOD_LIMIT && availableItems.length > 0) {
        const newMood = generateMoodPhysics();
        if (newMood) {
          setMoods(prev => [...prev, newMood]);
        }
      }
    }, MOOD_GENERATION_INTERVAL);

    return () => clearInterval(interval);
  }, [moods.length, availableItems.length, generateMoodPhysics]);

  // Mood cleanup interval
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setMoods(prev => {
        const expiredMoods = prev.filter(mood => (now - mood.createdAt) >= MOOD_LIFETIME);
        setAvailableItems(prevItems => [
          ...prevItems,
          ...expiredMoods.map(mood => ({ text: mood.text, category: mood.category }))
        ]);
        return prev.filter(mood => (now - mood.createdAt) < MOOD_LIFETIME);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Physics update interval
  const updatePositions = useCallback(() => {
    setMoods(prevMoods => 
      prevMoods.map(mood => {
        if (mood.isDragging) return mood;

        let newVx = mood.vx * 0.95;
        let newVy = mood.vy * 0.95;
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

  useEffect(() => {
    const interval = setInterval(updatePositions, ANIMATION_INTERVAL);
    return () => clearInterval(interval);
  }, [updatePositions]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e, mood) => {
    setDraggedMood(mood);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!draggedMood || !dragStart) return;
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
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

    // Check if mood is dragged to edge of screen
    const edgeThreshold = 100;
    if (e.clientX < edgeThreshold || e.clientX > window.innerWidth - edgeThreshold ||
        e.clientY < edgeThreshold || e.clientY > window.innerHeight - edgeThreshold) {
      setMoods(prev => prev.filter(m => m.id !== draggedMood.id));
      setAvailableItems(prev => [...prev, { text: draggedMood.text, category: draggedMood.category }]);
      setDraggedMood(null);
      setDragStart(null);
    }
  }, [draggedMood, dragStart]);

  const handleMouseUp = useCallback((e) => {
    if (!draggedMood || !dragStart) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) {
      setSelectedMood(draggedMood);
      setIsSelectionVisible(true);
      setMoods(prev => prev.filter(m => m.id !== draggedMood.id));
    } else {
      setMoods(prev => prev.map(m => 
        m.id === draggedMood.id ? { ...m, isDragging: false } : m
      ));
    }

    setDraggedMood(null);
    setDragStart(null);
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
    <div className="mood-container">
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
          onToggleVisibility={() => setIsSelectionVisible(!isSelectionVisible)}
          onComplete={onSelectionComplete}
        />
      )}
    </div>
  );
};

export default EnhancedClusteringMoods;