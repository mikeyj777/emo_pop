import React, { useState, useEffect } from 'react';

const styles = {
  container: {
    position: 'fixed',
    inset: 0
  },
  containerBounds: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    borderLeft: '2px solid rgb(34, 197, 94)',
    borderRight: '2px solid rgb(34, 197, 94)'
  },
  marginBounds: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    borderLeft: '2px dashed rgb(34, 197, 94)',
    borderRight: '2px dashed rgb(34, 197, 94)'
  },
  bubble: {
    position: 'absolute',
    background: 'rgba(88, 28, 135, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255, 255, 255, 0.9)',
    userSelect: 'none',
    backdropFilter: 'blur(8px)',
    transform: 'translate(-50%, -50%)'
  },
  debug: {
    position: 'fixed',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '1px',
    height: '100%',
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
    pointerEvents: 'none'
  },
  controlPanel: {
    position: 'fixed',
    bottom: '16px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(0, 0, 0, 0.7)',
    padding: '16px',
    borderRadius: '8px',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backdropFilter: 'blur(8px)',
    minWidth: '300px'
  },
  dimensionText: {
    fontFamily: 'monospace',
    fontSize: '14px'
  },
  control: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  input: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '4px',
    color: 'white',
    padding: '4px 8px',
    width: '80px'
  }
};

const BoundsTest = () => {
  const [testBubbles, setTestBubbles] = useState([]);
  const [dimensions, setDimensions] = useState({
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    containerWidthPercent: 50,
    margin: 100,
    spacing: 14,
    bubbleSize: 100 // Added fixed bubble size for testing
  });

  const calculateContainerDimensions = (windowWidth, containerWidthPercent) => {
    const containerWidth = (windowWidth * containerWidthPercent) / 100;
    const containerLeft = (windowWidth - containerWidth) / 2;
    return { containerWidth, containerLeft };
  };

  const generateBubbles = (containerLeft, containerWidth, spacing, margin, bubbleSize) => {
    const bubbles = [];
    const effectiveWidth = containerWidth - (2 * margin);
    const effectiveLeft = containerLeft + margin;
    const bubbleRadius = bubbleSize / 2;

    // Only generate bubbles within the safe area
    for (let x = effectiveLeft + bubbleRadius; 
         x <= effectiveLeft + effectiveWidth - bubbleRadius; 
         x += spacing) {
      bubbles.push({
        id: x,
        x: x,
        y: Math.random() * (window.innerHeight - 160) + 80,
        size: bubbleSize
      });
    }
    return bubbles;
  };

  const updateDimensions = () => {
    setDimensions(prev => ({
      ...prev,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    }));
  };

  useEffect(() => {
    const { containerWidth, containerLeft } = calculateContainerDimensions(
      dimensions.windowWidth,
      dimensions.containerWidthPercent
    );
    const bubbles = generateBubbles(
      containerLeft, 
      containerWidth, 
      dimensions.spacing,
      dimensions.margin,
      dimensions.bubbleSize
    );
    setTestBubbles(bubbles);
  }, [
    dimensions.windowWidth, 
    dimensions.containerWidthPercent, 
    dimensions.spacing,
    dimensions.margin,
    dimensions.bubbleSize
  ]);

  useEffect(() => {
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleWidthPercentChange = (e) => {
    const newPercent = Math.min(Math.max(10, parseInt(e.target.value) || 0), 100);
    setDimensions(prev => ({
      ...prev,
      containerWidthPercent: newPercent
    }));
  };

  const handleMarginChange = (e) => {
    const { containerWidth } = calculateContainerDimensions(
      dimensions.windowWidth,
      dimensions.containerWidthPercent
    );
    const newMargin = Math.min(
      Math.max(0, parseInt(e.target.value) || 0),
      containerWidth / 2
    );
    setDimensions(prev => ({
      ...prev,
      margin: newMargin
    }));
  };

  const handleSpacingChange = (e) => {
    const newSpacing = Math.min(Math.max(5, parseInt(e.target.value) || 5), 50);
    setDimensions(prev => ({
      ...prev,
      spacing: newSpacing
    }));
  };

  const { containerWidth, containerLeft } = calculateContainerDimensions(
    dimensions.windowWidth,
    dimensions.containerWidthPercent
  );

  // Calculate the effective bounds for debug visualization
  const effectiveLeft = containerLeft + dimensions.margin;
  const effectiveRight = containerLeft + containerWidth - dimensions.margin;

  return (
    <div style={styles.container}>
      <div 
        style={{
          ...styles.containerBounds,
          left: `${containerLeft}px`,
          width: `${containerWidth}px`
        }}
      />
      <div 
        style={{
          ...styles.marginBounds,
          left: `${containerLeft + dimensions.margin}px`,
          width: `${containerWidth - 2 * dimensions.margin}px`
        }}
      />
      
      {/* Debug lines for effective bounds */}
      <div style={{...styles.debug, left: `${effectiveLeft}px`}} />
      <div style={{...styles.debug, left: `${effectiveRight}px`}} />
      
      {testBubbles.map((bubble) => (
        <div
          key={bubble.id}
          style={{
            ...styles.bubble,
            left: `${bubble.x}px`,
            top: `${bubble.y}px`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`
          }}
        >
          enthusiastic
        </div>
      ))}

      <div style={styles.controlPanel}>
        <div style={styles.dimensionText}>
          Window: {dimensions.windowWidth}px × {dimensions.windowHeight}px
        </div>
        <div style={styles.dimensionText}>
          Container: {Math.round(containerWidth)}px 
          (left: {Math.round(containerLeft)}px)
        </div>
        <div style={styles.dimensionText}>
          Effective Width: {Math.round(containerWidth - 2 * dimensions.margin)}px
          (at {Math.round(containerLeft + dimensions.margin)}px)
        </div>
        <div style={styles.control}>
          <label>Width:</label>
          <input
            type="number"
            value={dimensions.containerWidthPercent}
            onChange={handleWidthPercentChange}
            min="10"
            max="100"
            style={styles.input}
          />
          <span style={styles.dimensionText}>%</span>
        </div>
        <div style={styles.control}>
          <label>Margin:</label>
          <input
            type="number"
            value={dimensions.margin}
            onChange={handleMarginChange}
            min="0"
            max={containerWidth / 2}
            style={styles.input}
          />
          <span style={styles.dimensionText}>px</span>
        </div>
        <div style={styles.control}>
          <label>Spacing:</label>
          <input
            type="number"
            value={dimensions.spacing}
            onChange={handleSpacingChange}
            min="5"
            max="50"
            style={styles.input}
          />
          <span style={styles.dimensionText}>px</span>
        </div>
      </div>
    </div>
  );
};

export default BoundsTest;