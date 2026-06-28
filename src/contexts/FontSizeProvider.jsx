import React, { createContext, useState, useContext, useEffect } from 'react';
import FontSizeContext from './FontSizeContext';

export const FontSizeProvider = ({ children }) => {
	const [fontSize, setFontSize] = useState(() => {
		// Load initial font size from localStorage, or default to 16
		const savedFontSize = localStorage.getItem('fontSize');
		return savedFontSize ? parseInt(savedFontSize, 10) : 16; // Default font size
	});

	useEffect(() => {
		// Save font size to localStorage whenever it changes
		localStorage.setItem('fontSize', fontSize);
	}, [fontSize]);

	return <FontSizeContext.Provider value={{ fontSize, setFontSize }}>{children}</FontSizeContext.Provider>;
};

export const useFontSize = () => useContext(FontSizeContext);
