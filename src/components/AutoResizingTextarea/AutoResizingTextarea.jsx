import React, { useState, useEffect, useRef } from 'react';

const AutoResizingTextarea = ({ id, name, value, readOnly, onChange, ...prop }) => {
	const [text, setText] = useState('');
	const textareaRef = useRef(null);

	useEffect(() => {
		setText(value);
	}, [value]);

	const handleChange = (event) => {
		if (onChange) {
			onChange(event);
		}
		setText(event.target.value);
	};

	useEffect(() => {
		const textarea = textareaRef.current;
		textarea.style.height = 'auto';
		textarea.style.height = `${textarea.scrollHeight}px`;
		textarea.style.overflow = 'hidden';

		return;
	}, [text]);

	return (
		<textarea
			className={`form-control ${readOnly ? 'bg-light text-muted' : ''}`}
			id={id || name}
			rows="2"
			ref={textareaRef}
			value={text}
			onChange={handleChange}
			readOnly={readOnly}
			{...prop}
		/>
	);
};

export default AutoResizingTextarea;
