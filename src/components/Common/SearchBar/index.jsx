import React, { useState } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';

const SearchBar = ({ onSearch }) => {
	const [query, setQuery] = useState('');

	const handleClear = () => {
		setQuery('');
		if (onSearch) onSearch('');
	};

	const handleSearch = (e) => {
		e.preventDefault();
		if (onSearch) onSearch(query);
	};

	return (
		<Form onSubmit={handleSearch} className="d-flex align-items-center">
			<InputGroup>
				<Form.Control
					type="text"
					placeholder="Search..."
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					className="border-primary"
				/>
				{query && (
					<Button variant="outline-primary" onClick={handleClear}>
						<FontAwesomeIcon icon={faTimes} />
					</Button>
				)}
				<div className="btn btn-outline-primary border-start-0" onClick={handleSearch}>
					<FontAwesomeIcon icon={faSearch} />
				</div>
			</InputGroup>
		</Form>
	);
};

export default SearchBar;
