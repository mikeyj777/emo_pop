import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EnhancedClusteringMoods from "./EnhancedClusteringMoods";
import StageHeader from "./StageHeader";
import { loadEmotions, loadNeeds } from "../utils/getData";


const MainController = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [emotions, setEmotions] = useState([]);
  const [needs, setNeeds] = useState([]);
  const [error, setError] = useState(null);
  const [currentCategory, setCurrentCategory] = useState('positive');
  const [processedItems, setProcessedItems] = useState([]);
  const HEADER_TIMEOUT = 30000; // 30 seconds

  

  // Load data
  useEffect(() => {
      const fetchData = async () => {
          try {
              const [emotionsData, needsData] = await Promise.all([
                  loadEmotions(API_BASE_URL),
                  loadNeeds(API_BASE_URL)
              ]);
              setEmotions(emotionsData);
              setNeeds(needsData);
          } catch (err) {
              setError(err.message);
          }
      };

      fetchData();
  }, []);

  // Timer for category progression
  useEffect(() => {
      if (emotions.length === 0 || needs.length === 0) return;

      const timer = setTimeout(() => {
          switch (currentCategory) {
              case 'positive':
                  setCurrentCategory('negative');
                  break;
              case 'negative':
                  setCurrentCategory('needs');
                  break;
              case 'needs':
                  // Could either loop back to positive or end here
                  // For now, let's end
                  navigate(`/summary/${userId}`); // Assuming there's a summary route
                  break;
          }
      }, HEADER_TIMEOUT);

      return () => clearTimeout(timer);
  }, [currentCategory, emotions.length, needs.length, navigate, userId]);

  // Process data when emotions or needs change, or when category changes
  useEffect(() => {
      if (emotions.length === 0 || needs.length === 0) return;

      let itemsToProcess = [];

      switch (currentCategory) {
          case 'positive':
              const positiveEmotions = emotions
                  .filter(emotion => emotion[3]) // positive emotions
                  .reduce((acc, emotion) => {
                      const header = emotion[1]; // "header" is the category
                      if (!acc[header]) acc[header] = [];
                      acc[header].push(emotion[2]); // "name" is the emotion
                      return acc;
                  }, {});
              
              itemsToProcess = Object.entries(positiveEmotions).map(([header, items]) => ({
                  category: header,
                  items: items
              }));
              break;

          case 'negative':
              const negativeEmotions = emotions
                  .filter(emotion => !emotion[3])  // negative emotions
                  .reduce((acc, emotion) => {
                      const header = emotion[1];  // "header" is the category
                      if (!acc[header]) acc[header] = [];
                      acc[header].push(emotion[2]); // "name" is the emotion
                      return acc;
                  }, {});
              
              itemsToProcess = Object.entries(negativeEmotions).map(([header, items]) => ({
                  category: header,
                  items: items
              }));
              break;

          case 'needs':
              const groupedNeeds = needs.reduce((acc, need) => {
                  const header = need[1];
                  if (!acc[header]) acc[header] = [];
                  acc[header].push(need[2]);
                  return acc;
              }, {});
              
              itemsToProcess = Object.entries(groupedNeeds).map(([header, items]) => ({
                  category: header,
                  items: items
              }));
              break;
      }

      setProcessedItems(itemsToProcess);
  }, [emotions, needs, currentCategory]);

  if (error) return <div>Error: {error}</div>;
  if (!emotions.length || !needs.length) return <div>Loading...</div>;

  const handleSelectionComplete = (selectedItem) => {
      console.log('Selected:', selectedItem);
      // Add selection handling logic here
  };

  // Add a visual timer indicator
  const getHeaderText = () => {
      switch (currentCategory) {
          case 'positive':
              return 'Positive Emotions';
          case 'negative':
              return 'Negative Emotions';
          case 'needs':
              return 'Needs';
          default:
              return '';
      }
  };

  return (
      <div>
          <div className="header">
              <h2>{getHeaderText()}</h2>
              {/* Optional: Add a progress bar here */}
          </div>

          <EnhancedClusteringMoods
              items={processedItems}
              onSelectionComplete={handleSelectionComplete}
              currentCategory={currentCategory}
          />
      </div>
  );
};

export default MainController;