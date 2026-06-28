import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons';

const FileRelate = ({ index, files, label }) => {
	return (
		<div key={index}>
			<div className="my-3 d-flex">
				{files?.length > 0 ? (
					<FontAwesomeIcon icon={faCircleCheck} className="text-success fs-4" />
				) : (
					<FontAwesomeIcon icon={faCircleXmark} className="text-secondary fs-4" />
				)}
				<div className="ms-2">{label}</div>
			</div>
			{files?.map((file, fileIndex) => (
				<div key={fileIndex} className="ms-4 my-3 text-truncate">
					<span className="ms-4 mb-2 underline-on-hover">
						<a
							href={`/api/files/${file?.attachmentType || file?.type}/${file.reference || file._id}/${
								file.description || file.originalName
							}`}
							target="_blank">
							{file.description || file.originalName}
						</a>
					</span>
				</div>
			))}
		</div>
	);
};

export default FileRelate;
