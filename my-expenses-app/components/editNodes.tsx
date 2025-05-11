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
  const [showVisualPreview, setShowVisualPreview] = useState(false);
  const [selectedParentName, setSelectedParentName] =
    useState(initialParentName);

  // For ECharts compatibility, ensure we handle parent names properly
  const cleanParentName = (name: string) => {
    // If this is already a name without [index], just return it
    if (!name.includes("[")) return name;
    return name.replace(/\s*\[\d+\]$/, "");
  };

  // Log available parent options on component mount
  useEffect(() => {
    console.log("Modal initialized with parent options:", parentOptions);
    console.log("Initial parent name:", initialParentName);
  }, []);

  const handleSubmit = () => {
    const parsedPrice = parseFloat(newPrice);
    if (!isNaN(parsedPrice)) {
      // Show animation preview before submitting
      setShowVisualPreview(true);
      setTimeout(() => {
        // Determine the appropriate parent name format to pass back
        let finalParentName;

        if (isCreatingNewParent) {
          // For new parents, just use the name as entered
          finalParentName = newParentName;
          console.log(`Submitting new parent: ${finalParentName}`);
        } else if (newParentName === "Create New Parent") {
          // Handle "Create New Parent" selection
          finalParentName = "Create New Parent";
          console.log(`Submitting create new parent option`);
        } else {
          // Special handling for "Fast Food" case
          if (
            cleanParentName(newParentName).toLowerCase() === "fast food" ||
            newParentName.toLowerCase() === "fast food"
          ) {
            finalParentName = "Fast Food";
            console.log(`Special case handling for Fast Food`);
          } else {
            // For existing parents, try to find the full name with index
            const originalOption = parentOptions.find(
              (option) =>
                cleanParentName(option).toLowerCase() ===
                  cleanParentName(newParentName).toLowerCase() ||
                option.toLowerCase() === newParentName.toLowerCase()
            );

            // If we found the original option with index, use that
            if (originalOption) {
              finalParentName = originalOption;
              console.log(`Using original parent option: ${originalOption}`);
            } else {
              // If it's a known problematic category, use a known good format
              if (newParentName.toLowerCase().includes("food")) {
                finalParentName = "Fast Food";
                console.log(`Normalizing food-related category to Fast Food`);
              } else {
                // Otherwise use the display name - the component will need to look it up
                finalParentName = newParentName;
                console.log(`Using parent display name: ${newParentName}`);
              }
            }
          }
        }

        console.log(
          `Submitting parent change: ${finalParentName} with price: ${parsedPrice}`
        );
        onSubmit(finalParentName, parsedPrice);
        onClose();
      }, 1000); // Delay submission to show animation
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
    console.log(`Parent dropdown changed to: "${value}"`);

    if (value === "createNew") {
      setIsCreatingNewParent(true);
      setNewParentName("");
      setSelectedParentName("New Parent");
    } else {
      setIsCreatingNewParent(false);
      // Keep the full name with index in newParentName for proper lookup
      setNewParentName(value);
      // But use the clean name for display
      setSelectedParentName(cleanParentName(value));

      // Special case for Fast Food
      if (value.toLowerCase() === "fast food") {
        console.log("Selected Fast Food option - setting special value");
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [newParentName, newPrice]);

  // Determine if parent has changed for highlighting
  const hasParentChanged =
    cleanParentName(newParentName).toLowerCase() !==
    cleanParentName(initialParentName).toLowerCase();

  // Prepare display-friendly parent options
  const displayParentOptions = parentOptions.map(cleanParentName);

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "#ffffff",
        padding: "40px",
        borderRadius: "15px",
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
        border: "1px solid #ccc",
        color: "#222",
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
          fontSize: "1.5rem",
          textAlign: "center",
          color: "#333",
        }}
      >
        Update Node Information
      </h3>

      {/* Visual Preview Animation */}
      {showVisualPreview && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255,255,255,0.9)",
            borderRadius: "15px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
        >
          <div
            style={{
              fontSize: "18px",
              marginBottom: "30px",
              color: "#333",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Moving "{clickedNode.name}"<br />
            to {isCreatingNewParent ? "new parent" : selectedParentName}
          </div>
          <div
            style={{
              position: "relative",
              width: "300px",
              height: "150px",
            }}
          >
            {/* Parent Node */}
            <div
              style={{
                position: "absolute",
                top: "0px",
                right: "40px",
                width: "120px",
                height: "50px",
                backgroundColor: "#3b82f6",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
                fontSize: "14px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                padding: "0 10px",
                textAlign: "center",
              }}
            >
              {selectedParentName.length > 12
                ? selectedParentName.substring(0, 12) + "..."
                : selectedParentName}
            </div>

            {/* Animation Dot */}
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                left: "70px",
                width: "18px",
                height: "18px",
                background: "#ff5722",
                borderRadius: "50%",
                boxShadow: "0 0 15px 5px rgba(255, 87, 34, 0.6)",
                animation:
                  "moveToParentEChart 0.8s forwards cubic-bezier(0.22, 1, 0.36, 1)",
                zIndex: 5,
              }}
            ></div>

            {/* Original Parent */}
            <div
              style={{
                position: "absolute",
                top: "40px",
                left: "30px",
                width: "100px",
                height: "40px",
                backgroundColor: "#64748b",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
                fontSize: "12px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                padding: "0 8px",
                textAlign: "center",
                opacity: 0.7,
              }}
            >
              {cleanParentName(initialParentName).length > 10
                ? cleanParentName(initialParentName).substring(0, 10) + "..."
                : cleanParentName(initialParentName)}
            </div>

            {/* Leaf Node */}
            <div
              style={{
                position: "absolute",
                bottom: "10px",
                left: "60px",
                width: "60px",
                height: "35px",
                backgroundColor: "#10b981",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
                fontSize: "12px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                padding: "0 5px",
                textAlign: "center",
                zIndex: 2,
              }}
            >
              {clickedNode.name.length > 8
                ? clickedNode.name.substring(0, 8) + "..."
                : clickedNode.name}
            </div>

            {/* Connection Lines */}
            <svg
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 1,
              }}
            >
              {/* Old connection line that fades out */}
              <path
                d="M80,50 C80,70 80,80 90,95"
                stroke="#64748b"
                strokeWidth="2"
                fill="none"
                strokeDasharray="4,2"
                opacity="0.5"
                style={{
                  animation: "fadeOut 0.8s forwards",
                }}
              />
              {/* New connection line that appears */}
              <path
                d="M160,25 C130,50 110,70 100,95"
                stroke="#3b82f6"
                strokeWidth="3"
                fill="none"
                strokeDasharray="0,500"
                style={{
                  animation: "drawLine 0.8s forwards 0.3s",
                }}
              />
            </svg>
          </div>

          <div
            style={{
              fontSize: "16px",
              marginTop: "30px",
              color: "#4ade80",
              animation: "fadeIn 0.5s forwards 0.6s",
              opacity: 0,
            }}
          >
            {hasParentChanged ? "Parent changed! ✓" : "Price updated! ✓"}
          </div>

          <style jsx>{`
            @keyframes moveToParentEChart {
              0% {
                transform: translate(0, 0);
              }
              50% {
                transform: translate(30px, -40px);
              }
              100% {
                transform: translate(90px, -70px);
              }
            }
            @keyframes fadeOut {
              to {
                opacity: 0;
              }
            }
            @keyframes fadeIn {
              to {
                opacity: 1;
              }
            }
            @keyframes drawLine {
              to {
                stroke-dasharray: 500, 0;
              }
            }
          `}</style>
        </div>
      )}

      <h2
        style={{
          margin: "10px 0 20px",
          fontSize: "1.2rem",
          textAlign: "center",
          color: "#555",
        }}
      >
        Transaction:{" "}
        <span style={{ fontWeight: "normal", color: "#222" }}>
          {clickedNode.name}
        </span>
      </h2>

      {/* Parent Selection Section with Visual Indicator */}
      <div style={{ marginBottom: "15px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "5px",
          }}
        >
          <label style={{ fontWeight: "bold" }}>Parent:</label>

          {/* Show current parent */}
          <div
            style={{
              fontSize: "0.9rem",
              color: "#666",
              display: "flex",
              alignItems: "center",
            }}
          >
            Current:{" "}
            <span
              style={{
                fontWeight: "bold",
                color: "#3b82f6",
                marginLeft: "5px",
                padding: "3px 8px",
                backgroundColor: "#eff6ff",
                borderRadius: "4px",
              }}
            >
              {cleanParentName(initialParentName)}
            </span>
          </div>
        </div>

        <select
          value={isCreatingNewParent ? "createNew" : newParentName}
          onChange={handleParentChange}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "5px",
            border: hasParentChanged ? "2px solid #4ade80" : "1px solid #ddd",
            boxSizing: "border-box",
            backgroundColor: hasParentChanged ? "#f0fdf4" : "white",
          }}
        >
          {/* Display the parent options with proper values */}
          {parentOptions.map((parent) => (
            <option key={parent} value={parent}>
              {cleanParentName(parent)}
            </option>
          ))}
          <option value="createNew">Create New Parent</option>
        </select>

        {/* Visual indication of parent change */}
        {hasParentChanged && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: "8px",
              padding: "8px",
              backgroundColor: "#ecfdf5",
              borderRadius: "5px",
              borderLeft: "4px solid #4ade80",
            }}
          >
            <span style={{ marginRight: "10px" }}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                  fill="#4ade80"
                />
              </svg>
            </span>
            <span style={{ fontSize: "0.9rem" }}>
              Will move to{" "}
              <b>{isCreatingNewParent ? "new parent" : selectedParentName}</b>
            </span>
          </div>
        )}

        {isCreatingNewParent && (
          <input
            type="text"
            value={newParentName}
            onChange={(e) => {
              setNewParentName(e.target.value);
              setSelectedParentName(e.target.value || "New Parent");
            }}
            placeholder="Enter new parent name"
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "10px",
              borderRadius: "5px",
              border: "1px solid #ddd",
              boxSizing: "border-box",
              backgroundColor: "#f9fff9",
            }}
            autoFocus
          />
        )}
      </div>

      {/* Price Section */}
      <div style={{ marginBottom: "25px" }}>
        <label
          style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}
        >
          Price:
        </label>
        <input
          type="text"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "5px",
            border:
              newPrice !== initialPrice
                ? "2px solid #3b82f6"
                : "1px solid #ddd",
            boxSizing: "border-box",
            backgroundColor: newPrice !== initialPrice ? "#eff6ff" : "white",
          }}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button
          onClick={handleSubmit}
          style={{
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#2563eb")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#3b82f6")
          }
        >
          Apply Changes
        </button>
        <button
          onClick={onClose}
          style={{
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#dc2626")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#ef4444")
          }
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default InputModal;
