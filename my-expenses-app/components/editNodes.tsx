import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { InputModalProps } from "@/app/types/types";
import { useTheme } from "@/lib/theme-context";

const InputModal: React.FC<InputModalProps> = ({
  clickedNode,
  initialParentName,
  initialPrice,
  onSubmit,
  onClose,
  onDelete,
  parentOptions,
}) => {
  const { theme } = useTheme();
  const [newParentName, setNewParentName] = useState(initialParentName);
  const [isCreatingNewParent, setIsCreatingNewParent] = useState(false);
  const [newPrice, setNewPrice] = useState(initialPrice);
  const [newTransactionName, setNewTransactionName] = useState(
    clickedNode.name
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleSubmit = useCallback(() => {
    const parsedPrice = parseFloat(newPrice);
    if (!isNaN(parsedPrice)) {
      onSubmit(newParentName, parsedPrice, newTransactionName);
      setTimeout(onClose, 0);
    } else {
      alert("Please enter a valid number for the price.");
    }
  }, [newPrice, newParentName, newTransactionName, onSubmit, onClose]);

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

  if (!mounted) return null;

  const modalContent = (
    <>
      {/* Glass Backdrop */}
      <div
        className="glass-backdrop fixed inset-0"
        style={{ zIndex: 9998 }}
        onClick={onClose}
      />

      {/* Scrollable Modal Container */}
      <div
        className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4 pointer-events-none"
        style={{ zIndex: 9999 }}
      >
        {/* Glass Modal */}
        <div
          className="glass-modal p-10 max-w-[500px] w-full pointer-events-auto my-8"
          onClick={(e) => e.stopPropagation()}
        >
        <h3 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
          {clickedNode.isleaf ? "Update Transaction" : "Update Category"}
        </h3>
        <h2 className="text-lg text-center mb-6 text-text-secondary">
          {clickedNode.isleaf ? "Transaction" : "Category"}:{" "}
        <span style={{ fontWeight: "600", color: theme.primary[500] }}>
          {clickedNode.name}
        </span>
      </h2>

      {/* Raw Transaction Text Display - only for transactions */}
      {clickedNode.isleaf && clickedNode.raw_str && (
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: theme.text.secondary,
            }}
          >
            Original Transaction Text:
          </label>
          <div
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "20px",
              border: `1px solid ${theme.border.primary}`,
              backgroundColor: theme.background.primary,
              color: theme.text.primary,
              boxSizing: "border-box",
              fontSize: "0.9rem",
              fontFamily: "monospace",
              maxHeight: "100px",
              overflowY: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {clickedNode.raw_str}
          </div>
        </div>
      )}

      {/* Name Edit Field */}
      <div className="mb-5">
        <label className="glass-label">
          {clickedNode.isleaf ? "Transaction Name:" : "Category Name:"}
        </label>
        <input
          type="text"
          value={newTransactionName}
          onChange={(e) => setNewTransactionName(e.target.value)}
          placeholder={
            clickedNode.isleaf
              ? "Enter transaction name"
              : "Enter category name"
          }
          className="glass-input"
        />
      </div>

      {/* Category Selection - only for transactions */}
      {clickedNode.isleaf && (
        <div className="mb-5">
          <label className="glass-label">
            New Category:
          </label>
          <select
            value={isCreatingNewParent ? "createNew" : newParentName}
            onChange={handleParentChange}
            className="glass-select"
          >
            {parentOptions.map((parent) => (
              <option key={parent} value={parent}>
                {parent}
              </option>
            ))}
            <option value="createNew">
              Create New Category
            </option>
          </select>
          {isCreatingNewParent && (
            <input
              type="text"
              value={newParentName}
              onChange={(e) => setNewParentName(e.target.value)}
              placeholder="Enter new category name"
              className="glass-input mt-3"
            />
          )}
        </div>
      )}

      {/* Price Edit Field */}
      {clickedNode.isleaf && (
        <div className="mb-6">
          <label className="glass-label">
            New Price:
          </label>
          <input
            type="number"
            step="0.01"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            placeholder="Enter new price"
            className="glass-input text-xl font-semibold"
            style={{ color: theme.accent[500] }}
          />
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <button onClick={handleSubmit} className="glass-button-primary flex-1">
          Update
        </button>
        {clickedNode.isleaf && (
          <button onClick={onDelete} className="glass-button-secondary flex-1">
            Delete
          </button>
        )}
        <button onClick={onClose} className="glass-button flex-1">
          Cancel
        </button>
      </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
};

export default InputModal;
