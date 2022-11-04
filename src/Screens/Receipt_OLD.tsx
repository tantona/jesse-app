import { useCallback, useMemo } from "react";
import {
  Alert,
  Button,
  FlatList,
  Image,
  SafeAreaView,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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
import { FakeCurrencyInput } from "react-native-currency-input";

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
    <img src="${receipt?.signature?.uri}" width="300" height="150"/>
  </body>
</html>
`;
};

export const Receipt = () => {
  const { receipts, saveSignature } = useAppState();

  const route = useRoute<RouteProp<RootStackParamList, "Receipt">>();
  const receipt = receipts.find((receipt) => receipt.id === route.params.id);
  const { customer, receiptNo, parts } = receipt;
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
    } catch (err) {
      console.log(err);
    }
  }, [receipt]);
  const width = 250;
  return (
    <SafeAreaView style={tw`flex-1`}>
      <View style={tw`px-2 flex flex-col flex-1`}>
        <View style={tw`flex flex-row justify-between`}>
          <BackButton />
          <TouchableOpacity onPress={printToFile2}>
            <Entypo name="share-alternative" size={24} style={tw`mr-1 text-blue-600`} />
          </TouchableOpacity>
        </View>
        {/*  */}
        <View style={tw`px-2`}>
          {/* <ViewHeader
            onCancel={() => SheetManager.hide("create-receipt")}
            onSubmit={() => handleSave()}
            submitLabel="Save"
            title="Create Receipt"
          /> */}

          <TouchableOpacity
            onPress={() => {
              Alert.prompt(
                "Edit Receipt No.",
                "",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Done",
                    // onPress: setreceiptNo,
                  },
                ],
                "plain-text",
                `${receiptNo ? receiptNo : receipts?.length + 1}`
              );
            }}
            style={tw`pt-1 pb-1 flex flex-row items-center justify-between`}
          >
            <Text style={tw`font-semibold mr-1 text-xl text-gray-600`}>{`Receipt No. ${
              receiptNo ? receiptNo : receipts?.length + 1
            }`}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            // onPress={() => openCustomerModal()}
            style={tw`pt-2 pb-1 flex flex-row items-center border-b border-gray-300`}
          >
            <Text style={tw`text-xs mr-1 text-blue-600`}>{customer ? "Edit" : "Add"} Customer</Text>
          </TouchableOpacity>

          {customer ? (
            <View style={tw`flex flex-row items-center my-4`}>
              <UserAvatar size={50} name={customer?.name} src={customer?.image?.uri} style={tw`mr-4`} />
              <View>
                <Text style={tw`py-2 font-semibold`}>{customer?.name}</Text>
                <Text>{customer?.phoneNumbers?.[0].number}</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              // onPress={() => openCustomerModal()}
              style={tw`flex flex-row justify-center items-center my-4`}
            >
              <Text style={tw`text-gray-400`}>Tap here to add a customer</Text>
              <FontAwesome5 name="plus-circle" size={12} style={tw`mx-1 text-blue-600`} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            // onPress={() => openPartsModal()}
            style={tw`pt-2 pb-1 flex flex-row items-center border-b border-gray-300`}
          >
            <Text style={tw`text-xs mr-1 text-blue-600`}>{parts?.length ? "Edit" : "Add"} Parts</Text>
          </TouchableOpacity>
        </View>

        <View style={tw`flex-1`}>
          <FlatList
            data={parts}
            ItemSeparatorComponent={() => <View style={tw`flex border-b border-gray-100`} />}
            ListHeaderComponent={() => {
              return (
                <View style={tw`flex flex-row py-2 px-2`}>
                  <Text style={tw`font-bold text-xs w-1/3`}>Name</Text>
                  <Text style={tw`font-bold text-xs w-1/3 text-center`}>Quantity</Text>
                  <Text style={tw`font-bold text-xs w-1/3 text-center`}>Price</Text>
                </View>
              );
            }}
            ListEmptyComponent={() => {
              return (
                <TouchableOpacity
                  // onPress={() => openPartsModal()}
                  style={tw`flex flex-row items-center justify-center mt-16`}
                >
                  <Text style={tw`text-gray-400`}>Tap here to add parts</Text>
                  <FontAwesome5 name="plus-circle" size={12} style={tw`mx-1 text-blue-600`} />
                </TouchableOpacity>
              );
            }}
            renderItem={({ item, index }) => {
              return (
                <Swipeable
                  renderRightActions={() => {
                    return (
                      <TouchableOpacity
                        onPress={() =>
                          Alert.alert(
                            "Remove item?",
                            `Are you sure you would like to remove "${item.name}" from this receipt?`,
                            [
                              {
                                text: "No",
                                style: "cancel",
                              },
                              {
                                // onPress: () => removePart(index),
                                text: "Yes",
                                style: "destructive",
                              },
                            ]
                          )
                        }
                        style={tw`bg-red-500 flex items-center justify-center w-1/3`}
                      >
                        <FontAwesome5 name="trash-alt" size={16} style={tw`mr-1 text-white`} />
                      </TouchableOpacity>
                    );
                  }}
                >
                  <View style={tw`flex flex-row py-3 px-2 bg-white`}>
                    <Text style={tw`w-1/3`}>{item.name}</Text>
                    <TextInput
                      style={tw`w-1/3 text-center`}
                      value={`${item.quantity}`}
                      keyboardType="number-pad"
                      // onChangeText={(text) => handleUpdatePartQuantity(index, text ? parseInt(text) : 0)}
                      onBlur={() => {
                        if (item.quantity === 0) {
                          Alert.alert(
                            "Remove item?",
                            `Are you sure you would like to remove "${item.name}" from this receipt?`,
                            [
                              {
                                text: "No",
                                style: "cancel",
                              },
                              {
                                // onPress: () => removePart(index),
                                text: "Yes",
                                style: "destructive",
                              },
                            ]
                          );
                        }
                      }}
                    />

                    <View style={tw`w-1/3 flex justify-center`}>
                      <FakeCurrencyInput
                        numberOfLines={5}
                        placeholder="$0.00"
                        selectTextOnFocus={true}
                        style={tw`text-right text-sm`}
                        prefix="$"
                        separator="."
                        delimiter=","
                        precision={2}
                        value={item.price}
                        minValue={0}
                        maxValue={99999999999}
                        onBlur={(e) => {
                          if (!item.price) {
                            // handleUpdatePartPrice(index, 0.0);
                          }
                        }}
                        // onChangeValue={(value) => handleUpdatePartPrice(index, value)}
                      />
                    </View>
                  </View>
                </Swipeable>
              );
              0;
            }}
          />
        </View>
        <View style={{ ...tw`px-3 bg-gray-300`, height: 100 }}>
          <View style={tw`flex flex-row py-2 border-t border-gray-300`}>
            <Text style={tw`w-1/3 text-lg font-bold`}>Total</Text>

            <Text numberOfLines={1} style={tw`w-2/3 text-lg font-bold text-right`}>
              {/* {total.toFormat("$0,0.00")} */}
            </Text>
          </View>
        </View>
        {/* </SheetProvider> */}

        {/*  */}
        {receipt?.signature ? (
          <View style={tw`flex flex-col items-end`}>
            <Image
              source={{ uri: receipt?.signature?.uri }}
              style={{ height: width * (281 / 738), width, transform: [{ rotate: "180deg" }] }}
            />
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
    </SafeAreaView>
  );
};
