import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import EnhancedClusteringMoods from './EnhancedClusteringMoods';
import StageHeader from './StageHeader';

const API_BASE_URL = process.env.REACT_APP_API_URL;
const CATEGORY_DISPLAY_TIME = 30000; // 30 seconds per category

const MainController = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const [stages, setStages] = useState([]);
  const [currentStage, setCurrentStage] = useState(0);
  const [currentCategory, setCurrentCategory] = useState(0);
  const [currentData, setCurrentData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryTitle, setCategoryTitle] = useState('');
  const [categoryTimer, setCategoryTimer] = useState(null);

  const advanceToNextCategory = useCallback(() => {
    console.info('MainController: Attempting to advance category', {
      currentStage,
      currentCategory,
      totalStages: stages.length,
    });
    
    // Clear any existing timer
    if (categoryTimer) {
      clearTimeout(categoryTimer);
      setCategoryTimer(null);
    }

    // Check if we can move to next category in current stage
    if (currentCategory < (stages[currentStage]?.categories?.length || 0) - 1) {
      setCurrentCategory(prev => prev + 1);
    } else {
      // Check if we can move to next stage
      if (currentStage < stages.length - 1) {
        setCurrentStage(prev => prev + 1);
        setCurrentCategory(0);
      } else {
        // All stages complete
        navigate(`/results/${userId}`);
      }
    }
  }, [currentCategory, currentStage, stages, navigate, userId, categoryTimer]);

  const handleSelectionComplete = useCallback(async (selectedItems) => {
    if (!stages[currentStage]?.categories) return;
  
    const stageType = stages[currentStage].type;
    const categoryName = stages[currentStage].categories[currentCategory];
    
    try {
      const payload = {
        userId,
        type: stageType,
        category: categoryName,
        selections: selectedItems,
        timestamp: new Date().toISOString()
      };
      
      await axios.post(`${API_BASE_URL}/api/selections`, payload);
      advanceToNextCategory();
    } catch (error) {
      console.error('MainController: Error saving selections:', error);
      // Still advance even if save fails
      advanceToNextCategory();
    }
  }, [stages, currentStage, currentCategory, userId, advanceToNextCategory]);

  const parseCSV = useCallback((text) => {
    const rows = text.split(/\r?\n/).map(row => {
      const cells = [];
      let currentCell = '';
      let inQuotes = false;

      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          cells.push(currentCell.trim().replace(/^"|"$/g, ''));
          currentCell = '';
        } else {
          currentCell += char;
        }
      }
      
      cells.push(currentCell.trim().replace(/^"|"$/g, ''));
      return cells;
    }).filter(row => row.some(cell => cell.length > 0));
    
    return rows;
  }, []);

  const processCSVData = useCallback((rows, categoryIndex) => {
    if (rows.length < 2) {
      console.error('MainController: CSV file has insufficient data');
      return { categories: [], formattedData: [] };
    }

    const categories = rows[0];
    const currentCategoryName = categories[categoryIndex];
    const items = rows.slice(1)
      .map(row => row[categoryIndex])
      .filter(item => item && item.trim());

    return {
      categories,
      formattedData: [{
        category: currentCategoryName,
        items
      }]
    };
  }, []);

  const loadCurrentStageData = useCallback(async () => {
    if (!stages[currentStage]) return;
    
    setIsLoading(true);
    
    try {
      const fileUrl = `${process.env.PUBLIC_URL}/${stages[currentStage].file}`;
      const response = await fetch(fileUrl);
      const text = await response.text();
      const rows = parseCSV(text);
      const { categories, formattedData } = processCSVData(rows, currentCategory);
      
      // Update stage categories if not already set
      setStages(prevStages => {
        if (!prevStages[currentStage].categories.length) {
          const updatedStages = [...prevStages];
          updatedStages[currentStage] = {
            ...updatedStages[currentStage],
            categories
          };
          return updatedStages;
        }
        return prevStages;
      });
      
      setCurrentData(formattedData);
      setCategoryTitle(categories[currentCategory]);

      // Set new timer only if we're not at the end
      if (currentCategory < categories.length) {
        const timer = setTimeout(advanceToNextCategory, CATEGORY_DISPLAY_TIME);
        setCategoryTimer(timer);
      }
      
    } catch (error) {
      console.error('MainController: Error loading file:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentStage, currentCategory, stages, processCSVData, parseCSV, advanceToNextCategory]);

  // Initialize stages
  useEffect(() => {
    const initialStages = [
      { 
        file: 'data/feelings_positive.csv',
        type: 'positive',
        title: 'Positive Feelings',
        categories: []
      },
      { 
        file: 'data/feelings_negative.csv',
        type: 'negative',
        title: 'Challenging Feelings',
        categories: []
      },
      { 
        file: 'data/needs.csv',
        type: 'needs',
        title: 'Current Needs',
        categories: []
      }
    ];
    setStages(initialStages);
    setIsLoading(false);
  }, []);

  // Load stage data when current stage/category changes
  useEffect(() => {
    if (!isLoading && stages.length > 0) {
      loadCurrentStageData();
    }
    
    // Cleanup timer when component unmounts or stage/category changes
    return () => {
      if (categoryTimer) {
        clearTimeout(categoryTimer);
      }
    };
  }, [currentStage, currentCategory, stages.length, isLoading, loadCurrentStageData, categoryTimer]);

  if (isLoading || !stages[currentStage]) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <StageHeader 
        currentStage={stages[currentStage]?.title || 'Loading...'}
        currentCategory={categoryTitle || 'Loading...'}
      />
      
      <EnhancedClusteringMoods
        items={currentData}
        onSelectionComplete={handleSelectionComplete}
        currentCategory={categoryTitle || 'Loading...'}
      />
    </div>
  );
};

export default MainController;