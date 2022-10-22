import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Fuse from "fuse.js";
import { DateTime } from "luxon";
import { useMemo, useState } from "react";
import { Button, FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SheetManager } from "react-native-actions-sheet";
import tw from "twrnc";
import { useAppState } from "../hooks/appState";
import { RootStackParamList } from "../navigation";

export const Receipts = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, "Receipt">>();
  const { receipts } = useAppState();
  const [query, setquery] = useState("");
  const fuse = useMemo(
    () =>
      new Fuse(receipts, {
        keys: ["receiptNo"],
      }),
    [receipts]
  );

  return (
    <View style={tw`py-2 px-2 flex flex-col flex-1`}>
      <View style={tw`flex flex-row justify-end py-3`}>
        <TouchableOpacity onPress={() => navigation.navigate("Datasets")}>
          <Text style={tw`font-bold text-blue-500`}>Price sheets</Text>
        </TouchableOpacity>
      </View>
      <View>
        <Text style={tw`font-bold text-xl mb-2`}>Receipts</Text>
        <TextInput
          clearButtonMode="always"
          placeholder="Search..."
          style={tw`border border-gray-400 pt-2 pb-3 px-2 rounded-lg text-lg`}
          value={query}
          onChangeText={(text) => setquery(text)}
        />
      </View>

      <FlatList
        style={tw`flex-1`}
        data={query === "" ? receipts : fuse.search(query).map((item) => item.item)}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              style={tw`py-2`}
              onPress={() => {
                navigation.navigate("Receipt", item);
              }}
            >
              <Text style={tw`text-lg font-semibold`}>#{item.receiptNo}</Text>
              <Text style={tw`text-sm font-semibold`}>{item?.customer?.name}</Text>
              <Text style={tw`text-sm`}>{DateTime.fromISO(item.created).toLocaleString()}</Text>
            </TouchableOpacity>
          );
        }}
      />

      <View style={tw`justify-end`}>
        <TouchableOpacity
          style={tw`flex flex-row items-center py-1 px-2`}
          onPress={() => {
            SheetManager.show("create-receipt");
          }}
        >
          <FontAwesome5 name="plus-circle" size={16} style={tw`mr-1 text-blue-600`} />
          <Text style={tw`font-bold text-blue-600`}>New Receipt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
