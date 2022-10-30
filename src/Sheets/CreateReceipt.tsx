import { FontAwesome5 } from "@expo/vector-icons";
import Dinero from "dinero.js";
import * as Contacts from "expo-contacts";
import { Contact } from "expo-contacts";
import { FC, useMemo, useState } from "react";
import { Alert, FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SheetManager, SheetProps, SheetProvider } from "react-native-actions-sheet";
import { Swipeable } from "react-native-gesture-handler";
import UserAvatar from "react-native-user-avatar";
import tw from "twrnc";
import { ViewHeader } from "../components/ViewHeader";
import { TPartData, useAppState } from "../hooks/appState";
import { BaseSheet } from "./Base";

export const CreateReceipt: FC<SheetProps> = (props) => {
  const { createReceipt } = useAppState();
  const [receiptNo, setreceiptNo] = useState("");
  const [customer, setcustomer] = useState<Contact>(null);
  const [parts, setparts] = useState<TPartData[]>([]);

  const handleSave = async () => {
    if (customer === null) {
      return;
    }

    if (parts.length === 0) {
      return;
    }

    createReceipt({
      receiptNo,
      customer,
      parts,
    });
    SheetManager.hide<{ customer: Contacts.Contact; parts: TPartData[] }>(props.sheetId, {
      payload: {
        customer,
        parts,
      },
    });
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

  const total = useMemo(() => {
    return parts?.reduce((acc, part) => {
      const price = Dinero({ amount: part.price * 100, currency: "USD" }).multiply(part.quantity);
      return acc.add(price);
    }, Dinero({ amount: 0, currency: "USD" }));
  }, [parts]);

  const handleUpdatePartQuantity = (idx: number, quantity: number) => {
    parts[idx].quantity = quantity;
    setparts([...parts]);
  };

  const handleUpdatePartPrice = (idx: number, price: number) => {
    parts[idx].price = price;
    setparts([...parts]);
  };

  return (
    <BaseSheet sheetId={props.sheetId}>
      <SheetProvider context="create-receipt">
        <ViewHeader
          onCancel={() => SheetManager.hide("create-receipt")}
          onSubmit={() => handleSave()}
          submitLabel="Save"
          title="Create Receipt"
        />

        <TextInput
          placeholder="Receipt No."
          value={receiptNo}
          onChangeText={setreceiptNo}
          style={tw`border border-gray-400 pt-2 pb-3 px-2 rounded-lg text-lg`}
        />
        <TouchableOpacity
          onPress={() =>
            SheetManager.show<any, any>("pick-customer", {
              context: "create-receipt",
              onClose: (data) => {
                if (data) {
                  setcustomer(data);
                }
              },
            })
          }
        >
          {customer ? (
            <View style={tw`flex flex-row items-center my-4`}>
              <UserAvatar size={50} name={customer?.name} src={customer?.image?.uri} style={tw`mr-4`} />
              <View>
                <Text style={tw`py-2 font-semibold`}>{customer?.name}</Text>
                <Text>{customer?.phoneNumbers?.[0].number}</Text>
              </View>
            </View>
          ) : (
            <View style={tw`my-4 py-4 border border-gray-400 rounded-lg flex flex-row justify-center`}>
              <Text>Add Customer +</Text>
            </View>
          )}
        </TouchableOpacity>
        <View>
          {parts?.length > 0 ? (
            <View style={tw`mb-4`}>
              <View style={tw`py-4 flex flex-row`}>
                <Text style={tw`font-semibold mr-4`}>Parts</Text>

                <TouchableOpacity onPress={() => openPartsModal()}>
                  <Text style={tw`text-gray-400`}>Tap to edit</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={parts}
                ListHeaderComponent={() => {
                  return (
                    <View style={tw`flex flex-row py-2`}>
                      <Text style={tw`w-1/3`}>Name</Text>
                      <Text style={tw`w-1/3 text-center`}>Quantity</Text>
                      <Text style={tw`w-1/3 text-center`}>Price</Text>
                    </View>
                  );
                }}
                renderItem={({ item, index }) => {
                  const price = Dinero({ amount: item.price * 100, currency: "USD" }).multiply(item.quantity);
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
                      <View style={tw`flex flex-row py-2 bg-white`}>
                        <Text style={tw`w-1/3`}>{item.name}</Text>
                        <TextInput
                          style={tw`w-1/3 text-center`}
                          value={`${item.quantity}`}
                          keyboardType="number-pad"
                          onChangeText={(text) => handleUpdatePartQuantity(index, text ? parseInt(text) : 0)}
                        />
                        <TextInput
                          style={tw`w-1/3 text-center`}
                          value={price.toFormat("")}
                          onChangeText={(price) => handleUpdatePartPrice(index, parseInt(price))}
                        />
                      </View>
                    </Swipeable>
                  );
                }}
                ListFooterComponent={() => {
                  return (
                    <View style={tw`flex flex-row py-2 border-t border-gray-300`}>
                      <Text style={tw`w-1/3 font-bold`}>Total</Text>
                      <Text style={tw`w-1/3 text-center`}></Text>
                      <Text style={tw`w-1/3 font-bold text-center`}>{total.toFormat("$0,0.00")}</Text>
                    </View>
                  );
                }}
              />
            </View>
          ) : (
            <TouchableOpacity
              style={tw`my-4 py-4 border border-gray-400 rounded-lg flex flex-row justify-center`}
              onPress={() => openPartsModal()}
            >
              <Text>Add Parts +</Text>
            </TouchableOpacity>
          )}
        </View>
      </SheetProvider>
    </BaseSheet>
  );
};
