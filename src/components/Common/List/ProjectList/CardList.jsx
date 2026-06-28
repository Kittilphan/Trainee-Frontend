import { Link } from "react-router-dom";
import Style from "./CardList.module.css";

import BadgeCardStatus from "../../../BadgeStatus";

const CardList = ({ projects }) => {
  const dateFormat = (date) => {
    return date ? new Date(date).toLocaleDateString("en-GB") : "Unknown";
  };
  return (
    <div className="row">
      {projects.map((project, index) => {
        return (
          <Link
            to={`/projects/${project._id}`}
            className="col-lg-4 col-md-6 col-sm-12 mb-4"
            key={index}
          >
            <div
              className={`card h-100 ${Style.cardHover}`}
              data-project-state={project?.state}
            >
              <div className="d-flex justify-content-between align-items-start mb-2">
                <BadgeCardStatus status={project?.state} />
                <div className="text-bluedark smaller px-2 m-1 fst-italic border rounded-pill bg-white">
                  {project.customer?.name || project?.customerName || "---"}
                </div>
              </div>
              <div className="card-body pt-0 mt-0 d-flex flex-column">
                <h3 className="fw-bold text-wrap">{project.projectName}</h3>
                {project?.projectCode && (
                  <div className="smaller text-gray">
                    #{project.projectCode}
                  </div>
                )}
                <div className={Style.description}>{project.description}</div>
                <div className="d-flex gap-1 small text-muted fst-italic">
                  <div>Last updated by</div>
                  <div className="text-bluedark text-decoration-underline">
                    {project.lastUpdatedBy}
                  </div>
                  <div></div>
                  <div className="text-secondary">
                    {dateFormat(project.lastUpdatedAt)}
                  </div>
                </div>
                <div className="d-flex gap-1 smaller text-muted fst-italic">
                  <div>Created by</div>
                  <div className="text-bluedark text-decoration-underline">
                    {project.createdBy}
                  </div>
                  <div></div>
                  <div className="text-secondary">
                    {dateFormat(project.createdAt)}
                  </div>
                </div>
              </div>
              {/* <div className={`${Style.hoverDetails}`}>
                  <div className='small'>Created by: {project.createdBy}</div>
                  <div className='small'>
                    Created at: {dateFormat(project.createdAt)}
                  </div>
                </div> */}
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default CardList;
