import { useCallback, useMemo } from "react";
import { Alert, Button, FlatList, Image, Share, Text, TouchableOpacity, View } from "react-native";
import { SheetManager } from "react-native-actions-sheet";
import { RouteProp, useRoute } from "@react-navigation/native";
import Dinero from "dinero.js";
import tw from "twrnc";
import { TReceipt, TSignature, useAppState } from "../hooks/appState";
import { RootStackParamList } from "../navigation";
import { Entypo } from "@expo/vector-icons";
import * as Print from "expo-print";
import { shareAsync } from "expo-sharing";
import { DateTime } from "luxon";
import RNHTMLtoPDF from "react-native-html-to-pdf";
import UserAvatar from "react-native-user-avatar";
import { BackButton } from "../components/BackButton";
import { Swipeable } from "react-native-gesture-handler";
import { FontAwesome5 } from "@expo/vector-icons";

const receiptHTML = (receipt: TReceipt) => {
  return `
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
  </head>
  <body>
    <h1>${receipt?.customer?.name}</h1>
    <table>
      <thead>
        <tr>
          <th>name</th>
          <th>quantity</th>
          <th>price</th>
        </tr>
        </thead>
      <tbody>
        ${receipt?.parts.map((item) => {
          return `<tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>${item.price}</td>
        </tr>`;
        })}
      </tbody>
    </table>
    <img src="${receipt?.signature?.signature}" width="300" height="150"/>
  </body>
</html>
`;
};

export const Receipt = () => {
  const { receipts, saveSignature } = useAppState();

  const route = useRoute<RouteProp<RootStackParamList, "Receipt">>();
  const receipt = receipts.find((receipt) => receipt.id === route.params.id);

  const subtotal = useMemo(() => {
    return receipt?.parts?.reduce((acc, part) => {
      const price = Dinero({ amount: part.price * 100, currency: "USD" });
      return acc.add(price);
    }, Dinero({ amount: 0, currency: "USD" }));
  }, [receipt?.parts]);

  const printToFile = useCallback(async () => {
    const { uri } = await Print.printToFileAsync({ html: receiptHTML(receipt) });

    await shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf", dialogTitle: "What would you like to do?" });
  }, [receipt]);

  const printToFile2 = useCallback(async () => {
    const fileName = `receipt_${receipt.receiptNo}_${DateTime.fromISO(receipt?.created).toFormat("y-MM-dd")}`;

    try {
      const file = await RNHTMLtoPDF.convert({
        html: receiptHTML(receipt),
        fileName: fileName,
        directory: "Documents",
      });

      const resp = await Share.share({
        title: fileName,
        url: `file://${file.filePath}`,
      });
      console.log(resp.action);
    } catch (err) {
      console.log(err);
    }
  }, [receipt]);
  const width = 250;
  return (
    <View style={tw`p-2`}>
      <View style={tw`flex flex-row justify-between`}>
        <BackButton />
        <TouchableOpacity onPress={printToFile2}>
          <Entypo name="share-alternative" size={24} style={tw`mr-1 text-blue-600`} />
        </TouchableOpacity>
      </View>

      {receipt?.receiptNo ? (
        <Text style={tw`text-lg font-bold`}>#{receipt.receiptNo}</Text>
      ) : (
        <Text style={tw`text-lg font-bold text-gray-400`}>{receipt.id.substring(0, 8)}</Text>
      )}

      <View style={tw`flex flex-row items-center my-4`}>
        <UserAvatar size={50} name={receipt?.customer?.name} src={receipt?.customer?.image?.uri} style={tw`mr-4`} />
        <View>
          <Text style={tw`py-2 font-semibold`}>{receipt?.customer?.name}</Text>
          <Text>{receipt?.customer?.phoneNumbers?.[0].number}</Text>
        </View>
      </View>

      <View style={tw`mb-4`}>
        <View style={tw`py-4 flex flex-row`}>
          <Text style={tw`font-semibold mr-4`}>Parts</Text>
        </View>
        <FlatList
          data={receipt.parts}
          ListHeaderComponent={() => {
            return (
              <View style={tw`flex flex-row py-2`}>
                <Text style={tw`font-semibold w-6/12`}>Name</Text>
                <Text style={tw`font-semibold w-3/12 text-center`}>Quantity</Text>
                <Text style={tw`font-semibold w-3/12 text-center`}>Price</Text>
              </View>
            );
          }}
          renderItem={({ item }) => {
            const price = Dinero({ amount: item.price * 100, currency: "USD" }).multiply(item.quantity);
            return (
              <Swipeable
                renderRightActions={() => {
                  return (
                    <TouchableOpacity
                      style={tw`bg-red-500 flex items-center justify-center w-1/3`}
                      onPress={() => {
                        Alert.alert("Remove price sheet", "Are you sure you want to remove this price sheet?", [
                          { text: "Cancel", style: "cancel" },
                          { text: "Delete", style: "destructive", onPress: () => console.log("remove") },
                        ]);
                      }}
                    >
                      <FontAwesome5 name="trash-alt" size={16} style={tw`mr-1 text-white`} />
                    </TouchableOpacity>
                  );
                }}
              >
                <View style={tw`flex flex-row py-2 bg-white`}>
                  <Text style={tw`w-6/12`}>{item.name}</Text>
                  <Text
                    style={tw`w-3/12 text-center`}
                    // value={`${item.quantity}`}
                    // keyboardType="number-pad"
                    // onChangeText={(text) => handleUpdatePartQuantity(index, text ? parseInt(text) : 0)}
                  >
                    {item.quantity}
                  </Text>
                  <Text
                    style={tw`w-3/12 text-center`}
                    // value={price.toFormat("")}
                    // onChangeText={(price) => handleUpdatePartPrice(index, parseInt(price))}
                  >
                    {price.toFormat("$0,0.00")}
                  </Text>
                </View>
              </Swipeable>
            );
          }}
          ListFooterComponent={() => {
            return (
              <View style={tw`flex flex-row justify-between py-2 border-t border-t-gray-400`}>
                <Text style={tw`w-9/12 font-bold`}>Total</Text>

                <Text style={tw`w-3/12 font-bold text-center`}>{subtotal.toFormat("$0,0.00")}</Text>
              </View>
            );
          }}
        />
      </View>

      {receipt?.signature ? (
        <View style={tw`flex flex-col items-end`}>
          <Image source={{ uri: receipt?.signature?.signature }} style={{ height: width * (281 / 738), width }} />
          <Text>Signed: {receipt?.customer?.name}</Text>
          <Text>Date: {DateTime.fromISO(receipt?.signature?.date).toLocaleString()}</Text>
        </View>
      ) : (
        <Button
          title="Get signature"
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
      )}
    </View>
  );
};
