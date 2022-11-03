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
import { ViewHeader } from "../components/ViewHeader";

export const AddParts: FC<SheetProps<TPartData[]>> = (props) => {
  const [categoryFilter, setcategoryFilter] = useState<string | null>(null);
  const { priceSheets: priceSheets, categories } = useAppState();
  const [query, setQuery] = useState("");
  const [selected, setselected] = useState<Record<string, TPartData>>(
    props.payload.reduce((acc, part) => {
      acc[part.id] = part;
      return acc;
    }, {})
  );

  const items = categories.flatMap((category) => {
    if (categoryFilter !== null && category !== categoryFilter) {
      return [];
    }
    return priceSheets[category]?.[0]?.items.map((item) => ({ ...item, category })) ?? [];
  });

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
    <BaseSheet id={props.sheetId}>
      <SheetProvider context="add-parts">
        <ViewHeader
          onCancel={() => clearSelections()}
          cancelLabel="Reset"
          onSubmit={() => handleSave()}
          submitLabel="Done"
          title="Add Parts"
        />

        <TextInput
          clearButtonMode="always"
          placeholder={`Search ${categoryFilter ?? "Everything"}...`}
          style={tw`border border-gray-400 pt-2 pb-3 px-2 rounded-lg text-lg`}
          value={query}
          onChangeText={(text) => setQuery(text)}
        />
        <TouchableOpacity
          onPress={() => {
            SheetManager.show<string | null, string>("select-category", {
              context: "add-parts",
              payload: categoryFilter,
              onClose: (category) => {
                setcategoryFilter(category);
              },
            });
          }}
        >
          {categoryFilter != null ? (
            <Text style={tw`py-2 text-blue-500`}>Only showing {categoryFilter}</Text>
          ) : (
            <Text style={tw`py-2 text-blue-500`}>Filter by category</Text>
          )}
        </TouchableOpacity>

        <FlatList
          keyExtractor={(item) => item.id}
          data={
            query !== ""
              ? fuse
                  .search(query)
                  .filter((item) => item.item.price !== -1)
                  .map((item) => item.item)
                  .slice(0, 100)
              : items.slice(0, 100).filter((item) => item.price !== -1)
          }
          renderItem={({ item }) => {
            return (
              <TouchableOpacity style={tw`py-2 px-2 flex flex-row items-center`} onPress={() => handlePressItem(item)}>
                <FontAwesome style={tw`mr-2`} name={selected[item.id] ? "check-circle" : "circle-o"} size={28} />
                <View style={tw`flex-1 flex flex-row justify-between`}>
                  <View style={tw`flex flex-col`}>
                    <Text style={tw`text-lg font-semibold`}>{item.name}</Text>
                    <Text style={tw`text-xs text-gray-400`}>{item.category}</Text>
                  </View>
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
