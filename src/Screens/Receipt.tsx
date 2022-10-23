import { useMemo, useState } from "react";
import { Button, FlatList, Image, Text, View } from "react-native";
import { SheetManager } from "react-native-actions-sheet";

import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import Dinero from "dinero.js";
import tw from "twrnc";
import { TSignature, useAppState } from "../hooks/appState";
import { RootStackParamList } from "../navigation";

export const Receipt = () => {
  const { receipts, saveSignature } = useAppState();
  const navigation = useNavigation();

  const route = useRoute<RouteProp<RootStackParamList, "Receipt">>();
  const receipt = receipts.find((receipt) => receipt.id === route.params.id);

  const subtotal = useMemo(() => {
    return receipt?.parts?.reduce((acc, part) => {
      const price = Dinero({ amount: part.price * 100, currency: "USD" });
      return acc.add(price);
    }, Dinero({ amount: 0, currency: "USD" }));
  }, [receipt?.parts]);

  return (
    <View style={tw`py-2 px-2`}>
      <Button title="Back" onPress={() => navigation.goBack()} />
      <Text style={tw`text-lg font-bold`}>#{receipt.receiptNo}</Text>

      <View style={tw`flex flex-row items-center my-4`}>
        <Image source={receipt?.customer?.image} style={{ ...tw`mr-4`, width: 50, height: 50 }} />
        <View>
          <Text style={tw`py-2 font-semibold`}>{receipt?.customer?.name}</Text>
          <Text>{receipt?.customer?.phoneNumbers?.[0].number}</Text>
        </View>
      </View>

      <View style={tw`mb-4`}>
        <View style={tw`py-4 flex flex-row`}>
          <Text style={tw`font-semibold mr-4`}>Parts</Text>
          <Text style={tw`text-gray-400`}>Tap to edit</Text>
        </View>
        <FlatList
          data={receipt.parts}
          renderItem={({ item }) => {
            return (
              <View style={tw`flex flex-row justify-between py-2`}>
                <Text>{item.name}</Text>
                <Text>${item.price}</Text>
              </View>
            );
          }}
        />
        <View style={tw`flex flex-row justify-between py-2`}>
          <Text>Total</Text>
          <Text>{subtotal.toFormat("$0,0.00")}</Text>
        </View>
      </View>

      <Button
        title="Sign"
        onPress={() =>
          SheetManager.show<never, TSignature>("get-signature", {
            onClose: (payload) => {
              if (payload) {
                saveSignature(receipt.id, payload);
              }
            },
          })
        }
      />

      {receipt?.signature !== null && (
        <View>
          <Text>{receipt?.signature?.date}</Text>
          <View style={{ width: "100%", paddingTop: "100%" }}>
            <Image
              source={{ uri: receipt?.signature?.signature }}
              style={{ position: "absolute", left: 0, bottom: 0, right: 0, top: 0, resizeMode: "contain" }}
            />
          </View>
        </View>
      )}
    </View>
  );
};
