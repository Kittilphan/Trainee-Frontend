import React, { useState } from "react";
import { Link } from "react-router-dom";
import Style from "./RowList.module.css";
import FilterListIcon from "@mui/icons-material/FilterList";

const RowList = ({ deliveryRequests }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filters, setFilters] = useState({
    customerName: "",
    deliveryAt: "",
    address: "",
    contactPerson: "",
    createdAt: "",
  });
  const [visibleFilter, setVisibleFilter] = useState({
    customerName: false,
    deliveryAt: false,
    address: false,
    contactPerson: false,
    createdAt: false,
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

  const filteredRequests = deliveryRequests.filter((request) => {
    return (
      (filters.customerName === "" ||
        (request.customer?.name || request.customerName)
          .toLowerCase()
          .includes(filters.customerName.toLowerCase())) &&
      (filters.deliveryAt === "" ||
        dateFormat(request.deliveryAt).includes(filters.deliveryAt)) &&
      (filters.address === "" ||
        request.address
          .toLowerCase()
          .includes(filters.address.toLowerCase())) &&
      (filters.contactPerson === "" ||
        request.contactPerson
          .toLowerCase()
          .includes(filters.contactPerson.toLowerCase())) &&
      (filters.createdAt === "" ||
        dateFormat(request.createdAt).includes(filters.createdAt))
    );
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (sortConfig.key) {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === "deliveryAt" || sortConfig.key === "createdAt") {
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
      <div className="text-danger text-end">Click link in customer name **</div>
      <div className={`table-responsive ${Style.tableContainer}`}>
        <table className="table">
          <thead>
            <tr>
              <th className={`${Style.minWidthColumn} ${Style.sortable}`}>
                <div onClick={() => handleSort("customerName")}>
                  Customer
                  {sortConfig.key === "customerName" && (
                    <span className={Style.sortIcon}>
                      {sortConfig.direction === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </div>
                <FilterListIcon
                  className={Style.filterIcon}
                  onClick={() => toggleFilterVisibility("customerName")}
                />
                {visibleFilter.customerName && (
                  <input
                    type="text"
                    className={Style.filterInput}
                    value={filters.customerName}
                    onChange={(e) => handleFilterChange(e, "customerName")}
                    placeholder="Filter"
                  />
                )}
              </th>
              <th className={`${Style.minWidthColumn} ${Style.sortable}`}>
                <div onClick={() => handleSort("deliveryAt")}>
                  Delivery At
                  {sortConfig.key === "deliveryAt" && (
                    <span className={Style.sortIcon}>
                      {sortConfig.direction === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </div>
                <FilterListIcon
                  className={Style.filterIcon}
                  onClick={() => toggleFilterVisibility("deliveryAt")}
                />
                {visibleFilter.deliveryAt && (
                  <input
                    type="text"
                    className={Style.filterInput}
                    value={filters.deliveryAt}
                    onChange={(e) => handleFilterChange(e, "deliveryAt")}
                    placeholder="Filter"
                  />
                )}
              </th>
              <th className={`${Style.minWidthColumn} ${Style.sortable}`}>
                <div onClick={() => handleSort("address")}>
                  Address
                  {sortConfig.key === "address" && (
                    <span className={Style.sortIcon}>
                      {sortConfig.direction === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </div>
                <FilterListIcon
                  className={Style.filterIcon}
                  onClick={() => toggleFilterVisibility("address")}
                />
                {visibleFilter.address && (
                  <input
                    type="text"
                    className={Style.filterInput}
                    value={filters.address}
                    onChange={(e) => handleFilterChange(e, "address")}
                    placeholder="Filter"
                  />
                )}
              </th>
              <th className={`${Style.minWidthColumn} ${Style.sortable}`}>
                <div onClick={() => handleSort("contactPerson")}>
                  Contact Person
                  {sortConfig.key === "contactPerson" && (
                    <span className={Style.sortIcon}>
                      {sortConfig.direction === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </div>
                <FilterListIcon
                  className={Style.filterIcon}
                  onClick={() => toggleFilterVisibility("contactPerson")}
                />
                {visibleFilter.contactPerson && (
                  <input
                    type="text"
                    className={Style.filterInput}
                    value={filters.contactPerson}
                    onChange={(e) => handleFilterChange(e, "contactPerson")}
                    placeholder="Filter"
                  />
                )}
              </th>
              <th className={`${Style.minWidthColumn} ${Style.sortable}`}>
                <div onClick={() => handleSort("createdAt")}>
                  Created At
                  {sortConfig.key === "createdAt" && (
                    <span className={Style.sortIcon}>
                      {sortConfig.direction === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </div>
                <FilterListIcon
                  className={Style.filterIcon}
                  onClick={() => toggleFilterVisibility("createdAt")}
                />
                {visibleFilter.createdAt && (
                  <input
                    type="text"
                    className={Style.filterInput}
                    value={filters.createdAt}
                    onChange={(e) => handleFilterChange(e, "createdAt")}
                    placeholder="Filter"
                  />
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedRequests.map((request, index) => (
              <tr key={index}>
                <td>
                  <Link to={`/delivery-requests/${request._id}`} key={index}>
                    {request.customer?.name || request.customerName}
                  </Link>
                </td>
                <td>{dateFormat(request.deliveryAt) || "Unknown"}</td>
                <td>{request.address || "---"}</td>
                <td>{request.contactPerson || "---"}</td>
                <td>{dateFormat(request.createdAt) || "Unknown"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default RowList;
