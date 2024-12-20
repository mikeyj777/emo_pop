import React, { useState, useEffect, useCallback } from 'react';
import MoodButton from './ui/MoodButton';

const MOOD_GENERATION_INTERVAL = 2000;  // 2 seconds between bubbles
const BUBBLE_LIFETIME = 5000;           // 5 seconds lifetime
const FADE_DURATION = 1000;             // 1 second fade
const ANIMATION_INTERVAL = 50;          // 50ms physics updates
const CONTAINER_WIDTH_PERCENT = 50;     // Container width as percentage of window
const MARGIN = 100;                     // Safe margin in pixels

const EnhancedClusteringMoods = ({ items, category, header, onBubblesFate }) => {
  const [activeItems, setActiveItems] = useState([]);
  const [processingItems, setProcessingItems] = useState(new Set());
  const [availableItems, setAvailableItems] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [itemsToProcess, setItemsToProcess] = useState([]);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    left: 0,
    effectiveWidth: 0,
    effectiveLeft: 0
  });

  // Initialize container dimensions
  const updateContainerDimensions = useCallback(() => {
    const containerWidth = window.innerWidth * (CONTAINER_WIDTH_PERCENT / 100);
    const containerLeft = (window.innerWidth - containerWidth) / 2;
    const effectiveWidth = containerWidth - (2 * MARGIN);
    const effectiveLeft = containerLeft + MARGIN;
    
    setContainerDimensions({
      width: containerWidth,
      left: containerLeft,
      effectiveWidth,
      effectiveLeft
    });
  }, []);

  // Update dimensions on window resize
  useEffect(() => {
    updateContainerDimensions();
    window.addEventListener('resize', updateContainerDimensions);
    return () => window.removeEventListener('resize', updateContainerDimensions);
  }, [updateContainerDimensions]);

  // Initialize available items when props change
  useEffect(() => {
    if (items && items.length > 0) {
      setAvailableItems([...items]);
      setActiveItems([]);
      setProcessingItems(new Set());
    }
  }, [items]);

  // Generate new bubble with proper bounds
  const generateBubble = useCallback(() => {
    if (availableItems.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * availableItems.length);
    const text = availableItems[randomIndex];
    
    setAvailableItems(prev => prev.filter((_, index) => index !== randomIndex));
    
    // Calculate bubble size first
    const size = Math.random() * 20 + 80; // Base size between 80-100px
    const radius = size / 2;

    // Generate position within effective bounds
    const x = containerDimensions.effectiveLeft + radius + 
             Math.random() * (containerDimensions.effectiveWidth - size);
    const y = Math.random() * (window.innerHeight - 160) + 80;
    
    return {
      id: Date.now() + Math.random(),
      text,
      x,
      y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      size,
      createdAt: Date.now(),
      isFading: false,
      fadeStartTime: null,
      isDragging: false
    };
  }, [availableItems, containerDimensions]);

  // Bubble generation interval
  useEffect(() => {
    if (availableItems.length === 0) return;

    const interval = setInterval(() => {
      const newBubble = generateBubble();
      if (newBubble) {
        setActiveItems(prev => [...prev, newBubble]);
      }
    }, MOOD_GENERATION_INTERVAL);

    return () => clearInterval(interval);
  }, [availableItems.length, generateBubble]);

  // Process completed bubbles
  const processBubbleCompletion = useCallback((completedItems, wasSelected) => {
    const processedBubbles = completedItems.map(item => ({
      item: item.text,
      wasSelected,
      category,
      header,
      isPositive: category === 'needs' ? null : category === 'positive'
    }));

    onBubblesFate(processedBubbles);
  }, [category, header, onBubblesFate]);

  // Handle physics updates and bubble lifecycle
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      setActiveItems(prev => {
        const updatedItems = prev.map(item => {
          if (item.isDragging) return item;

          // Start fade if lifetime reached
          if (!item.isFading && (now - item.createdAt >= BUBBLE_LIFETIME)) {
            return { ...item, isFading: true, fadeStartTime: now };
          }

          // Complete fade and mark for processing
          if (item.isFading && (now - item.fadeStartTime >= FADE_DURATION)) {
            if (!processingItems.has(item.id)) {
              setItemsToProcess(current => [...current, { ...item, completionType: 'timeout' }]);
              setProcessingItems(prev => new Set([...prev, item.id]));
            }
            return null;
          }

          // Update physics with boundary checking
          const radius = item.size / 2;
          let newVx = item.vx * 0.95;
          let newVy = item.vy * 0.95;
          let newX = item.x + newVx;
          let newY = item.y + newVy;

          // Boundary checks
          const leftBound = containerDimensions.effectiveLeft + radius;
          const rightBound = containerDimensions.effectiveLeft + containerDimensions.effectiveWidth - radius;
          
          if (newX < leftBound || newX > rightBound) {
            newVx *= -0.8;
            newX = Math.max(leftBound, Math.min(newX, rightBound));
          }

          const topBound = radius;
          const bottomBound = window.innerHeight - radius;
          
          if (newY < topBound || newY > bottomBound) {
            newVy *= -0.8;
            newY = Math.max(topBound, Math.min(newY, bottomBound));
          }

          return { ...item, x: newX, y: newY, vx: newVx, vy: newVy };
        });

        return updatedItems.filter(Boolean);
      });
    }, ANIMATION_INTERVAL);

    return () => clearInterval(interval);
  }, [containerDimensions, processingItems]);

  // Handle processing of completed items
  useEffect(() => {
    if (itemsToProcess.length > 0) {
      const uniqueItems = itemsToProcess.reduce((acc, item) => {
        if (!acc.some(existingItem => existingItem.text === item.text)) {
          acc.push(item);
        }
        return acc;
      }, []);

      const timeoutItems = uniqueItems.filter(item => item.completionType === 'timeout');
      const selectedItems = uniqueItems.filter(item => item.completionType === 'selected');
      
      if (timeoutItems.length > 0) {
        processBubbleCompletion(timeoutItems, false);
      }
      if (selectedItems.length > 0) {
        processBubbleCompletion(selectedItems, true);
      }
      
      setItemsToProcess([]);
    }
  }, [itemsToProcess, processBubbleCompletion]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e, item) => {
    setDraggedItem(item);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!draggedItem || !dragStart) return;
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    setActiveItems(prev => prev.map(item =>
      item.id === draggedItem.id
        ? { ...item, x: item.x + dx, y: item.y + dy, isDragging: true, vx: 0, vy: 0 }
        : item
    ));
    setDragStart({ x: e.clientX, y: e.clientY });

    // Check for edge drag
    const edgeThreshold = 100;
    if (e.clientX < edgeThreshold || e.clientX > window.innerWidth - edgeThreshold ||
        e.clientY < edgeThreshold || e.clientY > window.innerHeight - edgeThreshold) {
      setActiveItems(prev => {
        const removedItem = prev.find(i => i.id === draggedItem.id);
        if (removedItem && !processingItems.has(removedItem.id)) {
          setItemsToProcess(current => [...current, { ...removedItem, completionType: 'timeout' }]);
          setProcessingItems(prev => new Set([...prev, removedItem.id]));
        }
        return prev.filter(i => i.id !== draggedItem.id);
      });
      setDraggedItem(null);
      setDragStart(null);
    }
  }, [draggedItem, dragStart]);

  const handleMouseUp = useCallback((e) => {
    if (!draggedItem || !dragStart) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5 && !processingItems.has(draggedItem.id)) {
      setItemsToProcess(current => [...current, { ...draggedItem, completionType: 'selected' }]);
      setProcessingItems(prev => new Set([...prev, draggedItem.id]));
      setActiveItems(prev => prev.filter(i => i.id !== draggedItem.id));
    } else {
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
  }, [draggedItem, dragStart]);

  // Global mouse event listeners
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div 
      style={{ 
        position: 'fixed',
        inset: 0,
        overflow: 'hidden'
      }}
    >
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