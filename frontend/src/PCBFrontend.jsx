import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function PCBFrontend() {
  const [activeTab, setActiveTab] = useState('tagentry');
  const [serialNumber, setSerialNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fetchStatus, setFetchStatus] = useState(null);

  const [pcbData, setPcbData] = useState({
    "Repair Date": '',
    "Fan Sr No": '',
    "Ticket No   ": '',
    "Linen Item No": '',
    "Version": '',
    "Model Type": '',
    "Customer Complaint": '',
    "Symp. Defe.": '',
    "Defect Description": '',
    "RF Observation": '',
    "Lot No": ''
  });

  // Map the display labels to actual backend/Excel keys
  const FIELD_LIST = [
    { key: "Repair Date", label: "Repair Date" },          // replaces Dummy Sr No.
    { key: "Fan Sr No", label: "Fan Sr No" },              // replaces PCB Sr NO
    { key: "Ticket No   ", label: "Ticket No" },
    { key: "Linen Item No", label: "Line Item No" },
    { key: "Version", label: "Version" },
    { key: "Model Type", label: "Model Type" },
    { key: "Customer Complaint", label: "Customer Complaint" },
    { key: "Symp. Defe.", label: "Symp. Defe." },
    { key: "Defect Description", label: "Defect Description" },
    { key: "RF Observation", label: "RF Observation" },
    { key: "Lot No", label: "Lot No" }
  ];

  const handleSerialNumberChange = (e) => {
    const value = e.target.value;
    setSerialNumber(value);
    if (fetchStatus) setFetchStatus(null);
    if (value.length >= 10) fetchData(value);
  };

  const fetchData = async (srNo) => {
    setIsLoading(true);
    setFetchStatus(null);
    try {
      const response = await fetch(`http://localhost:5000/api/data?serialNumber=${srNo}`);
      if (response.ok) {
        const data = await response.json();
        setPcbData({
          "Repair Date": data["Repair Date"] || '',
          "Fan Sr No": data["Fan Sr No"] || '',
          "Ticket No   ": data["Ticket No   "] ? parseInt(data["Ticket No   "], 10) : '', // Ticket No. as integer
          "Linen Item No": data["Linen Item No"] || '',
          "Version": data["Version"] || '',
          "Model Type": data["Model Type"] || '',
          "Customer Complaint": data["Customer Complaint"] || '',
          "Symp. Defe.": data["Symp. Defe."] || '',
          "Defect Description": data["Defect Description"] || '',
          "RF Observation": data["RF Observation"] || '',
          "Lot No": data["Lot No"] || ''
        });
        setFetchStatus('success');
      } else {
        setFetchStatus('error');
        clearPcbFields();
      }
    } catch (error) {
      setFetchStatus('error');
      clearPcbFields();
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearPcbFields = () => {
    setPcbData({
      "Repair Date": '',
      "Fan Sr No": '',
      "Ticket No   ": '',
      "Linen Item No": '',
      "Version": '',
      "Model Type": '',
      "Customer Complaint": '',
      "Symp. Defe.": '',
      "Defect Description": '',
      "RF Observation": '',
      "Lot No": ''
    });
  };

  return (
    <div className="container-fluid py-4">
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Atomberg Electrolyte Management</h4>
            <span className="badge bg-light text-dark">PCB Tracking</span>
          </div>
        </div>
        <div className="card-body">
          <form className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label fw-bold">Serial Number</label>
              <div className="input-group">
                <input
                  className="form-control form-control-lg"
                  placeholder="Min 10 characters"
                  value={serialNumber}
                  onChange={handleSerialNumberChange}
                />
                {isLoading && (
                  <span className="input-group-text">
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </span>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'tagentry' ? 'active' : ''}`}
                onClick={() => setActiveTab('tagentry')}
              >
                Tag Entry
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'consumption' ? 'active' : ''}`}
                onClick={() => setActiveTab('consumption')}
              >
                Consumption
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'setting' ? 'active' : ''}`}
                onClick={() => setActiveTab('setting')}
              >
                Settings
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body">
          {activeTab === 'tagentry' && (
            <div className="row g-3">
              <div className="col-12 d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">PCB Tag Information</h5>
                {fetchStatus === 'success' && (
                  <div className="text-success">Data loaded successfully</div>
                )}
                {fetchStatus === 'error' && (
                  <div className="text-danger">Data not found for Serial Number: {serialNumber}</div>
                )}
              </div>
              <div className="col-12" style={{ minHeight: '400px' }}>
                {isLoading ? (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <div className="text-center">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2">Fetching data...</p>
                    </div>
                  </div>
                ) : (
                  <div className="row g-3">
                    {FIELD_LIST.map(({ key, label }) => (
                      <div key={key} className="col-md-6 col-lg-4">
                        <div className="form-floating">
                          <input
                            className="form-control"
                            value={pcbData[key] || ""}
                            disabled
                            id={key}
                            type={key === 'Ticket No   ' ? 'number' : 'text'}
                          />
                          <label htmlFor={key}>{label}</label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PCBFrontend;
