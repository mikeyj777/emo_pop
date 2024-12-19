// MainController.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import EnhancedClusteringMoods from './EnhancedClusteringMoods';
import StageHeader from './StageHeader';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const MainController = () => {
  console.info('MainController: Component initialized');
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const [currentStage, setCurrentStage] = useState(0);
  const [currentCategory, setCurrentCategory] = useState(0);
  const [currentData, setCurrentData] = useState([]);
  const [selections, setSelections] = useState({
    positive: [],
    negative: [],
    needs: []
  });
  const [categoryTitle, setCategoryTitle] = useState('');

  const stages = [
    { 
      file: 'data/feelings_positive.csv',
      type: 'positive',
      title: 'Positive Feelings'
    },
    { 
      file: 'data/feelings_negative.csv',
      type: 'negative',
      title: 'Challenging Feelings'
    },
    { 
      file: 'data/needs.csv',
      type: 'needs',
      title: 'Current Needs'
    }
  ];

  const parseCSV = (text) => {
    console.info('MainController: Starting CSV parsing');
    
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
  };

  const processCSVData = (rows) => {
    console.info('MainController: Processing CSV data');
    
    if (rows.length < 2) {
      console.error('MainController: CSV file has insufficient data');
      return [];
    }

    const categories = rows[0];
    console.info('MainController: Categories from CSV:', categories);

    // Process data for current category only
    const currentCategoryName = categories[currentCategory];
    const items = rows.slice(1)
      .map(row => row[currentCategory])
      .filter(item => item && item.trim());

    return {
      categories,
      formattedData: [{
        category: currentCategoryName,
        items
      }]
    };
  };

  const loadCurrentStageData = async () => {
    console.info(`MainController: Loading data for stage ${currentStage}, category ${currentCategory}`);
    try {
      const fileUrl = `${process.env.PUBLIC_URL}/${stages[currentStage].file}`;
      console.info('MainController: Fetching file from:', fileUrl);
      
      const response = await fetch(fileUrl);
      const text = await response.text();
      
      const rows = parseCSV(text);
      const { categories, formattedData } = processCSVData(rows);
      
      // Update the current stage with the categories from the CSV
      stages[currentStage].categories = categories;
      
      setCurrentData(formattedData);
    } catch (error) {
      console.error('MainController: Error loading file:', error);
    }
  };

  useEffect(() => {
    console.info(`MainController: Stage or category changed`, {
      stage: currentStage,
      category: currentCategory
    });
    loadCurrentStageData();
  }, [currentStage, currentCategory]);

  const handleSelectionComplete = async (selectedItems) => {
    const stageType = stages[currentStage].type;
    const categoryName = stages[currentStage].categories[currentCategory];
    
    console.info('MainController: Selection complete', {
      stageType,
      category: categoryName,
      selectedItems
    });

    setSelections(prev => {
      const currentStageSelections = prev[stageType] || [];
      return {
        ...prev,
        [stageType]: [...currentStageSelections, ...selectedItems]
      };
    });

    try {
      const payload = {
        userId,
        type: stageType,
        category: categoryName,
        selections: selectedItems,
        timestamp: new Date().toISOString()
      };
      
      await axios.post(`${API_BASE_URL}/api/selections`, payload);

      // Move to next category or stage
      if (currentCategory < stages[currentStage].categories.length - 1) {
        setCurrentCategory(prev => prev + 1);
        setCategoryTitle(stages[currentStage].categories[currentCategory]);
      } else {
        if (currentStage < stages.length - 1) {
          setCurrentStage(prev => prev + 1);
          setCurrentCategory(0);
          setCategoryTitle(stages[currentStage].categories[currentCategory]);
        } else {
          navigate(`/results/${userId}`);
        }
      }
    } catch (error) {
      console.error('MainController: Error saving selections:', error);
    }
  };

  return (
    <div className="container">
      <StageHeader 
        currentStage={`${stages[currentStage].title} - ${stages[currentStage].type}`}
        currentCategory={categoryTitle || 'Loading...'}
      />
      
      <EnhancedClusteringMoods
        items={currentData}
        onSelectionComplete={handleSelectionComplete}
      />
    </div>
  );
};

export default MainController;