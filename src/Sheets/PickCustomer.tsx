import * as Contacts from "expo-contacts";
import Fuse from "fuse.js";
import { FC, useEffect, useMemo, useState } from "react";
import { FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SheetManager, SheetProps } from "react-native-actions-sheet";
import UserAvatar from "react-native-user-avatar";
import tw from "twrnc";
import { ViewHeader } from "../components/ViewHeader";
import { BaseSheet } from "./Base";

export const PickCustomer: FC<SheetProps> = (props) => {
  const [query, setQuery] = useState("");
  const [contacts, setcontacts] = useState<Contacts.Contact[]>([]);
  const fetchContacts = async () => {
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.Emails, Contacts.Fields.Addresses, Contacts.Fields.PhoneNumbers, Contacts.Fields.Image],
    });

    setcontacts(data ?? []);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const data = contacts;

  const fuse = useMemo(
    () =>
      new Fuse(data, {
        keys: ["name"],
      }),
    [data]
  );

  const onCancel = () => {
    SheetManager.hide<any>(props.sheetId, {
      payload: null,
      context: "create-receipt",
    });
  };

  const handlePressItem = (contact: Contacts.Contact) => {
    SheetManager.hide<any>(props.sheetId, {
      payload: contact,
      context: "create-receipt",
    });
  };

  return (
    <BaseSheet sheetId={props.sheetId}>
      <ViewHeader title="Pick Customer" onCancel={onCancel} />

      <TextInput
        clearButtonMode="always"
        placeholder="Search..."
        style={tw`border border-gray-400 pt-2 pb-3 px-2 rounded-lg text-lg`}
        value={query}
        onChangeText={(text) => setQuery(text)}
      />

      <FlatList
        data={query !== "" ? fuse.search(query).map((item) => item.item) : data}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity style={tw`py-2 px-2 flex flex-row items-center`} onPress={() => handlePressItem(item)}>
              <UserAvatar size={50} name={item.name} src={item.image?.uri} style={tw`mr-4`} />

              <Text style={tw`text-lg font-semibold`}>{item.name}</Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={() => (
          <View style={tw`py-4 px-2`}>
            <Text style={tw`text-lg font-semibold text-center text-gray-400`}>No parts found</Text>
          </View>
        )}
      />
    </BaseSheet>
  );
};
