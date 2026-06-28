import React, { useState, useEffect } from 'react';
import IconButton from '@mui/joy/IconButton';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import FileController from '../../../../controllers/Files';
import axios from 'axios';
import { SwalDialog } from '../../../Swal';
import CustomToolbar from '../CustomToolbar';
import { useFontSize } from '../../../../contexts/FontSizeProvider';

const categoryList = [
	{ value: 'FileUAT', label: 'UAT File' },
	{ value: 'FileFinalDiagram', label: 'Final Diagram Document' },
	{ value: 'FileSignOffDocument', label: 'Sign Off Document File' },
	{ value: 'FileTrainingDocument', label: 'Training Document File' },
	{ value: 'FileServiceReport', label: 'Service Report File' },
	{ value: 'FileDelivery', label: 'Delivery File' },
	{ value: 'FileDeliverySuccessReport', label: 'Delivery Success Report File' },
];

const teamList = [
	{ value: 'sale', label: 'Sale' },
	{ value: 'engineer', label: 'Infra' },
	{ value: 'cabling', label: 'Cabling' },
	{ value: 'dataCenter', label: 'Data Center' },
	{ value: 'projectManager', label: 'Project Manager' }
];

export default function FileDataGrid({ wipId }) {
	const { fontSize, setFontSize } = useFontSize();

	const [files, setFiles] = useState([]);
	const [isLoading, setLoading] = useState(true);
	const [error, setError] = useState();
	const [pagination, setPagination] = useState({ page: 1, limit: 10 });
	const [filterModel, setFilterModel] = useState({ items: [] });
	const [total, setTotal] = useState(0);

	useEffect(() => {
		const debounceFetch = setTimeout(() => {
			if (wipId && pagination && filterModel) {
				fetchFiles();
			}
		}, 1500);

		return () => {
			clearTimeout(debounceFetch);
		};
	}, [wipId, pagination, filterModel]);

	function fetchFiles() {
		setLoading(true);
		let cancelTokenSource = axios.CancelToken.source();

		FileController.getFileByWIPId({
			wipId: wipId,
			fields: {
				...pagination,
				filter: filterModel.items || []
			},
			options: { cancelToken: cancelTokenSource.token }
		})
			.then((data) => {
				if (!Array.isArray(data.files)) {
					throw new Error('Unexpected value');
				}
				console.log(`FileController.getFileByWIPId() id=${wipId}`, data.files);
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
					text: `${err.response?.status === 403
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
			flex: 1,
			width: 400,
			type: 'string',
			renderCell: (params) => (
				<a
					className="underline-on-hover"
					href={`/api/files/${params.row?.attachmentType || params.row?.type}/${params.id}/${params.value}`}
					target="_blank">
					{params.value}
				</a>
			)
		},
		{
			field: 'type',
			headerName: 'Category',
			width: 250,
			type: 'singleSelect',
			valueOptions: categoryList,
			valueGetter: (value) => value.replace(/engineer|cabling|dataCenter|projectManager|sale/g, '').trim()
		},
		{
			field: 'team',
			headerName: 'Team',
			width: 140,
			type: 'singleSelect',
			valueOptions: teamList,
			renderCell: (params) => {
				const value = params.row?.type || '';
				let result = '';
				if (value.includes('engineer')) result = 'Infra';
				else if (value.includes('cabling')) result = 'Cabling';
				else if (value.includes('dataCenter')) result = 'Data Center';
				else if (value.includes('projectManager')) result = 'Project Manager';
				else if (value.includes('sale')) result = 'Sale';

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
							createdBy: false,
							lastUpdatedBy: false
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
