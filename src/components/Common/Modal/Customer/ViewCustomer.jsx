import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button, ListGroup } from 'react-bootstrap';
import AutoResizingTextarea from '../../../AutoResizingTextarea/AutoResizingTextarea';
import CustomerController from '../../../../controllers/Customers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faPhone, faFax, faEnvelope, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { SwalDialog } from '../../../Swal';
import SpinLoading from '../../../SpinLoading';
import ContentRenderer from '../../../ContentRenderer';

const ViewCustomer = ({ show, onClose, customerData }) => {
	const [customer, setCustomer] = useState({});
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (customerData) {
			setCustomer(customerData);
			fetchCustomer();
		}
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
					setIsLoading(false);
				})
				.catch((err) => {
					console.log(`ERROR CustomerController.getById()`, err);
					SwalDialog({
						icon: 'error',
						text: `${err}`,
						options: {}
					});
				});
		}
	};

	const copyToClipboard = (text) => {
		navigator.clipboard.writeText(text || '').catch((err) => {
			console.error('Failed to copy: ', err);
		});
	};

	return (
		<Modal show={show} onHide={onClose}>
			<Modal.Header closeButton>
				<Modal.Title>View Customer</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div>
					<strong>Customer Name:</strong>
					<ContentRenderer value={customer?.name || 'N/A'} />
				</div>
				<div>
					<strong>Customer Alias:</strong>
					<ContentRenderer value={customer?.alias || 'N/A'} />
				</div>
				{isLoading ? (
					<div className="my-3">
						<SpinLoading />
					</div>
				) : (
					<>
						<div className="mt-3">
							<strong>Contact:</strong>
							{customer?.contact ? (
								<>
									<div className="col ms-3">
										<div className="d-flex gap-1">
											<FontAwesomeIcon icon={faPhone} /> <strong>Phone:</strong>{' '}
											<ContentRenderer value={customer.contact.phone || 'N/A'} />
										</div>

										<div className="d-flex gap-1">
											<FontAwesomeIcon icon={faFax} /> <strong>Fax:</strong>{' '}
											<ContentRenderer value={customer.contact.fax || 'N/A'} />
										</div>

										<div className="d-flex gap-1">
											<FontAwesomeIcon icon={faEnvelope} /> <strong>Email:</strong>{' '}
											<ContentRenderer value={customer.contact.email || 'N/A'} />
										</div>

										<div className="d-flex gap-1">
											<FontAwesomeIcon icon={faGlobe} /> <strong>Website:</strong>
											<a href={customer.contact.website || ''} target="_blank">
												{' '}
												{customer.contact.website || 'N/A'}
											</a>
										</div>
									</div>
								</>
							) : (
								<p>No Contact available.</p>
							)}
						</div>
						<div className="mt-3">
							<strong>Locations:</strong>
							{customer?.locations && customer.locations.length > 0 ? (
								<ListGroup className="ms-3">
									{customer.locations.map((loc, index) => (
										<div key={index}>
											<div className="d-flex justify-content-between align-items-center">
												<div className="d-flex">
													<strong>Label:</strong> <ContentRenderer value={loc.label || 'N/A'} />
												</div>
												<div
													onClick={() => {
														copyToClipboard(loc.location);
													}}>
													<FontAwesomeIcon icon={faCopy} fixedWidth className="me-1 btn" />
												</div>
											</div>
											<div className="mt-2">
												<ContentRenderer className="form-control bg-light text-muted" value={loc.location} />
											</div>
										</div>
									))}
								</ListGroup>
							) : (
								<p>No locations available.</p>
							)}
						</div>
					</>
				)}
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={onClose}>
					Close
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default ViewCustomer;
