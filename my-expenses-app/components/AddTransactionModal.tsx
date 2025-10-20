import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/lib/theme-context";

interface AddTransactionModalProps {
  onSubmit: (
    transactionName: string,
    cost: number,
    category: string,
    date?: string,
    location?: string,
    bank?: string
  ) => void;
  onClose: () => void;
  parentOptions: string[];
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  onSubmit,
  onClose,
  parentOptions,
}) => {
  const { theme } = useTheme();
  const [transactionName, setTransactionName] = useState("");
  const [cost, setCost] = useState("");
  const [category, setCategory] = useState(parentOptions[0] || "");
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0] // Today's date in YYYY-MM-DD format
  );
  const [location, setLocation] = useState("");
  const [bank, setBank] = useState("Manual Entry");

  const handleSubmit = useCallback(() => {
    if (!transactionName.trim()) {
      alert("Please enter a transaction name.");
      return;
    }

    const parsedCost = parseFloat(cost);
    if (isNaN(parsedCost) || parsedCost <= 0) {
      alert("Please enter a valid positive number for the cost.");
      return;
    }

    if (!category.trim()) {
      alert("Please select or enter a category.");
      return;
    }

    onSubmit(
      transactionName,
      parsedCost,
      category,
      date || undefined,
      location || undefined,
      bank || undefined
    );
    setTimeout(onClose, 0);
  }, [transactionName, cost, category, date, location, bank, onSubmit, onClose]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "createNew") {
      setIsCreatingNewCategory(true);
      setCategory("");
    } else {
      setIsCreatingNewCategory(false);
      setCategory(value);
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
  }, [handleSubmit, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 9998,
        }}
        onClick={onClose}
      />

      {/* Modal */}
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
          maxHeight: "90vh",
          overflowY: "auto",
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
          Add New Transaction
        </h3>

        {/* Transaction Name */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: theme.text.secondary,
            }}
          >
            Transaction Name *
          </label>
          <input
            type="text"
            value={transactionName}
            onChange={(e) => setTransactionName(e.target.value)}
            placeholder="e.g., Grocery Shopping, Netflix Subscription"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: `1px solid ${theme.border.primary}`,
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

        {/* Cost */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: theme.text.secondary,
            }}
          >
            Cost *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="0.00"
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

        {/* Category Selection */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: theme.text.secondary,
            }}
          >
            Category *
          </label>
          <select
            value={isCreatingNewCategory ? "createNew" : category}
            onChange={handleCategoryChange}
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
              + Create New Category
            </option>
          </select>
          {isCreatingNewCategory && (
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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

        {/* Date */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: theme.text.secondary,
            }}
          >
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: `1px solid ${theme.border.primary}`,
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

        {/* Location (Optional) */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: theme.text.secondary,
            }}
          >
            Location (Optional)
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Whole Foods, Amazon"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: `1px solid ${theme.border.primary}`,
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

        {/* Bank/Source (Optional) */}
        <div style={{ marginBottom: "25px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: theme.text.secondary,
            }}
          >
            Bank/Source (Optional)
          </label>
          <input
            type="text"
            value={bank}
            onChange={(e) => setBank(e.target.value)}
            placeholder="e.g., Chase, Amex"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: `1px solid ${theme.border.primary}`,
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

        {/* Buttons */}
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
            Add Transaction
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
    </>
  );
};

export default AddTransactionModal;
