import React, { useState, useEffect } from "react";
import { InputModalProps } from "@/app/types/types";

const InputModal: React.FC<InputModalProps> = ({
  clickedNode,
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
      setTimeout(onClose, 0);
    } else {
      alert("Please enter a valid number for the price.");
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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSubmit();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

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
        backgroundColor: "#1e293b", // slate-800
        padding: "40px",
        borderRadius: "20px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
        border: "1px solid #475569", // slate-600
        color: "#f1f5f9", // slate-100
        maxWidth: "500px",
        width: "100%",
        boxSizing: "border-box",
        fontFamily: "Arial, sans-serif",
        zIndex: 9999,
      }}
    >
      <h3
        style={{
          margin: "0 0 20px",
          fontSize: "1.8rem",
          textAlign: "center",
          background: "linear-gradient(to right, #91C4C3, #B4DEBD)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          fontWeight: "bold",
        }}
      >
        Update Transaction
      </h3>
      <h2
        style={{
          margin: "10px 0 20px",
          fontSize: "1.1rem",
          textAlign: "center",
          color: "#cbd5e1", // slate-300
        }}
      >
        Transaction:{" "}
        <span style={{ fontWeight: "600", color: "#80A1BA" }}>
          {clickedNode.name}
        </span>
      </h2>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "600",
            color: "#cbd5e1",
          }}
        >
          New Category:
        </label>
        <select
          value={isCreatingNewParent ? "createNew" : newParentName}
          onChange={handleParentChange}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #475569",
            backgroundColor: "#0f172a",
            color: "#f1f5f9",
            boxSizing: "border-box",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          {parentOptions.map((parent) => (
            <option
              key={parent}
              value={parent}
              style={{ backgroundColor: "#1e293b" }}
            >
              {parent}
            </option>
          ))}
          <option value="createNew" style={{ backgroundColor: "#1e293b" }}>
            Create New Category
          </option>
        </select>
        {isCreatingNewParent && (
          <input
            type="text"
            value={newParentName}
            onChange={(e) => setNewParentName(e.target.value)}
            placeholder="Enter new category name"
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "12px",
              borderRadius: "10px",
              border: "1px solid #91C4C3",
              backgroundColor: "#0f172a",
              color: "#f1f5f9",
              boxSizing: "border-box",
              fontSize: "1rem",
            }}
          />
        )}
      </div>
      <div style={{ marginBottom: "25px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "600",
            color: "#cbd5e1",
          }}
        >
          New Price:
        </label>
        <input
          type="text"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #475569",
            backgroundColor: "#0f172a",
            color: "#B4DEBD",
            boxSizing: "border-box",
            fontSize: "1.1rem",
            fontWeight: "600",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          gap: "12px",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={handleSubmit}
          style={{
            flex: 1,
            background: "linear-gradient(to right, #80A1BA, #91C4C3)",
            color: "white",
            border: "none",
            padding: "14px 24px",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "600",
            boxShadow: "0 4px 12px rgba(128, 161, 186, 0.3)",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Save Changes
        </button>
        <button
          onClick={onClose}
          style={{
            flex: 1,
            background: "linear-gradient(to right, #ef4444, #dc2626)",
            color: "white",
            border: "none",
            padding: "14px 24px",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "600",
            boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default InputModal;
