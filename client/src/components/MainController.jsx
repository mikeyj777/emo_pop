import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EnhancedClusteringMoods from "./EnhancedClusteringMoods";
import StageHeader from "./ui/StageHeader";
import { loadEmotions, loadNeeds, storeEmotions, storeNeeds } from "../utils/handleData";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const MainController = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    
    // Core state
    const [emotions, setEmotions] = useState([]);
    const [needs, setNeeds] = useState([]);
    const [error, setError] = useState(null);
    
    // Navigation and processing state
    const [currentCategory, setCurrentCategory] = useState('positive');
    const [currentHeaderIndex, setCurrentHeaderIndex] = useState(0);
    const [processedItems, setProcessedItems] = useState([]);
    const [currentItems, setCurrentItems] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [remainingItems, setRemainingItems] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Load initial data
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

    // Process and store selected items
    const processAndStoreSelectedItems = async () => {
      try {
          // Group items by category
          const emotionsPositive = selectedItems
              .filter(item => item.category === 'positive' && item.wasSelected)
              .map(item => item.item);
              
          const emotionsNegative = selectedItems
              .filter(item => item.category === 'negative' && item.wasSelected)
              .map(item => item.item);
              
          const needs = selectedItems
              .filter(item => item.category === 'needs' && item.wasSelected)
              .map(item => item.item);
  
          // Store emotions if any exist
          if (emotionsPositive.length > 0) {
              await storeEmotions(API_BASE_URL, userId, emotionsPositive, 'positive');
          }
          
          if (emotionsNegative.length > 0) {
              await storeEmotions(API_BASE_URL, userId, emotionsNegative, 'negative');
          }
  
          // Store needs if any exist
          if (needs.length > 0) {
              await storeNeeds(API_BASE_URL, userId, needs);
          }
  
          // Remove the setSelectedItems([]) from here since the useEffect will handle it
      } catch (error) {
          throw new Error(`Failed to store items: ${error.message}`);
      }
    };

    // Process data when emotions or needs change, or when category changes
    useEffect(() => {
        if (emotions.length === 0 || needs.length === 0) return;

        let itemsToProcess = [];

        switch (currentCategory) {
            case 'positive':
                const positiveEmotions = emotions
                    .filter(emotion => emotion[3])
                    .reduce((acc, emotion) => {
                        const header = emotion[1];
                        if (!acc[header]) acc[header] = [];
                        acc[header].push(emotion[2]);
                        return acc;
                    }, {});
                
                itemsToProcess = Object.entries(positiveEmotions).map(([header, items]) => ({
                    header,
                    items
                }));
                break;

            case 'negative':
                const negativeEmotions = emotions
                    .filter(emotion => !emotion[3])
                    .reduce((acc, emotion) => {
                        const header = emotion[1];
                        if (!acc[header]) acc[header] = [];
                        acc[header].push(emotion[2]);
                        return acc;
                    }, {});
                
                itemsToProcess = Object.entries(negativeEmotions).map(([header, items]) => ({
                    header,
                    items
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
                    header,
                    items
                }));
                break;
        }

        setProcessedItems(itemsToProcess);
        setCurrentHeaderIndex(0);
    }, [emotions, needs, currentCategory]);

    // Handle header/category progression and set current items
    useEffect(() => {
        if (processedItems.length === 0) return;
        
        if (currentHeaderIndex >= processedItems.length) {
            const handleCategoryTransition = async () => {
                setIsTransitioning(true);
                try {
                    
                    switch (currentCategory) {
                        case 'positive':
                            setCurrentCategory('negative');
                            setCurrentHeaderIndex(0);
                            break;
                        case 'negative':
                            setCurrentCategory('needs');
                            setCurrentHeaderIndex(0);
                            break;
                        case 'needs':
                            navigate(`/dashboard/${userId}`);
                            break;
                    }
                } catch (error) {
                    setError(`Error during category transition: ${error.message}`);
                } finally {
                    setIsTransitioning(false);
                }
            };

            handleCategoryTransition();
            return;
        }

        // Set current items for the current header
        const current = processedItems[currentHeaderIndex];
        setCurrentItems(current);
        setRemainingItems(current.items.length);
    }, [currentHeaderIndex, processedItems, currentCategory, navigate, userId]);

    useEffect(() => {
      // Don't process if there are no selected items
      if (selectedItems.length === 0) return;
      
      const processItems = async () => {
          try {
              await processAndStoreSelectedItems();
          } catch (error) {
              setError(`Error processing items: ${error.message}`);
          }
      };
  
      processItems();
  }, [selectedItems]); // Dependency array with selectedItems

    // Handle completed bubbles
    const handleBubblesFate = (processedBubbles) => {
      // Add selected items to cumulative array, replacing previous selections
      const newSelected = processedBubbles.filter(item => item.wasSelected);
      setSelectedItems(newSelected); // Replace instead of append
      
      // Update remaining count and check for completion
      setRemainingItems(remaining => {
          const newRemaining = remaining - processedBubbles.length;
          
          // If we've processed all items, move to next header
          if (newRemaining === 0) {
              setCurrentHeaderIndex(prev => prev + 1);
          }
          
          return newRemaining;
      });
    };

    // Loading and error states
    if (error) return <div className="status-message error">Error: {error}</div>;
    if (!emotions.length || !needs.length || isTransitioning) {
        return <div className="status-message loading">Loading...</div>;
    }
    if (!currentItems) return <div className="status-message processing">Processing...</div>;

    // Get header text for display
    const getHeaderText = () => {
        if (!currentItems) return '';
        return currentItems.header;
    };

    return (
        <div className="mood-container">
            
            <StageHeader 
                currentCategory={currentCategory} 
                currentHeader={getHeaderText()}
            />

            <EnhancedClusteringMoods
                items={currentItems.items}
                category={currentCategory}
                header={currentItems.header}
                onBubblesFate={handleBubblesFate}
            />
        </div>
    );
};

export default MainController;