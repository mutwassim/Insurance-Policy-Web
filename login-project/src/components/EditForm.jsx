import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from '../config/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import FormInput from "./FormInput";
import { CircularProgress } from '@mui/material';
import { addDays, format, parse, differenceInDays } from 'date-fns';
import "../styles/CustomerForm.css";
import { 
  customerFields, 
  vehicleFields, 
  dateFields, 
  chargeFields, 
  endorsementFields,
  vehicleValueRanges,
  adminFeeOptions,
  durationOptions
} from "./EditComponents";

function EditForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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
      dateOfBirth: "",
      dateIssued: "",
      duration: "",
      startDate: "",
      startTime: "",
      endDate: "",
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
      // Same validation schema as CustomerForm
      policyHolderFirstName: Yup.string().required("First name is required"),
      policyHolderLastName: Yup.string().required("Last name is required"),
      // ... add all other validations
    }),
    onSubmit: async (values) => {
      setIsProcessing(true);
      setProcessingStep('Saving changes...');
      setSubmitError(null);

      try {
        const docRef = doc(db, 'customerForms', id);
        await updateDoc(docRef, {
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
            dateOfBirth: values.dateOfBirth,
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
          },
          updatedAt: new Date()
        });

        setSubmitSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } catch (error) {
        console.error("Error updating form:", error);
        setSubmitError(error.message);
      } finally {
        setIsProcessing(false);
        setProcessingStep('');
      }
    },
  });

  // Fetch existing data
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const docRef = doc(db, 'customerForms', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          formik.setValues({
            policyHolderFirstName: data.customerInfo?.policyHolderFirstName || '',
            policyHolderLastName: data.customerInfo?.policyHolderLastName || '',
            emailAddress: data.customerInfo?.emailAddress || '',
            phoneNumber: data.customerInfo?.phoneNumber || '',
            reasonForIssue: data.customerInfo?.reasonForIssue || '',
            addressLine1: data.customerInfo?.addressLine1 || '',
            addressLine2: data.customerInfo?.addressLine2 || '',
            addressLine3: data.customerInfo?.addressLine3 || '',
            nameOnEmail: data.customerInfo?.nameOnEmail || '',
            vehicleRegistration: data.vehicleInfo?.vehicleRegistration || '',
            vehicleValue: data.vehicleInfo?.vehicleValue || '',
            vehicleMake: data.vehicleInfo?.vehicleMake || '',
            vehicleModel: data.vehicleInfo?.vehicleModel || '',
            policyNumber: data.vehicleInfo?.policyNumber || '',
            dateOfBirth: data.datesInfo?.dateOfBirth || '',
            dateIssued: data.datesInfo?.dateIssued || '',
            duration: data.datesInfo?.duration || '',
            startDate: data.datesInfo?.startDate || '',
            startTime: data.datesInfo?.startTime || '',
            endDate: data.datesInfo?.endDate || '',
            underwritingPremium: data.charges?.underwritingPremium || '',
            insurancePremiumTax: data.charges?.insurancePremiumTax || '',
            tempCoverAdminFee: data.charges?.tempCoverAdminFee || '',
            premiumInclIpt: data.charges?.premiumInclIpt || '0.00',
            youHaveBeenCharged: data.charges?.youHaveBeenCharged || '0.00',
            totalCharged: data.charges?.totalCharged || '0.00',
            compulsoryExcess: data.excess?.compulsoryExcess || '1250.00',
            voluntaryExcess: data.excess?.voluntaryExcess || '1300.00',
            totalExcess: data.excess?.totalExcess || '2550.00'
          });
        } else {
          setSubmitError("Form not found");
          navigate('/dashboard');
        }
      } catch (error) {
        console.error("Error fetching form:", error);
        setSubmitError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormData();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <CircularProgress />
        <p>Loading form data...</p>
      </div>
    );
  }

  return (
    <div className="form-container">
      <h1>Edit Customer Form</h1>
      <form onSubmit={formik.handleSubmit}>
        <section className="form-section">
          <h2 className="section-title">Customer Information</h2>
          {customerFields.map((field) => (
            <FormInput
              key={field.name}
              {...field}
              value={formik.values[field.name]}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched[field.name] && formik.errors[field.name]}
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
            />
          ))}
        </section>

        <section className="form-section">
          <h2 className="section-title">Dates Information</h2>
          {dateFields.map((field) => (
            <FormInput
              key={field.name}
              {...field}
              value={formik.values[field.name]}
              onChange={(e) => handleDateChange(field.name, e.target.value)}
              onBlur={formik.handleBlur}
              error={formik.touched[field.name] && formik.errors[field.name]}
            />
          ))}
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
            />
          ))}
        </section>

        <section className="form-section">
          <h2 className="section-title">Endorsements</h2>
          {endorsementFields.map((field) => (
            <FormInput
              key={field.name}
              {...field}
              value={formik.values[field.name]}
              onChange={(e) => handleExcessChange(field.name, e.target.value)}
              onBlur={formik.handleBlur}
              error={formik.touched[field.name] && formik.errors[field.name]}
            />
          ))}
        </section>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <div className="button-loading-state">
                <CircularProgress size={20} color="inherit" />
                <span>{processingStep}</span>
              </div>
            ) : (
              'Save Changes'
            )}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/dashboard')}
            disabled={isProcessing}
          >
            Cancel
          </button>
        </div>

        {submitError && (
          <div className="error-message">
            {submitError}
          </div>
        )}

        {submitSuccess && (
          <div className="success-message">
            Changes saved successfully!
          </div>
        )}
      </form>
    </div>
  );
}

export default EditForm;