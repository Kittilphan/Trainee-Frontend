import React from "react";
import { Link } from "react-router-dom";
import Style from "./CardList.module.css";
import Dropzone from "../../../Uploader/Dropzone";
import ProtectedComponent from "../../../ProtectedComponent";
import XOController from "../../../../controllers/XO";
import { SwalDialog } from "../../../Swal";
import axios from "axios";
import BadgeCardStatus from "../../../BadgeStatus";
import {
  faBox,
  faBoxOpen,
  faHourglass,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import AssignSaleOwner from "../../Modal/ShipmentStatus/AssignSaleOwner";
//not update now
const CardList = ({ xos, onFetch }) => {
  const backgroundColors = {
    2: "rgb(var(--rgb-app-green))",
    1: "rgb(var(--rgb-app-orange))",
    0: "rgb(var(--rgb-app-graylight))",
    3: "rgb(var(--rgb-app-blue))",
  };
  const textColor = {
    2: "rgb(var(--rgb-app-white))",
    1: "rgb(var(--rgb-app-white))",
    0: "rgb(var(--rgb-app-reddark))",
    3: "rgb(var(--rgb-app-white))",
  };

  const options = [
    { value: "3", label: "Issue", color: "blue" },
    { value: "2", label: "In Stock", color: "green" },
    { value: "1", label: "Partial", color: "orange" },
    { value: "0", label: "Waiting", color: "gray" },
  ];

  const handleSelectChange = (event) => {
    let cancelTokenSource = axios.CancelToken.source();
    XOController.updateStatus({
      id: event.target._id,
      stockReady: event.target.value,
      options: { cancelToken: cancelTokenSource.token },
    })
      .then((result) => {
        console.log("result: ", result);
        SwalDialog({
          icon: "success",
          text: `XO Number::${event.target.xoNumber} updated`,
          options: {},
        }).then(() => {
          onFetch();
        });
      })
      .catch((err) => {
        console.log(`ERROR XOController.updateStatus()`, err);
        SwalDialog({
          icon: "error",
          text: `${err}`,
          options: {},
        });
      });
  };

  const dateFormat = (date) => {
    return date ? new Date(date).toLocaleDateString("en-GB") : "Unknown";
  };

  const [showModal, setShowModal] = React.useState(false);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  return (
    <div className="row">
      <AssignSaleOwner show={showModal} closeModal={closeModal} />
      <ProtectedComponent requiredRoles={["delivery-admin", "admin"]}>
        <div className="mb-4">
          <button
            className="btn"
            onClick={openModal}
          >
            Upload Shipment Status File
          </button>
        </div>
      </ProtectedComponent>
      {xos?.map((xo, index) => (
        <div key={index} className="col-lg-4 col-md-6 col-sm-12 mb-4">
          <div
            className={`card h-100 ${Style.cardHover}`}
            data-xo-state={xo.stockReady}
          >
            <div className="d-flex justify-content-between align-items-start mb-2">
              <BadgeCardStatus
                status={xo?.stockReady}
                labelStatus={{
                  2: "In Stock",
                  1: "Partial",
                  0: "Waiting",
                  3: "Issue",
                }}
                iconStatus={{
                  2: faBox,
                  1: faBoxOpen,
                  0: faHourglass,
                  3: faPhone,
                }}
                backgroundColors={backgroundColors}
                textColor={textColor}
              />
              <div className="text-bluedark smaller px-2 m-1 fst-italic border rounded-pill bg-white">
                {xo.vendor?.name || "---"}
              </div>
            </div>
            <div className="card-body pt-0 mt-0 d-flex flex-column">
              <h3 className="fw-bold text-wrap">{xo.xoNumber[0]}</h3>
              <div className="row">
                <div className="col">
                  <h6 className="text-muted text-nowrap">Sale Order NO.</h6>
                  <ul>
                    {xo.shipmentStatus?.map((shipment, index) => (
                      <li key={index} className="border-bottom my-1">
                        {shipment?.saleOrderNumber || " -"}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="col">
                  <h6 className="text-muted  text-nowrap">Web Order NO.</h6>
                  <ul>
                    {xo.shipmentStatus?.map((shipment, index) => (
                      <li key={index} className="border-bottom my-1">
                        {shipment?.webOrderNumber || " -"}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-auto">
                <div className="d-flex justify-content-between mt-3">
                  <div>
                    <ProtectedComponent
                      requiredRoles={["delivery-admin", "admin"]}
                    >
                      <div className="dropdown">
                        <button
                          className="btn btn-secondary dropdown-toggle"
                          type="button"
                          id="dropdownMenuButton"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          {options.find(
                            (option) => option.value == xo.stockReady
                          )?.label || "Select an option"}
                        </button>
                        <ul
                          className="dropdown-menu"
                          aria-labelledby="dropdownMenuButton"
                        >
                          {options.map((option) => (
                            <li key={option.value}>
                              <button
                                className="dropdown-item"
                                onClick={() =>
                                  handleSelectChange({
                                    target: {
                                      value: option.value,
                                      _id: xo._id,
                                      xoNumber: xo.xoNumber,
                                    },
                                  })
                                }
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <span
                                  style={{
                                    display: "inline-block",
                                    width: "10px",
                                    height: "10px",
                                    backgroundColor: option.color,
                                    borderRadius: "50%",
                                    marginRight: "10px",
                                  }}
                                ></span>
                                {option.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </ProtectedComponent>
                  </div>
                </div>
                <div className="d-flex gap-1 small text-muted fst-italic">
                  <div>Last updated by</div>
                  <div className="text-bluedark text-decoration-underline">
                    {xo.lastUpdatedBy}
                  </div>
                  <div></div>
                  <div className="text-secondary">
                    {dateFormat(xo.lastUpdatedAt)}
                  </div>
                </div>
                <div className="d-flex gap-1 smaller text-muted fst-italic">
                  <div>Created by</div>
                  <div className="text-bluedark text-decoration-underline">
                    {xo.createdBy}
                  </div>
                  <div></div>
                  <div className="text-secondary">
                    {dateFormat(xo.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardList;
