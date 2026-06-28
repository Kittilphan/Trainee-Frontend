import useAuth from "../../hooks/useAuth";

import React from "react";
import axios from "axios";
// import { SwalDialog, SwalLoading } from "../../Swal";

// import UploadController from "../../../controllers/FileUpload";
// import AttachmentController from "../../../controllers/Attachment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";

export default function ButtonUpload({ checklistId, type, callback }) {
  const [fileUpload, setFileUpload] = React.useState(null);
  const [fileUploadTs, setFileUploadTs] = React.useState(new Date().getTime());
  const [fileName, setFileName] = React.useState("");
  const { user } = useAuth();
  function submitFileUpload() {
    // SwalLoading();
    const formData = new FormData();
    formData.append("fileUpload", fileUpload);
    let cancelTokenSource = axios.CancelToken.source();
    // UploadController.uploadFile(formData, { cancelToken: cancelTokenSource.token })
    // .then(async (result) => {
    //   console.log(`UploadController.uploadFile()`, result);
    //   if (result?.filename) {
    //     let cancelTokenSource = axios.CancelToken.source();
    //     await AttachmentController.createByChecklistId(
    //       checklistId,
    //       {
    //         name: fileName || result.filename || "unknown.file",
    //         filename: result.filename,
    //         type,
    //         owner: user.team || "all",
    //         created_by: user?.username || "unknown",
    //       },
    //       {
    //         cancelToken: cancelTokenSource.token,
    //       }
    //     );
    //     // SwalDialog({ icon: "success", text: "File Uploaded", timer: 1000 });
    //     setFileName("");
    //     setFileUploadTs(new Date().getTime());
    //     callback(new Date().getTime());
    //     return;
    //   }
    //   throw new Error("FAILED File Upload");
    // })
    // .catch((err) => {
    //   console.error(`ERROR UploadController.uploadFile()`, err);
    //   // SwalDialog({ icon: "error", text: err.message });
    // });
  }
  return (
    <div className="d-flex">
      <div className="row">
        <label className="col-md-3 col-form-label">เลือกไฟล์แนบ</label>
        <span className="col-md-9">
          <input
            className="form-control form-control-sm"
            type={"file"}
            key={fileUploadTs}
            onChange={(e) => {
              const file = e.target.files[0];
              setFileName(file.name.replace(/\.[^/.]+$/, ""));
              setFileUpload(file);
            }}
          />
        </span>
      </div>
      <div className="row">
        <label className="col-md-3 col-form-label">ชื่อไฟล์แนบ</label>
        <span className="col-md-9">
          <input
            className="form-control form-control-sm"
            type="text"
            value={fileName}
            onChange={(e) => {
              setFileName(e.target.value);
            }}
          />
        </span>
      </div>
      <div className="row">
        <div className="col-md-8">
          <button className="btn btn-sm btn-primary" onClick={submitFileUpload}>
            <FontAwesomeIcon icon={faUpload} fixedWidth className="me-1" />
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}
