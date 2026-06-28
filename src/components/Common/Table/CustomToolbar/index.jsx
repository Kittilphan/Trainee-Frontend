import React, { useState } from 'react';
import {
	GridToolbarContainer,
	GridToolbarColumnsButton,
	GridToolbarFilterButton,
	GridToolbarExport,
	GridToolbarDensitySelector
} from '@mui/x-data-grid';
import { IconButton, Typography, Menu, MenuItem } from '@mui/material';
import FormatSizeIcon from '@mui/icons-material/FormatSize';

const CustomToolbar = ({ onFontSizeChange }) => {
	const [anchorEl, setAnchorEl] = useState(null);

	const handleFontSizeClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleFontSizeSelect = (size) => {
		onFontSizeChange(size);
		handleClose();
	};

	return (
		<GridToolbarContainer style={{ display: 'flex', alignItems: 'center' }}>
			<GridToolbarColumnsButton />
			<GridToolbarFilterButton />
			<GridToolbarDensitySelector slotProps={{ tooltip: { title: 'Change density' } }} />
			<GridToolbarExport />

			<IconButton className="d-flex align-item-center" onClick={handleFontSizeClick}>
				<FormatSizeIcon color="primary" fontSize="small" />
				<Typography variant="body2" color="primary" style={{ marginRight: '8px' }}>
					Font Size
				</Typography>
			</IconButton>
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleClose}
				MenuListProps={{ 'aria-labelledby': 'font-size-button' }}>
				{[14, 16, 18, 20, 22].map((size) => (
					<MenuItem key={size} onClick={() => handleFontSizeSelect(size)} className="px-4">
						{size} px
					</MenuItem>
				))}
			</Menu>
		</GridToolbarContainer>
	);
};

export default CustomToolbar;
