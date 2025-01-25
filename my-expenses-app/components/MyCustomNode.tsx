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
  allNodes,
  colorThreshold,
}) => {
  const isLeafNode = allNodes[index].isleaf;

  const handleClick = (event: React.MouseEvent<SVGElement>) => {
    event.stopPropagation(); // Prevent propagation
    onNodeClick(payload.name, event); // Pass the event object
  };

  const parentsHeight = 0;

  const nodeWidth = isLeafNode ? 40 : Math.abs(10); // Set a constant width for leaf nodes
  const nodeHeight = isLeafNode ? 25 : Math.abs(height); // Set a constant height for leaf nodes and ensure minimum height
  const fillColor =
    payload.value && payload.value > colorThreshold ? "#ff6347" : "#32a836";
  // const strokeColor = "#ggg"; // Highlight the first node
  const fontSize = Math.max(12, width / 10);
  const truncatedName =
    payload.name.length > 15
      ? `${payload.name.substring(0, 15)}...`
      : payload.name;

  return (
    <g onClick={handleClick} style={{ cursor: "pointer" }}>
      {/* Rectangle for the node */}
      <rect
        x={x}
        y={y}
        width={nodeWidth}
        height={isLeafNode ? nodeHeight : false ? parentsHeight : height}
        fill={fillColor}
        strokeWidth={2}
        rx={6} // Rounded corners
        ry={6}
        onClick={handleClick}
        style={{ cursor: "pointer", filter: "drop-shadow(1px 1px 1px #aaa)" }} // Add shadow
      />
      {/* Text for node name */}
      <text
        x={x + nodeWidth / 2}
        y={y + nodeHeight / 2 - 18}
        textAnchor="middle"
        fill="#fff"
        fontSize={fontSize}
        dy={4}
        className="font-sans font-medium" // Apply Tailwind font classes
      >
        {truncatedName}
        <title>{payload.name}</title>
      </text>
      {/* Text for node value */}
      <text
        x={x + nodeWidth / 2}
        y={y + nodeHeight / 2} // Position below name
        textAnchor="middle"
        fill="#fff"
        fontSize={fontSize}
        dy={4}
        className="font-sans font-medium" // Apply Tailwind font classes
      >
        {payload.value !== undefined ? payload.value.toFixed(1) : "N/A"}
      </text>
    </g>
  );
};
