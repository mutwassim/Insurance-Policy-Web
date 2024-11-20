import React, { useState } from "react";

function DocumentAccess() {
  const [surname, setSurname] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [startDate, setStartDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement validation and logic to fetch policy documents
    console.log({ surname, birthDate, startDate });
  };

  return (
    <div>
      <h1>Access Your Policy Documents</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Surname"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          required
        />
        <input
          type="date"
          placeholder="Birth Date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
        />
        <input
          type="date"
          placeholder="Policy Start Date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default DocumentAccess;
