import React from "react";
import { MyCustomNodeProps } from "@/app/types/types";

export const MyCustomNode: React.FC<MyCustomNodeProps> = ({
  x,
  y,
  width,
  height,
  index,
  payload,
  onNodeClick,
  onNodeDrop,
  isDragging,
  isDragNode,
  allNodes,
}) => {
  const isLeafNode = allNodes[index].isleaf;

  const handleClick = (event: React.MouseEvent<SVGElement>) => {
    event.stopPropagation(); // Prevent propagation
    onNodeClick(payload.name, event); // Pass the event object
  };

  const handleDrop = (event: React.MouseEvent<SVGElement>) => {
    event.stopPropagation();
    if (onNodeDrop && isDragging) {
      onNodeDrop(payload.name);
    }
  };

  const nodeWidth = isLeafNode ? 40 : Math.abs(30);
  const nodeHeight = isLeafNode ? 25 : Math.abs(height);

  // Change colors based on drag state
  let fillColor = isLeafNode ? "#4fd1c5" : "#232946";
  let borderColor = isLeafNode ? "#4fd1c5" : "#2a334a";

  if (isDragNode) {
    // Highlight the node being dragged
    fillColor = "#ff9500";
    borderColor = "#ff5e00";
  } else if (isDragging && !isLeafNode && index !== 0) {
    // Highlight potential drop targets (only parent nodes, not root)
    fillColor = "#4CAF50";
    borderColor = "#2E7D32";
  }

  const fontSize = Math.max(15, width / 8);
  const truncatedName =
    payload.name.length > 15
      ? `${payload.name.substring(0, 15)}...`
      : payload.name;

  const topLeft = x;
  const topRight = x + nodeWidth;
  const bottomLeft = y;
  const bottomRight = y + (isLeafNode ? nodeHeight : Math.max(height, 30));

  return (
    <g
      onClick={handleClick}
      onMouseUp={handleDrop}
      style={{
        cursor: isDragging
          ? isLeafNode
            ? "not-allowed"
            : "pointer"
          : "pointer",
        opacity: isDragNode ? 0.7 : 1,
      }}
      data-node-index={index}
    >
      {/* Rectangle for the node */}
      <rect
        x={x}
        y={y}
        width={nodeWidth}
        height={isLeafNode ? nodeHeight : Math.max(height, 30)}
        fill={fillColor}
        stroke={borderColor}
        strokeWidth={
          isDragNode || (isDragging && !isLeafNode && index !== 0) ? 3 : 2
        }
        rx={10}
        ry={10}
        style={{
          cursor: isDragging
            ? isLeafNode
              ? "not-allowed"
              : "pointer"
            : "pointer",
          transition: "fill 0.3s, stroke 0.3s",
        }}
      />
      {/* Text for node name */}
      <text
        x={(topLeft + topRight) / 2}
        y={(bottomLeft + bottomRight) / 2 - (isLeafNode ? 2 : 8)}
        textAnchor="middle"
        fill="#fff"
        fontSize={isLeafNode ? fontSize * 0.95 : fontSize * 1.15}
        fontWeight="bold"
        fontFamily="'Inter', 'Segoe UI', 'Arial', sans-serif"
        dy={4}
        style={{
          transition: "fill 0.3s, font-size 0.3s",
          pointerEvents: "none",
          textShadow: "0 1px 6px #181f2a, 0 0px 2px #0008",
          dominantBaseline: "middle",
        }}
      >
        {truncatedName}
        <title>{payload.name}</title>
      </text>
      {/* Text for node value */}
      <text
        x={(topLeft + topRight) / 2}
        y={(bottomLeft + bottomRight) / 2 + (isLeafNode ? 12 : 14)}
        textAnchor="middle"
        fill={isLeafNode ? "#00ffd0" : "#fff"}
        opacity={isLeafNode ? 1 : 0.7}
        fontSize={isLeafNode ? fontSize * 0.85 : fontSize * 0.95}
        fontWeight={isLeafNode ? "bold" : 500}
        fontFamily="'Inter', 'Segoe UI', 'Arial', sans-serif"
        dy={4}
        style={{
          transition: "fill 0.3s, font-size 0.3s",
          pointerEvents: "none",
          textShadow: "0 1px 6px #181f2a, 0 0px 2px #0008",
          dominantBaseline: "middle",
        }}
      >
        {payload.cost !== undefined ? payload.cost.toFixed(1) : "N/A"}
      </text>
    </g>
  );
};
