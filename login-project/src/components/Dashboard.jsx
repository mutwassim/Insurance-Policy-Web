import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from '../config/auth';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import "../styles/Dashboard.css";

// Helper function to format dates
const formatDate = (date) => {
  if (!date) return 'N/A';
  
  try {
    // For Firestore Timestamp
    if (date && typeof date.toDate === 'function') {
      return date.toDate().toLocaleDateString();
    }
    
    // For string dates
    if (typeof date === 'string') {
      const parsedDate = new Date(date);
      return parsedDate.toLocaleDateString();
    }
    
    // For Date objects
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    
    return 'N/A';
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'N/A';
  }
};

function Dashboard() {
  const navigate = useNavigate();
  const [customerForms, setCustomerForms] = useState([]);
  const [selectedForms, setSelectedForms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);

  const fetchCustomerForms = async () => {
    try {
      setIsLoading(true);
      const q = query(
        collection(db, "customerForms"),
        orderBy("createdAt", "desc"),
        limit(10)
      );
      
      const querySnapshot = await getDocs(q);
      const forms = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Map nested data to top level for table display
          firstName: data.customerInfo?.policyHolderFirstName,
          lastName: data.customerInfo?.policyHolderLastName,
          emailAddress: data.customerInfo?.emailAddress,
          phoneNumber: data.customerInfo?.phoneNumber,
          policyNumber: data.vehicleInfo?.policyNumber,
          vehicleRegistration: data.vehicleInfo?.vehicleRegistration,
          startDate: data.datesInfo?.startDate,
          endDate: data.datesInfo?.endDate,
          dateOfBirth: data.datesInfo?.dateOfBirth,
          createdAt: data.createdAt || null,
        };
      });
      
      setCustomerForms(forms);
    } catch (error) {
      console.error("Error fetching forms:", error);
      alert("Error fetching customer forms");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/login');
      } else {
        fetchCustomerForms();
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Error logging out");
    }
  };

  const handleNewForm = () => {
    navigate('/customer-form');
  };

  const handleViewDetails = (form) => {
    setSelectedForm(form);
    setShowModal(true);
  };

  const handleEdit = (formId) => {
    try {
      navigate(`/edit-form/${formId}`);
    } catch (error) {
      console.error("Error navigating to edit form:", error);
      alert("Error opening edit form");
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedForms.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedForms.length} selected form(s)?`)) {
      try {
        setIsLoading(true);
        for (const formId of selectedForms) {
          await deleteDoc(doc(db, "customerForms", formId));
        }
        setSelectedForms([]);
        await fetchCustomerForms(); // Refresh the list
        alert("Selected forms deleted successfully");
      } catch (error) {
        console.error("Error deleting forms:", error);
        alert("Error deleting forms");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleFormSelect = (formId) => {
    setSelectedForms(prev => {
      if (prev.includes(formId)) {
        return prev.filter(id => id !== formId);
      } else {
        return [...prev, formId];
      }
    });
  };

  const handleBulkSelect = (e) => {
    if (e.target.checked) {
      setSelectedForms(filteredForms.map(form => form.id));
    } else {
      setSelectedForms([]);
    }
  };

  const handleDeleteSingle = async (formId) => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      try {
        setIsLoading(true);
        await deleteDoc(doc(db, "customerForms", formId));
        await fetchCustomerForms(); // Refresh the list
        alert("Form deleted successfully");
      } catch (error) {
        console.error("Error deleting form:", error);
        alert("Error deleting form");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredForms = customerForms.filter(form => {
    const searchLower = searchTerm.toLowerCase();
    return (
      form.firstName?.toLowerCase().includes(searchLower) ||
      form.lastName?.toLowerCase().includes(searchLower) ||
      form.policyNumber?.toLowerCase().includes(searchLower) ||
      form.vehicleRegistration?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <i className="fas fa-shield-alt"></i>
          <h2>Insurance Admin</h2>
        </div>

        <nav className="sidebar-nav">
          <a href="#" className="nav-item active">
            <i className="fas fa-home"></i>
            <span>Dashboard</span>
          </a>
          <a href="#" className="nav-item" onClick={handleNewForm}>
            <i className="fas fa-plus"></i>
            <span>New Application</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="content-header">
          <div className="header-title">
            <h1>Applications Overview</h1>
            <p className="text-secondary">Manage insurance applications</p>
          </div>
          <button onClick={handleNewForm} className="btn btn-primary">
            <i className="fas fa-plus"></i>
            New Application
          </button>
        </header>

        {/* Search and Controls */}
        <div className="controls-container">
          <div className="search-container">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search by name, policy number, or vehicle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            {selectedForms.length > 0 && (
              <button 
                onClick={handleDeleteSelected}
                className="btn btn-danger"
              >
                <i className="fas fa-trash"></i>
                Delete Selected ({selectedForms.length})
              </button>
            )}
          </div>
        </div>

        {/* Applications Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={handleBulkSelect}
                    checked={selectedForms.length === filteredForms.length && filteredForms.length > 0}
                  />
                </th>
                <th>Name</th>
                <th>Policy Number</th>
                <th>Vehicle Reg</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="loading-cell">
                    <div className="loading-spinner">Loading...</div>
                  </td>
                </tr>
              ) : filteredForms.length > 0 ? (
                filteredForms.map((form) => (
                  <tr key={form.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedForms.includes(form.id)}
                        onChange={() => handleFormSelect(form.id)}
                      />
                    </td>
                    <td>{`${form.firstName || ''} ${form.lastName || ''}`}</td>
                    <td>{form.policyNumber || 'N/A'}</td>
                    <td>{form.vehicleRegistration || 'N/A'}</td>
                    <td>{formatDate(form.startDate)}</td>
                    <td>{formatDate(form.endDate)}</td>
                    <td>
                      <div className="action-buttons-row">
                        <button 
                          className="btn-icon-small view"
                          onClick={() => handleViewDetails(form)}
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          className="btn-icon-small edit"
                          onClick={() => handleEdit(form.id)}
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="btn-icon-small delete"
                          onClick={() => handleDeleteSingle(form.id)}
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <i className="fas fa-search"></i>
                      <h3>No Applications Found</h3>
                      <p>Try adjusting your search criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* View Details Modal */}
      {showModal && selectedForm && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Application Details</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              {/* Personal Information */}
              <div className="detail-group">
                <h3>Personal Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>First Name</label>
                    <p>{selectedForm.firstName || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Last Name</label>
                    <p>{selectedForm.lastName || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Email Address</label>
                    <p>{selectedForm.emailAddress || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Phone Number</label>
                    <p>{selectedForm.phoneNumber || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Date of Birth</label>
                    <p>{formatDate(selectedForm.dateOfBirth)}</p>
                  </div>
                  <div className="detail-item">
                    <label>Gender</label>
                    <p>{selectedForm.gender || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Address</label>
                    <p>{selectedForm.address || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>City</label>
                    <p>{selectedForm.city || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>State</label>
                    <p>{selectedForm.state || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Postal Code</label>
                    <p>{selectedForm.postalCode || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="detail-group">
                <h3>Vehicle Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Vehicle Make</label>
                    <p>{selectedForm.vehicleMake || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Vehicle Model</label>
                    <p>{selectedForm.vehicleModel || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Vehicle Year</label>
                    <p>{selectedForm.vehicleYear || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Registration Number</label>
                    <p>{selectedForm.vehicleRegistration || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>VIN Number</label>
                    <p>{selectedForm.vinNumber || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Vehicle Color</label>
                    <p>{selectedForm.vehicleColor || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Insurance Information */}
              <div className="detail-group">
                <h3>Insurance Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Policy Number</label>
                    <p>{selectedForm.policyNumber || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Policy Type</label>
                    <p>{selectedForm.policyType || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Coverage Amount</label>
                    <p>{selectedForm.coverageAmount || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Premium Amount</label>
                    <p>{selectedForm.premiumAmount || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Start Date</label>
                    <p>{formatDate(selectedForm.startDate)}</p>
                  </div>
                  <div className="detail-item">
                    <label>End Date</label>
                    <p>{formatDate(selectedForm.endDate)}</p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="detail-group">
                <h3>Additional Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Previous Insurance</label>
                    <p>{selectedForm.previousInsurance || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Claims History</label>
                    <p>{selectedForm.claimsHistory || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Notes</label>
                    <p>{selectedForm.notes || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Application Status */}
              <div className="detail-group">
                <h3>Application Status</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Created Date</label>
                    <p>{formatDate(selectedForm.createdAt)}</p>
                  </div>
                  <div className="detail-item">
                    <label>Last Updated</label>
                    <p>{formatDate(selectedForm.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  setShowModal(false);
                  handleEdit(selectedForm.id);
                }}
              >
                <i className="fas fa-edit"></i>
                Edit Application
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
