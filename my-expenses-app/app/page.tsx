import React from "react";
// import LineChartComponent from "@/components/LineChartComponent";
import SnakeyChartComponent from "@/components/SnakeyChartComponent";
// import {SankeyChart} from "@d3/sankey-component"
const HomePage = () => {
  return (
    <div>
      <h1>AI Personal Expenses Tracker</h1>
      {/* <LineChartComponent /> */}
      <SnakeyChartComponent />
      {/* <SankeyChart/> */}
    </div>
  );
};

export default HomePage;
