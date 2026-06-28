import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import CreateWIP from '../../components/ProjectDetail/WIP/CreateWIP';
import Breadcrumb from '../../components/Breadcrumb';

import WIPcontroller from "../../controllers/WIP/index";
import BackButton from "../../components/Common/Button/BackButton";
import { SwalDialog } from '../../components/Swal';

export default function Create() {
  let navigate = useNavigate();
  const { projectId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const fetchData = async () => {
      try {
        const data = await WIPcontroller.getDataForNewWIP({
          id: projectId,
          options: cancelTokenSource.token,
        });
        if (data) {
          setData(data);
        }
      } catch (err) {
        setError(err);
        if (err.response?.status === 403) {
          SwalDialog({
            icon: 'error',
            text: `${err.response?.data?.message || err.response?.data?.error || err}`,
            options: {}
          }).then(() => {
            return navigate(`/projects`);
          });
        } else {
          console.error('Error fetching project data', error);
        }
      }
    };

    fetchData();

    return () => {
      cancelTokenSource.cancel('cancel due to unmounted');
    };
  }, [projectId]);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Breadcrumb
        items={[
          ['home', `/`],
          ['Projects', `/projects`],
          [data.project?.projectName, `/projects/${projectId}`],
          ['Create WIP', `/projects/${projectId}/wip-create`],
        ]}
      />
      <header className="d-flex pb-4 align-items-center">
        <BackButton
          classNames=""
          sizePx={48}
          padding={12}
          navigateOnClick={() => {
            navigate(`/projects/${projectId}`);
          }}
        />
        <div className="fs-2 fw-medium text-center container p-0">Create WIP</div>
        <div style={{ width: 48, height: 48 }}></div>
      </header>
      <CreateWIP
        filePO={data.project?.filePO}
        wipNumber={data.newWIPNumber}
        pmProject={data.project?.pmProject}
        customerId={data.project?.customerId}
      />
    </div>
  );
}
