import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLogin from "./components/AdminLogin";
import Dashboard from "./components/Dashboard";
import CustomerForm from "./components/CustomerForm";
import DocumentAccess from "./components/DocumentAccess";
import EditForm from './components/EditForm';
import GenerateEmail from './components/GenerateEmail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customer-form" element={<CustomerForm />} />
        <Route path="/documents" element={<DocumentAccess />} />
        <Route path="/edit-form/:id" element={<EditForm />} />
        <Route path="/generate-email" element={<GenerateEmail />} />
      </Routes>
    </Router>
  );
}

export default App;
