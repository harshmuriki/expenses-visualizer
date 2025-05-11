// Copyright 2021-2023 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/sankey-diagram

import * as d3 from "d3";
import * as d3Sankey from "d3-sankey";

export function SankeyChart({
  nodes, // an iterable of node objects (typically [{id}, …]); implied by links if missing
  links // an iterable of link objects (typically [{source, target}, …])
}, {
  format = ",",
  align = "justify",
  nodeId = d => d.id,
  nodeGroup,
  nodeGroups,
  nodeLabel,
  // nodeTitle = d => `${d.id}\n${format(d.value)}`,
  nodeAlign = align,
  nodeSort,
  nodeWidth = 15,
  nodePadding = 10,
  nodeLabelPadding = 6,
  // nodeStroke = "#fff",
  // nodeStrokeWidth = 1.5,
  // nodeStrokeOpacity = 1,
  // nodeStrokeLinejoin = "round",
  linkSource = ({ source }) => source,
  linkTarget = ({ target }) => target,
  linkValue = ({ value }) => value,
  linkPath = d3Sankey.sankeyLinkHorizontal(),
  linkTitle = d => `${d.source.id} → ${d.target.id}\n${format(d.value)}`,
  linkColor = "source",
  linkStrokeOpacity = 0.4,
  linkMixBlendMode = "multiply",
  colors = d3.schemeSet2,
  width = 640,
  height = 400,
  marginTop = 5,
  marginRight = 1,
  marginBottom = 5,
  marginLeft = 1,
} = {}) {
  // Convert nodeAlign from a name to a function (since d3-sankey is not part of core d3).
  if (typeof nodeAlign !== "function") nodeAlign = {
    left: d3Sankey.sankeyLeft,
    right: d3Sankey.sankeyRight,
    center: d3Sankey.sankeyCenter
  }[nodeAlign] ?? d3Sankey.sankeyJustify;

  // Compute values.
  const LS = d3.map(links, linkSource).map(intern);
  const LT = d3.map(links, linkTarget).map(intern);
  const LV = d3.map(links, linkValue);
  if (nodes === undefined) nodes = Array.from(d3.union(LS, LT), id => ({ id }));
  const N = d3.map(nodes, nodeId).map(intern);
  const G = nodeGroup == null ? null : d3.map(nodes, nodeGroup).map(intern);

  // Replace the input nodes and links with mutable objects for the simulation.
  nodes = d3.map(nodes, (_, i) => ({ id: N[i] }));
  links = d3.map(links, (_, i) => ({ source: LS[i], target: LT[i], value: LV[i] }));

  // Ignore a group-based linkColor option if no groups are specified.
  if (!G && ["source", "target", "source-target"].includes(linkColor)) linkColor = "#bbb";

  // Compute default domains.
  if (G && nodeGroups === undefined) nodeGroups = G;

  // Construct the scales.
  const color = nodeGroup == null ? null : d3.scaleOrdinal(nodeGroups, colors);

  // Compute the Sankey layout.
  d3Sankey.sankey()
    .nodeId(({ index: i }) => N[i])
    .nodeAlign(nodeAlign)
    .nodeWidth(nodeWidth)
    .nodePadding(nodePadding)
    .nodeSort(nodeSort)
    .extent([[marginLeft, marginTop], [width - marginRight, height - marginBottom]])
    ({ nodes, links });

  // Compute titles and labels using layout nodes, so as to access aggregate values.
  if (typeof format !== "function") format = d3.format(format);
  const Tl = nodeLabel === undefined ? N : nodeLabel == null ? null : d3.map(nodes, nodeLabel);
  // const Tt = nodeTitle == null ? null : d3.map(nodes, nodeTitle);
  const Lt = linkTitle == null ? null : d3.map(links, linkTitle);

  // A unique identifier for gradients (if needed)
  const uid = `O-${Math.random().toString(16).slice(2)}`;

  // Responsive SVG
  const svg = d3.create("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; display: block;")
    .attr("role", "img")
    .attr("aria-label", "Sankey diagram");

  // NODES
  // const node = svg.append("g")
  //   .attr("stroke", nodeStroke)
  //   .attr("stroke-width", nodeStrokeWidth)
  //   .attr("stroke-opacity", nodeStrokeOpacity)
  //   .attr("stroke-linejoin", nodeStrokeLinejoin)
  //   .selectAll("rect")
  //   .data(nodes)
  //   .join("rect")
  //   .attr("x", d => d.x0)
  //   .attr("y", d => d.y0)
  //   .attr("height", d => d.y1 - d.y0)
  //   .attr("width", d => d.x1 - d.x0)
  //   .attr("fill", G ? ({ index: i }) => color(G[i]) : "#888")
  //   .append("title")
  //   .text(({ index: i }) => Tt ? Tt[i] : Tl[i]);

  // LINKS
  const link = svg.append("g")
    .attr("fill", "none")
    .attr("stroke-opacity", linkStrokeOpacity)
    .selectAll("g")
    .data(links)
    .join("g")
    .style("mix-blend-mode", linkMixBlendMode);

  if (linkColor === "source-target") link.append("linearGradient")
    .attr("id", d => `${uid}-link-${d.index}`)
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", d => d.source.x1)
    .attr("x2", d => d.target.x0)
    .call(gradient => gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", ({ source: { index: i } }) => color(G[i])))
    .call(gradient => gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", ({ target: { index: i } }) => color(G[i])));

  link.append("path")
    .attr("d", linkPath)
    .attr("stroke", linkColor === "source-target" ? ({ index: i }) => `url(#${uid}-link-${i})`
      : linkColor === "source" ? ({ source: { index: i } }) => color(G[i])
        : linkColor === "target" ? ({ target: { index: i } }) => color(G[i])
          : linkColor)
    .attr("stroke-width", ({ width }) => Math.max(1, width))
    .append("title")
    .text(({ index: i }) => Lt ? Lt[i] : "");

  // LABELS
  if (Tl) svg.append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 12)
    .selectAll("text")
    .data(nodes)
    .join("text")
    .attr("x", d => d.x0 < width / 2 ? d.x1 + nodeLabelPadding : d.x0 - nodeLabelPadding)
    .attr("y", d => (d.y1 + d.y0) / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
    .attr("fill", "#222")
    .text(({ index: i }) => Tl[i]);

  function intern(value) {
    return value !== null && typeof value === "object" ? value.valueOf() : value;
  }

  return Object.assign(svg.node(), { scales: { color } });
}