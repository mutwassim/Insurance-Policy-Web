import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/GenerateEmail.css';

function GenerateEmail() {
  const location = useLocation();
  const { customerName, policyNumber, emailAddress, formData } = location.state || {};
  const [recipientEmail, setRecipientEmail] = useState(emailAddress || '');
  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setIsSending(true);

    try {
      // Add your email sending logic here
      console.log("Sending email to:", recipientEmail);
      console.log("Form data:", formData);
      
      // Placeholder for email sending
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Email sent successfully!');
    } catch (error) {
      console.error("Error sending email:", error);
      alert('Failed to send email: ' + error.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="email-template-container">
      <h1>Send Insurance Documents</h1>
      
      <div className="customer-details">
        <p><strong>Customer:</strong> {customerName}</p>
        <p><strong>Policy Number:</strong> {policyNumber}</p>
      </div>

      <form onSubmit={handleSendEmail}>
        <div className="form-group">
          <label htmlFor="recipientEmail">Recipient Email</label>
          <input
            type="email"
            id="recipientEmail"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            required
          />
        </div>

        <button 
          type="submit" 
          className="send-button"
          disabled={isSending}
        >
          {isSending ? 'Sending...' : 'Send Documents'}
        </button>
      </form>
    </div>
  );
}

export default GenerateEmail;