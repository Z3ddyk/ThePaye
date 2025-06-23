import React, { createContext, useState } from 'react';

// Create the context
export const HistoryContext = createContext();

// Create the provider component
export const HistoryProvider = ({ children }) => {
  const [history, setHistory] = useState([]); // State to store the history array

  // Function to add a new calculation result to the history
  const addToHistory = (result) => {
    // Add a timestamp to the result for better organization/display in history
    const newResultWithTimestamp = { ...result, timestamp: new Date().toISOString() };
    setHistory((prev) => [newResultWithTimestamp, ...prev]); // Adds newest calculation on top
  };

  return (
    // Provide the history state and addToHistory function to all children components
    <HistoryContext.Provider value={{ history, addToHistory }}>
      {children}
    </HistoryContext.Provider>
  );
};
