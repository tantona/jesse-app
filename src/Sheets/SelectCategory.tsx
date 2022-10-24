import { Picker } from "@react-native-picker/picker";
import { FC, useState } from "react";
import { Button } from "react-native";
import { SheetManager, SheetProps } from "react-native-actions-sheet";
import { useAppState } from "../hooks/appState";
import { BaseSheet } from "./Base";

export const SelectCategory: FC<SheetProps<string>> = (props) => {
  const { categories } = useAppState();
  const [category, setcategory] = useState("");

  const handleDone = () => {
    SheetManager.hide<string>("select-category", {
      context: "add-parts",
      payload: category,
    });
  };

  return (
    <BaseSheet sheetId={props.sheetId}>
      <Button title="Done" onPress={() => handleDone()} />
      <Picker
        selectedValue={category}
        onValueChange={(itemValue, itemIndex) => {
          setcategory(itemValue);
        }}
      >
        {Array.from(categories).map((category) => {
          return <Picker.Item key={category} label={category} value={category} />;
        })}
      </Picker>
    </BaseSheet>
  );
};
