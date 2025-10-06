import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function PCBFrontend() {
  const [activeTab, setActiveTab] = useState('tagentry');
  const [lotNumber, setLotNumber] = useState('');
  const [partCode, setPartCode] = useState('');

  // Handle input changes
  const handleLotNumberChange = (e) => {
    setLotNumber(e.target.value);
  };

  const handlePartCodeChange = (e) => {
    setPartCode(e.target.value);
  };

  // In production, suggestions would come from previously entered user data or a backend
  // Here, keep suggestion arrays empty (no option elements rendered)
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
    <div className="my-4 p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5>Atomberg</h5>
      </div>

      {/* Find PCB Section (now "Lot no.") */}
      <form className="row align-items-end mb-3">
        <div className="col-md-3">
          <label className="form-label">Lot no.</label>
          <input 
            className="form-control" 
            placeholder="" 
            value={lotNumber}
            onChange={handleLotNumberChange}
          />
        </div>
        <div className="col-md-2">
          <label className="form-label">Part Code</label>
          <input 
            className="form-control" 
            placeholder="" 
            value={partCode}
            onChange={handlePartCodeChange}
          />
        </div>
        <div className="col-md-2">
          <label className="form-label">Sr. No.</label>
          <input className="form-control" list="srNumbers" placeholder="" />
          <datalist id="srNumbers">
            {suggestions.srNumbers.map(option => <option key={option} value={option} />)}
          </datalist>
        </div>
          <div className="col-auto">
            <button type="button" className="btn btn-secondary mt-2">Find</button>
          </div>
          <div className="col-auto d-flex align-items-center transform-translate-y-50">
            <input type="checkbox" className="form-check-input" id="lockCheck" />
            <label htmlFor="lockCheck" className="form-check-label ms-1">Lock</label>
          </div>
      </form>

      {/* Tab Navigation */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'tagentry' ? 'active' : ''}`} onClick={() => setActiveTab('tagentry')}>
            Tag Entry
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'consumption' ? 'active' : ''}`} onClick={() => setActiveTab('consumption')}>
            Consumption
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'setting' ? 'active' : ''}`} onClick={() => setActiveTab('setting')}>
            Setting
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      {activeTab === 'tagentry' && (
        <form className="p-3 rounded bg-light mb-3">
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">Sr. No.</label>
              <input className="form-control" list="srNumbersInner" placeholder="" />
              <datalist id="srNumbersInner">
                {/* Render options only if array is populated */}
                {suggestions.srNumbers.map(option => <option key={option} value={option} />)}
              </datalist>
            </div>
            <div className="col-md-4">
              <label className="form-label">Date of Purchase</label>
              <input type="date" className="form-control" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Complaint No.</label>
              <input className="form-control" list="complaintNo" placeholder="" />
              <datalist id="complaintNo">
                {suggestions.complaintNo.map(option => <option key={option} value={option} />)}
              </datalist>
            </div>
            <div className="col-md-4">
              <label className="form-label">Branch</label>
              <input className="form-control" list="branch" placeholder="" />
              <datalist id="branch">
                {suggestions.branch.map(option => <option key={option} value={option} />)}
              </datalist>
            </div>
            <div className="col-md-4">
              <label className="form-label">BCCD Name</label>
              <input className="form-control" list="bccdName" placeholder="" />
              <datalist id="bccdName">
                {suggestions.bccdName.map(option => <option key={option} value={option} />)}
              </datalist>
            </div>
            <div className="col-md-4">
              <label className="form-label">Product Description</label>
              <input className="form-control" list="productDescription" placeholder="" />
              <datalist id="productDescription">
                {suggestions.productDescription.map(option => <option key={option} value={option} />)}
              </datalist>
            </div>
            <div className="col-md-4">
              <label className="form-label">Product Sr. No.</label>
              <input className="form-control" list="productSrNo" placeholder="" />
              <datalist id="productSrNo">
                {suggestions.productSrNo.map(option => <option key={option} value={option} />)}
              </datalist>
            </div>
            <div className="col-md-4">
              <label className="form-label">Nature of Defect</label>
              <input className="form-control" list="defect" placeholder="" />
              <datalist id="defect">
                {suggestions.defect.map(option => <option key={option} value={option} />)}
              </datalist>
            </div>
            <div className="col-md-4">
              <label className="form-label">Visiting Tech Name</label>
              <input className="form-control" list="techNames" placeholder="" />
              <datalist id="techNames">
                {suggestions.techNames.map(option => <option key={option} value={option} />)}
              </datalist>
            </div>
            <div className="col-md-4">
              <label className="form-label">Mfg. Month/Year</label>
              <input type="month" className="form-control" />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-12">
              <textarea className="form-control" rows="5" placeholder="Additional details..." />
            </div>
          </div>
        </form>
      )}

      {activeTab === 'consumption' && (
        <div className="p-5 text-center text-muted">No content yet.</div>
      )}
      {activeTab === 'setting' && (
        <div className="p-5 text-center text-muted">No content yet.</div>
      )}
    </div>
  );
}

export default PCBFrontend;