import React, { useState } from 'react';
import axios from 'axios';
import { Modal, Button, Form } from 'react-bootstrap';
import VendorController from '../../../../controllers/Vendors';
import { SwalDialog } from '../../../Swal';

const CreateVendor = ({ show, onClose = () => {} }) => {
	const [vendor, setVendor] = useState({
		name: ''
	});

	const handleNameChange = (e) => {
		setVendor({ ...vendor, name: e.target.value });
	};

	const handleSubmit = (e) => {
		e.preventDefault(); // Prevent default form submission behavior

		if (!vendor?.name) {
			SwalDialog({
				icon: 'warning',
				text: 'Vendor name is required',
				options: {}
			});
			return;
		}

		let cancelTokenSource = axios.CancelToken.source();
		VendorController.create({
			payload: vendor,
			options: { cancelToken: cancelTokenSource.token }
		})
			.then((result) => {
				console.log('result: ', result);
				SwalDialog({
					icon: 'success',
					text: `Vendor name: ${vendor.name} created`,
					options: {}
				}).then(() => {
					setVendor({ name: '' }); // Clear the input field after success
					onClose(); // Close the modal
				});
			})
			.catch((err) => {
				console.log(`ERROR VendorController.create()`, err);
				SwalDialog({
					icon: 'error',
					text: `${err}`,
					options: {}
				});
			});
	};

	return (
		<Modal show={show} onHide={onClose}>
			<Modal.Header closeButton>
				<Modal.Title>Create Vendor</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form onSubmit={handleSubmit}>
					<Form.Group>
						<Form.Label htmlFor="name">Vendor Name</Form.Label>
						<Form.Control
							id="name"
							type="text"
							placeholder="Enter vendor name"
							value={vendor.name}
							onChange={handleNameChange}
						/>
					</Form.Group>
					<hr />
					<Form.Group className="mt-3 gap-3 d-flex justify-content-end">
						<hr />

						<Button variant="danger" onClick={onClose}>
							Cancel
						</Button>
						<Button variant="success" type="submit">
							Create
						</Button>
					</Form.Group>
				</Form>
			</Modal.Body>
		</Modal>
	);
};

export default CreateVendor;
