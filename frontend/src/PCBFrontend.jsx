import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function PCBFrontend() {
  const [activeTab, setActiveTab] = useState('tagentry');
  const [lotNumber, setLotNumber] = useState('');
  const [partCode, setPartCode] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fetchStatus, setFetchStatus] = useState(null);

  const [tagEntryData, setTagEntryData] = useState({
    partCode: '',
    version: '',
    model: '',
    ticket: '',
    wolin: '',
    barcode: '',
    asp: '',
    customerComplaint: '',
    symtom: '',
    defect: '',
    rfObservation: ''
  });

  const handleLotNumberChange = (e) => {
    setLotNumber(e.target.value);
  };

  const handlePartCodeChange = (e) => {
    setPartCode(e.target.value);
  };

  const handleSerialNumberChange = (e) => {
    const value = e.target.value;
    setSerialNumber(value);
    
    if (fetchStatus) {
      setFetchStatus(null);
    }
    
    if (value.length >= 10) {
      fetchData(lotNumber, partCode, value);
    }
  };

  const fetchData = async (lotNum, partCod, srNo) => {
    setIsLoading(true);
    setFetchStatus(null);
    try {
      const response = await fetch(`/api/data?lotNumber=${lotNum}&partCode=${partCod}&serialNumber=${srNo}`);
      if (response.ok) {
        const data = await response.json();
        setTagEntryData({
          partCode: data.partCode || '',
          version: data.version || '',
          model: data.model || '',
          ticket: data.ticket || '',
          wolin: data.wolin || '',
          barcode: data.barcode || '',
          asp: data.asp || '',
          customerComplaint: data.customerComplaint || '',
          symtom: data.symtom || '',
          defect: data.defect || '',
          rfObservation: data.rfObservation || ''
        });
        setFetchStatus('success');
      } else {
        setFetchStatus('error');
        setTagEntryData({
          partCode: '',
          version: '',
          model: '',
          ticket: '',
          wolin: '',
          barcode: '',
          asp: '',
          customerComplaint: '',
          symtom: '',
          defect: '',
          rfObservation: ''
        });
      }
    } catch (error) {
      setFetchStatus('error');
      setTagEntryData({
        partCode: '',
        version: '',
        model: '',
        ticket: '',
        wolin: '',
        barcode: '',
        asp: '',
        customerComplaint: '',
        symtom: '',
        defect: '',
        rfObservation: ''
      });
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = {
    lotNumbers: [],
    partCodes: [],
    srNumbers: [],
    branch: [],
    bccdName: [],
    productDescription: [],
    productSrNo: [],
    complaintNo: [],
    defect: [],
    techNames: [],
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
          <form autoComplete="on" className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label fw-bold">Lot Number</label>
              <input 
                className="form-control form-control-lg" 
                placeholder="Enter Lot Number" 
                name='lotNumber'
                value={lotNumber}
                onChange={handleLotNumberChange}
                autoComplete='on'
              />
            </div>
            <div className="col-md-2">
              <label className="form-label fw-bold">Part Code</label>
              <input 
                className="form-control form-control-lg" 
                placeholder="Part Code" 
                value={partCode}
                onChange={handlePartCodeChange}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label fw-bold">Serial Number</label>
              <div className="input-group">
                <input 
                  className="form-control form-control-lg" 
                  list="srNumbers" 
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
              <datalist id="srNumbers">
                {suggestions.srNumbers.map(option => <option key={option} value={option} />)}
              </datalist>
            </div>
            <div className="col-auto">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="lockCheck" />
                <label className="form-check-label fw-bold" htmlFor="lockCheck">Lock Data</label>
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
                <i className="bi bi-tag me-1"></i>Tag Entry
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'consumption' ? 'active' : ''}`} 
                onClick={() => setActiveTab('consumption')}
              >
                <i className="bi bi-graph-up me-1"></i>Consumption
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'setting' ? 'active' : ''}`} 
                onClick={() => setActiveTab('setting')}
              >
                <i className="bi bi-gear me-1"></i>Settings
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
                  <div className="text-success">
                    <i className="bi bi-check-circle-fill me-1"></i>
                    Data loaded successfully
                  </div>
                )}
                {fetchStatus === 'error' && (
                  <div className="text-danger">
                    <i className="bi bi-exclamation-circle-fill me-1"></i>
                    Data not found for Serial Number: {serialNumber}
                  </div>
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
                    <div className="col-md-6 col-lg-4">
                      <div className="form-floating">
                        <input 
                          className="form-control" 
                          value={tagEntryData.partCode} 
                          disabled 
                          id="partCode"
                        />
                        <label htmlFor="partCode">Part Code</label>
                      </div>
                    </div>
                    
                    <div className="col-md-6 col-lg-4">
                      <div className="form-floating">
                        <input 
                          className="form-control" 
                          value={tagEntryData.version} 
                          disabled 
                          id="version"
                        />
                        <label htmlFor="version">Version</label>
                      </div>
                    </div>
                    
                    <div className="col-md-6 col-lg-4">
                      <div className="form-floating">
                        <input 
                          className="form-control" 
                          value={tagEntryData.model} 
                          disabled 
                          id="model"
                        />
                        <label htmlFor="model">Model</label>
                      </div>
                    </div>
                    
                    <div className="col-md-6 col-lg-4">
                      <div className="form-floating">
                        <input 
                          className="form-control" 
                          value={tagEntryData.ticket} 
                          disabled 
                          id="ticket"
                        />
                        <label htmlFor="ticket">Ticket</label>
                      </div>
                    </div>
                    
                    <div className="col-md-6 col-lg-4">
                      <div className="form-floating">
                        <input 
                          className="form-control" 
                          value={tagEntryData.wolin} 
                          disabled 
                          id="wolin"
                        />
                        <label htmlFor="wolin">WOLIN</label>
                      </div>
                    </div>
                    
                    <div className="col-md-6 col-lg-4">
                      <div className="form-floating">
                        <input 
                          className="form-control" 
                          value={tagEntryData.barcode} 
                          disabled 
                          id="barcode"
                        />
                        <label htmlFor="barcode">Barcode</label>
                      </div>
                    </div>
                    
                    <div className="col-md-6 col-lg-4">
                      <div className="form-floating">
                        <input 
                          className="form-control" 
                          value={tagEntryData.asp} 
                          disabled 
                          id="asp"
                        />
                        <label htmlFor="asp">ASP</label>
                      </div>
                    </div>
                    
                    <div className="col-md-6 col-lg-4">
                      <div className="form-floating">
                        <input 
                          className="form-control" 
                          value={tagEntryData.customerComplaint} 
                          disabled 
                          id="customerComplaint"
                        />
                        <label htmlFor="customerComplaint">Customer Complaint</label>
                      </div>
                    </div>
                    
                    <div className="col-md-6 col-lg-4">
                      <div className="form-floating">
                        <input 
                          className="form-control" 
                          value={tagEntryData.symtom} 
                          disabled 
                          id="symtom"
                        />
                        <label htmlFor="symtom">Symtom</label>
                      </div>
                    </div>
                    
                    <div className="col-md-6 col-lg-4">
                      <div className="form-floating">
                        <input 
                          className="form-control" 
                          value={tagEntryData.defect} 
                          disabled 
                          id="defect"
                        />
                        <label htmlFor="defect">Defect</label>
                      </div>
                    </div>
                    
                    <div className="col-md-6 col-lg-4">
                      <div className="form-floating">
                        <input 
                          className="form-control" 
                          value={tagEntryData.rfObservation} 
                          disabled 
                          id="rfObservation"
                        />
                        <label htmlFor="rfObservation">RF Observation</label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'consumption' && (
            <div className="text-center py-5">
              <div className="alert alert-info">
                <h5 className="alert-heading">Consumption Data</h5>
                <p className="mb-0">Consumption tracking features coming soon.</p>
              </div>
            </div>
          )}
          
          {activeTab === 'setting' && (
            <div className="text-center py-5">
              <div className="alert alert-info">
                <h5 className="alert-heading">System Settings</h5>
                <p className="mb-0">Configuration options will be available here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PCBFrontend;