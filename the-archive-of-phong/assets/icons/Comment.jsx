import * as React from "react"
import Svg, { Path } from "react-native-svg";

const Comment = ({color = 'black',strokeWidth=1.9, props}) => (
    <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} color={"#000000"} fill={"none"}>
        <Path d="M2 10.5C2 5.5 6 3 12 3C18 3 22 5.5 22 10.5C22 15.5 18 18 12 18V21C12 21 2 18 2 10.5Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"></Path>
        <Path d="M8.5 10.5H15.5M12 7L12 14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"></Path>
    </Svg>
);

export default Comment;