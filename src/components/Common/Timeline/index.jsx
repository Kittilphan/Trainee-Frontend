import React from 'react';
import { Container, Modal } from 'react-bootstrap';
import {
	Timeline as MuiTimeline,
	TimelineItem,
	TimelineSeparator,
	TimelineConnector,
	TimelineContent,
	TimelineOppositeContent,
	TimelineDot
} from '@mui/lab';
import { Typography, Box } from '@mui/material';
import SpinLoading from '../../SpinLoading';

const Timeline = ({ label, show, onClose, data = [], isLoading = false }) => {
	return (
		<Modal show={show} onHide={onClose} size="lg">
			<Modal.Header closeButton>
				<Modal.Title>{label || 'Timeline'}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Container>
					{isLoading ? (
						<SpinLoading />
					) : data.length > 0 ? (
						<MuiTimeline>
							{data.map((event, index) => (
								<TimelineItem key={index}>
									{/* Left side - Time */}
									<TimelineOppositeContent sx={{ flex: '0 0 25%', textAlign: 'right' }}>
										<Typography variant="body2" color="textSecondary">
											{new Date(event.actionAt).toLocaleDateString()} {new Date(event.actionAt).toLocaleTimeString()}
										</Typography>
										<Typography variant="body2" color="textSecondary">
											{event.actionBy}
										</Typography>
									</TimelineOppositeContent>

									<TimelineSeparator>
										<TimelineDot color="primary" />
										{index < data.length - 1 && <TimelineConnector />}
									</TimelineSeparator>

									{/* Right side - Event Details */}
									<TimelineContent>
										<Box mb={2}>
											<Typography variant="h6">{event.header || 'Event Details'}</Typography>

											<Box>
												{event.metadata &&
													Object.entries(event.metadata).map(([key, value]) => (
														<Typography key={key} variant="body2" color="textSecondary" className="d-flex">
															<strong>{key}:</strong>

															<span>
																{Array.isArray(value) ? (
																	value.map((item, index) => (
																		<Typography key={index} variant="body2" color="textSecondary" className="text-wrap">
																			{item}
																		</Typography>
																	))
																) : (
																	<Typography variant="body2" color="textSecondary" className="text-wrap">
																		{value}
																	</Typography>
																)}
															</span>
														</Typography>
													))}
											</Box>
										</Box>
									</TimelineContent>
								</TimelineItem>
							))}
						</MuiTimeline>
					) : (
						<Box textAlign="center" mt={4}>
							<Typography variant="h6" color="textSecondary" className="mb-5">
								No timeline data available.
							</Typography>
						</Box>
					)}
				</Container>
			</Modal.Body>
		</Modal>
	);
};

export default Timeline;
