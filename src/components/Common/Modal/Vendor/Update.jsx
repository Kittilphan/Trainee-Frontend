import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
import VendorController from '../../../../controllers/Vendors';
import { SwalDialog } from '../../../Swal';

const UpdateVendor = ({ show, onClose, vendorData }) => {
	const [vendor, setVendor] = useState({
		_id: -1,
		name: ''
	});

	const [cancelTokenSource, setCancelTokenSource] = useState(null);

	useEffect(() => {
		if (vendorData) {
			setVendor(vendorData);
		}
		return () => {
			if (cancelTokenSource) {
				cancelTokenSource.cancel();
			}
		};
	}, [vendorData]);

	const handleNameChange = (e) => {
		const { name, value } = e.target;
		setVendor({ ...vendor, [name]: value });
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		if (!vendor?.name) {
			SwalDialog({
				icon: 'warning',
				text: 'Vendor name is required',
				options: {}
			});
			return;
		}

		const source = axios.CancelToken.source();
		setCancelTokenSource(source);

		VendorController.update({
			id: vendor?._id,
			payload: vendor,
			options: { cancelToken: source.token }
		})
			.then((result) => {
				console.log('result: ', result);
				SwalDialog({
					icon: 'success',
					text: `Vendor name "${vendor.name}" updated`,
					options: {}
				}).then(() => {
					setVendor({ name: '' });
					onClose();
				});
			})
			.catch((err) => {
				console.log('ERROR VendorController.update()', err);
				SwalDialog({
					icon: 'error',
					text: err.message || 'An error occurred',
					options: {}
				});
			});
	};

	return (
		<Modal show={show} onHide={onClose}>
			<Modal.Header closeButton>
				<Modal.Title>Update Vendor</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form onSubmit={handleSubmit}>
					<Form.Group>
						<Form.Label htmlFor="name">Name</Form.Label>
						<Form.Control
							type="text"
							id="name"
							name="name"
							value={vendor.name}
							onChange={handleNameChange}
							placeholder="Enter vendor name"
						/>
					</Form.Group>
					<hr />
					<Form.Group className="mt-3 gap-3 d-flex justify-content-end">
						<hr />
						<Button variant="secondary" onClick={onClose} className="ml-2">
							Close
						</Button>
						<Button variant="primary" type="submit">
							Update
						</Button>
					</Form.Group>
				</Form>
			</Modal.Body>
		</Modal>
	);
};

export default UpdateVendor;
