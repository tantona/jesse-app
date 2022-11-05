import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import Dinero from "dinero.js";
import { Contact } from "expo-contacts";
import { DateTime } from "luxon";
import { FC, useCallback, useMemo, useState } from "react";
import { Alert, FlatList, Image, Share, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SheetManager, SheetProps, SheetProvider } from "react-native-actions-sheet";
import { FakeCurrencyInput } from "react-native-currency-input";
import { Swipeable } from "react-native-gesture-handler";
import RNHTMLtoPDF from "react-native-html-to-pdf";
import UserAvatar from "react-native-user-avatar";
import tw from "twrnc";
import { ViewHeader } from "../components/ViewHeader";
import { TPartData, TReceipt, TSignature, useAppState } from "../hooks/appState";
import ReceiptHTML from "../templates/Receipt";
import { BaseSheet } from "./Base";

type TMode = "create" | "update" | "view";

const calculateTotalPrice = (parts: TPartData[]) => {
  return parts?.reduce((acc, part) => {
    const p = part?.price ?? 0;

    const price = Dinero({ amount: Math.ceil(p * 100), currency: "USD" }).multiply(part.quantity);
    return acc.add(price);
  }, Dinero({ amount: 0, currency: "USD" }));
};

const getMode = (receipt: TReceipt | null): TMode => {
  if (receipt === null) {
    return "create";
  }
  if (Boolean(receipt?.id && !receipt?.signature)) {
    return "update";
  }

  return "view";
};

export const CreateReceipt: FC<SheetProps<TReceipt | null>> = (props) => {
  const { receipts } = useAppState();
  const receipt = receipts.find((r) => r.id === props?.payload?.id) ?? null;
  const mode = getMode(receipt);

  return (
    <BaseSheet id={props.sheetId}>
      {mode === "view" ? (
        <ReceiptView receipt={receipt} />
      ) : (
        <EditableReceiptView receipt={receipt} onSave={() => SheetManager.hide(props.sheetId)} />
      )}
    </BaseSheet>
  );
};

const ReceiptView: FC<{ receipt: TReceipt }> = ({ receipt }) => {
  const { customer, receiptNo, parts } = receipt;
  const signatureWidth = 175;
  const total = useMemo(() => calculateTotalPrice(parts), [parts]);

  const sharePDF = useCallback(async () => {
    const fileName = `receipt_${DateTime.fromISO(receipt?.created).toFormat("y-MM-dd")}`;

    try {
      const file = await RNHTMLtoPDF.convert({
        html: ReceiptHTML(receipt),
        fileName: fileName,
        directory: "Documents",
      });

      await Share.share({
        title: fileName,
        url: `file://${file.filePath}`,
      });
    } catch (err) {
      console.log(err);
    }
  }, [receipt]);

  return (
    <>
      <View style={tw`px-2`}>
        <ViewHeader
          cancelLabel=""
          onSubmit={() => SheetManager.hide("create-receipt")}
          submitLabel="Done"
          title={"Receipt"}
        />

        <View style={tw`pt-1 pb-1 flex flex-row items-center justify-between`}>
          <View>
            <Text style={tw`font-semibold mr-1 text-xl text-gray-600`}>{`Receipt No. ${receiptNo}`}</Text>
          </View>
          <View>
            <TouchableOpacity onPress={sharePDF}>
              <Ionicons name="ios-share-outline" size={24} style={tw`mr-1 text-blue-600`} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={tw`pt-2 pb-1 flex flex-row items-center border-b border-gray-300`}>
          <Text style={tw`text-xs mr-1`}>Customer</Text>
        </View>

        <View style={tw`flex flex-row items-center justify-between`}>
          <View style={tw`flex flex-row items-center my-4`}>
            <UserAvatar size={50} name={customer?.name} src={customer?.image?.uri} style={tw`mr-4`} />
            <View>
              <Text style={tw`py-2 font-semibold`}>{customer?.name}</Text>
              <Text>{customer?.phoneNumbers?.[0].number}</Text>
            </View>
          </View>
          <View style={tw`flex flex-col items-end`}>
            <Image
              source={{ uri: receipt?.signature?.uri }}
              style={{ height: signatureWidth * (281 / 738), width: signatureWidth, transform: [{ rotate: "180deg" }] }}
            />
            <Text style={{ fontSize: 8 }}>Date: {DateTime.fromISO(receipt?.signature?.date).toLocaleString()}</Text>
          </View>
        </View>

        <View style={tw`pt-2 pb-1 flex flex-row items-center border-b border-gray-300`}>
          <Text style={tw`text-xs mr-1`}>Parts</Text>
        </View>
      </View>

      <View style={tw`flex-1`}>
        <FlatList
          data={parts}
          ItemSeparatorComponent={() => <View style={tw`flex border-b border-gray-100`} />}
          ListHeaderComponent={() => {
            return (
              <View style={tw`flex flex-row py-2 px-2`}>
                <Text style={tw`w-7/12 font-bold text-xs`}>Name</Text>
                <Text style={tw`w-2/12 font-bold text-xs text-center`}>Quantity</Text>
                <Text style={tw`w-3/12 font-bold text-xs text-center`}>Price</Text>
              </View>
            );
          }}
          renderItem={({ item }) => {
            return (
              <View style={tw`flex flex-row py-2 px-2 bg-white`}>
                <Text style={tw`w-7/12 text-lg`}>{item.name}</Text>
                <Text style={tw`w-2/12 text-center text-lg`}>{item.quantity}</Text>

                <View style={tw`w-3/12 flex justify-center`}>
                  <Text style={tw`text-right text-lg `}>${item.price}.00</Text>
                </View>
              </View>
            );
          }}
        />
      </View>

      <View style={{ ...tw`px-3 bg-gray-300`, height: 100 }}>
        <View style={tw`flex flex-row py-2 border-t border-gray-300`}>
          <Text style={tw`w-1/3 text-lg font-bold`}>Total</Text>

          <Text numberOfLines={1} style={tw`w-2/3 text-lg font-bold text-right`}>
            {total.toFormat("$0,0.00")}
          </Text>
        </View>
      </View>
    </>
  );
};

const EditableReceiptView: FC<{ receipt: TReceipt; onSave: () => void }> = ({ receipt, onSave }) => {
  const { createReceipt, saveSignature, receipts } = useAppState();
  const mode = getMode(receipt);
  const [receiptNo, setreceiptNo] = useState(`${receipt?.receiptNo ? receipt?.receiptNo : receipts?.length + 1}`);
  const [customer, setcustomer] = useState<Contact>(receipt?.customer ?? null);
  const [parts, setparts] = useState<TPartData[]>(receipt?.parts ?? []);

  const handleSave = async () => {
    if (customer === null) {
      Alert.alert("Please add a customer");
      return;
    }

    const p = parts.filter((p) => p.quantity !== 0);

    if (p.length === 0) {
      Alert.alert("Please add some parts");
      return;
    }

    if (receipt?.id) {
      // updateReceipt({
      //   id:
      //   receiptNo,
      //   customer,
      //   parts: p,
      // });
    } else {
      createReceipt({
        receiptNo,
        customer,
        parts: p,
      });
    }
    onSave();
  };

  const removePart = (index: number) => {
    setparts(parts.filter((_, idx) => index !== idx));
  };

  const openPartsModal = () => {
    SheetManager.show<TPartData[], TPartData[]>("add-parts", {
      context: "create-receipt",
      payload: parts,
      onClose: (data) => {
        if (data) {
          setparts(data);
        }
      },
    });
  };

  const openCustomerModal = () => {
    SheetManager.show<any, any>("pick-customer", {
      context: "create-receipt",
      onClose: (data) => {
        if (data) {
          setcustomer(data);
        }
      },
    });
  };

  const total = useMemo(() => calculateTotalPrice(parts), [parts]);

  const handleUpdatePartQuantity = (idx: number, quantity: number) => {
    parts[idx].quantity = quantity;
    setparts([...parts]);
  };

  const handleUpdatePartPrice = (idx: number, price: number) => {
    parts[idx].price = price;
    setparts([...parts]);
  };

  return (
    <SheetProvider context="create-receipt">
      <View style={tw`px-2`}>
        <ViewHeader
          onCancel={() => SheetManager.hide("create-receipt")}
          onSubmit={() => handleSave()}
          submitLabel="Save"
          title={receipt?.id ? "Edit Receipt" : "Create Receipt"}
        />

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
                  onPress: setreceiptNo,
                },
              ],
              "plain-text",
              receiptNo
            );
          }}
          style={tw`pt-1 pb-1 flex flex-row items-center justify-between`}
        >
          <Text style={tw`font-semibold mr-1 text-xl text-gray-600`}>{`Receipt No. ${receiptNo}`}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => openCustomerModal()}
          style={tw`pt-2 pb-1 flex flex-row items-center border-b border-gray-300`}
        >
          <Text style={tw`text-xs font-semibold mr-1 text-blue-600`}>{customer ? "Edit" : "Add"} Customer</Text>
        </TouchableOpacity>

        {customer ? (
          <View style={tw`flex flex-row items-center justify-between`}>
            <View style={tw`flex flex-row items-center my-4`}>
              <UserAvatar size={50} name={customer?.name} src={customer?.image?.uri} style={tw`mr-4`} />
              <View>
                <Text style={tw`py-2 font-semibold`}>{customer?.name}</Text>
                <Text>{customer?.phoneNumbers?.[0].number}</Text>
              </View>
            </View>
            <View>
              {mode === "update" && (
                <TouchableOpacity
                  onPress={() =>
                    SheetManager.show<never, TSignature>("get-signature", {
                      context: "create-receipt",
                      onClose: (payload) => {
                        if (payload) {
                          saveSignature(receipt?.id, payload);
                        }
                      },
                    })
                  }
                  style={tw`flex flex-row items-center bg-blue-500 rounded-lg py-2 px-2`}
                >
                  <Text style={tw`text-white font-bold mr-2 text-xs`}>Get Signature</Text>
                  <FontAwesome5 style={tw`text-white`} name="pencil-alt" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => openCustomerModal()}
            style={tw`flex flex-row justify-center items-center my-8`}
          >
            <Text style={tw`text-gray-400`}>Tap here to add a customer</Text>
            <FontAwesome5 name="plus-circle" size={12} style={tw`mx-1 text-blue-600`} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => openPartsModal()}
          style={tw`pt-2 pb-1 flex flex-row items-center border-b border-gray-300`}
        >
          <Text style={tw`text-xs mr-1 font-semibold text-blue-600`}>{parts?.length ? "Edit" : "Add"} Parts</Text>
        </TouchableOpacity>
      </View>

      <View style={tw`flex-1`}>
        <FlatList
          data={parts}
          ItemSeparatorComponent={() => <View style={tw`flex border-b border-gray-100`} />}
          ListHeaderComponent={() => {
            return (
              <View style={tw`flex flex-row py-2 px-2`}>
                <Text style={tw`font-bold text-xs w-7/12`}>Name</Text>
                <Text style={tw`font-bold text-xs w-2/12 text-center`}>Quantity</Text>
                <Text style={tw`font-bold text-xs w-3/12 text-center`}>Price</Text>
              </View>
            );
          }}
          ListEmptyComponent={() => {
            return (
              <TouchableOpacity
                onPress={() => openPartsModal()}
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
                              onPress: () => removePart(index),
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
                <View style={tw`flex flex-row items-center py-2 px-2 bg-white`}>
                  <Text style={tw`w-7/12 text-lg`}>{item.name}</Text>
                  <View style={tw`w-2/12`}>
                    <TextInput
                      style={{ textAlign: "center", fontSize: 18, padding: 15 }}
                      value={`${item.quantity}`}
                      keyboardType="number-pad"
                      onChangeText={(text) => handleUpdatePartQuantity(index, text ? parseInt(text) : 0)}
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
                                onPress: () => removePart(index),
                                text: "Yes",
                                style: "destructive",
                              },
                            ]
                          );
                        }
                      }}
                    />
                  </View>

                  <View style={tw`w-3/12 flex justify-center`}>
                    <FakeCurrencyInput
                      numberOfLines={5}
                      placeholder="$0.00"
                      selectTextOnFocus={true}
                      style={tw`text-right text-lg`}
                      prefix="$"
                      separator="."
                      delimiter=","
                      precision={2}
                      value={item.price}
                      minValue={0}
                      maxValue={99999.999999}
                      onBlur={(e) => {
                        if (!item.price) {
                          handleUpdatePartPrice(index, 0.0);
                        }
                      }}
                      onChangeValue={(value) => handleUpdatePartPrice(index, value)}
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
            {total.toFormat()}
          </Text>
        </View>
      </View>
    </SheetProvider>
  );
};
