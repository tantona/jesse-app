import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Fuse from "fuse.js";
import { DateTime } from "luxon";
import { useMemo, useState } from "react";
import { Button, FlatList, SafeAreaView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SheetManager } from "react-native-actions-sheet";
import tw from "twrnc";
import { useAppState } from "../hooks/appState";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation";

export const Receipts = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, "PriceSheets">>();
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
    <SafeAreaView style={tw`flex-1`}>
      <View style={tw`px-2 flex flex-col flex-1`}>
        <View style={tw`flex flex-row justify-end py-3`}>
          <TouchableOpacity onPress={() => navigation.navigate("PriceSheets")}>
            <Text style={tw`font-bold text-blue-500`}>Price sheets</Text>
          </TouchableOpacity>
        </View>
        <View>
          <Text style={tw`font-bold text-xl mb-2`}>Receipts</Text>
          <TextInput
            clearButtonMode="always"
            placeholder="Search..."
            style={{ ...tw`border border-gray-400 pt-2 pb-3 px-2 rounded-lg`, fontSize: 20 }}
            value={query}
            onChangeText={(text) => setquery(text)}
          />
        </View>

        <FlatList
          style={tw`flex-1`}
          data={query === "" ? receipts : fuse.search(query).map((item) => item.item)}
          ListEmptyComponent={() => {
            return (
              <TouchableOpacity
                onPress={() => SheetManager.show("create-receipt")}
                style={tw`flex flex-row justify-center items-center my-16`}
              >
                <Text style={tw`text-gray-400`}>Tap here to create a receipt</Text>
                <FontAwesome5 name="plus-circle" size={12} style={tw`mx-1 text-blue-600`} />
              </TouchableOpacity>
            );
          }}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                style={tw`py-2 flex flex-row items-center`}
                onPress={() => {
                  // navigation.navigate("Receipt", item);
                  SheetManager.show("create-receipt", {
                    payload: item,
                  });
                }}
              >
                <View style={tw`flex-1`}>
                  <Text style={tw`text-lg font-semibold`}>#{item.receiptNo}</Text>
                  <Text style={tw`text-sm font-semibold`}>{item?.customer?.name}</Text>
                  <Text style={tw`text-sm`}>{DateTime.fromISO(item.created).toLocaleString()}</Text>
                </View>
                <View>
                  {item?.signature && <FontAwesome5 name="check-circle" size={25} style={tw`text-green-600`} />}
                </View>
              </TouchableOpacity>
            );
          }}
        />

        <View style={tw`flex flex-row`}>
          <TouchableOpacity
            style={tw`flex flex-row items-center py-3 px-2`}
            onPress={() => {
              SheetManager.show("create-receipt");
            }}
          >
            <FontAwesome5 name="plus-circle" size={16} style={tw`mr-1 text-blue-600`} />
            <Text style={tw`font-bold text-blue-600`}>New Receipt</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
