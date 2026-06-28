import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form } from 'react-bootstrap';
import AutoResizingTextarea from '../../../AutoResizingTextarea/AutoResizingTextarea';
import CustomerController from '../../../../controllers/Customers';
import { SwalDialog } from '../../../Swal';
import SpinLoading from '../../../SpinLoading';

const UpdateCustomer = ({ show, onClose = () => {}, onSubmit = () => {}, customerData }) => {
	const [customer, setCustomer] = useState({
		_id: -1,
		name: '',
		locations: []
	});
	const [initial, setInitial] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (customerData) {
			setCustomer(customerData);
			fetchCustomer();
		}

		return;
	}, [customerData]);

	const fetchCustomer = () => {
		if (customerData?.isTemp !== undefined) {
			setIsLoading(true);
			CustomerController.getById({
				id: customerData?._id,
				fields: { isTemp: customerData.isTemp }
			})
				.then((result) => {
					console.log('result: ', result);
					setCustomer(result);
					setInitial(result);
					setIsLoading(false);
				})
				.catch((err) => {
					console.log(`ERROR CustomerController.getById()`, err);
					SwalDialog({
						icon: 'error',
						text: `${err}`,
						options: {}
					});
					setIsLoading(false);
				});
		}
	};

	const handleChange = (e) => {
		e.preventDefault();
		const { id, name, value } = e.target;
		setCustomer({ ...customer, [id || name]: value });
	};

	const handleAddLocation = () => {
		setCustomer({
			...customer,
			locations: [...(customer.locations || []), { label: '', location: '' }]
		});
	};

	const handleRemoveLocation = (index) => {
		const updatedLocations = customer.locations.filter((_, locIndex) => locIndex !== index);
		setCustomer({
			...customer,
			locations: updatedLocations
		});
	};

	const handleLocationChange = (e, index) => {
		const { id, name, value } = e.target;
		const label = id || name;
		const updatedLocations = [...customer.locations];
		updatedLocations[index][label === 'location' ? 'location' : 'label'] = value;
		setCustomer({
			...customer,
			locations: updatedLocations
		});
	};

	const handleSubmit = () => {
		if (!customer?.name) {
			SwalDialog({
				icon: 'warning',
				text: 'Customer name is required',
				options: {}
			});
			return;
		}
		let customerUpdate = {};
		Object.keys(customer).forEach((key) => {
			if (initial[key] !== customer[key] && customer[key] !== null && customer[key] !== undefined) {
				customerUpdate[key] = customer[key];
			}
		});
		customerUpdate.isTemp = customer.isTemp;

		let cancelTokenSource = axios.CancelToken.source();
		CustomerController.update({
			id: customer?._id,
			payload: customerUpdate,
			options: { cancelToken: cancelTokenSource.token }
		})
			.then((result) => {
				console.log('result: ', result);
				SwalDialog({
					icon: 'success',
					text: `Customer name::${customer.name} updated`,
					options: {}
				}).then(() => {
					setCustomer({
						name: '',
						locations: []
					});
					onClose();
				});
			})
			.catch((err) => {
				console.log(`ERROR CustomerController.create()`, err);
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
				<Modal.Title>Update Customer</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form className="row gap-4">
					<Form.Group>
						<Form.Label htmlFor="name">Customer Name</Form.Label>
						<Form.Control
							type="text"
							id="name"
							placeholder="Enter customer name"
							value={customer?.name || ''}
							onChange={handleChange}
						/>
					</Form.Group>
					<Form.Group>
						<Form.Label htmlFor="alias">Customer Alias</Form.Label>
						<Form.Control
							type="text"
							id="alias"
							placeholder="Enter customer name"
							value={customer?.alias || ''}
							onChange={handleChange}
						/>
					</Form.Group>
					<Form.Group>
						<Form.Label>Locations</Form.Label>

						{isLoading ? (
							<div className="my-3">
								<SpinLoading />
							</div>
						) : (
							customer?.locations?.map((loc, index) => (
								<div className="mb-2" key={index}>
									<div className="input-group">
										<label htmlFor={`label-${index}`} className="input-group-text">
											Label
										</label>
										<input
											type="text"
											className="form-control"
											id={`label-${index}`}
											value={loc.label}
											onChange={(e) => handleLocationChange(e, index)}
										/>
									</div>
									<div>
										<AutoResizingTextarea
											className="form-control"
											value={loc.location}
											placeholder={`Location of ${loc.label || 'this label'}`}
											onChange={(e) => handleLocationChange(e, index)}
											id="location"
										/>
									</div>
									<button
										className="text-end text-secondary "
										onClick={() => {
											handleRemoveLocation(index);
										}}>
										remove
									</button>
								</div>
							))
						)}
						<Button variant="primary mb-2" onClick={handleAddLocation}>
							Add Location
						</Button>
					</Form.Group>
				</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="danger" onClick={onClose}>
					Cancel
				</Button>
				<Button variant="success" onClick={handleSubmit}>
					Save
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default UpdateCustomer;
