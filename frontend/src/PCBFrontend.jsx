import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function PCBFrontend() {
  const [activeTab, setActiveTab] = useState('tagentry');
  const [lotNumber, setLotNumber] = useState('');
  const [partCode, setPartCode] = useState('');

  // State variables for tag entry fields
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

  const handleFind = async (e) => {
    e.preventDefault();
    try {
      // Replace with your actual API endpoint
      const response = await fetch(`/api/data?lotNumber=${lotNumber}&partCode=${partCode}`);
      if (response.ok) {
        const data = await response.json();
        // Update the tag entry fields with fetched data
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
      } else {
        console.error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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
      {/* Header Card */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Atomberg Electrolyte Management</h4>
            <span className="badge bg-light text-dark">PCB Tracking</span>
          </div>
        </div>
        <div className="card-body">
          {/* Find PCB Section (now "Lot no.") */}
          <form autoComplete="on" className="row g-3 align-items-end" onSubmit={handleFind}>
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
              <input className="form-control form-control-lg" list="srNumbers" placeholder="Select Sr. No." />
              <datalist id="srNumbers">
                {suggestions.srNumbers.map(option => <option key={option} value={option} />)}
              </datalist>
            </div>
            <div className="col-auto">
              <button type="submit" className="btn btn-primary btn-lg">
                <i className="bi bi-search me-2"></i>Find PCB
              </button>
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

      {/* Tab Navigation */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'tagentry' ? 'active' : ''}`} 
                onClick={() => setActiveTab('tagentry')}
              >
                <i className="bi bi-tag me-1"></i>PCB Info
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

        {/* Tab Content */}
        <div className="card-body">
          {activeTab === 'tagentry' && (
            <div className="row g-3">
              <div className="col-12">
                <h5 className="card-title mb-4">PCB Tag Information</h5>
              </div>
              
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