"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import * as d3 from "d3";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Hardcode the data
  const [data, setData] = useState<any>({
    name: "Expenses",
    children: [
      {
        name: "Education",
        children: [
          {
            name: "Education",
            children: [{ name: "Online Course Fee", price: 92.43 }],
          },
          {
            name: "College Supplies",
            children: [
              { name: "GA Tech Marketplace", price: 105.0 },
              { name: "Princeton Grad Application Fee", price: 75.0 },
              { name: "UCB Graduate Division", price: 155.0 },
            ],
          },
        ],
      },
      {
        name: "Shopping",
        children: [
          {
            name: "Online Shopping",
            children: [
              { name: "Mobile Payment", price: 831.52 },
              { name: "Amazon Purchase", price: 5.43 },
              { name: "Target Purchase", price: 35.97 },
              { name: "Amazon Purchase", price: 12.11 },
            ],
          },
        ],
      },
      {
        name: "Health & Wellness",
        children: [
          {
            name: "Health & Beauty",
            children: [{ name: "CVS Pharmacy Purchase", price: 2.93 }],
          },
          {
            name: "Haircuts",
            children: [{ name: "Supercuts Haircut", price: 37.5 }],
          },
        ],
      },
      {
        name: "Transportation",
        children: [
          {
            name: "Ride Sharing",
            children: [
              { name: "Lyft Ride", price: 7.0 },
              { name: "Lyft Ride", price: 22.99 },
              { name: "Lyft Ride", price: 20.99 },
              { name: "Bird App Ride", price: 4.3 },
            ],
          },
          {
            name: "Rental Cars",
            children: [
              { name: "Vehicle Rental", price: -37.35 },
              { name: "Rental Car", price: 43.32 },
              { name: "Car Rental", price: 390.3 },
            ],
          },
          {
            name: "Transportation",
            children: [{ name: "Toll Charge", price: 26.1 }],
          },
          {
            name: "Gas",
            children: [
              { name: "Lakes Gas", price: 3.01 },
              { name: "Valero Fuel", price: 5.38 },
            ],
          },
        ],
      },
      {
        name: "Food & Dining",
        children: [
          {
            name: "Restaurants",
            children: [
              { name: "Matcha Cafe", price: 6.41 },
              { name: "Sahirah Kebab", price: 16.34 },
              { name: "PONKO CHATLANTA", price: 26.76 },
              { name: "IPIC Atlanta", price: 20.85 },
              { name: "Dining at ApplePay", price: 14.15 },
              { name: "Moe's Southwest Grill", price: 10.33 },
              { name: "Bella Mia", price: 2.92 },
              { name: "FADO Restaurant", price: 21.05 },
              { name: "WINGNUTS", price: 16.88 },
            ],
          },
          {
            name: "Groceries",
            children: [
              { name: "Publix Grocery Purchase", price: 13.51 },
              { name: "Publix Grocery Purchase", price: 7.61 },
              { name: "Publix Groceries", price: 16.29 },
              { name: "Publix Groceries", price: 34.7 },
              { name: "Publix Groceries", price: 22.12 },
            ],
          },
          {
            name: "Fast Food",
            children: [
              { name: "Chick-fil-A", price: 12.07 },
              { name: "Fast Food Restaurant", price: 5.4 },
              { name: "Chick-fil-A", price: 6.48 },
            ],
          },
          {
            name: "Food Delivery",
            children: [{ name: "Mobile Payment", price: 368.18 }],
          },
          {
            name: "Snacks",
            children: [{ name: "Moge Tee Snack", price: 7.08 }],
          },
        ],
      },
      {
        name: "Business & Work",
        children: [
          {
            name: "Insurance",
            children: [{ name: "Assurant Liability Insurance", price: 12.25 }],
          },
        ],
      },
    ],
  });

  useEffect(() => {
    if (!data || !containerRef.current) return;

    // Clear any previous chart
    containerRef.current.innerHTML = "";

    const width = 928;
    const height = width;

    const color = d3
      .scaleLinear<string>()
      .domain([0, 5])
      .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
      .interpolate(d3.interpolateHcl);

    const pack = (data: any) =>
      d3.pack().size([width, height]).padding(3)(
        d3
          .hierarchy(data)
          .sum((d: any) => d.price || 0)
          .sort((a, b) => (b.value || 0) - (a.value || 0))
      );

    const root = pack(data);
    let focus = root;
    let view: [number, number, number];

    const svg = d3
      .create("svg")
      .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
      .attr("width", width)
      .attr("height", height)
      .attr(
        "style",
        `max-width: 100%; height: auto; display: block; background: ${color(
          0
        )}; cursor: pointer;`
      )
      .on("click", (event) => zoom(event, root));

    const node = svg
      .append("g")
      .selectAll("circle")
      .data(root.descendants().slice(1))
      .join("circle")
      .attr("fill", (d: any) => (d.children ? color(d.depth) : "white"))
      .attr("pointer-events", (d: any) => (!d.children ? "none" : null))
      .on("mouseover", function () {
        d3.select(this).attr("stroke", "#000");
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke", null);
      })
      .on("click", (event: any, d: any) => {
        if (focus !== d && d.children) {
          zoom(event, d);
          event.stopPropagation();
        } else if (!d.children) {
          alert(`Edit transaction: ${d.data.name} ($${d.data.price})`);
        }
      });

    const label = svg
      .append("g")
      .style("font", "10px sans-serif")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .selectAll("text")
      .data(root.descendants())
      .join("text")
      .style("fill-opacity", (d: any) => (d.parent === root ? 1 : 0))
      .style("display", (d: any) => (d.parent === root ? "inline" : "none"))
      .text((d: any) => {
        if (d.children) {
          return `${d.data.name} ($${d.value})`;
        } else {
          return `${d.data.name} ($${d.data.price})`;
        }
      });

    zoomTo([root.x, root.y, root.r * 2]);
    containerRef.current.appendChild(svg.node() as Node);

    function zoomTo(v: [number, number, number]) {
      const k = width / v[2];
      view = v;
      label.attr(
        "transform",
        (d: any) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`
      );
      node.attr(
        "transform",
        (d: any) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`
      );
      node.attr("r", (d: any) => d.r * k);
    }

    function zoom(event: any, d: any) {
      focus = d;

      const transition = svg
        .transition()
        .duration(event.altKey ? 7500 : 750)
        .tween("zoom", () => {
          const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
          return (t: number) => zoomTo(i(t));
        });

      label
        .filter(function (this: SVGTextElement, d: any) {
          return d.parent === focus || this.style.display === "inline";
        })
        .transition(transition)
        .style("fill-opacity", (d: any) => (d.parent === focus ? 1 : 0))
        .on("start", function (this: SVGTextElement, d: any) {
          if (d.parent === focus) this.style.display = "inline";
        })
        .on("end", function (this: SVGTextElement, d: any) {
          if (d.parent !== focus) this.style.display = "none";
        });
    }
  }, [data]);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <div ref={containerRef} style={{ width: "100%", height: "auto" }}></div>
      </main>
    </div>
  );
}
