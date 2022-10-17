import { useMemo, useState } from "react";
import { FlatList, Text, TextInput, TouchableOpacity, View, Button } from "react-native";
import { SheetManager } from "react-native-actions-sheet";

import Fuse from "fuse.js";
import tw from "twrnc";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../navigation";
import { useAppState } from "../hooks/appState";

export const Receipt = () => {
  const { receipts, datasets } = useAppState();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "Receipt">>();
  const receipt = receipts.find((receipt) => receipt.id === route.params.id);

  return (
    <View style={tw`py-2 px-2`}>
      <Button title="Back" onPress={() => navigation.goBack()} />
      <Text style={tw`text-lg font-bold`}>Receipt</Text>
      <Text style={tw`text-lg font-bold`}>#{receipt.receiptNo}</Text>

      <TouchableOpacity onPress={() => SheetManager.show("pick-customer")}>
        <Text style={tw`text-lg font-bold`}>Customer</Text>
      </TouchableOpacity>

      <Text style={tw`text-lg font-bold`}>Parts</Text>
      <Button title="Add" onPress={() => SheetManager.show("add-parts")} />
      <FlatList
        data={receipt.parts}
        renderItem={({ item }) => (
          <View style={tw`flex flex-row justify-between`}>
            <Text>{item.name}</Text>
            <Text>{item.price}</Text>
          </View>
        )}
      />
    </View>
  );
};
