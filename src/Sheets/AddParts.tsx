import { FC, useState, useRef, useMemo, PropsWithChildren } from "react";
import { View, Text, TextInput, Button, ScrollView, FlatList, TouchableOpacity, Dimensions } from "react-native";
import ActionSheet, {
  SheetManager,
  SheetProps,
  useScrollHandlers,
  ActionSheetRef,
  SheetProvider,
} from "react-native-actions-sheet";
import tw from "twrnc";
import Fuse from "fuse.js";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { TPartData, useAppState } from "../hooks/appState";
import { BaseSheet } from "./Base";

export const AddParts: FC<SheetProps<TPartData[]>> = (props) => {
  const { priceSheets: priceSheets, categories } = useAppState();
  const [query, setQuery] = useState("");
  const [selected, setselected] = useState<Record<string, TPartData>>(
    props.payload.reduce((acc, part) => {
      acc[part.id] = part;
      return acc;
    }, {})
  );

  const priceSheet = priceSheets?.[0];
  const items = priceSheet?.items ?? [];

  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: ["name"],
      }),
    [items]
  );

  const clearSelections = () => {
    setselected({});
  };

  const handlePressItem = (item: TPartData) => {
    if (!selected[item.id]) {
      setselected({ ...selected, [item.id]: { ...item, quantity: 1 } });
      return;
    }
    const s = Object.keys(selected).reduce<Record<string, TPartData>>((acc, key) => {
      if (key !== item.id) {
        acc[key] = selected[key];
      }
      return acc;
    }, {});

    setselected(s);
  };

  const handleSave = async () => {
    SheetManager.hide<TPartData[]>(props.sheetId, {
      context: "create-receipt",
      payload: Object.keys(selected).map((key) => selected[key]),
    });
  };

  return (
    <BaseSheet sheetId={props.sheetId}>
      <SheetProvider context="add-parts">
        <View style={tw`flex flex-row justify-between items-center mb-4`}>
          <Button title="Clear" onPress={() => clearSelections()} />

          <TouchableOpacity
            onPress={() =>
              SheetManager.show<string, string>("select-category", {
                context: "add-parts",
                onClose: (category) => {
                  console.log(category);
                },
              })
            }
          >
            <Text style={tw`text-lg font-bold`}>Add {priceSheet?.category} Parts</Text>
          </TouchableOpacity>

          <Button title="Done" onPress={() => handleSave()} />
        </View>

        <TextInput
          clearButtonMode="always"
          placeholder="Search..."
          style={tw`border border-gray-400 pt-2 pb-3 px-2 rounded-lg text-lg`}
          value={query}
          onChangeText={(text) => setQuery(text)}
        />

        <Text>{priceSheet.category}</Text>

        <FlatList
          keyExtractor={(item) => item.id}
          data={
            query !== ""
              ? fuse
                  .search(query)
                  .filter((item) => item.item.price !== -1)
                  .map((item) => item.item)
              : items.filter((item) => item.price !== -1)
          }
          renderItem={({ item }) => {
            return (
              <TouchableOpacity style={tw`py-2 px-2 flex flex-row items-center`} onPress={() => handlePressItem(item)}>
                <FontAwesome style={tw`mr-2 text-xl`} name={selected[item.id] ? "check-circle" : "circle-o"} />
                <View style={tw`flex-1 flex flex-row justify-between`}>
                  <Text style={tw`text-lg font-semibold`}>{item.name}</Text>
                  <Text style={tw`text-lg text-gray-400`}>${item.price}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={() => (
            <View style={tw`py-4 px-2`}>
              <Text style={tw`text-lg font-semibold text-center text-gray-400`}>No parts found</Text>
            </View>
          )}
        />
        <View style={tw`flex flex-row justify-center mb-4`}>
          <Text style={tw`font-semibold`}>{Object.keys(selected).length} selected</Text>
        </View>
      </SheetProvider>
    </BaseSheet>
  );
};
