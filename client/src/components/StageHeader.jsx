import React, { useState, useEffect } from 'react';

const StageHeader = ({ stages = [], categories = [] }) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [currentCategoryIndex, setCategoryIndex] = useState(0);
  const [isStageTransitioning, setStageTransitioning] = useState(false);
  const [isCategoryTransitioning, setCategoryTransitioning] = useState(false);

  useEffect(() => {
    // Rotate through categories more frequently than stages
    const categoryInterval = setInterval(() => {
      setCategoryTransitioning(true);
      setTimeout(() => {
        setCategoryIndex((prev) => (prev + 1) % categories.length);
        setCategoryTransitioning(false);
      }, 500);
    }, 5000);

    // Rotate through stages less frequently
    const stageInterval = setInterval(() => {
      setStageTransitioning(true);
      setTimeout(() => {
        setCurrentStageIndex((prev) => (prev + 1) % stages.length);
        setStageTransitioning(false);
      }, 500);
    }, 15000);

    return () => {
      clearInterval(categoryInterval);
      clearInterval(stageInterval);
    };
  }, [categories.length, stages.length]);

  return (
    <header className="stage-header">
      <div className="stage-header-content">
        <div className="stage-title-container">
          <h1 className={`stage-title ${isStageTransitioning ? 'fade-out' : 'fade-in'}`}>
            {stages[currentStageIndex]}
          </h1>
        </div>
        
        <div className="category-title-container">
          <h2 className={`category-title ${isCategoryTransitioning ? 'fade-out' : 'fade-in'}`}>
            {categories[currentCategoryIndex]}
          </h2>
        </div>
      </div>
    </header>
  );
};

export default StageHeader;