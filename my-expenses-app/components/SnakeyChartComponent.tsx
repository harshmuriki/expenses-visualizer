"use client";

import React from "react";
import { Sankey, Tooltip, ResponsiveContainer } from "recharts";
import MyCustomNode from "./MyCustomNode";
import { data0, testdatamini } from "@/data/testData";

const SankeyChartComponent = () => {

  const dataValue = data0
  // Calculate the number of nodes
  const numberOfNodes = dataValue.nodes.length;

  // Define base dimensions
  const baseWidth = 500;
  const baseHeight = 500;

  // Adjust dimensions based on the number of nodes
  const adjustedWidth = baseWidth + numberOfNodes * 1; // Add 100 units per node
  const adjustedHeight = baseHeight + numberOfNodes * 50; // Add 50 units per node

  const margin = {
    left: Math.min(200, numberOfNodes * 20),
    right: Math.min(200, numberOfNodes * 20),
    top: 100,
    bottom: 100,
  };

  return (
    <ResponsiveContainer width="100%" height={adjustedHeight}>
      <Sankey
        width={adjustedWidth}
        height={adjustedHeight}
        data={dataValue}
        node={(nodeProps) => <MyCustomNode {...nodeProps} />}
        nodePadding={50}
        margin={margin}
        link={{ stroke: "#77c878" }}
      >
        {/* <Tooltip /> */}
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div
                  style={{
                    background: "#fff",
                    padding: "10px",
                    border: "1px solid #ccc",
                  }}
                >
                  <p>{`Source: ${payload[0].payload.source}`}</p>
                  <p>{`Target: ${payload[0].payload.target}`}</p>
                  <p>{`Value: ${payload[0].payload.value}`}</p>
                </div>
              );
            }
            return null;
          }}
        />
      </Sankey>
    </ResponsiveContainer>
  );
};

export default SankeyChartComponent;
