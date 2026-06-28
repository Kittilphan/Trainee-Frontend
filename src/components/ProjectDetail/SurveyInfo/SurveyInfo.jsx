import React from 'react';
import ContentRenderer from '../../ContentRenderer';

function SurveyInfo({ index, isChecked, label, text, textClass }) {
	if (!isChecked && !text) return;
	return (
		<div key={index} className="my-3 ">
			<div>{label}:</div>

			<div className="form-check form-switch mt-3 gap-3">
				<label className="form-check-label">
					<input className="form-check-input" type="checkbox" role="switch" checked={isChecked === 1} readOnly />
					<span>{isChecked === 1 ? 'Already Survey' : 'Not Survey'}</span>
				</label>
				<div className="col-8">
					<div className="input-group mt-2">
						<ContentRenderer className="form-control bg-light text-muted" value={text} />
					</div>
				</div>
			</div>
		</div>
	);
}

export default SurveyInfo;
