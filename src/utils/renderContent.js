const renderContent = (content) => {
	if (!content || content === null) {
		return { __html: '' }; // Return empty string if content is null or undefined
	}
	const escapeHtml = content.replace(/</g, '&lt;'); // Escape '<'
	return { __html: escapeHtml }; // Return escaped HTML
};

export default renderContent;
