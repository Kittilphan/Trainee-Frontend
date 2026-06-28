import React from "react";

import { WIPList } from "../../routes/WIP";
import Details from "./Details/Details";
import FileList from "./FileList/FileList";

function ProjectDetail({ project }) {
  return (
    <div>
      <WIPList project={project} />
      <Details project={project} />
      <FileList project={project} />
    </div>
  );
}

export default ProjectDetail;
