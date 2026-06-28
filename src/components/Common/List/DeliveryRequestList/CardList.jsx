import { Link } from "react-router-dom";
import Style from "./CardList.module.css"; // You can use the same styles or create new ones

const CardList = ({ deliveryRequests }) => {
  const dateFormat = (date) => {
    return date ? new Date(date).toLocaleDateString("en-GB") : "Unknown";
  };

  return (
    <div className="row">
      {deliveryRequests.map((request, index) => {
        return (
          <Link
            to={`/delivery-requests/${request._id}`}
            className="col-lg-4 col-md-6 col-sm-12 mb-4"
            key={index}
          >
            <div className={`card h-100 ${Style.cardHover}`}>
              {/* <div className="d-flex justify-content-end mb-1">
                <div className="text-bluedark smaller px-2 m-1 fst-italic border rounded-pill bg-white">
                  {request.customer?.name || "---"}
                </div>
              </div> */}
              <div className="card-body pt-0 mt-0 d-flex flex-column mt-3">
                <h3 className="fw-bold text-wrap">
                  @{request.customerName || "---"}
                </h3>
                <div className="d-flex gap-1 small text-muted fst-italic mb-2">
                  <div>
                    <strong>Delivery At:</strong>
                  </div>
                  <div className="text-bluedark text-decoration-underline">
                    {dateFormat(request.deliveryAt) || "unknow"}
                  </div>
                </div>
                <div className="smaller text-gray">
                  <strong>Address:</strong> {request.address || "---"}
                </div>
                <div className="d-flex gap-1 small text-muted fst-italic">
                  <div>
                    <strong>Contact Person:</strong>
                  </div>
                  <div className="text-bluedark text-decoration-underline">
                    {request.contactPerson || "---"}
                  </div>
                </div>
                <div className="d-flex gap-1 smaller text-muted fst-italic mt-2">
                  <div>
                    <strong>Created By:</strong>
                  </div>
                  <div className="text-bluedark text-decoration-underline">
                    {request.createdBy}
                  </div>
                  <div className="text-secondary">
                    {dateFormat(request.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default CardList;
