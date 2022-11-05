import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import { DateTime } from "luxon";
import { FC, useState, useCallback } from "react";
import { ActivityIndicator, Button, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SheetManager, SheetProps } from "react-native-actions-sheet";
import { readRemoteFile } from "react-native-csv";
import tw from "twrnc";
import { v4 } from "uuid";
import { ViewHeader } from "../components/ViewHeader";
import { TPartData, useAppState } from "../hooks/appState";
import ActionSheet from "react-native-actions-sheet";

export const CreatePriceSheetCategory: FC<SheetProps> = (props) => {
  const [category, setcategory] = useState("");
  const { createPriceSheetCategory } = useAppState();

  const handleSubmit = () => {
    createPriceSheetCategory(category);
    SheetManager.hide("create-price-sheet-category");
  };

  return (
    <ActionSheet id={props.sheetId} headerAlwaysVisible isModal>
      <View style={tw`p-2 pb-4`}>
        <ViewHeader
          onCancel={() => SheetManager.hide("create-price-sheet-category")}
          onSubmit={handleSubmit}
          submitLabel="Create"
          title="Create new category"
        />

        <TextInput
          clearButtonMode="always"
          style={{ ...tw`border border-gray-400 pt-2 pb-3 px-2 rounded-lg`, fontSize: 20 }}
          value={category}
          onChangeText={setcategory}
          placeholder="Category Name"
        />
      </View>
    </ActionSheet>
  );
};
