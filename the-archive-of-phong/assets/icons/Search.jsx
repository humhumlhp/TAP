import * as React from "react"
import Svg, { Path } from "react-native-svg";

const Search = ({color = 'black',strokeWidth=1.9, props}) => (

<Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} color={color} fill={"none"}>
    <Path d="M17 17L21 21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></Path>
    <Path d="M19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19C15.4183 19 19 15.4183 19 11Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></Path>
</Svg>

);
export default Search;