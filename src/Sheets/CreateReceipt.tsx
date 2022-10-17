import { FC, useState, useRef, useMemo } from "react";
import { View, Text, TextInput, Image, Button, ScrollView, FlatList, TouchableOpacity } from "react-native";
import * as Contacts from "expo-contacts";
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
import { Contact } from "expo-contacts";
import { BaseSheet } from "./Base";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import { useAppState } from "../../hooks/app-state/context";

export const CreateReceipt: FC<SheetProps> = (props) => {
  const { createReceipt } = useAppState();
  const [receiptNo, setreceiptNo] = useState("");
  const [selected, setselected] = useState<Record<string, boolean>>({});
  const actionSheetRef = useRef<ActionSheetRef>(null);
  // const scrollHandlers = useScrollHandlers<ScrollView>("scrollview-1", actionSheetRef);
  // const { scheduleNotification } = useAppState();
  const [customer, setcustomer] = useState<Contact>(null);
  const [parts, setparts] = useState<TPartData[]>([]);

  const handlePressItem = (id: string) => {
    if (!selected[id]) {
      setselected({ ...selected, [id]: true });
      return;
    }
    const s = Object.keys(selected).reduce<Record<string, boolean>>((acc, key) => {
      if (key !== id) {
        acc[key] = true;
      }
      return acc;
    }, {});

    setselected(s);
  };

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

  return (
    <BaseSheet sheetId={props.sheetId}>
      <SheetProvider context="local">
        <View>
          <Button title="Save" onPress={() => handleSave()} />
        </View>
        <TextInput placeholder="Receipt No." value={receiptNo} onChangeText={setreceiptNo} />
        <TouchableOpacity
          onPress={() =>
            SheetManager.show<any, any>("pick-customer", {
              context: "local",
              onClose: (data) => {
                if (data) {
                  setcustomer(data);
                }
              },
            })
          }
        >
          {customer ? (
            <View style={tw`mb-4`}>
              <Text style={tw`py-4 font-semibold`}>Customer</Text>
              <Image source={customer?.image} style={{ width: 50, height: 50 }} />
              <Text>{customer?.name}</Text>
              <Text>{customer?.phoneNumbers?.[0].number}</Text>
            </View>
          ) : (
            <Text>Customer</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            SheetManager.show<TPartData[], TPartData[]>("add-parts", {
              context: "local",
              payload: parts,
              onClose: (data) => {
                if (data) {
                  setparts(data);
                }
              },
            })
          }
        >
          {parts?.length > 0 ? (
            <View style={tw`mb-4`}>
              <Text style={tw`py-4 font-semibold`}>Parts</Text>
              <FlatList
                data={parts}
                renderItem={({ item }) => {
                  return (
                    <View style={tw`flex flex-row justify-between`}>
                      <Text>{item.name}</Text>
                      <Text>{item.price}</Text>
                    </View>
                  );
                }}
              />
            </View>
          ) : (
            <Text>Parts</Text>
          )}
        </TouchableOpacity>
      </SheetProvider>
    </BaseSheet>
  );
};
