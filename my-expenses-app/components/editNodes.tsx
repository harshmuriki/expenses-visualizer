import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { InputModalProps } from "@/app/types/types";
import { useTheme } from "@/lib/theme-context";

// Import Material Web Components
if (typeof window !== 'undefined') {
  import('@material/web/button/filled-button.js');
  import('@material/web/button/outlined-button.js');
  import('@material/web/button/text-button.js');
  import('@material/web/textfield/filled-text-field.js');
  import('@material/web/textfield/outlined-text-field.js');
}

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
          className="p-10 max-w-[500px] w-full pointer-events-auto my-8 rounded-3xl"
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-high)',
            border: '1px solid var(--md-sys-color-outline-variant)',
            boxShadow: 'var(--md-sys-elevation-level5)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
        <h3 className="md-typescale-headline-large font-bold text-center mb-4" style={{ color: 'var(--md-sys-color-primary)' }}>
          {clickedNode.isleaf ? "Update Transaction" : "Update Category"}
        </h3>
        <h2 className="md-typescale-body-large text-center mb-6" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
          {clickedNode.isleaf ? "Transaction" : "Category"}:{" "}
        <span className="font-semibold" style={{ color: 'var(--md-sys-color-on-surface)' }}>
          {clickedNode.name}
        </span>
      </h2>

      {/* Raw Transaction Text Display - only for transactions */}
      {clickedNode.isleaf && clickedNode.raw_str && (
        <div style={{ marginBottom: "20px" }}>
          <label
            className="md-typescale-label-large"
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: 'var(--md-sys-color-on-surface-variant)',
            }}
          >
            Original Transaction Text:
          </label>
          <div
            className="md-typescale-body-small"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              border: '1px solid var(--md-sys-color-outline-variant)',
              backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
              color: 'var(--md-sys-color-on-surface)',
              boxSizing: "border-box",
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
        <label className="md-typescale-label-large block mb-2 font-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
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
          className="w-full px-4 py-3 rounded-xl md-typescale-body-large"
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container)',
            border: '1px solid var(--md-sys-color-outline)',
            color: 'var(--md-sys-color-on-surface)',
            outline: 'none'
          }}
        />
      </div>

      {/* Category Selection - only for transactions */}
      {clickedNode.isleaf && (
        <div className="mb-5">
          <label className="md-typescale-label-large block mb-2 font-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
            New Category:
          </label>
          <select
            value={isCreatingNewParent ? "createNew" : newParentName}
            onChange={handleParentChange}
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
              Create New Category
            </option>
          </select>
          {isCreatingNewParent && (
            <input
              type="text"
              value={newParentName}
              onChange={(e) => setNewParentName(e.target.value)}
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
      )}

      {/* Price Edit Field */}
      {clickedNode.isleaf && (
        <div className="mb-6">
          <label className="md-typescale-label-large block mb-2 font-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
            New Price:
          </label>
          <input
            type="number"
            step="0.01"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            placeholder="Enter new price"
            className="w-full px-4 py-3 rounded-xl md-typescale-headline-small font-semibold"
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container)',
              border: '1px solid var(--md-sys-color-outline)',
              color: 'var(--md-sys-color-tertiary)',
              outline: 'none'
            }}
          />
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <md-filled-button onClick={handleSubmit} className="flex-1">
          Update
        </md-filled-button>
        {clickedNode.isleaf && (
          <md-outlined-button
            onClick={onDelete}
            className="flex-1"
            style={{ '--md-outlined-button-label-text-color': 'var(--md-sys-color-error)' } as any}
          >
            Delete
          </md-outlined-button>
        )}
        <md-text-button onClick={onClose} className="flex-1">
          Cancel
        </md-text-button>
      </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
};

export default InputModal;
