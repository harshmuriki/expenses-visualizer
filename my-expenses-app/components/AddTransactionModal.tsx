import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "@/lib/theme-context";

// Import Material Web Components
if (typeof window !== 'undefined') {
  import('@material/web/button/filled-button.js');
  import('@material/web/button/outlined-button.js');
  import('@material/web/textfield/filled-text-field.js');
}

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
      {/* Material 3 Scrim/Backdrop */}
      <div
        className="fixed inset-0"
        style={{
          zIndex: 9998,
          backgroundColor: 'rgba(0, 0, 0, 0.6)'
        }}
        onClick={onClose}
      />

      {/* Scrollable Modal Container */}
      <div
        className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4 pointer-events-none"
        style={{ zIndex: 9999 }}
      >
        {/* Material 3 Modal */}
        <div
          className="p-10 max-w-[500px] w-full max-h-[90vh] overflow-y-auto pointer-events-auto my-8 rounded-3xl"
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-high)',
            border: '1px solid var(--md-sys-color-outline-variant)',
            boxShadow: 'var(--md-sys-elevation-level5)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
        <h3 className="md-typescale-headline-large font-bold text-center mb-6" style={{ color: 'var(--md-sys-color-primary)' }}>
          Add New Transaction
        </h3>

        {/* Transaction Name */}
        <div className="mb-5">
          <label className="md-typescale-label-large block mb-2 font-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
            Transaction Name *
          </label>
          <input
            type="text"
            value={transactionName}
            onChange={(e) => setTransactionName(e.target.value)}
            placeholder="e.g., Grocery Shopping, Netflix Subscription"
            className="w-full px-4 py-3 rounded-xl md-typescale-body-large"
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container)',
              border: '1px solid var(--md-sys-color-outline)',
              color: 'var(--md-sys-color-on-surface)',
              outline: 'none'
            }}
          />
        </div>

        {/* Cost */}
        <div className="mb-5">
          <label className="md-typescale-label-large block mb-2 font-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
            Cost *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-3 rounded-xl md-typescale-headline-small font-semibold"
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container)',
              border: '1px solid var(--md-sys-color-outline)',
              color: 'var(--md-sys-color-tertiary)',
              outline: 'none'
            }}
          />
        </div>

        {/* Category Selection */}
        <div className="mb-5">
          <label className="md-typescale-label-large block mb-2 font-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
            Category *
          </label>
          <select
            value={isCreatingNewCategory ? "createNew" : category}
            onChange={handleCategoryChange}
            className="w-full px-4 py-3 rounded-xl md-typescale-body-large"
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container)',
              border: '1px solid var(--md-sys-color-outline)',
              color: 'var(--md-sys-color-on-surface)',
              outline: 'none'
            }}
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
              className="w-full px-4 py-3 rounded-xl mt-3 md-typescale-body-large"
              style={{
                backgroundColor: 'var(--md-sys-color-surface-container)',
                border: '1px solid var(--md-sys-color-outline)',
                color: 'var(--md-sys-color-on-surface)',
                outline: 'none'
              }}
            />
          )}
        </div>

        {/* Date */}
        <div className="mb-5">
          <label className="md-typescale-label-large block mb-2 font-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl md-typescale-body-large"
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container)',
              border: '1px solid var(--md-sys-color-outline)',
              color: 'var(--md-sys-color-on-surface)',
              outline: 'none'
            }}
          />
        </div>

        {/* Location (Optional) */}
        <div className="mb-5">
          <label className="md-typescale-label-large block mb-2 font-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
            Location (Optional)
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Whole Foods, Amazon"
            className="w-full px-4 py-3 rounded-xl md-typescale-body-large"
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container)',
              border: '1px solid var(--md-sys-color-outline)',
              color: 'var(--md-sys-color-on-surface)',
              outline: 'none'
            }}
          />
        </div>

        {/* Bank/Source (Optional) */}
        <div className="mb-6">
          <label className="md-typescale-label-large block mb-2 font-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
            Bank/Source (Optional)
          </label>
          <input
            type="text"
            value={bank}
            onChange={(e) => setBank(e.target.value)}
            placeholder="e.g., Chase, Amex"
            className="w-full px-4 py-3 rounded-xl md-typescale-body-large"
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container)',
              border: '1px solid var(--md-sys-color-outline)',
              color: 'var(--md-sys-color-on-surface)',
              outline: 'none'
            }}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <md-filled-button
            onClick={handleSubmit}
            className="flex-1"
          >
            Add Transaction
          </md-filled-button>
          <md-outlined-button
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </md-outlined-button>
        </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
};

export default AddTransactionModal;
