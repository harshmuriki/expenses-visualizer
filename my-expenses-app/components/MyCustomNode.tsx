import React from "react";

interface Link {
  source: number;
  target: number;
  value: number;
}

interface Node {
  name: string;
  value?: number;
  isleaf?: boolean;
  // Add other properties as needed
}

interface MyCustomNodeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  payload: { name: string; value?: number; [key: string]: any };
  containerWidth: number;
  onNodeClick: (nodeId: string, event: React.MouseEvent<SVGElement>) => void; // New click handler
  allNodes: Node[];
}

const MyCustomNode: React.FC<MyCustomNodeProps> = ({
  x,
  y,
  width,
  height,
  index,
  payload,
  onNodeClick,
  allNodes,
}) => {
  const isLeafNode = allNodes[index].isleaf;

  const handleClick = (event: React.MouseEvent<SVGElement>) => {
    event.stopPropagation(); // Prevent propagation
    onNodeClick(payload.name, event); // Pass the event object
  };
  // console.log("isleafnode", isLeafNode);
  // const isLeafNode = !links.some((link: Link) => link.source === index);
  const nodeWidth = isLeafNode ? 25 : width; // Set a constant width for leaf nodes
  const nodeHeight = isLeafNode ? 25 : height; // Set a constant height for leaf nodes
  // Dynamic styles
  // Dynamic styles
  const fillColor =
    payload.value && payload.value > 100 ? "#ff6347" : "#8884d8";
  const strokeColor = "#fff"; // Highlight the first node
  const fontSize = Math.max(12, width / 10);
  const truncatedName =
    payload.name.length > 10
      ? `${payload.name.substring(0, 10)}...`
      : payload.name;

  return (
    <g>
      {/* Rectangle for the node */}
      <rect
        x={x}
        y={y}
        width={nodeWidth}
        height={nodeHeight}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={2}
        rx={5} // Rounded corners
        ry={5}
        onClick={handleClick}
        style={{ cursor: "pointer" }}
      />
      {/* Text for node name */}
      <text
        x={x + width / 2 + 40}
        y={y + height / 2 - 10} // Position above value
        textAnchor="middle"
        fill="#fff"
        fontSize={fontSize}
        dy={4}
      >
        {truncatedName}
        <title>{payload.name}</title>
      </text>
      {/* Text for node value */}
      <text
        x={x + width / 2 + 40}
        y={y + height / 2 + 10} // Position below name
        textAnchor="middle"
        fill="#fff"
        fontSize={fontSize}
        dy={4}
      >
        {payload.value || "N/A"}
      </text>
    </g>
  );
};

export default MyCustomNode;
