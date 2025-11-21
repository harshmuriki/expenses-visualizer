import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

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

  if (!mounted) return null;

  const modalContent = (
    <>
      {/* Backdrop */}
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
        {/* Modal */}
        <div
          className="glass-modal p-10 max-w-[500px] w-full max-h-[90vh] overflow-y-auto pointer-events-auto my-8"
          onClick={(e) => e.stopPropagation()}
        >
        <h3 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
          Add New Transaction
        </h3>

        {/* Transaction Name */}
        <div className="mb-5">
          <label className="glass-label">
            Transaction Name *
          </label>
          <input
            type="text"
            value={transactionName}
            onChange={(e) => setTransactionName(e.target.value)}
            placeholder="e.g., Grocery Shopping, Netflix Subscription"
            className="glass-input"
          />
        </div>

        {/* Cost */}
        <div className="mb-5">
          <label className="glass-label">
            Cost *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="0.00"
            className="glass-input text-xl font-semibold"
            style={{ color: theme.accent[500] }}
          />
        </div>

        {/* Category Selection */}
        <div className="mb-5">
          <label className="glass-label">
            Category *
          </label>
          <select
            value={isCreatingNewCategory ? "createNew" : category}
            onChange={handleCategoryChange}
            className="glass-select"
          >
            {parentOptions.map((parent) => (
              <option key={parent} value={parent}>
                {parent}
              </option>
            ))}
            <option value="createNew">
              + Create New Category
            </option>
          </select>
          {isCreatingNewCategory && (
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Enter new category name"
              className="glass-input mt-3"
            />
          )}
        </div>

        {/* Date */}
        <div className="mb-5">
          <label className="glass-label">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="glass-input"
          />
        </div>

        {/* Location (Optional) */}
        <div className="mb-5">
          <label className="glass-label">
            Location (Optional)
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Whole Foods, Amazon"
            className="glass-input"
          />
        </div>

        {/* Bank/Source (Optional) */}
        <div className="mb-6">
          <label className="glass-label">
            Bank/Source (Optional)
          </label>
          <input
            type="text"
            value={bank}
            onChange={(e) => setBank(e.target.value)}
            placeholder="e.g., Chase, Amex"
            className="glass-input"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            className="glass-button-primary flex-1 text-base"
          >
            Add Transaction
          </button>
          <button
            onClick={onClose}
            className="glass-button-secondary flex-1 text-base"
          >
            Cancel
          </button>
        </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
};

export default AddTransactionModal;
