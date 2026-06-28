import React from 'react';
import Style from './style.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import CreateXO from '../../../Modals/CreateXO';
import { SwalDialog } from '../../../Swal';

function POFileList({ file = [], callbackRemoveFile = () => {}, setProject = () => {} }) {
	const files = Array.isArray(file) ? file : file ? [file] : [];
	const [showModal, setShowModal] = React.useState(false);
	const [selectedPO, setSelectedPO] = React.useState(null);
	const [selectedPOIndex, setSelectedPOIndex] = React.useState(null);

	const formatFileSize = (size) => {
		return (size / 1024).toFixed(2);
	};

	const handleClick = (file, index) => {
		setSelectedPO(file);
		setSelectedPOIndex(index);
		setShowModal(true);
	};

	const setConfirmedOrderNumber = (value, index) => {
		setProject((prevProject) => {
			const updatedFilePOArray = [...prevProject.filePO];
			updatedFilePOArray[index].remark = value;
			return {
				...prevProject,
				filePO: updatedFilePOArray
			};
		});
	};

	const onSubmitCreateXO = (wipNumber, filePO, xoNumbers, handleClose) => {
		// const hasInvalidXoNumber = xoNumbers.some((xo) => !xo.value);
		// const hasInvalidVendor = xoNumbers.some((xo) => !xo.vendor);
		const hasInvalidXoNumber = xoNumbers.some((xo) => !xo.xoNumber && xo.isDeleted !== 1);
		const hasInvalidVendor = xoNumbers.some((xo) => !xo.vendor && xo.isDeleted !== 1);

		if (hasInvalidXoNumber) {
			SwalDialog({
				icon: 'error',
				text: `XO Numbers are required.`,
				options: {}
			});
			return;
		}

		if (hasInvalidVendor) {
			SwalDialog({
				icon: 'error',
				text: `Vendor for each XO is required.`,
				options: {}
			});
			return;
		}

		filePO.xoNumbers = xoNumbers;

		setProject((prevProject) => {
			const updatedFilePOArray = [...prevProject.filePO];
			updatedFilePOArray[selectedPOIndex] = filePO;
			return {
				...prevProject,
				filePO: updatedFilePOArray
			};
		});
		handleClose();
		setShowModal(false);
	};

	if (files.length === 0)
		// return <div className="text-center my-3 text-danger">Upload Confirmed Order Files/Pif Before Add XO Number</div>;
		return (
			<div>
				<div className="my-1">
					<li className="col-8 col-md-10">
						<div className="p-2 border-secondary d-flex justify-content-between gap-2 rounded-1 flex-row">
							<div className="text-truncate text-danger">Upload Confirmed Order Files before Add XO Number</div>
						</div>
					</li>
					<div className=" d-flex flex-row">
						<div type="text" className="form-control text-muted">
							Enter Confirmed Order Number
						</div>
						<button className="btn btn-outline-secondary ms-2 col-4 col-md-2" disabled>
							XO
						</button>
					</div>
				</div>
			</div>
		);
	else
		return (
			<>
				{files?.map((file, index) => (
					<div key={index}>
						<div className="my-3">
							<li className="mb-1">
								<div className="p-2 border border-primary d-flex justify-content-between gap-2 rounded-1 flex-row">
									<div className="text-truncate col-7">{file.path || file.description || file.originalName}</div>
									<div className="d-flex flex-nowrap justify-content-end">
										{file.size ? <em className={`${Style.sizeFile} me-2`}>{formatFileSize(file.size)} KB</em> : null}
										<button
											onClick={() => {
												callbackRemoveFile(index);
											}}
											className="btn btn-sm btn-link text-danger">
											<FontAwesomeIcon icon={faTimes} className="text-danger" fixedWidth />
										</button>
									</div>
								</div>
							</li>
							<div className=" d-flex flex-row">
								<input
									type="text"
									className="form-control"
									placeholder="Enter Confirmed Order Number"
									value={file.remark}
									onChange={(e) => setConfirmedOrderNumber(e.target.value, index)}
								/>
								<button
									className="btn btn-outline-primary ms-2 col-4 col-md-2"
									onClick={() => {
										handleClick(file, index);
									}}>
									XO
								</button>
							</div>
						</div>
						{file.xoNumbers &&
							file.xoNumbers?.map(
								(xo, xoIndex) =>
									xo.isDeleted !== 1 && (
										<div key={xoIndex} className="d-flex p-2 ms-3">
											<div>XO Number: {xo?.xoNumber}</div>
											<div className="ms-2">From {xo.vendor?.name || xo.vendor || 'N/A'}</div>
										</div>
									)
							)}
					</div>
				))}
				<CreateXO
					show={showModal}
					closeModal={() => {
						setShowModal(false);
					}}
					filePO={selectedPO}
					onSubmit={onSubmitCreateXO}
				/>
			</>
		);
}

export default POFileList;
