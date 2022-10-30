import { Picker } from "@react-native-picker/picker";
import { FC, useState } from "react";
import { Button, View, Text, TouchableOpacity } from "react-native";
import { SheetManager, SheetProps } from "react-native-actions-sheet";
import { useAppState } from "../hooks/appState";
import { BaseSheet } from "./Base";
import tw from "twrnc";
import ActionSheet from "react-native-actions-sheet";

export const SelectCategory: FC<SheetProps<string | null>> = (props) => {
  const { categories } = useAppState();
  const [category, setcategory] = useState(props?.payload ?? null);

  const handleDone = () => {
    console.log(category);
    SheetManager.hide<string | null>("select-category", {
      context: "add-parts",
      payload: category,
    });
  };

  return (
    <ActionSheet id={props.sheetId} headerAlwaysVisible isModal>
      <View style={{ ...tw`p-2`, height: 300 }}>
        <View style={tw`flex flex-row items-center`}>
          <View style={tw`w-1/3 `} />
          <View style={tw`w-1/3 flex flex-row justify-center`}>
            <Text style={tw`text-sm font-semibold`}>Select a category</Text>
          </View>
          <View style={tw`w-1/3 flex flex-row justify-end`}>
            <TouchableOpacity onPress={() => handleDone()}>
              <Text style={tw`text-lg text-blue-500`}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Picker
          selectedValue={category}
          onValueChange={(itemValue, itemIndex) => {
            setcategory(itemValue);
          }}
        >
          <Picker.Item label="None" value={null} />
          {Array.from(categories).map((category) => {
            return <Picker.Item key={category} label={category} value={category} />;
          })}
        </Picker>
      </View>
    </ActionSheet>
  );
};
