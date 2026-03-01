import { Colors } from "@/constants/colors";
import React from "react";
import Svg, { Line } from "react-native-svg";

export default function HorizontalLine({ width = "100%", style }) {
  return (
    <Svg height="2" width={width} style={style}>
      <Line
        x1="0"
        y1="1"
        x2="100%"
        y2="1"
        stroke={Colors.grey}
        strokeWidth="1.5"
        strokeDasharray="4 4"   // 👈 controls dot spacing
      />
    </Svg>
  );
}
