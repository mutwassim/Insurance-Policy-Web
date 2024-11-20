import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import FormInput from "./FormInput";
import { db, auth } from '../config/auth';  // Import auth
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { addDays, format, parse, differenceInDays } from 'date-fns';
import "../styles/CustomerForm.css";
import { CircularProgress } from '@mui/material'; // Or use your preferred loader

function CustomerForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [saveTemplate, setSaveTemplate] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const navigate = useNavigate();

  // Check if user is authenticated
  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        // Redirect to login if not authenticated
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // UK phone number regex
  const phoneRegExp = /^(?:(?:\+44)|(?:0))(?:(?:(?:\d{2})\)?[\s-]?\d{4}[\s-]?\d{4})|(?:(?:\d{3})\)?[\s-]?\d{3}[\s-]?\d{4})|(?:(?:\d{4})\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3})))$/;

  // Add this new array for vehicle value options
  const vehicleValueRanges = [
    { value: "1500-5000", label: "£1,500 - £5,000" },
    { value: "5001-10000", label: "£5,001 - £10,000" },
    { value: "10001-15000", label: "£10,001 - £15,000" },
    { value: "15001-20000", label: "£15,001 - £20,000" },
    { value: "20001-25000", label: "£20,001 - £25,000" },
    { value: "25001-30000", label: "£25,001 - £30,000" },
  ];

  // Add duration options
  const durationOptions = Array.from({ length: 30 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} ${i + 1 === 1 ? 'Day' : 'Days'}`
  }));

  // Add handler for date calculations
  const handleDateChange = (field, value) => {
    formik.setFieldValue(field, value);
    
    if (field === 'startDate') {
      if (formik.values.duration) {
        const startDate = parse(value, 'yyyy-MM-dd', new Date());
        const newEndDate = format(addDays(startDate, formik.values.duration), 'yyyy-MM-dd');
        formik.setFieldValue('endDate', newEndDate);
      }
    } else if (field === 'endDate') {
      const startDate = parse(formik.values.startDate, 'yyyy-MM-dd', new Date());
      const endDate = parse(value, 'yyyy-MM-dd', new Date());
      const duration = differenceInDays(endDate, startDate);
      if (duration > 0 && duration <= 30) {
        formik.setFieldValue('duration', duration);
      }
    }
  };

  // Add this near your other constant definitions
  const adminFeeOptions = [
    { value: "4.80", label: "£4.80" },
    { value: "9.60", label: "£9.60" }
  ];

  // Add this function to handle premium calculations
  const calculateTotals = (underwriting, ipt, adminFee) => {
    const underwritingValue = parseFloat(underwriting) || 0;
    const iptValue = parseFloat(ipt) || 0;
    const adminFeeValue = parseFloat(adminFee) || 0;
    
    return underwritingValue + iptValue + adminFeeValue;
  };

  const formik = useFormik({
    initialValues: {
      policyHolderFirstName: "",
      policyHolderLastName: "",
      emailAddress: "",
      phoneNumber: "",
      reasonForIssue: "",
      addressLine1: "",
      addressLine2: "",
      addressLine3: "",
      nameOnEmail: "",
      vehicleRegistration: "",
      vehicleValue: "",
      vehicleMake: "",
      vehicleModel: "",
      policyNumber: "",
      dateOfBirth: '',
      dateIssued: '',
      duration: '',
      startDate: '',
      startTime: '',
      endDate: '',
      underwritingPremium: "",
      insurancePremiumTax: "",
      tempCoverAdminFee: "",
      premiumInclIpt: "0.00",
      youHaveBeenCharged: "0.00",
      totalCharged: "0.00",
      compulsoryExcess: "1250.00",
      voluntaryExcess: "1300.00",
      totalExcess: "2550.00"
    },
    validationSchema: Yup.object({
      policyHolderFirstName: Yup.string().required("First name is required"),
      policyHolderLastName: Yup.string().required("Last name is required"),
      emailAddress: Yup.string().email("Invalid email").required("Email is required"),
      phoneNumber: Yup.string().required("Phone number is required"),
      reasonForIssue: Yup.string()
        .min(10, "Must be at least 10 characters")
        .required("Reason for issue is required"),
      addressLine1: Yup.string()
        .required("Address Line 1 is required"),
      nameOnEmail: Yup.string()
        .required("Name on email is required"),
      vehicleRegistration: Yup.string()
        .matches(/^[A-Z0-9]{1,7}$/, "Please enter a valid vehicle registration")
        .required("Vehicle registration is required"),
      vehicleValue: Yup.string()
        .required("Vehicle value is required"),
      vehicleMake: Yup.string()
        .required("Vehicle make is required"),
      vehicleModel: Yup.string()
        .required("Vehicle model is required"),
      policyNumber: Yup.string()
        .matches(/^TCV-MOT-[A-Z0-9]+$/, "Invalid policy number format")
        .required("Policy number is required"),
      dateOfBirth: Yup.date()
        .max(new Date(), "Date of birth cannot be in the future")
        .required("Date of birth is required")
        .test("age", "Must be at least 18 years old", function(value) {
          if (!value) return false;
          const cutoff = new Date();
          cutoff.setFullYear(cutoff.getFullYear() - 18);
          return value <= cutoff;
        }),
      dateIssued: Yup.date()
        .required("Date issued is required"),
      duration: Yup.number()
        .min(1, "Minimum duration is 1 day")
        .max(30, "Maximum duration is 30 days")
        .required("Duration is required"),
      startDate: Yup.date()
        .min(new Date(), "Start date must be today or later")
        .required("Start date is required"),
      startTime: Yup.string()
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format")
        .required("Start time is required"),
      endDate: Yup.date()
        .min(Yup.ref('startDate'), "End date cannot be before start date")
        .test("duration", "Duration cannot exceed 30 days", function(value) {
          const { startDate } = this.parent;
          if (startDate && value) {
            const start = new Date(startDate);
            const end = new Date(value);
            const duration = differenceInDays(end, start);
            return duration <= 30;
          }
          return true;
        })
        .required("End date is required"),
      underwritingPremium: Yup.number()
        .min(0, "Amount cannot be negative")
        .required("Underwriting premium is required"),
      insurancePremiumTax: Yup.number()
        .min(0, "Amount cannot be negative")
        .required("Insurance Premium Tax is required"),
      tempCoverAdminFee: Yup.string()
        .required("Admin fee is required"),
      compulsoryExcess: Yup.number()
        .min(0, "Amount cannot be negative")
        .required("Compulsory excess is required"),
      voluntaryExcess: Yup.number()
        .min(0, "Amount cannot be negative")
        .required("Voluntary excess is required"),
    }),
    onSubmit: async (values) => {
      if (!auth.currentUser) {
        alert("Please login to save the form");
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      try {
        const customerFormData = {
          userId: auth.currentUser.uid,
          createdAt: new Date(),
          customerInfo: {
            policyHolderFirstName: values.policyHolderFirstName,
            policyHolderLastName: values.policyHolderLastName,
            emailAddress: values.emailAddress,
            phoneNumber: values.phoneNumber,
            reasonForIssue: values.reasonForIssue,
            addressLine1: values.addressLine1,
            addressLine2: values.addressLine2,
            addressLine3: values.addressLine3,
            nameOnEmail: values.nameOnEmail,
          },
          vehicleInfo: {
            vehicleRegistration: values.vehicleRegistration,
            vehicleValue: values.vehicleValue,
            vehicleMake: values.vehicleMake,
            vehicleModel: values.vehicleModel,
            policyNumber: values.policyNumber,
          },
          datesInfo: {
            startDate: values.startDate,
            endDate: values.endDate,
            duration: values.duration,
            dateIssued: values.dateIssued,
            startTime: values.startTime,
          },
          charges: {
            underwritingPremium: values.underwritingPremium,
            insurancePremiumTax: values.insurancePremiumTax,
            tempCoverAdminFee: values.tempCoverAdminFee,
            premiumInclIpt: values.premiumInclIpt,
            youHaveBeenCharged: values.youHaveBeenCharged,
            totalCharged: values.totalCharged,
          },
          excess: {
            compulsoryExcess: values.compulsoryExcess,
            voluntaryExcess: values.voluntaryExcess,
            totalExcess: values.totalExcess,
          }
        };

        // Save to Firestore
        const docRef = await addDoc(collection(db, 'customerForms'), customerFormData);
        console.log("Form saved with ID:", docRef.id);
        setSubmitSuccess(true);
        alert("Form saved successfully!");

      } catch (error) {
        console.error("Error saving form:", error);
        setSubmitError(error.message);
        alert("Error saving form: " + error.message);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Add handler for charge calculations
  const handleChargeChange = (field, value) => {
    formik.setFieldValue(field, value);
    
    const underwriting = field === 'underwritingPremium' ? value : formik.values.underwritingPremium;
    const ipt = field === 'insurancePremiumTax' ? value : formik.values.insurancePremiumTax;
    const adminFee = field === 'tempCoverAdminFee' ? value : formik.values.tempCoverAdminFee;
    
    const total = calculateTotals(underwriting, ipt, adminFee);
    
    formik.setFieldValue('premiumInclIpt', total.toFixed(2));
    formik.setFieldValue('youHaveBeenCharged', total.toFixed(2));
    formik.setFieldValue('totalCharged', total.toFixed(2));
  };

  // Add handler for excess calculations
  const handleExcessChange = (field, value) => {
    formik.setFieldValue(field, value);
    
    const compulsory = field === 'compulsoryExcess' ? value : formik.values.compulsoryExcess;
    const voluntary = field === 'voluntaryExcess' ? value : formik.values.voluntaryExcess;
    
    const total = (parseFloat(compulsory) || 0) + (parseFloat(voluntary) || 0);
    formik.setFieldValue('totalExcess', total.toFixed(2));
  };

  const customerFields = [
    {
      name: "policyHolderFirstName",
      label: "First Name",
      placeholder: "Enter first name",
      type: "text"
    },
    {
      name: "policyHolderLastName",
      label: "Last Name",
      placeholder: "Enter last name",
      type: "text"
    },
    {
      name: "emailAddress",
      label: "Email Address",
      placeholder: "Enter email address",
      type: "email"
    },
    {
      name: "phoneNumber",
      label: "Phone Number",
      placeholder: "Enter phone number",
      type: "tel"
    },
    {
      name: "reasonForIssue",
      label: "Reason for Issue",
      placeholder: "Enter reason for issue",
      type: "text"
    },
    {
      name: "addressLine1",
      label: "Address Line 1",
      placeholder: "Enter address line 1",
      type: "text"
    },
    {
      name: "addressLine2",
      label: "Address Line 2",
      placeholder: "Enter address line 2",
      type: "text"
    },
    {
      name: "addressLine3",
      label: "Address Line 3",
      placeholder: "Enter address line 3",
      type: "text"
    },
    {
      name: "nameOnEmail",
      label: "Name on Email",
      placeholder: "Enter name on email",
      type: "text"
    }
  ];

  const vehicleFields = [
    {
      name: "vehicleRegistration",
      label: "Vehicle Registration",
      type: "text"
    },
    {
      name: "vehicleValue",
      label: "Vehicle Value",
      type: "select",
      options: vehicleValueRanges
    },
    {
      name: "vehicleMake",
      label: "Vehicle Make",
      type: "text"
    },
    {
      name: "vehicleModel",
      label: "Vehicle Model",
      type: "text"
    },
    {
      name: "policyNumber",
      label: "Policy Number",
      type: "text",
      placeholder: "Enter number"
    }
  ];

  const dateFields = [
    {
      name: "dateOfBirth",
      label: "Date of Birth",
      placeholder: "Select date of birth",
      type: "date"
    },
    {
      name: "dateIssued",
      label: "Date Issued",
      placeholder: "Enter date issued",
      type: "date"
    },
    {
      name: "duration",
      label: "Duration",
      placeholder: "Select duration",
      type: "select",
      options: durationOptions
    },
    {
      name: "startDate",
      label: "Start Date",
      placeholder: "Select start date",
      type: "date"
    },
    {
      name: "startTime",
      label: "Start Time",
      placeholder: "Enter start time",
      type: "time"
    },
    {
      name: "endDate",
      label: "End Date",
      placeholder: "Enter end date",
      type: "date"
    }
  ];

  // Add charges fields configuration
  const chargeFields = [
    {
      name: "underwritingPremium",
      label: "Underwriting Premium",
      placeholder: "Enter premium",
      type: "number",
      step: "0.01",
      prefix: "£"
    },
    {
      name: "insurancePremiumTax",
      label: "Insurance Premium Tax",
      placeholder: "Enter tax amount",
      type: "number",
      step: "0.01",
      prefix: "£"
    },
    {
      name: "tempCoverAdminFee",
      label: "Tempcover Admin Fee",
      placeholder: "Select admin fee",
      type: "select",
      options: adminFeeOptions
    },
    {
      name: "premiumInclIpt",
      label: "Premium (inc. IPT)",
      placeholder: "Enter premium (inc. IPT)",
      type: "number",
      step: "0.01",
      disabled: true,
      prefix: "£"
    },
    {
      name: "youHaveBeenCharged",
      label: "You Have Been Charged",
      placeholder: "Enter you have been charged",
      type: "number",
      step: "0.01",
      disabled: true,
      prefix: "£"
    },
    {
      name: "totalCharged",
      label: "Total Charged",
      placeholder: "Enter total charged",
      type: "number",
      step: "0.01",
      disabled: true,
      prefix: "£"
    }
  ];

  // Add endorsement fields configuration
  const endorsementFields = [
    {
      name: "compulsoryExcess",
      label: "Compulsory Excess",
      placeholder: "Enter compulsory excess",
      type: "number",
      step: "0.01",
      prefix: "£"
    },
    {
      name: "voluntaryExcess",
      label: "Voluntary Excess",
      placeholder: "Enter voluntary excess",
      type: "number",
      step: "0.01",
      prefix: "£"
    },
    {
      name: "totalExcess",
      label: "Total Excess Amount",
      placeholder: "Enter total excess",
      type: "number",
      step: "0.01",
      disabled: true,
      prefix: "£"
    }
  ];

  // Add this new function to check if all fields are valid
  const validateAllFields = () => {
    const errors = {};
    
    // Customer Information validation
    if (!formik.values.policyHolderFirstName) errors.policyHolderFirstName = 'First name is required';
    if (!formik.values.policyHolderLastName) errors.policyHolderLastName = 'Last name is required';
    if (!formik.values.emailAddress) {
      errors.emailAddress = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formik.values.emailAddress)) {
      errors.emailAddress = 'Invalid email address';
    }
    if (!formik.values.phoneNumber) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!phoneRegExp.test(formik.values.phoneNumber)) {
      errors.phoneNumber = 'Invalid UK phone number';
    }
    if (!formik.values.reasonForIssue) errors.reasonForIssue = 'Reason is required';
    if (!formik.values.addressLine1) errors.addressLine1 = 'Address is required';
    if (!formik.values.nameOnEmail) errors.nameOnEmail = 'Name on email is required';

    // Vehicle Information validation
    if (!formik.values.vehicleRegistration) {
      errors.vehicleRegistration = 'Registration is required';
    } else if (!/^[A-Z0-9]{1,7}$/.test(formik.values.vehicleRegistration)) {
      errors.vehicleRegistration = 'Invalid registration format';
    }
    if (!formik.values.vehicleValue) errors.vehicleValue = 'Vehicle value is required';
    if (!formik.values.vehicleMake) errors.vehicleMake = 'Make is required';
    if (!formik.values.vehicleModel) errors.vehicleModel = 'Model is required';
    if (!formik.values.policyNumber) {
      errors.policyNumber = 'Policy number is required';
    } else if (!/^TCV-MOT-[A-Z0-9]+$/.test(formik.values.policyNumber)) {
      errors.policyNumber = 'Invalid policy number format';
    }

    // Dates Information validation
    const currentDate = new Date();
    const startDate = new Date(formik.values.startDate);
    const endDate = new Date(formik.values.endDate);

    if (!formik.values.startDate) {
      errors.startDate = 'Start date is required';
    } else if (startDate < currentDate) {
      errors.startDate = 'Start date cannot be in the past';
    }

    if (!formik.values.endDate) {
      errors.endDate = 'End date is required';
    } else if (endDate <= startDate) {
      errors.endDate = 'End date must be after start date';
    }

    if (!formik.values.duration) {
      errors.duration = 'Duration is required';
    } else if (formik.values.duration < 1 || formik.values.duration > 30) {
      errors.duration = 'Duration must be between 1 and 30 days';
    }

    return errors;
  };

  // Add this function to handle scrolling to invalid fields
  const scrollToFirstError = (errors) => {
    const firstErrorField = Object.keys(errors)[0];
    const element = document.querySelector(`[name="${firstErrorField}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus();
      // Add a temporary highlight effect
      element.classList.add('highlight-error');
      setTimeout(() => {
        element.classList.remove('highlight-error');
      }, 2000);
    }
  };

  // Add these styles to your CSS file
  const styles = `
    .highlight-error {
      animation: shake 0.5s ease-in-out;
      border-color: #dc2626 !important;
      background-color: #fef2f2 !important;
      box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.2);
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }

    .section-status {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }

    .status-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .status-complete {
      background-color: #22c55e;
    }

    .status-incomplete {
      background-color: #dc2626;
    }

    .processing-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .processing-content {
      background-color: white;
      padding: 30px;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .button-loading-state {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  `;

  // Update the handleGenerateFiles function
  const handleGenerateFiles = async () => {
    // First validate all fields
    const errors = await formik.validateForm();
    
    if (Object.keys(errors).length > 0) {
      scrollToFirstError(errors);
      const errorMessages = Object.entries(errors)
        .map(([field, message]) => `${field.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${message}`)
        .join('\n');
      alert(`Please fix the following errors:\n${errorMessages}`);
      return;
    }

    setIsProcessing(true);
    setProcessingStep('Initializing...');

    try {
      // Check authentication
      if (!auth.currentUser) {
        throw new Error("Please login to continue");
      }

      // Save to database if checkbox is checked
      if (saveTemplate) {
        setProcessingStep('Saving template...');
        const docRef = await addDoc(collection(db, 'customerForms'), {
          userId: auth.currentUser.uid,
          createdAt: new Date(),
          customerInfo: {
            policyHolderFirstName: formik.values.policyHolderFirstName,
            policyHolderLastName: formik.values.policyHolderLastName,
            // ... rest of your customer info fields
          },
          // ... rest of your form sections
        });
        console.log("Template saved with ID:", docRef.id);
      }

      // Prepare data for next page
      setProcessingStep('Preparing to generate files...');
      
      // Navigate to email template page
      navigate('/generate-email', { 
        state: { 
          customerName: `${formik.values.policyHolderFirstName} ${formik.values.policyHolderLastName}`,
          policyNumber: formik.values.policyNumber,
          emailAddress: formik.values.emailAddress,
          formData: formik.values
        } 
      });

    } catch (error) {
      console.error("Error:", error);
      setSubmitError(error.message);
      alert(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  // Add this function to check field completion status
  const getCompletionStatus = () => {
    const errors = formik.errors;
    const touched = formik.touched;
    const values = formik.values;

    const sections = {
      customerInfo: ['policyHolderFirstName', 'policyHolderLastName', 'emailAddress', 'phoneNumber', 'reasonForIssue', 'addressLine1', 'nameOnEmail'],
      vehicleInfo: ['vehicleRegistration', 'vehicleValue', 'vehicleMake', 'vehicleModel', 'policyNumber'],
      datesInfo: ['dateOfBirth', 'startDate', 'endDate', 'duration', 'dateIssued', 'startTime'],
      charges: ['underwritingPremium', 'insurancePremiumTax', 'tempCoverAdminFee'],
      excess: ['compulsoryExcess', 'voluntaryExcess', 'totalExcess']
    };

    const incompleteFields = {};

    Object.entries(sections).forEach(([section, fields]) => {
      const incomplete = fields.filter(field => {
        return !values[field] || errors[field];
      });
      if (incomplete.length > 0) {
        incompleteFields[section] = incomplete;
      }
    });

    return incompleteFields;
  };

  return (
    <div className="form-container">
      {/* Add the styles */}
      <style>{styles}</style>

      <form onSubmit={formik.handleSubmit} noValidate>
        {/* Customer Information Section */}
        <section className="form-section">
          <div className="section-header">
            <h2 className="section-title">Customer Information</h2>
            <div className="section-status">
              <div className={`status-indicator ${
                Object.keys(getCompletionStatus()).includes('customerInfo') 
                  ? 'status-incomplete' 
                  : 'status-complete'
              }`} />
              <span>{
                Object.keys(getCompletionStatus()).includes('customerInfo') 
                  ? 'Incomplete' 
                  : 'Complete'
              }</span>
            </div>
          </div>
          {customerFields.map((field) => (
            <FormInput
              key={field.name}
              {...field}
              value={formik.values[field.name]}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched[field.name] && formik.errors[field.name]}
              isValid={formik.touched[field.name] && !formik.errors[field.name]}
            />
          ))}
        </section>

        <section className="form-section">
          <h2 className="section-title">Vehicle Information</h2>
          {vehicleFields.map((field) => (
            <FormInput
              key={field.name}
              {...field}
              value={formik.values[field.name]}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched[field.name] && formik.errors[field.name]}
              isValid={formik.touched[field.name] && !formik.errors[field.name]}
            />
          ))}
        </section>

        <section className="form-section">
          <h2 className="section-title">Dates Information</h2>
          <div>
            <FormInput
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              placeholder="Select date of birth"
              value={formik.values.dateOfBirth}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
              max={new Date().toISOString().split('T')[0]} // Prevents future dates
            />

            <FormInput
              label="Start Date"
              name="startDate"
              type="date"
              placeholder="Select start date"
              value={formik.values.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              onBlur={formik.handleBlur}
              error={formik.touched.startDate && formik.errors.startDate}
            />

            <FormInput
              label="End Date"
              name="endDate"
              type="date"
              placeholder="Select end date"
              value={formik.values.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              onBlur={formik.handleBlur}
              error={formik.touched.endDate && formik.errors.endDate}
            />

            <FormInput
              label="Duration (Days)"
              name="duration"
              type="number"
              placeholder="Enter duration"
              value={formik.values.duration}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.duration && formik.errors.duration}
              disabled={true}
            />

            <FormInput
              label="Issue Date"
              name="dateIssued"
              type="date"
              placeholder="Select issue date"
              value={formik.values.dateIssued}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.dateIssued && formik.errors.dateIssued}
            />

            <FormInput
              label="Time of Issue"
              name="startTime"
              type="time"
              placeholder="Select time"
              value={formik.values.startTime}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.startTime && formik.errors.startTime}
            />
          </div>
        </section>

        <section className="form-section">
          <h2 className="section-title">Charges Information</h2>
          {chargeFields.map((field) => (
            <FormInput
              key={field.name}
              {...field}
              value={formik.values[field.name]}
              onChange={(e) => handleChargeChange(field.name, e.target.value)}
              onBlur={formik.handleBlur}
              error={formik.touched[field.name] && formik.errors[field.name]}
              isValid={formik.touched[field.name] && !formik.errors[field.name]}
            />
          ))}
        </section>

        <section className="form-section">
          <h2 className="section-title">Endorsements Applicable</h2>
          {endorsementFields.map((field) => (
            <FormInput
              key={field.name}
              {...field}
              value={formik.values[field.name]}
              onChange={(e) => handleExcessChange(field.name, e.target.value)}
              onBlur={formik.handleBlur}
              error={formik.touched[field.name] && formik.errors[field.name]}
              isValid={formik.touched[field.name] && !formik.errors[field.name]}
            />
          ))}
        </section>

        <div className="form-actions">
          <div className="save-template-checkbox">
            <input
              type="checkbox"
              id="saveTemplate"
              checked={saveTemplate}
              onChange={(e) => setSaveTemplate(e.target.checked)}
            />
            <label htmlFor="saveTemplate">Save as Template</label>
          </div>

          <button
            type="button"
            className="generate-files-button"
            onClick={handleGenerateFiles}
            disabled={isProcessing || Object.keys(formik.errors).length > 0}
          >
            {isProcessing ? (
              <div className="button-loading-state">
                <CircularProgress size={20} color="inherit" />
                <span>{processingStep}</span>
              </div>
            ) : (
              'Generate Files'
            )}
          </button>
        </div>

        {isProcessing && (
          <div className="processing-overlay">
            <div className="processing-content">
              <CircularProgress size={40} />
              <p>{processingStep}</p>
            </div>
          </div>
        )}

        {Object.keys(getCompletionStatus()).length > 0 && (
          <div className="incomplete-fields-warning">
            <p>The following sections need attention:</p>
            <ul>
              {Object.entries(getCompletionStatus()).map(([section, fields]) => (
                <li key={section}>
                  {section}: {fields.join(', ')}
                </li>
              ))}
            </ul>
          </div>
        )}

        {submitError && (
          <div className="error-message">
            {submitError}
          </div>
        )}

        {submitSuccess && (
          <div className="success-message">
            Template saved successfully!
          </div>
        )}
      </form>
    </div>
  );
}

export default CustomerForm;
