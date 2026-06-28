import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { SwalDialog, SwalConfirm } from "../../Swal";

import AutoResizingTextarea from "../../AutoResizingTextarea/AutoResizingTextarea";
import Dropzone from "../../Uploader/Dropzone";
import FileList from "../../Common/List/FileList/FileList";

import WIPController from "../../../controllers/WIP/index";
import { Spinner } from 'react-bootstrap';
import ProtectedComponent from '../../ProtectedComponent';

import AllUsersContext from '../../../contexts/AllUsersContext';

export default function EditWIP({ wip }) {
  const { isLoadingUser, getUserFilter } = useContext(AllUsersContext);
  const [users, setUsers] = useState([]);
  let navigate = useNavigate();
  const { projectId, wipId } = useParams();
  const [isLoading, setLoading] = React.useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = React.useState();
  const [initial, setInitial] = React.useState({});
  const [wipData, setWIPData] = useState({
    percentageKickoff: 0,
    percentageDelivery: 0,
    percentageImplement: 0,
    percentageDocDelivery: 0,
    dateOnProject: "",
    offeredDetails: "",
    remark: "",
    engineerFileUAT: [],
    engineerFileFinalDiagram: [],
    engineerFileSignOffDocument: [],
    engineerFileTrainingDocument: [],
    engineerFileServiceReport: [],
    cablingFileUAT: [],
    cablingFileFinalDiagram: [],
    cablingFileSignOffDocument: [],
    cablingFileTrainingDocument: [],
    cablingFileServiceReport: [],
    dataCenterFileUAT: [],
    dataCenterFileFinalDiagram: [],
    dataCenterFileSignOffDocument: [],
    dataCenterFileTrainingDocument: [],
    dataCenterFileServiceReport: [],
    projectManagerFileUAT: [],
    projectManagerFileFinalDiagram: [],
    projectManagerFileSignOffDocument: [],
    projectManagerFileTrainingDocument: [],
    projectManagerFileServiceReport: [],
    engineerFileDelivery: [],
    cablingFileDelivery: [],
    dataCenterFileDelivery: [],
    projectManagerFileDelivery: [],
    status: 0,
  });

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;

    if (id === "status") {
      const stateLabels = {
        0: "On Progress",
        1: "Done",
        2: "Canceled",
      };

      SwalConfirm({
        icon: "warning",
        text: `Are you sure you want to change the WIP status to "${stateLabels[value]}"?`,
        callbackConfirm: () => {
          setWIPData((prevWIPData) => ({ ...prevWIPData, [id]: value }));
        },
      });
      // Close the dropdown
      if (dropdownRef.current) {
        dropdownRef.current.click();
      }
    } else {
      setWIPData((prevWIPData) => ({ ...prevWIPData, [id]: value }));
    }

    setWIPData((prevWIPData) => ({
      ...prevWIPData,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUploadFile = (file, type) => {
    setWIPData((prevWIPData) => {
      const updatedFiles = prevWIPData[`${type}`] || [];
      return {
        ...prevWIPData,
        [`${type}`]: [...updatedFiles, file],
      };
    });
  };

  const handleRemoveFile = (index, type) => {
    setWIPData((prevWIPData) => {
      const currentFiles = prevWIPData[type] || [];
      const fileDeleted = currentFiles[index];
      const filteredFiles = currentFiles.filter((_, i) => i !== index);

      const fileDeletedIds =
        fileDeleted && fileDeleted.reference
          ? prevWIPData.fileDeleted
            ? [...prevWIPData.fileDeleted, fileDeleted.reference]
            : [fileDeleted.reference]
          : prevWIPData.fileDeleted || [];

      return {
        ...prevWIPData,
        [type]: filteredFiles,
        fileDeleted: fileDeletedIds
      };
    });
  };

  const updateWIPDataWithIncomingData = (incomingData) => {
    const {
      percentageKickoff,
      percentageDelivery,
      percentageImplement,
      percentageDocDelivery,
      dateOnProject,
      engineerFileUAT,
      engineerFileFinalDiagram,
      engineerFileSignOffDocument,
      engineerFileTrainingDocument,
      engineerFileServiceReport,
      cablingFileUAT,
      cablingFileFinalDiagram,
      cablingFileSignOffDocument,
      cablingFileTrainingDocument,
      cablingFileServiceReport,
      dataCenterFileUAT,
      dataCenterFileFinalDiagram,
      dataCenterFileSignOffDocument,
      dataCenterFileTrainingDocument,
      dataCenterFileServiceReport,
      projectManagerFileUAT,
      projectManagerFileFinalDiagram,
      projectManagerFileSignOffDocument,
      projectManagerFileTrainingDocument,
      projectManagerFileServiceReport,
      engineerFileDelivery,
      cablingFileDelivery,
      dataCenterFileDelivery,
      projectManagerFileDelivery,
      offeredDetails,
      remark,
      status
    } = incomingData;
    return {
      percentageKickoff: percentageKickoff,
      percentageDelivery: percentageDelivery,
      percentageImplement: percentageImplement,
      percentageDocDelivery: percentageDocDelivery,
      dateOnProject: dateOnProject,
      engineerFileUAT: engineerFileUAT,
      engineerFileFinalDiagram: engineerFileFinalDiagram,
      engineerFileSignOffDocument: engineerFileSignOffDocument,
      engineerFileTrainingDocument: engineerFileTrainingDocument,
      engineerFileServiceReport: engineerFileServiceReport,
      cablingFileUAT: cablingFileUAT,
      cablingFileFinalDiagram: cablingFileFinalDiagram,
      cablingFileSignOffDocument: cablingFileSignOffDocument,
      cablingFileTrainingDocument: cablingFileTrainingDocument,
      cablingFileServiceReport: cablingFileServiceReport,
      dataCenterFileUAT: dataCenterFileUAT,
      dataCenterFileFinalDiagram: dataCenterFileFinalDiagram,
      dataCenterFileSignOffDocument: dataCenterFileSignOffDocument,
      dataCenterFileTrainingDocument: dataCenterFileTrainingDocument,
      dataCenterFileServiceReport: dataCenterFileServiceReport,
      projectManagerFileUAT: projectManagerFileUAT,
      projectManagerFileFinalDiagram: projectManagerFileFinalDiagram,
      projectManagerFileSignOffDocument: projectManagerFileSignOffDocument,
      projectManagerFileTrainingDocument: projectManagerFileTrainingDocument,
      projectManagerFileServiceReport: projectManagerFileServiceReport,
      engineerFileDelivery: engineerFileDelivery,
      cablingFileDelivery: cablingFileDelivery,
      dataCenterFileDelivery: dataCenterFileDelivery,
      projectManagerFileDelivery: projectManagerFileDelivery,
      offeredDetails: offeredDetails,
      remark: remark,
      status: status,
    };
  };

  useEffect(() => {
    if (wip) {
      setWIPData(updateWIPDataWithIncomingData(wip));
      setInitial(updateWIPDataWithIncomingData(wip));
    }
  }, [wip]);

  const getFormattedDate = (date) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (
      wipData.percentageKickoff > 100 || wipData.percentageKickoff < 0 ||
      wipData.percentageDelivery > 100 || wipData.percentageDelivery < 0 ||
      wipData.percentageImplement > 100 || wipData.percentageImplement < 0 ||
      wipData.percentageDocDelivery > 100 || wipData.percentageDocDelivery < 0
    ) {
      SwalDialog({
        icon: "error",
        text: "Percentage must be between 0 and 100",
      });
      return;
    }
    if (wipData.status === 1) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const formattedToday = `${yyyy}-${mm}-${dd}`;

      if (wip.dateAssigned) {
        const dateAssignedArray = getFormattedDate(wip.dateAssigned).split("-");
        if (dateAssignedArray.length === 3) {
          const dateAssigned = new Date(
            dateAssignedArray[0],
            dateAssignedArray[1] - 1,
            dateAssignedArray[2]
          );
          const formattedTodayArray = formattedToday.split("-");
          const todayDate = new Date(
            formattedTodayArray[0],
            formattedTodayArray[1] - 1,
            formattedTodayArray[2]
          );
          const timeDifference = todayDate - dateAssigned;
          const daysDifference = Math.ceil(
            timeDifference / (1000 * 60 * 60 * 24)
          );
          wipData.dateOnProject = daysDifference + 1;
          wipData.percentageKickoff = 100;
          wipData.percentageDelivery = 100;
          wipData.percentageImplement = 100;
          wipData.percentageDocDelivery = 100;
        }
      }
    } else if (wipData.status !== 1) {
      wipData.dateOnProject = "";
    }

    const file = [
      "engineerFileUAT",
      "engineerFileFinalDiagram",
      "engineerFileSignOffDocument",
      "engineerFileTrainingDocument",
      "engineerFileServiceReport",

      "cablingFileUAT",
      "cablingFileFinalDiagram",
      "cablingFileSignOffDocument",
      "cablingFileTrainingDocument",
      "cablingFileServiceReport",

      "dataCenterFileUAT",
      "dataCenterFileFinalDiagram",
      "dataCenterFileSignOffDocument",
      "dataCenterFileTrainingDocument",
      "dataCenterFileServiceReport",

      "projectManagerFileUAT",
      "projectManagerFileFinalDiagram",
      "projectManagerFileSignOffDocument",
      "projectManagerFileTrainingDocument",
      "projectManagerFileServiceReport",

      "engineerFileDelivery",
      "cablingFileDelivery",
      "dataCenterFileDelivery",
      "projectManagerFileDelivery",

      "fileDeleted"]

    let updatedWIPDataLength = 0;

    for (const key in wipData) {
      if (wipData.hasOwnProperty(key) && !file.includes(key)) {
        let value = wipData[key];
        let valueInitial = initial[key];
        if (value !== null && value !== undefined && value != valueInitial) {
          formData.append(key, value);
          updatedWIPDataLength++;
        }
      }
    }

    const appendFileArrayToFormData = (filesArray, keyPrefix) => {
      if (filesArray) {
        filesArray.forEach((file) => {
          if (file.path) {
            formData.append(`${keyPrefix}`, file)
            updatedWIPDataLength++;
          };
        });
      }
    };

    file.forEach((key) => {
      appendFileArrayToFormData(wipData[key], key);
    });

    if (wipData.fileDeleted && wipData.fileDeleted.length > 0) {
      wipData.fileDeleted.forEach((fileId) => formData.append(`fileDeleted[]`, fileId));
      updatedWIPDataLength++;
    }

    let cancelTokenSource = axios.CancelToken.source();
    try {
      if (updatedWIPDataLength === 0) {
        SwalDialog({
          icon: "warning",
          text: "WIP detail didn't change.",
        }).then(() => {
          navigate(-1);
        });
        return;
      }
      setSubmitLoading(true);
      if (wipData.status === 1) {
        const roles = [
          wip?.saleOwner && `Sale Owner: ${users.find((user) => user._id === wip?.saleOwner)?.displayName}`
        ].filter(Boolean);
        const confirmationText = `
          <h3>Are you sure you want to send the mail to the following user(s)?</h3>
          <br/>
          <ul style="text-align: left;">
            ${roles?.map((role) => `<li>${role}</li>`).join('')}
          </ul>
        `;

        SwalConfirm({
          icon: 'warning',
          options: {
            html: confirmationText,
            showCancelButton: true,
            confirmButtonText: 'Send it!',
            cancelButtonText: 'No, cancel',
            title: ''
          },
          callbackConfirm: async () => {
            try {
              const response = await WIPController.updateWIP({
                id: wip.wipId,
                payload: formData,
                options: { cancelToken: cancelTokenSource.token },
              });

              updatedWIPDataLength = 0;

              SwalDialog({
                icon: "success",
                text: "WIP updated successfully.",
              }).then(() => {
                navigate(-1);
              });
            } catch (error) {
              SwalDialog({
                icon: "error",
                text: `${error.response?.data?.message || error.response?.data?.error || error}`,
              }).then(() => {
                navigate(-1);
              });
            }
          },
          callbackCancel: () => {
            return;
          }
        });
      } else {
        const response = await WIPController.updateWIP({
          id: wip.wipId,
          payload: formData,
          options: { cancelToken: cancelTokenSource.token },
        });

        updatedWIPDataLength = 0;

        SwalDialog({
          icon: "success",
          text: "WIP updated successfully.",
        }).then(() => {
          navigate(-1);
        });
      }
    } catch (error) {
      SwalDialog({
        icon: "error",
        text: `${error.response?.data?.message || error.response?.data?.error || error}`,
      }).then(() => {
        navigate(-1);
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const dropdownRef = React.useRef(null);

  const getButtonClass = () => {
    switch (wipData.status) {
      case 0:
        return "btn-outline-primary";
      case 1:
        return "btn-outline-success";
      case 2:
        return "btn-outline-danger";
      default:
        return "btn-outline-info";
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const empList = await getUserFilter(["sale"]);
        setUsers(empList);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (!isLoadingUser) {
      fetchUsers();
    }
  }, [isLoadingUser]);

  return (
    <main>
      <section className="main-content p-5 rounded-4 border shadow">
        <div className="d-row mt-4">
          <label className="fs-4 py-2">ความคืบหน้า</label>
          <div className="d-flex flex-column flex-md-row mt-4 justify-content-between">
            <div className="d-flex flex-wrap fs-5 py-2 mx-2 justify-content-between">
              <label htmlFor="percentageKickoff" className="form-label me-3">Kickoff</label>
              <input
                className="form-control me-3 text-end"
                id="percentageKickoff"
                style={{ maxWidth: "4rem", height: "2.5rem" }}
                type="text"
                value={wipData.percentageKickoff}
                onChange={handleChange}
              />
            </div>
            <div className="d-flex flex-wrap fs-5 py-2 mx-2 justify-content-between">
              <label htmlFor="percentageDelivery" className="form-label me-3">Delivery</label>
              <input
                className="form-control me-3 text-end"
                id="percentageDelivery"
                style={{ maxWidth: "4rem", height: "2.5rem" }}
                type="text"
                value={wipData.percentageDelivery}
                onChange={handleChange}
              />
            </div>
            <div className="d-flex flex-wrap fs-5 py-2 mx-2 justify-content-between">
              <label htmlFor="percentageImplement" className="form-label me-3">Implement</label>
              <input
                className="form-control me-3 text-end"
                id="percentageImplement"
                style={{ maxWidth: "4rem", height: "2.5rem" }}
                type="text"
                value={wipData.percentageImplement}
                onChange={handleChange}
              />
            </div>
            <div className="d-flex flex-wrap fs-5 py-2 mx-2 justify-content-between">
              <label htmlFor="percentageDocDelivery" className="form-label me-3">Document Delivery</label>
              <input
                className="form-control me-3 text-end"
                id="percentageDocDelivery"
                style={{ maxWidth: "4rem", height: "2.5rem" }}
                type="text"
                value={wipData.percentageDocDelivery}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        <div className="d-row mt-4">
          <label className="fs-4 py-2">ข้อมูลเพิ่มเติม</label>
          <div className="d-flex flex-column flex-lg-row fs-5 py-2 justify-content-between">
            <label htmlFor="offeredDetails" className="form-label me-2" style={{ width: "9.5rem" }}>
              Offered Details
            </label>
            <AutoResizingTextarea
              className="form-control"
              id="offeredDetails"
              type="text"
              rows="3"
              value={wipData.offeredDetails}
              onChange={handleChange}
            />
          </div>
          <div className="d-flex flex-column flex-lg-row fs-5 py-2 justify-content-between">
            <label htmlFor="remark" className="form-label me-2" style={{ width: "9.5rem" }}>
              Remark
            </label>
            <AutoResizingTextarea
              className="form-control"
              id="remark"
              type="text"
              rows="3"
              value={wipData.remark}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="d-flex flex-wrap justify-content-between">
          <ProtectedComponent requiredRoles={['engineer']}>
            <div className="d-row mt-4">
              <label className="fs-4 py-2">เอกสาร (Infra)</label>
              <div className="d-flex flex-column flex-md-row fs-5 py-2">
                <label className="form-label me-2" style={{ width: "18rem" }}>
                  Sign off Document
                </label>
                <div>
                  <Dropzone
                    caption={`Upload Sign off Document`}
                    callbackUploadFile={(file) => handleUploadFile(file, "engineerFileSignOffDocument")}
                  />
                  <FileList
                    file={wipData.engineerFileSignOffDocument}
                    callbackRemoveFile={(file) => handleRemoveFile(file, "engineerFileSignOffDocument")}
                  />
                </div>
              </div>
              <div className="d-flex flex-column flex-md-row fs-5 py-2">
                <label className="form-label me-2" style={{ width: "18rem" }}>
                  Final Diagram Document
                </label>
                <div>
                  <Dropzone
                    caption={`Upload Final Diagram Document`}
                    callbackUploadFile={(file) => handleUploadFile(file, "engineerFileFinalDiagram")}
                  />
                  <FileList
                    file={wipData.engineerFileFinalDiagram}
                    callbackRemoveFile={(file) => handleRemoveFile(file, "engineerFileFinalDiagram")}
                  />
                </div>
              </div>
              <div className="d-flex flex-column flex-md-row fs-5 py-2">
                <label className="form-label me-2" style={{ width: "18rem" }}>
                  Training Document
                </label>
                <div>
                  <Dropzone
                    caption={`Upload Training Document`}
                    callbackUploadFile={(file) => handleUploadFile(file, "engineerFileTrainingDocument")}
                  />
                  <FileList
                    file={wipData.engineerFileTrainingDocument}
                    callbackRemoveFile={(file) => handleRemoveFile(file, "engineerFileTrainingDocument")}
                  />
                </div>
              </div>
              <div className="d-flex flex-column flex-md-row fs-5 py-2">
                <label className="form-label me-2" style={{ width: "18rem" }}>
                  UAT Document
                </label>
                <div>
                  <Dropzone
                    caption={`Upload UAT Document`}
                    callbackUploadFile={(file) => handleUploadFile(file, "engineerFileUAT")}
                  />
                  <FileList
                    file={wipData.engineerFileUAT}
                    callbackRemoveFile={(file) => handleRemoveFile(file, "engineerFileUAT")}
                  />
                </div>
              </div>
              <div className="d-flex flex-column flex-md-row fs-5 py-2">
                <label className="form-label me-2" style={{ width: "18rem" }}>
                  Service Report Document
                </label>
                <div>
                  <Dropzone
                    caption={`Upload Service Report Document`}
                    callbackUploadFile={(file) => handleUploadFile(file, "engineerFileServiceReport")}
                  />
                  <FileList
                    file={wipData.engineerFileServiceReport}
                    callbackRemoveFile={(file) => handleRemoveFile(file, "engineerFileServiceReport")}
                  />
                </div>
              </div>
              <div className="d-flex flex-column flex-md-row fs-5 py-2">
                <label className="form-label me-2" style={{ width: "18rem" }}>
                  Delivery Document
                </label>
                <div>
                  <Dropzone
                    caption={`Upload Delivery Document`}
                    callbackUploadFile={(file) => handleUploadFile(file, "engineerFileDelivery")}
                  />
                  <FileList
                    file={wipData.engineerFileDelivery}
                    callbackRemoveFile={(file) => handleRemoveFile(file, "engineerFileDelivery")}
                  />
                </div>
              </div>
            </div>
          </ProtectedComponent>
          <ProtectedComponent requiredRoles={['cabling']}>
            <div className="d-row mt-4">
              <label className="fs-4 py-2">เอกสาร (Cabling)</label>
              <div className="d-flex flex-column flex-md-row fs-5 py-2">
                <label className="form-label me-2" style={{ width: "18rem" }}>
                  Sign off Document
                </label>
                <div>
                  <Dropzone
                    caption={`Upload Sign off Document`}
                    callbackUploadFile={(file) => handleUploadFile(file, "cablingFileSignOffDocument")}
                  />
                  <FileList
                    file={wipData.cablingFileSignOffDocument}
                    callbackRemoveFile={(file) => handleRemoveFile(file, "cablingFileSignOffDocument")}
                  />
                </div>
              </div>
              <div className="d-flex flex-column flex-md-row fs-5 py-2">
                <label className="form-label me-2" style={{ width: "18rem" }}>
                  Final Diagram Document
                </label>
                <div>
                  <Dropzone
                    caption={`Upload Final Diagram Document`}
                    callbackUploadFile={(file) => handleUploadFile(file, "cablingFileFinalDiagram")}
                  />
                  <FileList
                    file={wipData.cablingFileFinalDiagram}
                    callbackRemoveFile={(file) => handleRemoveFile(file, "cablingFileFinalDiagram")}
                  />
                </div>
              </div>
              <div className="d-flex flex-column flex-md-row fs-5 py-2">
                <label className="form-label me-2" style={{ width: "18rem" }}>
                  Training Document
                </label>
                <div>
                  <Dropzone
                    caption={`Upload Training Document`}
                    callbackUploadFile={(file) => handleUploadFile(file, "cablingFileTrainingDocument")}
                  />
                  <FileList
                    file={wipData.cablingFileTrainingDocument}
                    callbackRemoveFile={(file) => handleRemoveFile(file, "cablingFileTrainingDocument")}
                  />
                </div>
              </div>
              <div className="d-flex flex-column flex-md-row fs-5 py-2">
                <label className="form-label me-2" style={{ width: "18rem" }}>
                  UAT Document
                </label>
                <div>
                  <Dropzone
                    caption={`Upload UAT Document`}
                    callbackUploadFile={(file) => handleUploadFile(file, "cablingFileUAT")}
                  />
                  <FileList
                    file={wipData.cablingFileUAT}
                    callbackRemoveFile={(file) => handleRemoveFile(file, "cablingFileUAT")}
                  />
                </div>
              </div>
              <div className="d-flex flex-column flex-md-row fs-5 py-2">
                <label className="form-label me-2" style={{ width: "18rem" }}>
                  Service Report Document
                </label>
                <div>
                  <Dropzone
                    caption={`Upload Service Report Document`}
                    callbackUploadFile={(file) => handleUploadFile(file, "cablingFileServiceReport")}
                  />
                  <FileList
                    file={wipData.cablingFileServiceReport}
                    callbackRemoveFile={(file) => handleRemoveFile(file, "cablingFileServiceReport")}
                  />
                </div>
              </div>
              <div className="d-flex flex-column flex-md-row fs-5 py-2">
                <label className="form-label me-2" style={{ width: "18rem" }}>
                  Delivery Document
                </label>
                <div>
                  <Dropzone
                    caption={`Upload Delivery Document`}
                    callbackUploadFile={(file) => handleUploadFile(file, "cablingFileDelivery")}
                  />
                  <FileList
                    file={wipData.cablingFileDelivery}
                    callbackRemoveFile={(file) => handleRemoveFile(file, "cablingFileDelivery")}
                  />
                </div>
              </div>
            </div>
          </ProtectedComponent>
          <ProtectedComponent requiredRoles={['data-center']}>
            <div className="d-row mt-4">
              <label className="fs-4 py-2">เอกสาร (Data Center)</label>
              <div className="d-flex flex-column flex-md-row fs-5 py-2">
                <label className="form-label me-2" style={{ width: "18rem" }}>
                  Sign off Document
                </label>
                <div>
                  <Dropzone
                    caption={`Upload Sign off Document`}
                    callbackUploadFile={(file) => handleUploadFile(file, "dataCenterFileSignOffDocument")}
                  />
                  <FileList
                    file={wipData.dataCenterFileSignOffDocument}
                    callbackRemoveFile={(file) => handleRemoveFile(file, "dataCenterFileSignOffDocument")}
                  />
                </div>
              </div>
              <div className="d-flex flex-column flex-md-row fs-5 py-2">
                <label className="form-label me-2" style={{ width: "18rem" }}>
                  Final Diagram Document
                </label>
                <div>
                  <Dropzone
                    caption={`Upload Final Diagram Document`}
                    callbackUploadFile={(file) => handleUploadFile(file, "dataCenterFileFinalDiagram")}
                  />
                  <FileList
                    file={wipData.dataCenterFileFinalDiagram}
                    callbackRemoveFile={(file) => handleRemoveFile(file, "dataCenterFileFinalDiagram")}
                  />
                </div>
              </div>
              <div className="d-flex flex-column flex-md-row fs-5 py-2">
                <label className="form-label me-2" style={{ width: "18rem" }}>
                  Training Document
                </label>
                <div>
                  <Dropzone
                    caption={`Upload Training Document`}
                    callbackUploadFile={(file) => handleUploadFile(file, "dataCenterFileTrainingDocument")}
                  />
                  <FileList
                    file={wipData.dataCenterFileTrainingDocument}
                    callbackRemoveFile={(file) => handleRemoveFile(file, "dataCenterFileTrainingDocument")}
                  />
                </div>
              </div>
              <div className="d-flex flex-column flex-md-row fs-5 py-2">
                <label className="form-label me-2" style={{ width: "18rem" }}>
                  UAT Document
                </label>
                <div>
                  <Dropzone
                    caption={`Upload UAT Document`}
                    callbackUploadFile={(file) => handleUploadFile(file, "dataCenterFileUAT")}
                  />
                  <FileList
                    file={wipData.dataCenterFileUAT}
                    callbackRemoveFile={(file) => handleRemoveFile(file, "dataCenterFileUAT")}
                  />
                </div>
              </div>
              <div className="d-flex flex-column flex-md-row fs-5 py-2">
                <label className="form-label me-2" style={{ width: "18rem" }}>
                  Service Report Document
                </label>
                <div>
                  <Dropzone
                    caption={`Upload Service Report Document`}
                    callbackUploadFile={(file) => handleUploadFile(file, "dataCenterFileServiceReport")}
                  />
                  <FileList
                    file={wipData.dataCenterFileServiceReport}
                    callbackRemoveFile={(file) => handleRemoveFile(file, "dataCenterFileServiceReport")}
                  />
                </div>
              </div>
              <div className="d-flex flex-column flex-md-row fs-5 py-2">
                <label className="form-label me-2" style={{ width: "18rem" }}>
                  Delivery Document
                </label>
                <div>
                  <Dropzone
                    caption={`Upload Delivery Document`}
                    callbackUploadFile={(file) => handleUploadFile(file, "dataCenterFileDelivery")}
                  />
                  <FileList
                    file={wipData.dataCenterFileDelivery}
                    callbackRemoveFile={(file) => handleRemoveFile(file, "dataCenterFileDelivery")}
                  />
                </div>
              </div>
            </div>
          </ProtectedComponent>
          <ProtectedComponent requiredRoles={['project-manager']}>
            <div className="d-row mt-4">
              <label className="fs-4 py-2">เอกสาร (Project Manager)</label>
              <div className="d-flex flex-column flex-md-row fs-5 py-2">
                <label className="form-label me-2" style={{ width: "18rem" }}>
                  Sign off Document
                </label>
                <div>
                  <Dropzone
                    caption={`Upload Sign off Document`}
                    callbackUploadFile={(file) => handleUploadFile(file, "projectManagerFileSignOffDocument")}
                  />
                  <FileList
                    file={wipData.projectManagerFileSignOffDocument}
                    callbackRemoveFile={(file) => handleRemoveFile(file, "projectManagerFileSignOffDocument")}
                  />
                </div>
              </div>
              <div className="d-flex flex-column flex-md-row fs-5 py-2">
                <label className="form-label me-2" style={{ width: "18rem" }}>
                  Final Diagram Document
                </label>
                <div>
                  <Dropzone
                    caption={`Upload Final Diagram Document`}
                    callbackUploadFile={(file) => handleUploadFile(file, "projectManagerFileFinalDiagram")}
                  />
                  <FileList
                    file={wipData.projectManagerFileFinalDiagram}
                    callbackRemoveFile={(file) => handleRemoveFile(file, "projectManagerFileFinalDiagram")}
                  />
                </div>
              </div>
              <div className="d-flex flex-column flex-md-row fs-5 py-2">
                <label className="form-label me-2" style={{ width: "18rem" }}>
                  Training Document
                </label>
                <div>
                  <Dropzone
                    caption={`Upload Training Document`}
                    callbackUploadFile={(file) => handleUploadFile(file, "projectManagerFileTrainingDocument")}
                  />
                  <FileList
                    file={wipData.projectManagerFileTrainingDocument}
                    callbackRemoveFile={(file) => handleRemoveFile(file, "projectManagerFileTrainingDocument")}
                  />
                </div>
              </div>
              <div className="d-flex flex-column flex-md-row fs-5 py-2">
                <label className="form-label me-2" style={{ width: "18rem" }}>
                  UAT Document
                </label>
                <div>
                  <Dropzone
                    caption={`Upload UAT Document`}
                    callbackUploadFile={(file) => handleUploadFile(file, "projectManagerFileUAT")}
                  />
                  <FileList
                    file={wipData.projectManagerFileUAT}
                    callbackRemoveFile={(file) => handleRemoveFile(file, "projectManagerFileUAT")}
                  />
                </div>
              </div>
              <div className="d-flex flex-column flex-md-row fs-5 py-2">
                <label className="form-label me-2" style={{ width: "18rem" }}>
                  Service Report Document
                </label>
                <div>
                  <Dropzone
                    caption={`Upload Service Report Document`}
                    callbackUploadFile={(file) => handleUploadFile(file, "projectManagerFileServiceReport")}
                  />
                  <FileList
                    file={wipData.projectManagerFileServiceReport}
                    callbackRemoveFile={(file) => handleRemoveFile(file, "projectManagerFileServiceReport")}
                  />
                </div>
              </div>
              <div className="d-flex flex-column flex-md-row fs-5 py-2">
                <label className="form-label me-2" style={{ width: "18rem" }}>
                  Delivery Document
                </label>
                <div>
                  <Dropzone
                    caption={`Upload Delivery Document`}
                    callbackUploadFile={(file) => handleUploadFile(file, "projectManagerFileDelivery")}
                  />
                  <FileList
                    file={wipData.projectManagerFileDelivery}
                    callbackRemoveFile={(file) => handleRemoveFile(file, "projectManagerFileDelivery")}
                  />
                </div>
              </div>
            </div>
          </ProtectedComponent>
        </div>
        <div
          name="footer-button"
          className="d-flex px-0 mt-5 justify-content-between"
        >
          <div className="dropdown">
            <button
              className={`btn btn-lg dropdown-toggle ${getButtonClass()}`}
              type="button"
              id="dropdownMenuButton"
              data-bs-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
              ref={dropdownRef}
            >
              {wipData.status === 0
                ? "On Progress"
                : wipData.status === 1
                  ? "Done"
                  : "Canceled"}
            </button>
            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
              <a
                className="dropdown-item"
                onClick={() =>
                  handleChange({ target: { id: "status", value: 0 } })
                }
              >
                <span className="dot bg-primary"></span>
                On Progress
              </a>
              <a
                className="dropdown-item"
                onClick={() =>
                  handleChange({ target: { id: "status", value: 1 } })
                }
              >
                <span className="dot bg-success"></span>
                Done
              </a>
              <a
                className="dropdown-item"
                onClick={() =>
                  handleChange({ target: { id: "status", value: 2 } })
                }
              >
                <span className="dot bg-danger"></span>
                Cancel
              </a>
            </div>
          </div>
          <div>
            <div className="btn btn-danger btn-lg me-lg-5 me-sm-3 me-1" style={{ width: "8rem" }} onClick={() => navigate(-1)}>
              Cancel
            </div>
            <div
              type="submit"
              className={`btn btn-success btn-lg ms-lg-5 ms-sm-3 ms-1 ${submitLoading ? 'disabled' : ''}`}
              onClick={!submitLoading ? handleSubmit : null}
              style={{ pointerEvents: submitLoading ? 'none' : 'auto', width: "8rem" }}>
              {submitLoading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  {' Loading...'}
                </>
              ) : (
                'Save'
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
