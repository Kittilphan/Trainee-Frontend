import React, { useState, useEffect } from 'react';
import IconButton from '@mui/joy/IconButton';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import FileController from '../../../../controllers/Files';
import axios from 'axios';
import { SwalDialog } from '../../../Swal';
import CustomToolbar from '../CustomToolbar';
import { useFontSize } from '../../../../contexts/FontSizeProvider';

const categoryList = [
	{ value: 'fileQuotation', label: 'Quotation File' },
	{ value: 'filePO', label: 'Confirmed Order Files' },
	{ value: 'fileOther', label: 'Other' },
	{ value: 'FileDiagram', label: 'Survey Diagram' },
	{ value: 'SurveyPicture', label: 'Survey Picture' },
	{ value: 'FileBom', label: 'BOM/BOQ' },
	{ value: 'FileConfig', label: 'Configuration' },
	{ value: 'FileTor', label: 'TOR/RFP' },
	{ value: 'FileComply', label: 'Comply' },
	{ value: 'FileProposal', label: 'Proposal' },
	{ value: 'FilePresentation', label: 'Presentation' },
	{ value: 'FilePoc', label: 'POC Document' },
	{ value: 'FileFloorPlan', label: 'Floor Plan/Heat Map' },
	{ value: 'FileUAT', label: 'UAT File' },
	{ value: 'FileFinalDiagram', label: 'Final Diagram Document' },
	{ value: 'FileSignOffDocument', label: 'Sign Off Document File' },
	{ value: 'FileTrainingDocument', label: 'Training Document File' },
	{ value: 'FileServiceReport', label: 'Service Report File' },
	{ value: 'FileDelivery', label: 'Delivery File' },
	{ value: 'FileDeliverySuccessReport', label: 'Delivery Success Report File' }
];

const teamList = [
	{ value: 'presale', label: 'Infra' },
	{ value: 'engineer', label: 'Engineer' },
	{ value: 'cabling', label: 'Cabling' },
	{ value: 'dataCenter', label: 'Data Center' },
	{ value: 'dataCenter', label: 'Data Center' }
];

export default function FileDataGrid({ projectId }) {
	const { fontSize, setFontSize } = useFontSize();

	const [files, setFiles] = useState([]);
	const [isLoading, setLoading] = useState(true);
	const [error, setError] = useState();
	const [pagination, setPagination] = useState({ page: 1, limit: 10 });
	const [filterModel, setFilterModel] = useState({ items: [] });
	const [total, setTotal] = useState(0);

	useEffect(() => {
		const debounceFetch = setTimeout(() => {
			if (projectId && pagination && filterModel) {
				fetchFiles();
			}
		}, 1500);

		return () => {
			clearTimeout(debounceFetch);
		};
	}, [projectId, pagination, filterModel]);

	function fetchFiles() {
		setLoading(true);
		let cancelTokenSource = axios.CancelToken.source();

		FileController.getFileByProjectId({
			projectId: projectId,
			fields: {
				...pagination,
				filter: filterModel.items || []
			},
			options: { cancelToken: cancelTokenSource.token }
		})
			.then((data) => {
				console.log(`FileController.getFileByProjectId() id=${projectId}`, data.files);
				if (!Array.isArray(data.files)) {
					throw new Error('Unexpected value');
				}
				setFiles(data.files);
				setTotal(data.total);
			})
			.catch((err) => {
				setError(err);
				console.error(`ERROR`, err);
			})
			.finally(() => {
				setLoading(false);
				cancelTokenSource.cancel('cancel due to unmounted');
			});
	}

	const handleFontSizeChange = (newSize) => {
		setFontSize(newSize);
	};

	const handlePaginationChange = (model) => {
		let { page, pageSize } = model;
		page = page > 0 ? page + 1 : 1;
		if (page !== pagination.page || pageSize !== pagination.limit) {
			setPagination((prev) => ({ ...prev, page, limit: pageSize }));
		}
	};

	const handleFilterModelChange = (model) => {
		setFilterModel(model);
	};

	const handleBtnClicked = (file) => {
		let cancelTokenSource = axios.CancelToken.source();

		FileController.downloadById({
			file: file,
			options: {
				cancelToken: cancelTokenSource.token
			}
		})
			.then((blob) => {
				// Create a new Blob URL
				const url = URL.createObjectURL(blob);

				// Create a temporary link element
				const a = document.createElement('a');
				a.href = url;
				a.download = file.originalName || 'download';
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);

				// Revoke the Blob URL after some time to free memory
				setTimeout(() => URL.revokeObjectURL(url), 10000);
			})
			.catch((err) => {
				console.log('ERROR FileController.downloadById()', err);
				SwalDialog({
					icon: 'error',
					text: `${
						err.response?.status === 403
							? 'User does not have access to that file'
							: err.response?.data?.message || err.response?.data?.error || err
					}`,
					options: {}
				});
			});
	};

	const columns = [
		{
			field: 'originalName',
			headerName: 'File Name',
			minWidth: 150,
			flex: 1,
			type: 'string',
			renderCell: (params) => {
				return (
					<a
						className="underline-on-hover"
						href={`/api/files/${params.row?.attachmentType || params.row?.type}/${params.id}/${params.value}`}
						target="_blank">
						{params.value}
					</a>
				);
			}
		},
		{
			field: 'wipNumber',
			headerName: 'WIP?',
			width: 135,
			type: 'string',
			valueGetter: (value) => value || '- - -'
		},
		{
			field: 'type',
			headerName: 'Category',
			width: 200,
			type: 'singleSelect',
			valueOptions: categoryList,
			valueGetter: (value) => value.replace(/presale|cabling|dataCenter|engineer|projectManager/, '').trim()
		},
		{
			field: 'team',
			headerName: 'Team',
			width: 100,
			type: 'singleSelect',
			valueOptions: teamList,
			renderCell: (params) => {
				const value = params.row?.type || '';
				let result = '';
				if (value === 'presaleFileTor' || value === 'presaleFileBom') result = 'Sale,Infra';
				else if (value.includes('presale') || value.includes('engineer')) result = 'Infra';
				else if (value.includes('cabling')) result = 'Cabling';
				else if (value.includes('dataCenter')) result = 'Data Center';

				return <div>{result}</div>;
			}
		},
		{
			field: 'uploadedBy',
			headerName: 'Uploaded by',
			width: 110,
			type: 'strings'
		},
		{
			field: 'uploadedAt',
			headerName: 'Uploaded at',
			width: 120,
			type: 'date',
			valueFormatter: (value) => new Date(value).toLocaleDateString('en-GB')
		},
		{
			field: 'action',
			headerName: 'Action',
			width: 150,
			type: 'actions',
			renderCell: (params) => (
				<div className="d-flex">
					<IconButton onClick={() => handleBtnClicked(params.row)} color="primary">
						<ArrowDownwardIcon />
					</IconButton>
					{/* <IconButton onClick={() => {}} color="danger">
						<DeleteIcon />
					</IconButton> */}
				</div>
			)
		}
	];

	return (
		<div className="mt-4">
			<DataGrid
				rows={files}
				columns={columns}
				getRowId={(row) => row._id}
				components={{ Toolbar: GridToolbar }}
				pageSize={pagination.limit}
				pageSizeOptions={[10, 25, 100]}
				initialState={{
					pagination: {
						paginationModel: { pageSize: pagination.limit, page: pagination.page - 1 }
					},
					columns: {
						columnVisibilityModel: {
							uploadedAt: false
						}
					}
				}}
				slots={{ toolbar: () => <CustomToolbar onFontSizeChange={handleFontSizeChange} /> }}
				autoHeight
				filterModel={filterModel}
				onPaginationModelChange={handlePaginationChange}
				onFilterModelChange={handleFilterModelChange}
				rowCount={total}
				filterMode="server"
				paginationMode="server"
				loading={isLoading}
				sx={{
					'& .MuiDataGrid-root': {
						fontSize: fontSize
					},
					'& .MuiDataGrid-columnHeaders': {
						fontSize: fontSize - 2
					},
					'& .MuiDataGrid-cell': {
						fontSize: fontSize
					}
				}}
			/>
		</div>
	);
}
