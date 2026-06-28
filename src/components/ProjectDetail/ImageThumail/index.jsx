import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircleXmark, faDownload } from '@fortawesome/free-solid-svg-icons';
import JSZip from 'jszip';
import axios from 'axios';
import Style from './style.module.css';

const ImageThumail = ({ index, files, label }) => {
	const [isModalOpen, setModalOpen] = useState(false);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);

	if (!files) return;

	const downloadAllFiles = async () => {
		const zip = new JSZip();
		const folder = zip.folder(label || 'SurveyPictures');

		for (const file of files) {
			const fileName = file.description || file.originalName;
			const filePath = `/api/files/${file?.attachmentType || file?.type}/${file.reference || file._id}/${fileName}`;

			try {
				const response = await axios.get(filePath, {
					responseType: 'blob'
				});
				folder.file(fileName, response.data);
			} catch (error) {
				console.error('Error fetching file:', fileName, error);
			}
		}

		const content = await zip.generateAsync({ type: 'blob' });
		const link = document.createElement('a');
		link.href = URL.createObjectURL(content);
		link.download = `${label}_files.zip`;
		link.click();
	};

	const openModal = (index) => {
		setSelectedImageIndex(index);
		setModalOpen(true);
	};

	const closeModal = () => {
		setModalOpen(false);
	};

	// Determine the number of thumbnails to display
	const maxThumbnails = 3; // Adjusted to show 3 thumbnails
	const thumbnailsToShow = files.slice(1, maxThumbnails + 1);
	const extraCount = files.length - maxThumbnails - 1;

	return (
		<div key={index}>
			<div className="my-3 d-flex align-items-center">
				{files?.length > 0 ? (
					<FontAwesomeIcon icon={faCircleCheck} className="text-success fs-4" />
				) : (
					<FontAwesomeIcon icon={faCircleXmark} className="text-secondary fs-4" />
				)}
				<div className="ms-2">{label}</div>
				{files?.length > 0 && (
					<button className="btn btn-link text-decoration-none" onClick={downloadAllFiles}>
						<FontAwesomeIcon icon={faDownload} /> Download All
					</button>
				)}
			</div>

			<div className="d-flex">
				{/* Large Image on the left */}
				<div className="position-relative me-3">
					<img
						src={`/api/files/${files[0].attachmentType || files[0].type}/${
							files[0].reference || files[0]._id
						}/${files[0].originalName}`}
						alt={files[0].description || files[0].originalName}
						style={{ width: 'auto', height: '50vh', cursor: 'pointer', borderRadius: '4px' }}
						onClick={() => openModal(0)}
						loading="lazy"
					/>/
				</div>

				{/* Thumbnails on the right */}
				<div className="d-flex flex-column gap-2">
					{thumbnailsToShow.map((file, fileIndex) => (
						<div key={fileIndex} className="position-relative">
							<img
								src={`/api/files/${file.attachmentType || file.type}/${
									file.reference || file._id
								}/${file.originalName}`}
								alt={file.description || file.originalName}
								style={{ width: '100px', height: 'auto', cursor: 'pointer', borderRadius: '4px' }}
								onClick={() => openModal(fileIndex + 1)}
								loading="lazy"
							/>
							{/* Overlay for the last thumbnail if there are extra images */}
							{fileIndex === maxThumbnails - 1 && extraCount > 0 && (
								<div
									className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
									style={{
										backgroundColor: 'rgba(0, 0, 0, 0.6)',
										color: 'white',
										fontSize: '14px',
										borderRadius: '4px',
										cursor: 'pointer'
									}}
									onClick={() => openModal(fileIndex + 1)}>
									+{extraCount}
								</div>
							)}
						</div>
					))}
				</div>
			</div>

			{/* Full-Screen Modal */}
			{isModalOpen && (
				<div className={`modal ${Style.modalStyle}`} onClick={closeModal}>
					<div className="position-relative" onClick={(e) => e.stopPropagation()}>
						<img
							src={`/api/files/${
								files[selectedImageIndex].attachmentType || files[selectedImageIndex].type
							}/${files[selectedImageIndex].reference || files[selectedImageIndex]._id}/${
								files[selectedImageIndex].originalName
							}`}
							alt="Full screen"
							className={Style.fullScreenImageStyle}
						/>
					</div>
					<div
						className="d-flex gap-2 mt-3 justify-content-center overflow-x-auto"
						style={{ width: '80%', whiteSpace: 'nowrap' }}
						onClick={(e) => e.stopPropagation()}>
						{files.map((file, idx) => (
							<img
								key={idx}
								src={`/api/files/${file.attachmentType || file.type}/${
									file.reference || file._id
								}/${file.originalName}`}
								alt={file.description || file.originalName}
								style={{
									width: '60px',
									height: '60px',
									objectFit: 'cover',
									cursor: 'pointer',
									border: selectedImageIndex === idx ? '2px solid #007bff' : '2px solid transparent'
								}}
								onClick={() => setSelectedImageIndex(idx)}
								loading="lazy"
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default ImageThumail;
