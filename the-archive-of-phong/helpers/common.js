import { Dimensions, Platform} from "react-native";

const {width: deviceWidth, height: deviceHeight} = Dimensions.get('window');

// Define screen dimensions - scale mobile ratio to full height on web
const SCREEN_HEIGHT = Platform.OS === 'web' ? deviceHeight : deviceHeight;
const SCREEN_WIDTH = Platform.OS === 'web' ? deviceHeight * (390/844 ) : deviceWidth;

//Define hp: height percentage
export const hp = percentage=>{
    return (percentage * SCREEN_HEIGHT) / 100;
}
//Define wp: width percentage
export const wp = percentage=>{
    return (percentage * SCREEN_WIDTH) / 100;
}