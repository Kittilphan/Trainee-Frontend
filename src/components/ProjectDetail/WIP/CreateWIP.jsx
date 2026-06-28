import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { useNavigate, useParams } from 'react-router-dom';
import { SwalDialog, SwalConfirm } from '../../Swal';
import AutoResizingTextarea from '../../AutoResizingTextarea/AutoResizingTextarea';

import CreateXO from '../../Modals/CreateXO';
import WIPcontroller from '../../../controllers/WIP/index';
import CustomerController from '../../../controllers/Customers';

import UserIcon from "../../Common/UserIcon/UserIcon";
import AllUsersContext from '../../../contexts/AllUsersContext';

export default function CreateWIP({ filePO, wipNumber, pmProject, customerId }) {
  const { isLoadingUser, getUserFilter } = useContext(AllUsersContext);
  const [users, setUsers] = useState([]);
  let navigate = useNavigate();
  const { projectId } = useParams();

  const [wipData, setWIPData] = useState({
    wipNumber: `${wipNumber}`,
    pmWIP: pmProject,
    pmWIPType: pmProject ? 0 : null,
    projectId: projectId,
    wipName: '',
    filePO: '',
    poChecked: false,
    xoChecked: false,
    dateAssigned: new Date(Date.now()).toISOString().split('T')[0],
    expectedCompleteDate: '',
    siteName: '',
    siteAddress: '',
    dateTimeRequest: '',
    customerContactPerson: '',
    customerContactTel: '',
    requireInternalKickoff: false,
    requestSub: false,
    subDetail: '',
    typeEngineer: [
      { engImplement: null },
      { engTraining: null },
      { engConsult: null },
      { engDelivery: null },
      { engAnotherChecked: null },
      { engAnother: null }
    ],
    typeCabling: [
      { cabImplement: null },
      { cabTraining: null },
      { cabConsult: null },
      { cabDelivery: null },
      { cabAnotherChecked: null },
      { cabAnother: null }
    ],
    typeDataCenter: [
      { dataImplement: null },
      { dataTraining: null },
      { dataConsult: null },
      { dataDelivery: null },
      { dataAnotherChecked: null },
      { dataAnother: null }
    ],
    offeredDetails: '',
    remark: '',
    status: 0
  });

  const [showModal, setShowModal] = useState(false);
  const [useOfficialAddress, setUseOfficialAddress] = useState(false);
  const [AddressOptions, setAddressOptions] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(false);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    const isCheckbox = type === 'checkbox';

    setWIPData((prevWIPData) => {
      if (id.includes('.')) {
        const [arrayName, key] = id.split('.');
        const itemIndex = prevWIPData[arrayName].findIndex((i) => key in i);
        if (itemIndex !== -1) {
          const updatedArray = [
            ...prevWIPData[arrayName].slice(0, itemIndex),
            { ...prevWIPData[arrayName][itemIndex], [key]: isCheckbox ? checked : value },
            ...prevWIPData[arrayName].slice(itemIndex + 1)
          ];
          return {
            ...prevWIPData,
            [arrayName]: updatedArray
          };
        }
      } else {
        return {
          ...prevWIPData,
          [id]: isCheckbox ? checked : value
        };
      }
      return prevWIPData;
    });
  };

  const handleXOlink = (xoNum) => {
    navigate(`/xo`);
  };

  const handleUseOfficialAddress = () => {
    const changeTo = !useOfficialAddress;
    setUseOfficialAddress(changeTo);
    if (changeTo) FetchLocations();
  };

  const handleSubmit = async () => {
    const { wipNumber, typeEngineer, typeCabling, typeDataCenter } = wipData;

    if (!wipNumber) {
      SwalDialog({
        icon: 'error',
        text: 'WIP Number are required.'
      });
      return;
    }

    let anotherCheckedTemp = false;
    const hasValidType = (typeArray) =>
      typeArray.some((item) => {
        let anotherChecked =
          Object.keys(item).includes('engAnotherChecked') ||
          Object.keys(item).includes('cabAnotherChecked') ||
          Object.keys(item).includes('dataAnotherChecked');
        let another =
          Object.keys(item).includes('engAnother') ||
          Object.keys(item).includes('cabAnother') ||
          Object.keys(item).includes('dataAnother');

        return Object.values(item).some((value) => {
          if (anotherChecked && value !== null && value !== false && value !== '') {
            anotherCheckedTemp = true;
            return false;
          } else if (!anotherCheckedTemp && another && value !== null && value !== false && value !== '') {
            anotherCheckedTemp = false;
            return false;
          } else {
            return value !== null && value !== false && value !== '';
          }
        });
      });

    if (
      !hasValidType(wipData.typeEngineer) &&
      !hasValidType(wipData.typeCabling) &&
      !hasValidType(wipData.typeDataCenter)
    ) {
      SwalDialog({
        icon: 'error',
        text: 'Must have at least one implement or fill another implement information.'
      });
      return;
    }

    const regex = /^WNIG\d{7}$/;
    const trimmedWipNumber = wipData.wipNumber.trim();
    if (!regex.test(trimmedWipNumber)) {
      SwalDialog({
        icon: 'error',
        text: 'WIP Number Format is not correct.',
      })
      return;
    }

    const formatTypes = (types) => {
      const groupedTypes = types.reduce((dataArray, type) => {
        const key = Object.keys(type)[0];
        const baseKey = key.replace(/Checked$/, '');
        if (!dataArray[baseKey]) {
          dataArray[baseKey] = {};
        }
        dataArray[baseKey][key] = type[key];
        return dataArray;
      }, {});
      return Object.entries(groupedTypes)
        .filter(([key, values]) => Object.values(values).some((value) => value))
        .map(([key, values]) => {
          const checkedKey = `${key}Checked`;
          if (values[checkedKey] === false) {
            return '';
          }
          if (values[checkedKey]) {
            return values[key];
          }
          return key.replace(/^(eng|cab|data)/, '');
        });
    };

    const formattedWIPData = {
      ...wipData,
      typeEngineer: formatTypes(typeEngineer),
      typeCabling: formatTypes(typeCabling),
      typeDataCenter: formatTypes(typeDataCenter)
    };

    const updatedWIPData = {};

    for (const key in formattedWIPData) {
      if (formattedWIPData.hasOwnProperty(key)) {
        let value = formattedWIPData[key];
        if (key === 'pmWIPType' && value !== null && value !== undefined) {
          updatedWIPData[key] = value;
        }
        if (value !== null && value !== undefined && value !== '' && value != '0') {
          if (typeof value === 'boolean') {
            updatedWIPData[key] = value ? 1 : 0;
          } else if (Array.isArray(value)) {
            if (value !== null && value !== undefined && value !== '' && value != '0') {
              updatedWIPData[key] = value;
            }
          } else {
            updatedWIPData[key] = value;
          }
        }
      }
    }

    let cancelTokenSource = axios.CancelToken.source();
    try {
      if (formattedWIPData?.typeEngineer || formattedWIPData?.typeCabling || formattedWIPData?.typeDataCenter) {
        const roles = [
          formattedWIPData?.typeEngineer?.length > 0 &&
          `Infra Leader: ${users?.filter(user => user.roles.some(role => ["engineer-leader"].includes(role))).map(leader => leader.displayName).join(", ")}`,
          formattedWIPData?.typeCabling?.length > 0 && `Cabling Leader: ${users?.filter(user => user.roles.includes("cabling-leader")).map((leader) => leader.displayName).join(", ")}`,
          formattedWIPData?.typeDataCenter?.length > 0 && `Data Center Leader: ${users?.filter(user => user.roles.includes("data-center-leader")).map((leader) => leader.displayName).join(", ")}`,
        ].filter(Boolean);

        const confirmationText = `
          <h3>Are you sure you want to send the mail to the following user(s)?</h3>
          <br/>
          <ul style="text-align: left;">
            ${roles.map((role) => `<li>${role}</li>`).join('')}
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
              const result = await WIPcontroller.createWIP({
                payload: updatedWIPData,
                options: { cancelToken: cancelTokenSource.token }
              });
              SwalDialog({
                icon: 'success',
                text: 'WIP created successfully.',
              }).then(() => {
                navigate(-1);
              });
            } catch (error) {
              SwalDialog({
                icon: "error",
                text: `${error.response?.data?.message || error.response?.data?.error || error || 'Failed to updated WIP.'}`,
              })
            }
          },
          callbackCancel: () => {
            return;
          }
        });
      } else {
        const result = await WIPcontroller.createWIP({
          payload: updatedWIPData,
          options: { cancelToken: cancelTokenSource.token }
        });
        SwalDialog({
          icon: 'success',
          text: 'WIP created successfully.',
        }).then(() => {
          navigate(-1);
        });
      }
    } catch (error) {
      SwalDialog({
        icon: "error",
        text: `${error.response?.data?.message || error.response?.data?.error || error || 'Failed to updated WIP.'}`,
      })
    }
  };

  const FetchLocations = async () => {
    setLocationsLoading(true);
    try {
      const locations = await CustomerController.getLocationsById({
        id: customerId
      });
      setAddressOptions(locations);
    } catch (err) {
      console.error('Error Fetching Locations :', err);
      throw new Error(err.response?.data?.message || err.response?.data?.error || 'Error Fetching items');
    } finally {
      setLocationsLoading(false);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const empList = await getUserFilter(["engineer-leader", "cabling-leader", "data-center-leader"]);
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
      <CreateXO
        show={showModal}
        closeModal={closeModal}
        wipNumber={wipData.wipNumber}
        filePO={filePO ? filePO.find((po) => po.reference === wipData.filePO) : ''}
      />

      <section className="main-content p-5 rounded-4 border shadow">
        <div name="Content-field-1" className="d-flex flex-wrap justify-content-between">
          <div name="Content-field-1-left" className="col-md-5 col-12 px-0">
            <input
              className="form-control my-2 form-control-lg"
              type="text"
              id="wipNumber"
              placeholder="WIP Number"
              value={wipData.wipNumber || ""}
              onChange={handleChange}
            // disabled
            />
            <input
              className="form-control my-2 form-control-lg"
              type="text"
              id="wipName"
              placeholder="WIP Description"
              value={wipData.wipName || ""}
              onChange={handleChange}
            />
            <div className="d-flex flex-wrap py-2">
              <div className="form-check fs-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="poChecked"
                  value={wipData.poChecked}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="poChecked">
                  {wipData.filePO ? "Confirmed Order Files" : "Require Confirmed Order Files"}
                </label>
              </div>
              <div className="d-row">
                <select
                  className="form-select ms-3"
                  style={{ width: "9rem" }}
                  value={wipData.filePO || ""}
                  id="filePO"
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    Select Order List
                  </option>
                  <option value="">None</option>
                  {filePO && filePO.length > 0 && (
                    filePO.map((po) => (
                      <option key={po._id} value={po.reference}>
                        {po.description}
                      </option>
                    ))
                  )}
                </select>
                <div className="d-flex flex-wrap py-2">
                  <div className="d-row">
                    {wipData.filePO && (
                      <div className="ms-4 my-1 fs-5">
                        <ul>
                          {filePO && filePO.filter(po => po.reference === wipData.filePO).map((po) => (
                            <li key={po._id}>
                              {po.xoNumbers && po.xoNumbers.map((xoObject) => (
                                <ul key={xoObject._id}>
                                  {xoObject.xoNumber && (
                                    <li>
                                      <button type="button" onClick={() => handleXOlink(xoObject.xoNumber)}>
                                        {`XO ${xoObject.xoNumber}`}
                                      </button>
                                    </li>
                                  )}
                                </ul>
                              ))}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="d-flex flex-wrap py-2">
              <div className="form-check fs-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="xoChecked"
                  value={wipData.xoChecked}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="xoChecked">Require XO</label>
              </div>
              <label className="text-danger">* กรณีที่ WIP นี้ต้องมี Confirmed Order Files แต่ยังไม่ได้ใส่ Confirmed Order หรือ XO จะมีเมล์แจ้งเตือนทุกเช้าวันจันทร์</label>
            </div>
          </div>
          <div name="Content-field-1-right" className="px-0" style={{ width: "23rem" }}>
            <div className="d-flex py-2 justify-content-between flex-wrap">
              <label className="fs-5" style={{ minWidth: "12.6rem" }}>
                วันที่ได้รับมอบหมาย
              </label>
              <input
                type="date"
                id="dateAssigned"
                className="form-control"
                style={{ maxWidth: "10rem" }}
                value={wipData.dateAssigned}
                onChange={handleChange}
              />
            </div>
            <div className="d-flex py-2 justify-content-between flex-wrap">
              <label className="fs-5" style={{ minWidth: "12.6rem" }}>
                วันเสร็จสิ้นงานที่คาดหวัง
              </label>
              <input
                type="date"
                id="expectedCompleteDate"
                className="form-control"
                style={{ maxWidth: "10rem" }}
                value={wipData.expectedCompleteDate || ""}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        <div name="Content-field-2" className="d-flex flex-column flex-xl-row mt-4 justify-content-between">
          <div name="Content-field-2-left" className="mb-4 me-xl-4">
            <label
              className="fs-4 py-2"
              style={{ width: "42vw" }}>
              ข้อมูลลูกค้า
            </label>
            <div className="d-flex flex-column flex-xl-row fs-5 py-2">
              <label htmlFor="siteName" className="form-label me-xl-2 mb-2 mb-xl-0" style={{ minWidth: "14.5rem" }}>
                ชื่อสถานที่
              </label>
              <div className="d-flex col-lg-10">
                {useOfficialAddress ? (
                  <Select
                    className="col-4"
                    options={AddressOptions}
                    getOptionLabel={(option) => option.label || 'default'}
                    getOptionValue={(option) => option.location}
                    onChange={(selected) => handleChange({ target: { id: 'siteAddress', value: selected.location } })}
                  />
                ) : (
                  <div className="col-4">
                    <input
                      className="form-control"
                      type="text"
                      id="siteName"
                      value={wipData.siteName || ""}
                      onChange={handleChange}
                    />
                  </div>
                )}
                <div className="form-check my-auto ms-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="useOfficialAddress"
                    value="1"
                    checked={useOfficialAddress}
                    onChange={() => handleUseOfficialAddress()}
                  />
                  <label className="form-check-label user-select-none" htmlFor="useOfficialAddress">
                    Use Official Address
                  </label>
                </div>
              </div>
            </div>
            <div className="d-flex flex-column flex-xl-row fs-5 py-2">
              <label htmlFor="siteAddress" className="form-label me-xl-2 mb-2 mb-xl-0" style={{ minWidth: "14.5rem" }}>
                ที่อยู่สำหรับติดตั้ง
              </label>
              <AutoResizingTextarea
                className="form-control"
                id="siteAddress"
                type="text"
                rows="3"
                value={wipData.siteAddress || ""}
                onChange={handleChange}
              />
            </div>
            <div className="d-flex flex-column flex-xl-row fs-5 py-2">
              <label className="me-xl-2 mb-2 mb-xl-0" style={{ minWidth: "14.5rem" }}>
                วันติดตั้ง
              </label>
              <input
                type="date"
                id="dateTimeRequest"
                className="form-control"
                style={{ width: "10rem" }}
                value={wipData.dateTimeRequest || ""}
                onChange={handleChange}
              />
            </div>
            <div className="d-flex flex-column flex-xl-row fs-5 py-2">
              <label htmlFor="customerContactPerson" className="form-label me-xl-2 mb-2 mb-xl-0" style={{ minWidth: "14.5rem" }}>
                ช่องทางติดต่อลูกค้า (ส่วนตัว)
              </label>
              <input
                className="form-control"
                id="customerContactPerson"
                type="text"
                rows="1"
                value={wipData.customerContactPerson || ""}
                onChange={handleChange}
              />
            </div>
            <div className="d-flex flex-column flex-xl-row fs-5 py-2">
              <label htmlFor="customerContactTel" className="form-label me-xl-2 mb-2 mb-xl-0" style={{ minWidth: "14.5rem" }}>
                เบอร์โทรติดต่อลูกค้า
              </label>
              <input
                className="form-control"
                id="customerContactTel"
                type="text"
                rows="1"
                value={wipData.customerContactTel || ""}
                onChange={handleChange}
              />
            </div>
          </div>
          <div name="Content-field-2-right" className="mb-4">
            <label
              className="fs-4 py-2"
              style={{ width: "42vw" }}>
              ข้อมูล Sales
            </label>
            <div className="form-check py-2 fs-5">
              <input
                className="form-check-input"
                type="checkbox"
                id="requireInternalKickoff"
                value=""
                checked={wipData.requireInternalKickoff}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="requireInternalKickoff">
                WIP kickoff
              </label>
            </div>
            <div className="form-check py-2 fs-5">
              <input
                className="form-check-input"
                type="checkbox"
                id="requestSub"
                value=""
                checked={wipData.requestSub}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="requestSub">
                Request Sub
              </label>
              <AutoResizingTextarea
                className="form-control mt-2"
                id="subDetail"
                type="text"
                rows="3"
                value={wipData.subDetail || ""}
                onChange={handleChange}
                disabled={!wipData.requestSub}
              />
            </div>
          </div>
        </div>
        <div name="Content-field-3" className="d-flex flex-column flex-xl-row mt-4 justify-content-between">
          <div
            name="Content-field-3-left"
            className="d-row px-0 me-xl-4">
            <div className="fs-4 py-2 d-flex"
              style={{ width: "25vw" }}>
              <label className="me-4"> ข้อมูล Infra </label>
              <UserIcon users={users.filter(user => user.roles.some(role => ["engineer-leader"].includes(role)))} />
            </div>
            <div className="form-check py-2 fs-5">
              <input
                className="form-check-input"
                type="checkbox"
                id="typeEngineer.engImplement"
                value="Implement"
                checked={wipData.typeEngineer?.engImplement}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="typeEngineer.engImplement">
                Implement
              </label>
            </div>
            <div className="form-check py-2 fs-5">
              <input
                className="form-check-input"
                type="checkbox"
                id="typeEngineer.engTraining"
                value="Training"
                checked={wipData.typeEngineer?.engTraining}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="typeEngineer.engTraining">
                Training
              </label>
            </div>
            <div className="form-check py-2 fs-5">
              <input
                className="form-check-input"
                type="checkbox"
                id="typeEngineer.engConsult"
                value="Consult"
                checked={wipData.typeEngineer?.engConsult}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="typeEngineer.engConsult">
                Consult
              </label>
            </div>
            <div className="form-check py-2 fs-5">
              <input
                className="form-check-input"
                type="checkbox"
                id="typeEngineer.engDelivery"
                value="Delivery"
                checked={wipData.typeEngineer?.engDelivery}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="typeEngineer.engDelivery">
                Delivery
              </label>
            </div>
            <div className="form-check py-2 fs-5">
              <input
                className="form-check-input"
                type="checkbox"
                id="typeEngineer.engAnotherChecked"
                value="Another"
                checked={wipData.typeEngineer?.engAnotherChecked}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="typeEngineer.engAnotherChecked">
                อื่น ๆ
              </label>
              <input
                className="form-control mt-2"
                type="text"
                id="typeEngineer.engAnother"
                value={wipData.typeEngineer?.engAnother}
                onChange={handleChange}
                disabled={!wipData.typeEngineer?.find(e => 'engAnotherChecked' in e)?.engAnotherChecked}
              />
            </div>
          </div>
          <div
            name="Content-field-3-mid"
            className="d-row px-0">
            <div className="fs-4 py-2 d-flex"
              style={{ width: "25vw" }}>
              <label className="me-4"> ข้อมูล Cabling </label>
              <UserIcon users={users.filter(user => user.roles.includes("cabling-leader"))} />
            </div>
            <div className="form-check py-2 fs-5">
              <input
                className="form-check-input"
                type="checkbox"
                id="typeCabling.cabImplement"
                value="Implement"
                checked={wipData.typeCabling?.cabImplement}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="typeCabling.cabImplement">
                Implement
              </label>
            </div>
            <div className="form-check py-2 fs-5">
              <input
                className="form-check-input"
                type="checkbox"
                id="typeCabling.cabTraining"
                value="Training"
                checked={wipData.typeCabling?.cabTraining}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="typeCabling.cabTraining">
                Training
              </label>
            </div>
            <div className="form-check py-2 fs-5">
              <input
                className="form-check-input"
                type="checkbox"
                id="typeCabling.cabConsult"
                value="Consult"
                checked={wipData.typeCabling?.cabConsult}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="typeCabling.cabConsult">
                Consult
              </label>
            </div>
            <div className="form-check py-2 fs-5">
              <input
                className="form-check-input"
                type="checkbox"
                id="typeCabling.cabDelivery"
                value="Delivery"
                checked={wipData.typeCabling?.cabDelivery}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="typeCabling.cabDelivery">
                Delivery
              </label>
            </div>
            <div className="form-check py-2 fs-5">
              <input
                className="form-check-input"
                type="checkbox"
                id="typeCabling.cabAnotherChecked"
                value="Another"
                checked={wipData.typeCabling?.cabAnotherChecked}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="typeCabling.cabAnotherChecked">
                อื่น ๆ
              </label>
              <input
                className="form-control mt-2"
                type="text"
                id="typeCabling.cabAnother"
                value={wipData.typeCabling?.cabAnother}
                onChange={handleChange}
                disabled={!wipData.typeCabling?.find(e => 'cabAnotherChecked' in e)?.cabAnotherChecked}
              />
            </div>
          </div>
          <div
            name="Content-field-3-right"
            className="d-row px-0">
            <div className="fs-4 py-2 d-flex"
              style={{ width: "25vw" }}>
              <label className="me-4"> ข้อมูล Datacenter </label>
              <UserIcon users={users.filter(user => user.roles.includes("data-center-leader"))} />
            </div>
            <div className="form-check py-2 fs-5">
              <input
                className="form-check-input"
                type="checkbox"
                id="typeDataCenter.dataImplement"
                value="Implement"
                checked={wipData.typeDataCenter?.dataImplement}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="typeDataCenter.dataImplement">
                Implement
              </label>
            </div>
            <div className="form-check py-2 fs-5">
              <input
                className="form-check-input"
                type="checkbox"
                id="typeDataCenter.dataTraining"
                value="Training"
                checked={wipData.typeDataCenter?.dataTraining}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="typeDataCenter.dataTraining">
                Training
              </label>
            </div>
            <div className="form-check py-2 fs-5">
              <input
                className="form-check-input"
                type="checkbox"
                id="typeDataCenter.dataConsult"
                value="Consult"
                checked={wipData.typeDataCenter?.dataConsult}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="typeDataCenter.dataConsult">
                Consult
              </label>
            </div>
            <div className="form-check py-2 fs-5">
              <input
                className="form-check-input"
                type="checkbox"
                id="typeDataCenter.dataDelivery"
                value="Delivery"
                checked={wipData.typeDataCenter?.dataDelivery}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="typeDataCenter.dataDelivery">
                Delivery
              </label>
            </div>
            <div className="form-check py-2 fs-5">
              <input
                className="form-check-input"
                type="checkbox"
                id="typeDataCenter.dataAnotherChecked"
                value="Another"
                checked={wipData.typeDataCenter?.dataAnotherChecked}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="typeDataCenter.dataAnotherChecked">
                อื่น ๆ
              </label>
              <input
                className="form-control mt-2"
                type="text"
                id="typeDataCenter.dataAnother"
                value={wipData.typeDataCenter?.dataAnother}
                onChange={handleChange}
                disabled={!wipData.typeDataCenter?.find(e => 'dataAnotherChecked' in e)?.dataAnotherChecked}
              />
            </div>
          </div>
        </div>
        <div name="Content-field-4" className="d-row mt-4">
          <label className="fs-4 py-2">ข้อมูลเพิ่มเติม</label>
          <div className="d-flex flex-column flex-lg-row fs-5 py-2 justify-content-between">
            <label
              htmlFor="offeredDetails"
              className="form-label me-2"
              style={{ minWidth: "9rem" }}>
              Offered Details
            </label>
            <AutoResizingTextarea
              className="form-control"
              id="offeredDetails"
              type="text"
              rows="3"
              value={wipData.offeredDetails || ""}
              onChange={handleChange}
            />
          </div>
          <div className="d-flex flex-column flex-lg-row fs-5 py-2 justify-content-between">
            <label
              htmlFor="remark"
              className="form-label me-2"
              style={{ minWidth: "9rem" }}>
              Remark
            </label>
            <AutoResizingTextarea
              className="form-control"
              id="remark"
              type="text"
              rows="3"
              value={wipData.remark || ""}
              onChange={handleChange}
            />
          </div>
        </div>
        <div name="footer-button" className="d-flex px-0 mt-5 justify-content-end">
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
            onClick={handleSubmit}>
            Save
          </button>
        </div>
      </section>
    </main>
  );
}
