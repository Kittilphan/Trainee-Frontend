import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { Modal, Button, Form, Tabs, Tab } from 'react-bootstrap';
import CustomerController from '../../../../controllers/Customers';
import { SwalDialog } from '../../../Swal';

const TempCustomer = ({
	show,
	selectedCustomer = {},
	onClose = () => {},
	onSubmit = () => {},
	onCustomerChange = () => {}
}) => {
	const [tempCustomers, setTempCustomers] = useState([]);
	const [customer, setCustomer] = useState({
		name: ''
	});
	const [activeTab, setActiveTab] = useState('select');

	const fetchCustomerOptions = async (cancelTokenSource) => {
		const data = await CustomerController.list({
			fields: {
				areAll: true,
				fields: { _id: 1, name: 1, alias: 1 },
				filter: [{ field: 'isTemp', operator: 'is', value: 'true' }]
			},
			options: { cancelToken: cancelTokenSource.token }
		});
		setTempCustomers(
			data?.customers?.map((v) => {
				return { value: v._id, label: `${v.alias ? `[${v.alias}] ` : ''}${v.name}` };
			})
		);
	};

	useEffect(() => {
		let cancelTokenSource = axios.CancelToken.source();
		fetchCustomerOptions(cancelTokenSource);

		return () => {
			cancelTokenSource.cancel('cancel due to unmounted');
		};
	}, []);

	const clearData = () => {
		setCustomer({
			name: ''
		});
		onClose();
	};

	const handleNameChange = (e) => {
		setCustomer({ ...customer, name: e.target.value });
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

		let cancelTokenSource = axios.CancelToken.source();
		CustomerController.createTemp({
			payload: customer,
			options: { cancelToken: cancelTokenSource.token }
		})
			.then((result) => {
				console.log('result: ', result);
				SwalDialog({
					icon: 'success',
					text: `Customer name::${result.name} created`,
					options: {}
				}).then(() => {
					setCustomer({
						name: ''
					});
					onCustomerChange({ value: result._id, label: result.name });
					fetchCustomerOptions(cancelTokenSource);
					onClose();
				});
			})
			.catch((err) => {
				console.log(`ERROR CustomerController.create()`, err);
				SwalDialog({
					icon: 'error',
					text: `${err.response?.data?.error || err}`,
					options: {}
				});
			});
	};

	return (
		<Modal show={show} onHide={onClose}>
			<Modal.Header closeButton>
				<Modal.Title>Temporary Customer</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
					<Tab eventKey="select" title="Select Existing">
						<Form.Group className="mt-3">
							<Form.Label>Select Temporary Customer</Form.Label>
							<Select
								options={tempCustomers}
								value={selectedCustomer}
								onChange={onCustomerChange}
								placeholder="Select a customer"
							/>
						</Form.Group>
						<hr />
						<Form.Group className="mt-3 gap-3 d-flex justify-content-end">
							<Button variant="secondary" onClick={onClose}>
								Close
							</Button>
						</Form.Group>
					</Tab>
					<Tab eventKey="create" title="Create New">
						<Form
							onSubmit={(e) => {
								e.preventDefault();
								handleSubmit();
							}}>
							<Form.Group className="mt-3">
								<Form.Label htmlFor="name">Temporary Customer Name</Form.Label>
								<Form.Control
									type="text"
									id="name"
									placeholder="Enter customer name"
									value={customer.name}
									onChange={handleNameChange}
								/>
							</Form.Group>
							<hr />
							<Form.Group className="mt-3 gap-3 d-flex justify-content-end">
								<Button variant="danger" onClick={clearData}>
									Cancel
								</Button>
								<Button variant="success" type="submit">
									Create
								</Button>
							</Form.Group>
						</Form>
					</Tab>
				</Tabs>
			</Modal.Body>
		</Modal>
	);
};

export default TempCustomer;
