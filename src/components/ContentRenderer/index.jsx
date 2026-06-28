import React from 'react';
import renderContent from '../../utils/renderContent';
import Style from './style.module.css';

const ContentRenderer = ({ value = '', className = '', minRows = 1, lineHeight = 1.5, ...prop }) => {
	className = `${Style.text} ${className}`;
	const minHeight = `${lineHeight * minRows}em`;

	return <div className={className} style={{ minHeight }} dangerouslySetInnerHTML={renderContent(value)} {...prop} />;
};

export default ContentRenderer;
