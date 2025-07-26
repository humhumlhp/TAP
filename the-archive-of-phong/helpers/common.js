import { Dimensions} from "react-native";

const {width: deviceWidth, height: deviceHeight} = Dimensions.get('window');

//Define hp: height percentage
export const hp = percentage=>{
    return (percentage*deviceHeight)/100;
}
//Define wp: width percentage
export const wp = percentage=>{
    return (percentage*deviceWidth)/100;
}