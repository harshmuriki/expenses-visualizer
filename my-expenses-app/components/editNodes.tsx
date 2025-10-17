import React, { useState, useEffect, useCallback } from "react";
import { InputModalProps } from "@/app/types/types";
import { useTheme } from "@/lib/theme-context";

const InputModal: React.FC<InputModalProps> = ({
  clickedNode,
  initialParentName,
  initialPrice,
  onSubmit,
  onClose,
  parentOptions,
}) => {
  const { theme } = useTheme();
  const [newParentName, setNewParentName] = useState(initialParentName);
  const [isCreatingNewParent, setIsCreatingNewParent] = useState(false);
  const [newPrice, setNewPrice] = useState(initialPrice);

  const handleSubmit = useCallback(() => {
    const parsedPrice = parseFloat(newPrice);
    if (!isNaN(parsedPrice)) {
      onSubmit(newParentName, parsedPrice);
      setTimeout(onClose, 0);
    } else {
      alert("Please enter a valid number for the price.");
    }
  }, [newPrice, newParentName, onSubmit, onClose]);

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
  }, [newParentName, newPrice, handleSubmit, onClose]);

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: theme.background.secondary,
        padding: "40px",
        borderRadius: "20px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
        border: `1px solid ${theme.border.primary}`,
        color: theme.text.primary,
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
          background: `linear-gradient(to right, ${theme.secondary[500]}, ${theme.accent[500]})`,
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
          color: theme.text.secondary,
        }}
      >
        Transaction:{" "}
        <span style={{ fontWeight: "600", color: theme.primary[500] }}>
          {clickedNode.name}
        </span>
      </h2>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "600",
            color: theme.text.secondary,
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
            border: `1px solid ${theme.border.primary}`,
            backgroundColor: theme.background.primary,
            color: theme.text.primary,
            boxSizing: "border-box",
            fontSize: "1rem",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = theme.primary[500];
            e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.primary[500]}20`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = theme.border.primary;
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {parentOptions.map((parent) => (
            <option
              key={parent}
              value={parent}
              style={{
                backgroundColor: theme.background.secondary,
                color: theme.text.primary,
              }}
            >
              {parent}
            </option>
          ))}
          <option
            value="createNew"
            style={{
              backgroundColor: theme.background.secondary,
              color: theme.text.primary,
            }}
          >
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
              border: `1px solid ${theme.secondary[500]}`,
              backgroundColor: theme.background.primary,
              color: theme.text.primary,
              boxSizing: "border-box",
              fontSize: "1rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = theme.primary[500];
              e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.primary[500]}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme.secondary[500];
              e.currentTarget.style.boxShadow = "none";
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = theme.primary[500];
              e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.primary[500]}20`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = theme.secondary[500];
              e.currentTarget.style.boxShadow = "none";
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
            color: theme.text.secondary,
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
            border: `1px solid ${theme.border.primary}`,
            backgroundColor: theme.background.primary,
            color: theme.accent[500],
            boxSizing: "border-box",
            fontSize: "1.1rem",
            fontWeight: "600",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = theme.primary[500];
            e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.primary[500]}20`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = theme.border.primary;
            e.currentTarget.style.boxShadow = "none";
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = theme.primary[500];
            e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.primary[500]}20`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = theme.border.primary;
            e.currentTarget.style.boxShadow = "none";
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
            background: `linear-gradient(to right, ${theme.primary[500]}, ${theme.secondary[500]})`,
            color: "white",
            border: "none",
            padding: "14px 24px",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "600",
            boxShadow: `0 4px 12px ${theme.primary[500]}30`,
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
            background: `linear-gradient(to right, ${theme.semantic.error}, #dc2626)`,
            color: "white",
            border: "none",
            padding: "14px 24px",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "600",
            boxShadow: `0 4px 12px ${theme.semantic.error}30`,
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
