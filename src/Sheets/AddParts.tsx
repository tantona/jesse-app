import { FC, useState, useRef, useMemo, PropsWithChildren } from "react";
import { View, Text, TextInput, Button, ScrollView, FlatList, TouchableOpacity, Dimensions } from "react-native";
import ActionSheet, { SheetManager, SheetProps, useScrollHandlers, ActionSheetRef } from "react-native-actions-sheet";
import tw from "twrnc";
import Fuse from "fuse.js";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { TPartData, useAppState } from "../hooks/appState";
import { BaseSheet } from "./Base";

export const AddParts: FC<SheetProps<TPartData[]>> = (props) => {
  const { datasets } = useAppState();
  const [query, setQuery] = useState("");
  const [selected, setselected] = useState<Record<string, TPartData>>(
    props.payload.reduce((acc, part) => {
      acc[part.id] = part;
      return acc;
    }, {})
  );
  const data = datasets?.[0]?.items;

  const fuse = useMemo(
    () =>
      new Fuse(data, {
        keys: ["name"],
      }),
    [data]
  );

  const clearSelections = () => {
    setselected({});
  };

  const handlePressItem = (item: TPartData) => {
    if (!selected[item.id]) {
      setselected({ ...selected, [item.id]: item });
      return;
    }
    const s = Object.keys(selected).reduce<Record<string, TPartData>>((acc, key) => {
      if (key !== item.id) {
        acc[key] = item;
      }
      return acc;
    }, {});

    setselected(s);
  };

  const handleSave = async () => {
    SheetManager.hide<TPartData[]>(props.sheetId, {
      context: "local",
      payload: Object.keys(selected).map((key) => selected[key]),
    });
  };

  return (
    <BaseSheet sheetId={props.sheetId}>
      <View style={tw`flex flex-row items-center mb-4`}>
        <View style={tw`w-1/3 font-semibold`}>
          <Button title="Clear" onPress={() => clearSelections()} />
        </View>
        <View style={tw`w-1/3 flex flex-row justify-center`}>
          <Text style={tw`text-lg font-bold`}>Add Parts</Text>
        </View>
        <View style={tw`w-1/3 flex flex-row justify-end`}>
          <Button title="Done" onPress={() => handleSave()} />
        </View>
      </View>

      <TextInput
        clearButtonMode="always"
        placeholder="Search..."
        style={tw`border border-gray-400 pt-2 pb-3 px-2 rounded-lg text-lg`}
        value={query}
        onChangeText={(text) => setQuery(text)}
      />

      <FlatList
        keyExtractor={(item) => item.id}
        data={
          query !== ""
            ? fuse
                .search(query)
                .slice(0, 10)
                .map((item) => item.item)
            : data.slice(0, 10)
        }
        renderItem={({ item }) => {
          return (
            <TouchableOpacity style={tw`py-2 px-2 flex flex-row items-center`} onPress={() => handlePressItem(item)}>
              <FontAwesome style={tw`mr-2 text-xl`} name={selected[item.id] ? "check-circle" : "circle-o"} />
              <Text style={tw`text-lg font-semibold`}>{item.name}</Text>
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
    </BaseSheet>
  );
};
