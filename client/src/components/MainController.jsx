import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EnhancedClusteringMoods from "./EnhancedClusteringMoods";
import StageHeader from "./StageHeader";
import { loadEmotions, loadNeeds } from "../utils/getData";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const MainController = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [emotions, setEmotions] = useState([]);
    const [needs, setNeeds] = useState([]);
    const [error, setError] = useState(null);
    const [currentCategory, setCurrentCategory] = useState('positive');
    const [currentHeaderIndex, setCurrentHeaderIndex] = useState(0);
    const [processedItems, setProcessedItems] = useState([]);
    const [currentItems, setCurrentItems] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [remainingItems, setRemainingItems] = useState(0);

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
        
        // If we've shown all headers in this category, move to next category
        if (currentHeaderIndex >= processedItems.length) {
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
                    navigate(`/summary/${userId}`);
                    break;
            }
            return;
        }

        // Set current items for the current header
        const current = processedItems[currentHeaderIndex];
        setCurrentItems(current);
        setRemainingItems(current.items.length);
    }, [currentHeaderIndex, processedItems, currentCategory, navigate, userId]);

    // Handle completed bubbles
    const handleBubblesFate = (processedBubbles) => {
        // Add selected items to cumulative array
        const newSelected = processedBubbles.filter(item => item.wasSelected);
        setSelectedItems(prev => [...prev, ...newSelected]);
        
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

    if (error) return <div>Error: {error}</div>;
    if (!emotions.length || !needs.length) return <div>Loading...</div>;
    if (!currentItems) return <div>Processing...</div>;

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