import * as React from "react"
import Svg, { Path } from "react-native-svg";

const Location = ({color = 'black',strokeWidth=1.9, props}) => (

<Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} color={color} fill={"none"}>
    <Path d="M14.5 9C14.5 10.3807 13.3807 11.5 12 11.5C10.6193 11.5 9.5 10.3807 9.5 9C9.5 7.61929 10.6193 6.5 12 6.5C13.3807 6.5 14.5 7.61929 14.5 9Z" stroke={color} strokeWidth="1.5"></Path>
    <Path d="M13.2574 17.4936C12.9201 17.8184 12.4693 18 12.0002 18C11.531 18 11.0802 17.8184 10.7429 17.4936C7.6543 14.5008 3.51519 11.1575 5.53371 6.30373C6.6251 3.67932 9.24494 2 12.0002 2C14.7554 2 17.3752 3.67933 18.4666 6.30373C20.4826 11.1514 16.3536 14.5111 13.2574 17.4936Z" stroke={color} strokeWidth="1.5"></Path>
    <Path d="M18 20C18 21.1046 15.3137 22 12 22C8.68629 22 6 21.1046 6 20" stroke={color} strokeWidth="1.5" strokeLinecap="round"></Path>
</Svg>

);
export default Location;