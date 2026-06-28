import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import Style from './style.module.css';
import { SwalDialog } from '../../Swal';

export default function Dropzone({ id, caption, acceptFiles, callbackUploadFile = () => {}, maxFiles = 10 }) {
	const maxFileSize = 20 * 1024 * 1024; // 20 MB
	const acceptFileTypes = acceptFiles || {
		'image/jpeg': ['.jpg', '.jpeg'],
		'image/png': ['.png'],
		'image/svg+xml': ['.svg'],
		// 'image/gif': ['.gif'],
		// 'image/webp': ['.webp'],
		// 'image/bmp': ['.bmp'],
		'application/pdf': ['.pdf'],
		'text/plain': ['.txt'],
		'application/vnd.ms-excel': ['.xls'],
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
		'application/msword': ['.doc'],
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
		'application/vnd.ms-powerpoint': ['.ppt'],
		'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
		'application/vnd.visio': ['.vsd'],
		'application/octet-stream': ['.msg'],
		'application/vnd.ms-outlook': ['.msg']
	};

	const [uploadedFilesCount, setUploadedFilesCount] = useState(0);

	const onDrop = useCallback(
		(acceptedFiles, fileRejections) => {
			if (uploadedFilesCount + acceptedFiles.length > maxFiles) {
				SwalDialog({
					icon: 'warning',
					text: `You can only upload a maximum of ${maxFiles} files.`,
					options: {}
				});
				return;
			}

			const oversizedFiles = fileRejections.filter(({ file }) => file.size > maxFileSize).map(({ file }) => file.name);
			if (oversizedFiles.length > 0) {
				SwalDialog({
					icon: 'warning',
					text: `The following files exceed the maximum allowed size of 20 MB: ${oversizedFiles.join(', ')}.`,
					options: {}
				});
			}

			acceptedFiles.forEach((file) => {
				callbackUploadFile(file);
			});
			setUploadedFilesCount((prevCount) => prevCount + acceptedFiles.length);
		},
		[callbackUploadFile, uploadedFilesCount, maxFiles]
	);

	const {
		getRootProps,
		getInputProps,
		// acceptedFiles,
		// fileRejections,
		isFocused,
		isDragAccept,
		isDragReject,
		fileRejections
	} = useDropzone({
		onDrop,
		maxSize: maxFileSize,
		accept: acceptFileTypes
		// getFilesFromEvent: (event) => callbackUploadEvent(event),
	});
	// const acceptedFileItems = acceptedFiles.map((file) => {
	//   const formatFileSize = (size) => {
	//     return (size / 1024).toFixed(2);
	//   };

	//   return (
	//     <li key={file.path}>
	//       <div className="p-2 border border-primary d-flex justify-content-between gap-2">
	//         <span>{file.path}</span>
	//         <div>
	//           <em>{formatFileSize(file.size)} KB</em>
	//           <button
	//             onClick={() => {
	//               callbackRemoveFile(file);
	//             }}
	//           >
	//             <FontAwesomeIcon
	//               icon={faTimes}
	//               className="text-danger"
	//               fixedWidth
	//             />
	//           </button>
	//         </div>
	//       </div>
	//     </li>
	//   );
	// });
	// const fileRejectionItems = fileRejections.map(({ file, errors }) => (
	//   <li key={file.path}>
	//     {file.path} - {file.size} bytes
	//     <ul>
	//       {errors.map((e) => (
	//         <li key={e.code}>{e.message}</li>
	//       ))}
	//     </ul>
	//   </li>
	// ));
	const className = React.useMemo(() => {
		return [
			Style.dropzone,
			isFocused ? Style.focused : '',
			isDragAccept ? Style.accept : '',
			isDragReject ? Style.reject : ''
		].join(' ');
	}, [isFocused, isDragAccept, isDragReject]);

	return (
		<section className={Style.container}>
			<div {...getRootProps({ className })}>
				<input id={id} {...getInputProps()} />
				<div className="d-flex align-items-top">
					<FontAwesomeIcon icon={faUpload} fixedWidth className={Style.icon} />
					<div>
						<div className={Style.label}>
							{caption || `Drag 'n' drop files here, or click to select files manually`}
						</div>
						{acceptFileTypes && Object.keys(acceptFileTypes || {}).length > 0 && (
							<div className={Style.remarks}>
								.jpg, .jpeg, .png, .pdf, .txt, .xls, .xlsx, .doc, .docx, .ppt, .pptx, .vsd
							</div>
						)}
					</div>
				</div>
			</div>
			{/* <div className="mt-3">
        <h4>Accepted files</h4>
        <ul className="ms-3 mt-2 mb-3">{acceptedFileItems}</ul>
      </div>
      <div>
        <h4>Rejected files</h4>
        <ul className="ms-3 mt-2 mb-3">{fileRejectionItems}</ul>
      </div> */}
		</section>
	);
}
