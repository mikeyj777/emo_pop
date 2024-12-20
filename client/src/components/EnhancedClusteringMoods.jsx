import React, { useState, useEffect, useCallback } from 'react';
import MoodButton from './ui/MoodButton';

// Constants
const MOOD_GENERATION_INTERVAL = 2000;
const BUBBLE_LIFETIME = 5000;
const FADE_DURATION = 1000;
const ANIMATION_INTERVAL = 50;

const EnhancedClusteringMoods = ({ items, category, header, onBubblesFate }) => {
  console.info('I. Component Initialization - EnhancedClusteringMoods');

  // State declarations
  console.info('I.A. State Initialization');
  const [activeItems, setActiveItems] = useState([]);
  const [processingItems, setProcessingItems] = useState(new Set());
  const [availableItems, setAvailableItems] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragStart, setDragStart] = useState(null);

  // Initialize items effect
  useEffect(() => {
    console.info('II. Items Initialization Effect');
    if (items && items.length > 0) {
      console.info('II.A. Setting Initial Items State');
      setAvailableItems([...items]);
      setActiveItems([]);
      setProcessingItems(new Set());
    }
  }, [items]);

  // Bubble generation
  const generateBubble = useCallback(() => {
    console.info('III. Bubble Generation');
    
    if (availableItems.length === 0) {
      console.info('III.A. No Available Items');
      return null;
    }
    
    console.info('III.B. Creating New Bubble');
    const randomIndex = Math.floor(Math.random() * availableItems.length);
    const text = availableItems[randomIndex];
    
    setAvailableItems(prev => prev.filter((_, index) => index !== randomIndex));
    
    return {
      id: Date.now() + Math.random(),
      text,
      x: Math.random() * (window.innerWidth - 160) + 80,
      y: Math.random() * (window.innerHeight - 160) + 80,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      size: Math.random() * 20 + 80,
      createdAt: Date.now(),
      isFading: false,
      fadeStartTime: null,
      isDragging: false
    };
  }, [availableItems]);

  // Bubble generation interval
  useEffect(() => {
    console.info('IV. Bubble Generation Interval Setup');
    
    if (availableItems.length === 0) {
      console.info('IV.A. No Items Available - Skipping Interval');
      return;
    }

    console.info('IV.B. Starting Generation Interval');
    const interval = setInterval(() => {
      console.info('IV.B.1. Generating New Bubble');
      const newBubble = generateBubble();
      if (newBubble) {
        setActiveItems(prev => [...prev, newBubble]);
      }
    }, MOOD_GENERATION_INTERVAL);

    return () => {
      console.info('IV.C. Cleaning Up Generation Interval');
      clearInterval(interval);
    };
  }, [availableItems.length, generateBubble]);

  // Bubble completion processor
  const processBubbleCompletion = useCallback((completedItems, wasSelected) => {
    console.info('V. Processing Completed Bubbles');
    console.info('V.A. Creating Completion Data');
    
    const processedBubbles = completedItems.map(item => ({
      item: item.text,
      wasSelected,
      category,
      header,
      isPositive: category === 'needs' ? null : category === 'positive'
    }));

    console.info('V.B. Triggering Completion Callback');
    onBubblesFate(processedBubbles);
  }, [category, header, onBubblesFate]);

  // Physics and lifecycle effect
  useEffect(() => {
    console.info('VI. Physics and Lifecycle Management Setup');
    
    const interval = setInterval(() => {
      console.info('VI.A. Physics Update Tick');
      const now = Date.now();
      let completedItems = [];
      
      setActiveItems(prev => {
        console.info('VI.A.1. Updating Active Items');
        const updatedItems = prev.map(item => {
          if (item.isDragging) return item;

          // Fade handling
          if (!item.isFading && (now - item.createdAt >= BUBBLE_LIFETIME)) {
            console.info('VI.A.1.a. Starting Item Fade');
            return { ...item, isFading: true, fadeStartTime: now };
          }

          if (item.isFading && (now - item.fadeStartTime >= FADE_DURATION)) {
            console.info('VI.A.1.b. Completing Item Fade');
            if (!processingItems.has(item.id)) {
              completedItems.push(item);
              setProcessingItems(prev => new Set([...prev, item.id]));
            }
            return null;
          }

          // Physics updates
          console.info('VI.A.1.c. Updating Item Physics');
          return updateItemPhysics(item);
        });

        return updatedItems.filter(Boolean);
      });

      if (completedItems.length > 0) {
        console.info('VI.A.2. Processing Completed Items');
        processBubbleCompletion(completedItems, false);
      }
    }, ANIMATION_INTERVAL);

    return () => {
      console.info('VI.B. Cleaning Up Physics Interval');
      clearInterval(interval);
    };
  }, [processBubbleCompletion]);

  // Mouse event handlers
  console.info('VII. Mouse Event Handler Setup');
  
  const handleMouseDown = useCallback((e, item) => {
    console.info('VII.A. Mouse Down Handler');
    setDraggedItem(item);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e) => {
    console.info('VII.B. Mouse Move Handler');
    if (!draggedItem || !dragStart) return;
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    updateDraggedItem(dx, dy, e);
  }, [draggedItem, dragStart, processBubbleCompletion]);

  const handleMouseUp = useCallback((e) => {
    console.info('VII.C. Mouse Up Handler');
    if (!draggedItem || !dragStart) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    processMouseUp(dx, dy);
  }, [draggedItem, dragStart, processBubbleCompletion]);

  // Mouse event effect
  useEffect(() => {
    console.info('VII.D. Adding Mouse Event Listeners');
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      console.info('VII.E. Removing Mouse Event Listeners');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Helper functions
  const updateItemPhysics = (item) => {
    let newVx = item.vx * 0.95;
    let newVy = item.vy * 0.95;
    let newX = item.x + newVx;
    let newY = item.y + newVy;
    
    const padding = item.size / 2;
    if (newX < padding || newX > window.innerWidth - padding) {
      newVx *= -0.8;
      newX = Math.max(padding, Math.min(newX, window.innerWidth - padding));
    }
    if (newY < padding || newY > window.innerHeight - padding) {
      newVy *= -0.8;
      newY = Math.max(padding, Math.min(newY, window.innerHeight - padding));
    }
    
    return { ...item, x: newX, y: newY, vx: newVx, vy: newVy };
  };

  const updateDraggedItem = (dx, dy, e) => {
    setActiveItems(prev => prev.map(item =>
      item.id === draggedItem.id
        ? { ...item, x: item.x + dx, y: item.y + dy, isDragging: true, vx: 0, vy: 0 }
        : item
    ));
    setDragStart({ x: e.clientX, y: e.clientY });

    checkEdgeDrag(e);
  };

  const checkEdgeDrag = (e) => {
    const edgeThreshold = 100;
    if (e.clientX < edgeThreshold || e.clientX > window.innerWidth - edgeThreshold ||
        e.clientY < edgeThreshold || e.clientY > window.innerHeight - edgeThreshold) {
      console.info('VII.B.1. Edge Drag Detected');
      processDraggedItemRemoval();
    }
  };

  const processDraggedItemRemoval = () => {
    setActiveItems(prev => {
      const removedItem = prev.find(i => i.id === draggedItem.id);
      if (removedItem && !processingItems.has(removedItem.id)) {
        processBubbleCompletion([removedItem], false);
        setProcessingItems(prev => new Set([...prev, removedItem.id]));
      }
      return prev.filter(i => i.id !== draggedItem.id);
    });
    setDraggedItem(null);
    setDragStart(null);
  };

  const processMouseUp = (dx, dy) => {
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5 && !processingItems.has(draggedItem.id)) {
      console.info('VII.C.1. Processing Click');
      processBubbleCompletion([draggedItem], true);
      setProcessingItems(prev => new Set([...prev, draggedItem.id]));
      setActiveItems(prev => prev.filter(i => i.id !== draggedItem.id));
    } else {
      console.info('VII.C.2. Processing Drag Release');
      setActiveItems(prev => prev.map(item =>
        item.id === draggedItem.id
          ? {
              ...item,
              isDragging: false,
              vx: (Math.random() - 0.5) * 1.5,
              vy: (Math.random() - 0.5) * 1.5
            }
          : item
      ));
    }

    setDraggedItem(null);
    setDragStart(null);
  };

  console.info('VIII. Rendering Component');
  return (
    <div className="mood-container">
      {activeItems.map((item) => (
        <MoodButton
          key={item.id}
          mood={item}
          style={{
            left: item.x,
            top: item.y,
            opacity: item.isFading 
              ? 1 - ((Date.now() - item.fadeStartTime) / FADE_DURATION)
              : 1
          }}
          onMouseDown={(e) => handleMouseDown(e, item)}
        />
      ))}
    </div>
  );
};

export default EnhancedClusteringMoods;