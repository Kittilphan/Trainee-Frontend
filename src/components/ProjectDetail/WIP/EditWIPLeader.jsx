import React, { useState, useEffect, useContext } from "react";
import axios from 'axios';
import { useNavigate, useParams } from "react-router-dom";
import { SwalDialog, SwalConfirm } from "../../Swal";
import AssignEngineerModal from "../../Modals/AssignEngineer";
import ProtectedComponent from "../../ProtectedComponent";
import WIPcontroller from "../../../controllers/WIP/";

export default function EditWIPLeader({ wip }) {
  const navigate = useNavigate();
  const [initial, setInitial] = React.useState({});
  const [wipData, setWIPData] = useState({
    PM: {
      Owner: null,
    },
    Engineer: {
      Owner: null,
      Consult: [],
      CoProject: [],
    },
    Cabling: {
      Owner: null,
      Consult: [],
      CoProject: [],
    },
    Datacenter: {
      Owner: null,
      Consult: [],
      CoProject: [],
    },
    pmWIPType: null,
  });

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        if (wip) {
          const newWIPData = {
            PM: {
              Owner: wip.pmWIP,
            },
            Engineer: {
              Owner: wip.engineerOwner,
              Consult: Array.isArray(wip.engineerConsult)
                ? wip.engineerConsult.map((consult) => consult)
                : [],
              CoProject: Array.isArray(wip.engineerAdditional)
                ? wip.engineerAdditional.map((co) => co)
                : [],
            },
            Cabling: {
              Owner: wip.cablingOwner,
              Consult: Array.isArray(wip.cablingConsult)
                ? wip.cablingConsult.map((consult) => consult)
                : [],
              CoProject: Array.isArray(wip.cablingAdditional)
                ? wip.cablingAdditional.map((co) => co)
                : [],
            },
            Datacenter: {
              Owner: wip.datacenterOwner,
              Consult: Array.isArray(wip.datacenterConsult)
                ? wip.datacenterConsult.map((consult) => consult)
                : [],
              CoProject: Array.isArray(wip.datacenterAdditional)
                ? wip.datacenterAdditional.map((co) => co)
                : [],
            },
            pmWIPType: wip.pmWIPType,
          };
          setWIPData(newWIPData);
          setInitial(newWIPData);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, [wip]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formatData = (data) => {
      const pmWIPType = 1;
      const formatted = data;
      const ownerSources = [
        Array.isArray(formatted.Engineer.Owner) ? formatted.Engineer.Owner[0]?._id || null : formatted.Engineer.Owner?._id || null,
        Array.isArray(formatted.Cabling.Owner) ? formatted.Cabling.Owner[0]?._id || null : formatted.Cabling.Owner?._id || null,
        Array.isArray(formatted.Datacenter.Owner) ? formatted.Datacenter.Owner[0]?._id || null : formatted.Datacenter.Owner?._id || null,
      ];
      const pmWIPAutoGen = Array.isArray(formatted.PM.Owner) ? formatted.PM.Owner[0]?._id || formatted.PM.Owner[1]?._id || formatted.PM.Owner[2]?._id : formatted.PM.Owner?._id || ownerSources[0] || ownerSources[1] || ownerSources[2];

      return {
        pmWIP: pmWIPAutoGen,
        pmWIPType: data.pmWIPType ? data.pmWIPType : (pmWIPAutoGen == ownerSources[0] && pmWIPAutoGen !== null) ? pmWIPType : wip.pmWIPType,
        engineerOwner: Array.isArray(formatted.Engineer.Owner) ? formatted.Engineer.Owner[0]?._id || null : formatted.Engineer.Owner?._id || null,
        engineerConsult: (formatted.Engineer.Consult || []).map((eng) => eng?._id),
        engineerAdditional: (formatted.Engineer.CoProject || []).map((eng) => eng?._id),
        cablingOwner: Array.isArray(formatted.Cabling.Owner) ? formatted.Cabling.Owner[0]?._id || null : formatted.Cabling.Owner?._id || null,
        cablingConsult: (formatted.Cabling.Consult || []).map((eng) => eng?._id),
        cablingAdditional: (formatted.Cabling.CoProject || []).map((eng) => eng?._id),
        datacenterOwner: Array.isArray(formatted.Datacenter.Owner) ? formatted.Datacenter.Owner[0]?._id || null : formatted.Datacenter.Owner?._id || null,
        datacenterConsult: (formatted.Datacenter.Consult || []).map((eng) => eng?._id),
        datacenterAdditional: (formatted.Datacenter.CoProject || []).map((eng) => eng?._id),
      };
    };

    const wipDataPayload = formatData(wipData);
    const initialPayload = formatData(initial);
    const updatedWIPData = {};

    let updatedWIPDataLength = 0;

    for (const key in wipDataPayload) {
      if (wipDataPayload.hasOwnProperty(key)) {
        let value = wipDataPayload[key];
        let valueInitial = initialPayload[key];
        if (JSON.stringify(value) !== JSON.stringify(valueInitial)) {
          updatedWIPData[key] = value;
          updatedWIPDataLength++;
        }
      }
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

      if (wipData?.Engineer?.Owner || wipData?.Engineer?.Consult || wipData?.Engineer?.CoProject ||
        wipData?.Cabling?.Owner || wipData?.Cabling?.Consult || wipData?.Cabling?.CoProject ||
        wipData?.Datacenter?.Owner || wipData?.Datacenter?.Consult || wipData?.Datacenter?.CoProject
      ) {
        const roles = [
          wipData?.Engineer?.Owner &&
          `Infra Owner: ${Array.isArray(wipData.Engineer.Owner)
            ? wipData.Engineer.Owner.map((owner) => owner.displayName).join(", ")
            : wipData.Engineer.Owner.displayName
          }`,
          wipData?.Engineer?.Consult?.length > 0 && `Infra Consult: ${wipData?.Engineer?.Consult?.map((consult) => consult.displayName).join(", ")}`,
          wipData?.Engineer?.CoProject?.length > 0 && `Infra CoProject: ${wipData?.Engineer?.CoProject?.map((coProject) => coProject.displayName).join(", ")}`,

          wipData?.Cabling?.Owner &&
          `Cabling Owner: ${Array.isArray(wipData.Cabling.Owner)
            ? wipData.Cabling.Owner.map((owner) => owner.displayName).join(", ")
            : wipData.Cabling.Owner.displayName
          }`,
          wipData?.Cabling?.Consult?.length > 0 && `Cabling Consult: ${wipData?.Cabling?.Consult?.map((consult) => consult.displayName).join(", ")}`,
          wipData?.Cabling?.CoProject?.length > 0 && `Cabling CoProject: ${wipData?.Cabling?.CoProject?.map((coProject) => coProject.displayName).join(", ")}`,

          wipData?.Datacenter?.Owner &&
          `Data Center Owner: ${Array.isArray(wipData.Datacenter.Owner)
            ? wipData.Datacenter.Owner.map((owner) => owner.displayName).join(", ")
            : wipData.Datacenter.Owner.displayName
          }`,
          wipData?.Datacenter?.Consult?.length > 0 && `Data Center Consult: ${wipData?.Datacenter?.Consult?.map((consult) => consult.displayName).join(", ")}`,
          wipData?.Datacenter?.CoProject?.length > 0 && `Data Center CoProject: ${wipData?.Datacenter?.CoProject?.map((coProject) => coProject.displayName).join(", ")}`,
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
              const response = await WIPcontroller.updateWIP({
                id: wip.wipId,
                payload: updatedWIPData,
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
        const response = await WIPcontroller.updateWIP({
          id: wip.wipId,
          payload: updatedWIPData,
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
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleAdd = (role, field, _id, displayName) => {
    setWIPData((prevWIPData) => {
      const fieldValues = prevWIPData[role][field] || [];
      if (fieldValues.some((user) => user._id === _id)) {
        SwalDialog({
          icon: "warning",
          text: `The employee is already included in this field(${field}).`,
        });
        return prevWIPData;
      }

      const allFields = [
        { name: "Owner", values: Array.isArray(prevWIPData[role]?.Owner) ? prevWIPData[role].Owner : prevWIPData[role]?.Owner ? [prevWIPData[role].Owner] : [] },
        { name: "Consult", values: Array.isArray(prevWIPData[role]?.Consult) ? prevWIPData[role].Consult : [] },
        { name: "CoProject", values: Array.isArray(prevWIPData[role]?.CoProject) ? prevWIPData[role].CoProject : [] },
      ];

      const duplicateField = allFields.find(({ values }) =>
        values.some((user) => user._id === _id)
      );

      if (duplicateField) {
        SwalDialog({
          icon: "warning",
          text: `The employee is already assigned in another field(${duplicateField.name}).`,
        });
        return prevWIPData;
      }

      let updatedWIPData = {
        ...prevWIPData,
        [role]: {
          ...prevWIPData[role],
          [field]: [...fieldValues, { _id, displayName }],
        },
      };

      if (role === "PM" && field === "Owner") {
        updatedWIPData = { ...updatedWIPData, pmWIPType: 2 };
      }

      return updatedWIPData;
    });
  };

  const handleDelete = (role, field, index) => {
    setWIPData((prevWIPData) => {
      const updatedField = prevWIPData[role][field].filter(
        (_, i) => i !== index
      );
      return {
        ...prevWIPData,
        [role]: {
          ...prevWIPData[role],
          [field]: updatedField,
        },
      };
    });
  };

  const getFieldForModal = (modalType) => {
    switch (modalType) {
      case "PM":
        return "Owner";
      case "EngineerOwner":
        return "Owner";
      case "EngineerConsult":
        return "Consult";
      case "EngineerCoProject":
        return "CoProject";
      case "CablingOwner":
        return "Owner";
      case "CablingConsult":
        return "Consult";
      case "CablingCoProject":
        return "CoProject";
      case "DatacenterOwner":
        return "Owner";
      case "DatacenterConsult":
        return "Consult";
      case "DatacenterCoProject":
        return "CoProject";
      default:
        return "";
    }
  };

  return (
    <main>
      <AssignEngineerModal
        show={showModal}
        closeModal={closeModal}
        modalType={modalType}
        handleAdd={handleAdd}
        field={getFieldForModal(modalType)}
      />

      <section className="main-content p-5 rounded-4 border shadow my-4">
        <header className="d-flex flex-wrap justify-content-center mb-5">
          <label className="fs-2">Select Employee</label>
        </header>
        <div className="d-flex flex-wrap fs-4 justify-content-evenly mb-5">
          <div name="PM">
            <label className="fs-3 py-2">Project manager (WIP)</label>
            <div className="d-flex flex-wrap py-2">
              <label className="me-2" style={{ width: "8rem" }}>
                PM WIP :
              </label>
              {wipData.PM.Owner ? (
                <div className="d-flex align-items-center justify-content-between">
                  <label style={{ width: "22rem" }}>{Array.isArray(wipData.PM.Owner) ? wipData.PM.Owner[0].displayName : wipData.PM.Owner.displayName}</label>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm ms-2"
                    onClick={() =>
                      setWIPData((prevWIPData) => ({
                        ...prevWIPData,
                        PM: {
                          ...prevWIPData.PM,
                          Owner: null,
                        },
                        pmWIPType: null,
                      }))
                    }
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    type="button"
                    className="btn btn-success btn-md"
                    style={{ width: "8rem" }}
                    onClick={() => openModal("PM")}
                  >
                    Assign
                  </button>
                </div>
              )}
            </div>
          </div>
          <ProtectedComponent requiredRoles={["engineer-leader"]}>
            <div name="Engineer">
              <label className="fs-3 py-2">Infra</label>
              <div className="d-flex flex-wrap py-2">
                <label className="me-2" style={{ width: "8rem" }}>
                  Owner :
                </label>
                {wipData.Engineer.Owner ? (
                  <div className="d-flex align-items-center justify-content-between">
                    <label style={{ width: "22rem" }}>{Array.isArray(wipData.Engineer.Owner) ? wipData.Engineer.Owner[0].displayName : wipData.Engineer.Owner.displayName}
                    </label>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm ms-2"
                      onClick={() =>
                        setWIPData((prevWIPData) => ({
                          ...prevWIPData,
                          Engineer: {
                            ...prevWIPData.Engineer,
                            Owner: null,
                          },
                        }))
                      }
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-success btn-md"
                    style={{ width: "8rem" }}
                    onClick={() => openModal("EngineerOwner")}
                  >
                    Assign
                  </button>
                )}
              </div>
              <div className="d-row flex-wrap py-2 d-xl-flex">
                <label className="me-2" style={{ width: "8rem" }}>
                  Consult :
                </label>
                <div>
                  {wipData.Engineer.Consult &&
                    wipData.Engineer.Consult.map((consultant, index) => (
                      <div
                        key={index}
                        className="d-flex align-items-center justify-content-between"
                      >
                        <label style={{ width: "22rem" }}>{consultant.displayName}</label>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm ms-2"
                          onClick={() =>
                            handleDelete("Engineer", "Consult", index)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  <button
                    type="button"
                    className="btn btn-success btn-md"
                    style={{ width: "8rem" }}
                    onClick={() => openModal("EngineerConsult")}
                  >
                    Assign
                  </button>
                </div>
              </div>
              <div className="d-row flex-wrap py-2 d-xl-flex">
                <label className="me-2" style={{ width: "8rem" }}>
                  Co-Project :
                </label>
                <div>
                  {wipData.Engineer.CoProject &&
                    wipData.Engineer.CoProject.map((co, index) => (
                      <div
                        key={index}
                        className="d-flex align-items-center justify-content-between"
                      >
                        <label style={{ width: "22rem" }}>{co.displayName}</label>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm ms-2"
                          onClick={() =>
                            handleDelete("Engineer", "CoProject", index)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  <button
                    type="button"
                    className="btn btn-success btn-md"
                    style={{ width: "8rem" }}
                    onClick={() => openModal("EngineerCoProject")}
                  >
                    Assign
                  </button>
                </div>
              </div>
            </div>
          </ProtectedComponent>
          <ProtectedComponent requiredRoles={["cabling-leader"]}>
            <div name="Cabling">
              <label className="fs-3 py-2">Cabling</label>
              <div className="d-flex flex-wrap py-2">
                <label className="me-2" style={{ width: "8rem" }}>
                  Owner :
                </label>
                {wipData.Cabling.Owner ? (
                  <div className="d-flex align-items-center justify-content-between">
                    <label style={{ width: "22rem" }}>{Array.isArray(wipData.Cabling.Owner) ? wipData.Cabling.Owner[0].displayName : wipData.Cabling.Owner.displayName}
                    </label>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm ms-2"
                      onClick={() =>
                        setWIPData((prevWIPData) => ({
                          ...prevWIPData,
                          Cabling: {
                            ...prevWIPData.Cabling,
                            Owner: null,
                          },
                        }))
                      }
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-success btn-md"
                    style={{ width: "8rem" }}
                    onClick={() => openModal("CablingOwner")}
                  >
                    Assign
                  </button>
                )}
              </div>
              <div className="d-row flex-wrap py-2 d-xl-flex">
                <label className="me-2" style={{ width: "8rem" }}>
                  Consult :
                </label>
                <div>
                  {wipData.Cabling.Consult &&
                    wipData.Cabling.Consult.map((consultant, index) => (
                      <div
                        key={index}
                        className="d-flex align-items-center justify-content-between"
                      >
                        <label style={{ width: "22rem" }}>{consultant.displayName}</label>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm ms-2"
                          onClick={() =>
                            handleDelete("Cabling", "Consult", index)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  <button
                    type="button"
                    className="btn btn-success btn-md"
                    style={{ width: "8rem" }}
                    onClick={() => openModal("CablingConsult")}
                  >
                    Assign
                  </button>
                </div>
              </div>
              <div className="d-row flex-wrap py-2 d-xl-flex">
                <label className="me-2" style={{ width: "8rem" }}>
                  Co-Project :
                </label>
                <div>
                  {wipData.Cabling.CoProject &&
                    wipData.Cabling.CoProject.map((co, index) => (
                      <div
                        key={index}
                        className="d-flex align-items-center justify-content-between"
                      >
                        <label style={{ width: "22rem" }}>{co.displayName}</label>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm ms-2"
                          onClick={() =>
                            handleDelete("Cabling", "CoProject", index)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  <button
                    type="button"
                    className="btn btn-success btn-md"
                    style={{ width: "8rem" }}
                    onClick={() => openModal("CablingCoProject")}
                  >
                    Assign
                  </button>
                </div>
              </div>
            </div>
          </ProtectedComponent>
          <ProtectedComponent requiredRoles={["data-center-leader"]}>
            <div name="Datacenter">
              <label className="fs-3 py-2">Datacenter</label>
              <div className="d-flex flex-wrap py-2">
                <label className="me-2" style={{ width: "8rem" }}>
                  Owner :
                </label>
                {wipData.Datacenter.Owner ? (
                  <div className="d-flex align-items-center justify-content-between">
                    <label style={{ width: "22rem" }}>{Array.isArray(wipData.Datacenter.Owner) ? wipData.Datacenter.Owner[0].displayName : wipData.Datacenter.Owner.displayName}
                    </label>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm ms-2"
                      onClick={() =>
                        setWIPData((prevWIPData) => ({
                          ...prevWIPData,
                          Datacenter: {
                            ...prevWIPData.Datacenter,
                            Owner: null,
                          },
                        }))
                      }
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-success btn-md"
                    style={{ width: "8rem" }}
                    onClick={() => openModal("DatacenterOwner")}
                  >
                    Assign
                  </button>
                )}
              </div>
              <div className="d-row flex-wrap py-2 d-xl-flex">
                <label className="me-2" style={{ width: "8rem" }}>
                  Consult :
                </label>
                <div>
                  {wipData.Datacenter.Consult &&
                    wipData.Datacenter.Consult.map((consultant, index) => (
                      <div
                        key={index}
                        className="d-flex align-items-center justify-content-between"
                      >
                        <label style={{ width: "22rem" }}>{consultant.displayName}</label>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm ms-2"
                          onClick={() =>
                            handleDelete("Datacenter", "Consult", index)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  <button
                    type="button"
                    className="btn btn-success btn-md"
                    style={{ width: "8rem" }}
                    onClick={() => openModal("DatacenterConsult")}
                  >
                    Assign
                  </button>
                </div>
              </div>
              <div className="d-row flex-wrap py-2 d-xl-flex">
                <label className="me-2" style={{ width: "8rem" }}>
                  Co-Project :
                </label>
                <div>
                  {wipData.Datacenter.CoProject &&
                    wipData.Datacenter.CoProject.map((co, index) => (
                      <div
                        key={index}
                        className="d-flex align-items-center justify-content-between"
                      >
                        <label style={{ width: "22rem" }}>{co.displayName}</label>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm ms-2"
                          onClick={() =>
                            handleDelete("Datacenter", "CoProject", index)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  <button
                    type="button"
                    className="btn btn-success btn-md"
                    style={{ width: "8rem" }}
                    onClick={() => openModal("DatacenterCoProject")}
                  >
                    Assign
                  </button>
                </div>
              </div>
            </div>
          </ProtectedComponent>
        </div>
        <div
          name="footer-button"
          className="d-flex px-0 mt-5 justify-content-end"
        >
          <button
            type="reset"
            className="btn btn-danger btn-lg me-lg-5 me-sm-3 me-1"
            style={{ width: "8rem" }}
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-success btn-lg ms-lg-5 ms-sm-3 ms-1"
            style={{ width: "8rem" }}
            onClick={handleSubmit}
          >
            Save
          </button>
        </div>
      </section>
    </main>
  );
}
