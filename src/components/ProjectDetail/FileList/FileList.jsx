import React from 'react';
import FileTable from '../../Common/Table/FileTable/FileTable';

function FileList({ project }) {
	return (
		<section className="position-relative rounded-4 border shadow p-5 my-4">
			<h3>ไฟล์ทั้งหมดที่เกี่ยวข้องกับโครงการ</h3>
			<FileTable projectId={project._id} />
		</section>
	);
}

export default FileList;
