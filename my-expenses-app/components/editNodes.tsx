import React, { useState, useEffect } from "react";
import { Node } from "./MyCustomNode";

interface InputModalProps {
  node: Node;
  initialParentName: string;
  initialPrice: string;
  onSubmit: (newParentName: string, newPrice: number) => void;
  onClose: () => void;
  parentOptions: string[]; // Add this prop to pass parent options
}

const InputModal: React.FC<InputModalProps> = ({
  node,
  initialParentName,
  initialPrice,
  onSubmit,
  onClose,
  parentOptions,
}) => {
  const [newParentName, setNewParentName] = useState(initialParentName);
  const [isCreatingNewParent, setIsCreatingNewParent] = useState(false);
  const [newPrice, setNewPrice] = useState(initialPrice);

  const handleSubmit = () => {
    const parsedPrice = parseFloat(newPrice);
    if (!isNaN(parsedPrice)) {
      onSubmit(newParentName, parsedPrice);
      onClose();
    } else {
      alert("Please enter a valid number for the price.");
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const handleParentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "createNew") {
      setIsCreatingNewParent(true);
      setNewParentName("");
    } else {
      setIsCreatingNewParent(false);
      setNewParentName(value);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [newParentName, newPrice]);

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "#f9f9f9", // Light background for modern feel
        padding: "40px", // Ample padding for better spacing
        borderRadius: "15px", // Softer rounded corners
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)", // Slightly darker shadow for depth
        border: "1px solid #ccc", // Subtle border for structure
        color: "#222", // Darker text for better contrast
        maxWidth: "450px", // Adjusted for a slightly wider modal
        width: "100%", // Ensure it stays responsive
        boxSizing: "border-box", // Include padding and border in element's total width and height
        fontFamily: "Arial, sans-serif", // Clean, readable font
      }}
    >
      <h3
        style={{
          margin: "0 0 20px", // Add space below heading
          fontSize: "1.5rem", // Slightly larger heading
          textAlign: "center", // Center the heading
          color: "#333", // Subtle text color for the heading
        }}
      >
        Update Node Information
      </h3>
      <h2
        style={{
          margin: "10px 0 20px", // Additional spacing for balance
          fontSize: "1.2rem", // Slightly smaller to match context
          textAlign: "center", // Keep consistent alignment
          color: "#555", // Softer color for less prominence
        }}
      >
        Transaction:{" "}
        <span style={{ fontWeight: "normal", color: "#222" }}>{node.name}</span>
      </h2>{" "}
      <div style={{ marginBottom: "15px" }}>
        <label
          style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}
        >
          New Parent Name:
        </label>
        <select
          value={isCreatingNewParent ? "createNew" : newParentName}
          onChange={handleParentChange}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ddd",
            boxSizing: "border-box",
          }}
        >
          {parentOptions.map((parent) => (
            <option key={parent} value={parent}>
              {parent}
            </option>
          ))}
          <option value="createNew">Create New Parent</option>
        </select>
        {isCreatingNewParent && (
          <input
            type="text"
            value={newParentName}
            onChange={(e) => setNewParentName(e.target.value)}
            placeholder="Enter new parent name"
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "10px",
              borderRadius: "5px",
              border: "1px solid #ddd",
              boxSizing: "border-box",
            }}
          />
        )}
      </div>
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}
        >
          New Price:
        </label>
        <input
          type="text"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ddd",
            boxSizing: "border-box",
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button
          onClick={handleSubmit}
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Submit
        </button>
        <button
          onClick={onClose}
          style={{
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default InputModal;
