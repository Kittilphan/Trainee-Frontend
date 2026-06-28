import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import ContentRenderer from '../../../ContentRenderer';

const ViewVendor = ({ show, onClose, vendorData }) => {
	const [vendor, setVendor] = useState({
		_id: -1,
		name: ''
	});

	useEffect(() => {
		if (vendorData) setVendor(vendorData);

		return;
	}, [vendorData]);

	return (
		<Modal show={show} onHide={onClose}>
			<Modal.Header closeButton>
				<Modal.Title>View Vendor</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form>
					<Form.Group>
						<Form.Label>Vendor Name</Form.Label>
						<ContentRenderer className="form-control input-group bg-light text-muted" value={vendor?.name} />
					</Form.Group>
				</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={onClose}>
					Close
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default ViewVendor;
