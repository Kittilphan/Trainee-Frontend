import React from 'react';

import Style from './style.module.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

function FileList({ file, callbackRemoveFile = () => {} }) {
	const files = Array.isArray(file) ? file : file ? [file] : [];

	const formatFileSize = (size) => {
		return (size / 1024).toFixed(2);
	};

	return (
		<>
			{files?.map((file, index) => (
				<li key={index} className="my-1">
					<div className="p-2 border border-primary d-flex justify-content-between gap-2 rounded-1 flex-row">
						<div className="text-truncate">{file.path || file.description || file.originalName}</div>
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
			))}
		</>
	);
}

export default FileList;
