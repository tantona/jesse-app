import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { FC } from "react";
import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";
import tw from "twrnc";

export const BackButton: FC<TouchableOpacityProps> = ({ onPress }) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity style={tw`flex flex-row items-center py-1`} onPress={() => navigation.goBack()}>
      <FontAwesome5 name="arrow-left" size={12} style={tw`mr-1 text-blue-600`} />
      <Text style={tw`font-bold text-blue-600`}>Back</Text>
    </TouchableOpacity>
  );
};
