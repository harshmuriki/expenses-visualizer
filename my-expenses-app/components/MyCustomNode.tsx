import React, { useMemo } from "react";
import { MyCustomNodeProps } from "@/app/types/types";

export const MyCustomNode: React.FC<MyCustomNodeProps> = ({
  x,
  y,
  height,
  index,
  payload,
  onNodeClick,
  allNodes,
  links,
  // @typescript-eslint/no-unused-vars
}) => {
  const isLeafNode = allNodes[index].isleaf;

  const handleClick = (event: React.MouseEvent<SVGElement>) => {
    event.stopPropagation(); // Prevent propagation
    onNodeClick(payload.name, event); // Pass the event object
  };

  const nodeWidth = isLeafNode ? 45 : 40;
  const formatValue = (value?: number) =>
    value !== undefined
      ? new Intl.NumberFormat("en-US", {
          maximumFractionDigits: value < 100 ? 1 : 0,
        }).format(value)
      : "N/A";

  const withAlpha = (hexColor: string, alpha: number) => {
    const sanitized = hexColor.replace("#", "");
    if (sanitized.length !== 6) {
      return hexColor;
    }
    const r = parseInt(sanitized.slice(0, 2), 16);
    const g = parseInt(sanitized.slice(2, 4), 16);
    const b = parseInt(sanitized.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const baseColor = useMemo(() => {
    if (!links || index === 0) {
      return "#4fd1c5";
    }

    const findTopLevelParent = (nodeIdx: number): number | null => {
      let current = nodeIdx;
      let parent = links.find((link) => link.target === current)?.source;

      while (parent !== undefined && parent !== 0) {
        current = parent;
        parent = links.find((link) => link.target === current)?.source;
      }

      return parent === 0 ? current : null;
    };

    const topParentIndex = findTopLevelParent(index);
    if (topParentIndex === null) {
      return "#4fd1c5";
    }

    const parentLink = links.find(
      (link) => link.source === 0 && link.target === topParentIndex
    );

    return parentLink?.color ?? "#4fd1c5";
  }, [index, links]);

  // Find the incoming link for this node (where this node is the target)
  let incomingEdgeWidth = 25;
  if (links) {
    const incomingLink = links.find((l) => l.target === index);
    if (incomingLink && typeof incomingLink.strokeWidth === "number") {
      incomingEdgeWidth = incomingLink.strokeWidth;
    }
  }
  // Better height calculation
  const minHeight = isLeafNode ? 35 : 40;
  const calculatedHeight = isLeafNode ? incomingEdgeWidth : Math.abs(height);
  const nodeHeight = Math.max(minHeight, calculatedHeight);

  const fillColor = isLeafNode
    ? withAlpha(baseColor, 0.95)
    : withAlpha(baseColor, 0.65);
  const borderColor = isLeafNode ? baseColor : withAlpha(baseColor, 0.85);
  const fontSize = isLeafNode ? 13 : 14;
  const truncatedName =
    payload.name.length > 15
      ? `${payload.name.substring(0, 15)}...`
      : payload.name;

  const topLeft = x;
  const topRight = x + nodeWidth;
  const bottomLeft = y;
  const bottomRight = y + nodeHeight;

  return (
    <g onClick={handleClick} style={{ cursor: "pointer" }}>
      {/* Rectangle for the node */}
      <rect
        x={x}
        y={y}
        width={nodeWidth}
        height={nodeHeight}
        fill={fillColor}
        stroke={borderColor}
        strokeWidth={2}
        rx={10}
        ry={10}
        style={{
          cursor: "pointer",
          transition: "fill 0.3s, stroke 0.3s",
        }}
      />
      {/* Text for node name */}
      <text
        x={(topLeft + topRight) / 2}
        y={(bottomLeft + bottomRight) / 2 - 9}
        textAnchor="middle"
        fill="#fff"
        fontSize={fontSize}
        fontWeight="600"
        fontFamily="'Inter', 'Segoe UI', 'Arial', sans-serif"
        style={{
          transition: "fill 0.3s, font-size 0.3s",
          pointerEvents: "none",
          textShadow: "0 2px 8px #000, 0 1px 3px #000",
        }}
      >
        {truncatedName}
        <title>{payload.name}</title>
      </text>
      {/* Text for node value */}
      <text
        x={(topLeft + topRight) / 2}
        y={(bottomLeft + bottomRight) / 2 + 11}
        textAnchor="middle"
        fill={isLeafNode ? "#00ffd0" : "#a7f3d0"}
        opacity={0.95}
        fontSize={isLeafNode ? 12 : 13}
        fontWeight="600"
        fontFamily="'Inter', 'Segoe UI', 'Arial', sans-serif"
        style={{
          transition: "fill 0.3s, font-size 0.3s",
          pointerEvents: "none",
          textShadow: "0 2px 8px #000, 0 1px 3px #000",
        }}
      >
        {formatValue(payload.cost)}
      </text>
    </g>
  );
};
