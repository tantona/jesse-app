import { useMemo, useRef, useState } from "react";
import { FlatList, Text, TextInput, TouchableOpacity, View, Button, Image, Dimensions } from "react-native";
import { SheetManager } from "react-native-actions-sheet";

import Fuse from "fuse.js";
import tw from "twrnc";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../navigation";
import { useAppState } from "../hooks/appState";
import Dinero from "dinero.js";
import SignatureScreen, { SignatureViewRef } from "react-native-signature-canvas";

const Sign = ({ text, onOK }) => {
  const ref = useRef<SignatureViewRef>();

  // Called after ref.current.readSignature() reads a non-empty base64 string
  const handleOK = (signature: string) => {
    onOK(signature); // Callback from Component props
  };

  // Called after ref.current.readSignature() reads an empty string
  const handleEmpty = () => {
    console.log("Empty");
  };

  // Called after ref.current.clearSignature()
  const handleClear = () => {
    console.log("clear success!");
  };

  // Called after end of stroke
  const handleEnd = () => {
    ref.current.readSignature();
  };

  // Called after ref.current.getData()
  const handleData = (data: any) => {
    console.log("handledata", data);
  };

  return (
    <SignatureScreen
      ref={ref}
      onEnd={handleEnd}
      onOK={handleOK}
      onEmpty={handleEmpty}
      onClear={handleClear}
      onGetData={handleData}
      autoClear={false}
      descriptionText={text}
      trimWhitespace
      rotated
    />
  );
};

const { width } = Dimensions.get("window");

export const Receipt = () => {
  const { receipts } = useAppState();
  const navigation = useNavigation();
  const [signature, setsignature] = useState("");
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

      <View style={tw`h-full`}>
        {signature !== "" ? (
          <View style={{ width: "100%", paddingTop: "100%" }}>
            <Image
              source={{ uri: signature }}
              style={{ position: "absolute", left: 0, bottom: 0, right: 0, top: 0, resizeMode: "contain" }}
            />
          </View>
        ) : (
          <Sign text={"foo"} onOK={(signature: string) => setsignature(signature)} />
        )}
      </View>
    </View>
  );
};
