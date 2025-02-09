import React from "react";
import { SvgXml } from "react-native-svg";

// Define the props interface for the SvgImageWrapper
interface SvgImageWrapperProps {
    height: number | string;  // Accepts both number and string for flexibility
    width: number | string;   // Accepts both number and string for flexibility
    xml: string;              // Raw SVG XML string
    color?: string;           // Optional color prop to dynamically change icon color
}

const SvgImageWrapper: React.FC<SvgImageWrapperProps> = ({ height, width, xml, color }) => {
    return (
        <SvgXml 
            xml={xml} 
            width={width}
            height={height}
            stroke={color}
            // fill={color}
        /> 
    );
}

export default SvgImageWrapper;
