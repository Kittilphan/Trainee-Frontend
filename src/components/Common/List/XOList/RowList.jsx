import React, { useState } from "react";
import { Link } from "react-router-dom";
import Style from "./RowList.module.css"; // Update the CSS module as needed
import FilterListIcon from "@mui/icons-material/FilterList";

const XOTableList = ({ xos }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filters, setFilters] = useState({
    status: "",
    xoNumber: "",
    vendorName: "",
    saleOrderNumber: "",
    webOrderNumber: "",
    lastUpdatedAt: "",
  });
  const [visibleFilter, setVisibleFilter] = useState({
    status: false,
    xoNumber: false,
    vendorName: false,
    saleOrderNumber: false,
    webOrderNumber: false,
    lastUpdatedAt: false,
  });

  const dateFormat = (date) => {
    return date ? new Date(date).toLocaleDateString("en-GB") : "Unknown";
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (e, key) => {
    setFilters({ ...filters, [key]: e.target.value });
  };

  const toggleFilterVisibility = (key) => {
    setVisibleFilter((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
    setFilters((prevFilter) => ({
      ...prevFilter,
      [key]: "",
    }));
  };

  const filteredXOs = xos.filter((xo) => {
    return (
      (filters.status === "" || xo.stockReady === parseInt(filters.status)) &&
      (filters.xoNumber === "" ||
        xo.xoNumber[0]
          .toLowerCase()
          .includes(filters.xoNumber.toLowerCase())) &&
      (filters.vendorName === "" ||
        (xo.vendor?.name || "---")
          .toLowerCase()
          .includes(filters.vendorName.toLowerCase())) &&
      (filters.saleOrderNumber === "" ||
        xo.shipmentStatus?.some((shipment) =>
          shipment.saleOrderNumber?.includes(
            filters.saleOrderNumber.toLowerCase()
          )
        )) &&
      (filters.webOrderNumber === "" ||
        xo.shipmentStatus?.some((shipment) =>
          shipment.webOrderNumber?.includes(
            filters.webOrderNumber.toLowerCase()
          )
        )) &&
      (filters.lastUpdatedAt === "" ||
        dateFormat(xo.lastUpdatedAt).includes(filters.lastUpdatedAt))
    );
  });

  const sortedXOs = [...filteredXOs].sort((a, b) => {
    if (sortConfig.key) {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === "lastUpdatedAt") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    }
    return 0;
  });

  return (
    <>
      <div className="text-danger text-end">Click link in XO Number **</div>
      <div className={`table-responsive ${Style.tableContainer}`}>
        <table className="table">
          <thead>
            <tr>
              <th className={`${Style.minWidthColumn} ${Style.sortable}`}>
                <div onClick={() => handleSort("stockReady")}>
                  Status
                  {sortConfig.key === "stockReady" && (
                    <span className={Style.sortIcon}>
                      {sortConfig.direction === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </div>
                <FilterListIcon
                  className={Style.filterIcon}
                  onClick={() => toggleFilterVisibility("status")}
                />
                {visibleFilter.status && (
                  <input
                    type="text"
                    className={Style.filterInput}
                    value={filters.status}
                    onChange={(e) => handleFilterChange(e, "status")}
                    placeholder="Filter"
                  />
                )}
              </th>
              <th className={`${Style.minWidthColumn} ${Style.sortable}`}>
                <div onClick={() => handleSort("xoNumber")}>
                  XO Number
                  {sortConfig.key === "xoNumber" && (
                    <span className={Style.sortIcon}>
                      {sortConfig.direction === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </div>
                <FilterListIcon
                  className={Style.filterIcon}
                  onClick={() => toggleFilterVisibility("xoNumber")}
                />
                {visibleFilter.xoNumber && (
                  <input
                    type="text"
                    className={Style.filterInput}
                    value={filters.xoNumber}
                    onChange={(e) => handleFilterChange(e, "xoNumber")}
                    placeholder="Filter"
                  />
                )}
              </th>
              <th className={`${Style.minWidthColumn} ${Style.sortable}`}>
                <div onClick={() => handleSort("vendorName")}>
                  Vendor
                  {sortConfig.key === "vendorName" && (
                    <span className={Style.sortIcon}>
                      {sortConfig.direction === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </div>
                <FilterListIcon
                  className={Style.filterIcon}
                  onClick={() => toggleFilterVisibility("vendorName")}
                />
                {visibleFilter.vendorName && (
                  <input
                    type="text"
                    className={Style.filterInput}
                    value={filters.vendorName}
                    onChange={(e) => handleFilterChange(e, "vendorName")}
                    placeholder="Filter"
                  />
                )}
              </th>
              <th className={`${Style.minWidthColumn} ${Style.sortable}`}>
                <div onClick={() => handleSort("saleOrderNumber")}>
                  Sale Order Number
                  {sortConfig.key === "saleOrderNumber" && (
                    <span className={Style.sortIcon}>
                      {sortConfig.direction === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </div>
                <FilterListIcon
                  className={Style.filterIcon}
                  onClick={() => toggleFilterVisibility("saleOrderNumber")}
                />
                {visibleFilter.saleOrderNumber && (
                  <input
                    type="text"
                    className={Style.filterInput}
                    value={filters.saleOrderNumber}
                    onChange={(e) => handleFilterChange(e, "saleOrderNumber")}
                    placeholder="Filter"
                  />
                )}
              </th>
              <th className={`${Style.minWidthColumn} ${Style.sortable}`}>
                <div onClick={() => handleSort("webOrderNumber")}>
                  Web Order Number
                  {sortConfig.key === "webOrderNumber" && (
                    <span className={Style.sortIcon}>
                      {sortConfig.direction === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </div>
                <FilterListIcon
                  className={Style.filterIcon}
                  onClick={() => toggleFilterVisibility("webOrderNumber")}
                />
                {visibleFilter.webOrderNumber && (
                  <input
                    type="text"
                    className={Style.filterInput}
                    value={filters.webOrderNumber}
                    onChange={(e) => handleFilterChange(e, "webOrderNumber")}
                    placeholder="Filter"
                  />
                )}
              </th>
              <th className={`${Style.minWidthColumn} ${Style.sortable}`}>
                <div onClick={() => handleSort("lastUpdatedAt")}>
                  Last Updated
                  {sortConfig.key === "lastUpdatedAt" && (
                    <span className={Style.sortIcon}>
                      {sortConfig.direction === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </div>
                <FilterListIcon
                  className={Style.filterIcon}
                  onClick={() => toggleFilterVisibility("lastUpdatedAt")}
                />
                {visibleFilter.lastUpdatedAt && (
                  <input
                    type="text"
                    className={Style.filterInput}
                    value={filters.lastUpdatedAt}
                    onChange={(e) => handleFilterChange(e, "lastUpdatedAt")}
                    placeholder="Filter"
                  />
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedXOs.map((xo, index) => (
              <tr key={index}>
                <td>
                  {xo.stockReady === 2 ? (
                    <h4 className="text-success">In Stock</h4>
                  ) : xo.stockReady === 1 ? (
                    <h4 className="text-warning">Partial</h4>
                  ) : xo.stockReady === 2 ? (
                    <h4 className="text-secondary">Waiting</h4>
                  ) : (
                    <h4 className="text-primary">Issue</h4>
                  )}
                </td>
                <td>
                  <Link to={`/xos/${xo._id}`} key={index}>
                    <div className="card-title">
                      <h2 className="col d-flex flex-wrap">
                        <span className="text-nowrap">{xo.xoNumber[0]}</span>
                      </h2>
                    </div>
                  </Link>
                </td>
                <td>{xo.vendor?.name || "---"}</td>
                <td>
                  <ul>
                    {xo.shipmentStatus?.map((shipment, index) => (
                      <li key={index} className="border-bottom my-1">
                        {shipment?.saleOrderNumber || " -"}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>
                  <ul>
                    {xo.shipmentStatus?.map((shipment, index) => (
                      <li key={index} className="border-bottom my-1">
                        {shipment?.webOrderNumber || " -"}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>
                  <div className="d-flex flex-wrap text-gray">
                    <div>By {xo.lastUpdatedBy}</div>
                    <div className="ms-1">
                      At {dateFormat(xo.lastUpdatedAt)}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default XOTableList;
