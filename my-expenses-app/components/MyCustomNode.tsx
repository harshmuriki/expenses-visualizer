import React, { useMemo } from "react";
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
  links,
  // @typescript-eslint/no-unused-vars
}) => {
  const isLeafNode = allNodes[index].isleaf;

  const handleClick = (event: React.MouseEvent<SVGElement>) => {
    event.stopPropagation(); // Prevent propagation
    onNodeClick(payload.name, event); // Pass the event object
  };

  const nodeWidth = isLeafNode ? 40 : Math.abs(30);
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
  const nodeHeight = isLeafNode ? incomingEdgeWidth : Math.abs(height);
  const fillColor = isLeafNode
    ? withAlpha(baseColor, 0.9)
    : withAlpha(baseColor, 0.55);
  const borderColor = isLeafNode ? baseColor : withAlpha(baseColor, 0.8);
  const fontSize = Math.max(15, width / 8);
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
        {formatValue(payload.cost)}
      </text>
    </g>
  );
};
