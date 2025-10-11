import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const initialFormState = {
  lotNumber: "",
  partCode: "",
  srNumber: "",
  dateOfPurchase: "",
  complaintNo: "",
  branch: "",
  bccdName: "",
  productDescription: "",
  productSrNo: "",
  defect: "",
  techName: "",
  mfgMonthYear: "",
  additionalDetails: "",
};

function PCBFrontend() {
  const [activeTab, setActiveTab] = useState('tagentry');
  const [form, setForm] = useState(() => {
    // Load saved data from localStorage, or use initial state
    const saved = localStorage.getItem("pcbFormData");
    return saved ? JSON.parse(saved) : initialFormState;
  });
  const [alert, setAlert] = useState("");

  // Store form data any time it changes
  useEffect(() => {
    localStorage.setItem("pcbFormData", JSON.stringify(form));
  }, [form]);

  // Handle changes in input fields
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle find action (call backend API)
  const handleFind = async (e) => {
    e.preventDefault();
    setAlert("");
    try {
      const res = await fetch(`http://localhost:5000/api/lot/${form.lotNumber}`);
      if (!res.ok) throw new Error("Entry not found");
      const data = await res.json();
      setForm(prev => ({
        ...prev,
        ...data
      }));
      setAlert("");
    } catch (err) {
      setAlert("Entry not found");
    }
  };

  return (
    <div className="my-4 p-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5>Atomberg</h5>
      </div>

      {/* Find PCB Section (Lot no., Part Code, Sr. No.) */}
      <form className="row align-items-end mb-3 g-3" onSubmit={handleFind}>
        <div className="col-md-3">
          <label className="form-label">Lot no.</label>
          <input
            name="lotNumber"
            className="form-control"
            value={form.lotNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-2">
          <label className="form-label">Part Code</label>
          <input
            name="partCode"
            className="form-control"
            value={form.partCode}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-2">
          <label className="form-label">Sr. No.</label>
          <input
            name="srNumber"
            className="form-control"
            value={form.srNumber}
            onChange={handleChange}
          />
        </div>
        <div className="col-auto">
          <button type="submit" className="btn btn-secondary mt-2">Find</button>
        </div>
        <div className="col-auto d-flex align-items-center">
          <input type="checkbox" className="form-check-input" id="lockCheck" />
          <label htmlFor="lockCheck" className="form-check-label ms-1">Lock</label>
        </div>
      </form>
      {alert && <div className="alert alert-danger">{alert}</div>}

      {/* Tab Navigation */}
      <ul className="nav nav-tabs mb-3">
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
            Setting
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      {activeTab === 'tagentry' && (
        <form className="p-3 rounded bg-light mb-3">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Sr. No.</label>
              <input
                name="srNumber"
                className="form-control"
                value={form.srNumber}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Date of Purchase</label>
              <input
                name="dateOfPurchase"
                type="date"
                className="form-control"
                value={form.dateOfPurchase}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Complaint No.</label>
              <input
                name="complaintNo"
                className="form-control"
                value={form.complaintNo}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Branch</label>
              <input
                name="branch"
                className="form-control"
                value={form.branch}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">BCCD Name</label>
              <input
                name="bccdName"
                className="form-control"
                value={form.bccdName}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Product Description</label>
              <input
                name="productDescription"
                className="form-control"
                value={form.productDescription}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Product Sr. No.</label>
              <input
                name="productSrNo"
                className="form-control"
                value={form.productSrNo}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Nature of Defect</label>
              <input
                name="defect"
                className="form-control"
                value={form.defect}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Visiting Tech Name</label>
              <input
                name="techName"
                className="form-control"
                value={form.techName}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Mfg. Month/Year</label>
              <input
                name="mfgMonthYear"
                type="month"
                className="form-control"
                value={form.mfgMonthYear}
                onChange={handleChange}
              />
            </div>
            <div className="col-12">
              <textarea
                name="additionalDetails"
                className="form-control"
                rows="3"
                placeholder="Additional details..."
                value={form.additionalDetails}
                onChange={handleChange}
              />
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
