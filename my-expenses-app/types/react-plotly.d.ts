declare module "react-plotly.js" {
  import { Component } from "react";

  interface PlotParams {
    data: any[];
    layout?: any;
    config?: any;
    style?: React.CSSProperties;
    className?: string;
    onInitialized?: (figure: any, graphDiv: HTMLElement) => void;
    onUpdate?: (figure: any, graphDiv: HTMLElement) => void;
    onPurge?: (figure: any, graphDiv: HTMLElement) => void;
    onError?: (err: any) => void;
    onBeforeHover?: (event: any) => void;
    onHover?: (event: any) => void;
    onUnhover?: (event: any) => void;
    onClick?: (event: any) => void;
    onSelected?: (event: any) => void;
    onDeselect?: (event: any) => void;
    onRelayout?: (event: any) => void;
    onRedraw?: (event: any) => void;
    onAnimated?: (event: any) => void;
    onAnimatingFrame?: (event: any) => void;
    onAnimationInterrupted?: (event: any) => void;
    onTransitioning?: (event: any) => void;
    onTransitionInterrupted?: (event: any) => void;
    onRestyle?: (event: any) => void;
    onAfterExport?: (event: any) => void;
    onAfterPlot?: (event: any) => void;
    onAutoSize?: (event: any) => void;
    onBeforeExport?: (event: any) => void;
    onButtonClicked?: (event: any) => void;
    onSliderChange?: (event: any) => void;
    onSliderEnd?: (event: any) => void;
    onSliderStart?: (event: any) => void;
    onSunburstClick?: (event: any) => void;
    onTreemapClick?: (event: any) => void;
    onLegendClick?: (event: any) => void;
    onLegendDoubleClick?: (event: any) => void;
    onSliderChange?: (event: any) => void;
    onSliderEnd?: (event: any) => void;
    onSliderStart?: (event: any) => void;
    onSunburstClick?: (event: any) => void;
    onTreemapClick?: (event: any) => void;
    onLegendClick?: (event: any) => void;
    onLegendDoubleClick?: (event: any) => void;
    divId?: string;
    debug?: boolean;
    useResizeHandler?: boolean;
    revision?: number;
  }

  export default class Plot extends Component<PlotParams> {}
}
