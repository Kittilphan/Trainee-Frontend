import React from 'react';
import { Doughnut } from 'react-chartjs-2';

const CircleProgress = ({
	label,
	percent = 0,
	backgroundColor = ['#007bff', '#e9ecef'],
	hoverBackgroundColor = ['#0056b3', '#d6d6d6']
}) => {
	const circleData = {
		labels: ['On Progress', 'Unassigned'],
		datasets: [
			{
				data: [percent, 100 - percent],
				backgroundColor: backgroundColor,
				hoverBackgroundColor: hoverBackgroundColor,
				borderWidth: 0
			}
		]
	};

	const circleOptions = {
		cutout: '80%',
		plugins: {
			tooltip: { enabled: true },
			legend: {
				display: true,
				position: 'bottom'
			}
		}
	};
	return (
		<div className="flex-fill mt-3 mt-md-0">
			<div className="card p-4 h-100">
				<h2 className="my-1">{label || 'Overall Progress'}</h2>
				<div className="text-center p-4 p-md-0 my-auto">
					<div style={{ position: 'relative', display: 'inline-block' }}>
						<Doughnut data={circleData} options={circleOptions} />
						<div
							style={{
								position: 'absolute',
								top: '50%',
								left: '50%',
								transform: 'translate(-50%, -50%)',
								fontSize: '24px',
								fontWeight: 'bold'
							}}>
							{percent}%
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CircleProgress;
