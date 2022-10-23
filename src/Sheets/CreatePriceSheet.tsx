import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import { DateTime } from "luxon";
import { FC, useState, useCallback } from "react";
import { ActivityIndicator, Button, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SheetManager, SheetProps } from "react-native-actions-sheet";
import { readRemoteFile } from "react-native-csv";
import tw from "twrnc";
import { v4 } from "uuid";
import { TPartData, useAppState } from "../hooks/appState";
import { BaseSheet } from "./Base";

const parseResults = (row: any) => {
  let price = parseFloat(row?.[1]?.replace(/\,|\$/g, ""));

  if (!price || isNaN(price)) {
    price = -1;
  }

  return {
    id: v4(),
    name: row?.[0],
    price: price,
  };
};

interface ICompleteArgs {
  data: any[];
  meta: any;
  errors: any;
}

const readCSV = (uri: string) => {
  return new Promise<ICompleteArgs>((resolve) => {
    readRemoteFile(uri, {
      complete: (results: ICompleteArgs, file: any) => {
        resolve(results);
      },
    });
  });
};

export const CreatePriceSheet: FC<SheetProps> = (props) => {
  const { categories, createPriceSheet } = useAppState();
  const [category, setcategory] = useState("");
  const [loading, setloading] = useState(false);
  const [createNewCategory, setCreateNewCategory] = useState(false);
  const handlePickFile = useCallback(async () => {
    if (category === "") {
      alert("Category can't be empty");
      return;
    }
    const resp = await DocumentPicker.getDocumentAsync();
    if (resp.type === "success") {
      setloading(true);
      try {
        const { data } = await readCSV(resp.uri);

        createPriceSheet({
          id: v4(),
          category,
          created: DateTime.now().toString(),
          items: data.map<TPartData>(parseResults),
        });
        SheetManager.hide("create-price-sheet");
      } catch (err) {
        console.log(err);
      } finally {
        setloading(false);
      }
    }

    if (resp.type === "cancel") {
      SheetManager.hide("create-price-sheet");
    }
  }, [category]);

  return (
    <BaseSheet sheetId={props.sheetId}>
      {loading ? (
        <View style={tw`p-2`}>
          <ActivityIndicator />
        </View>
      ) : (
        <View style={tw`p-2`}>
          <View style={tw`flex flex-row items-center mb-3`}>
            <View style={tw`w-3/12`}>
              <TouchableOpacity onPress={() => SheetManager.hide("create-price-sheet")}>
                <Text style={tw`text-lg text-blue-500`}>Cancel</Text>
              </TouchableOpacity>
            </View>
            <View style={tw`w-6/12`}>
              <Text style={tw`text-center text-lg font-bold`}>Add Price Sheet</Text>
            </View>
            <View style={tw`w-3/12 flex flex-row justify-end`}>
              <TouchableOpacity>
                <Text style={tw`text-lg text-blue-500`} onPress={() => handlePickFile()}>
                  Next
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {!createNewCategory && categories?.size > 0 ? (
            <View>
              <Picker
                prompt="Foobar"
                selectedValue={category}
                onValueChange={(itemValue, itemIndex) => {
                  setcategory(itemValue);
                }}
              >
                {Array.from(categories).map((category) => {
                  return <Picker.Item key={category} label={category} value={category} />;
                })}
              </Picker>
              <Button onPress={() => setCreateNewCategory(true)} title="Create new category" />
            </View>
          ) : (
            <View>
              <TextInput
                clearButtonMode="always"
                style={tw`border border-gray-400 pt-2 pb-3 px-2 rounded-lg text-lg`}
                value={category}
                onChangeText={setcategory}
                placeholder="Category Name"
              />
              {categories?.size > 0 && (
                <Button onPress={() => setCreateNewCategory(false)} title="Select from existing" />
              )}
            </View>
          )}
        </View>
      )}
    </BaseSheet>
  );
};
