// Add these configurations at the top of the file
export const vehicleValueRanges = [
  { value: "1500-5000", label: "£1,500 - £5,000" },
  { value: "5001-10000", label: "£5,001 - £10,000" },
  { value: "10001-15000", label: "£10,001 - £15,000" },
  { value: "15001-20000", label: "£15,001 - £20,000" },
  { value: "20001-25000", label: "£20,001 - £25,000" },
  { value: "25001-30000", label: "£25,001 - £30,000" },
];

export const adminFeeOptions = [
  { value: "4.80", label: "£4.80" },
  { value: "9.60", label: "£9.60" }
];

export const durationOptions = Array.from({ length: 30 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1} ${i + 1 === 1 ? 'Day' : 'Days'}`
}));

// Then export the field configurations
export const customerFields = [
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

export const vehicleFields = [
  {
    name: "vehicleRegistration",
    label: "Vehicle Registration",
    placeholder: "Enter registration",
    type: "text"
  },
  {
    name: "vehicleValue",
    label: "Vehicle Value",
    placeholder: "Select vehicle value",
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

export const dateFields = [
  {
    name: "dateOfBirth",
    label: "Date of Birth",
    placeholder: "Select date of birth",
    type: "date"
  },
  {
    name: "dateIssued",
    label: "Date Issued",
    placeholder: "Select issue date",
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

export const chargeFields = [
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
    placeholder: "Enter amount charged",
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

export const endorsementFields = [
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