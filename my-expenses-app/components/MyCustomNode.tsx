import React from 'react';

interface MyCustomNodeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  payload: { name: string; value?: number; [key: string]: any };
  containerWidth: number;
}

const MyCustomNode: React.FC<MyCustomNodeProps> = ({
  x,
  y,
  width,
  height,
  index,
  payload,
  containerWidth,
}) => {
  return (
    <g>
      {/* Rectangle for the node */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="#8884d8"
        stroke="#fff"
        strokeWidth={2}
      />
      {/* Text for node name */}
      <text
        x={x + width / 2}
        y={y + height / 2 - 10} // Position above value
        textAnchor="middle"
        fill="#fff"
        dy={4}
      >
        {payload.name}
      </text>
      {/* Text for node value */}
      <text
        x={x + width / 2}
        y={y + height / 2 + 10} // Position below name
        textAnchor="middle"
        fill="#fff"
        dy={4}
      >
        {payload.value || 'N/A'} {/* Display value or fallback to 'N/A' */}
      </text>
    </g>
  );
};

export default MyCustomNode;
