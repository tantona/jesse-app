import * as DocumentPicker from "expo-document-picker";
import { Button, FlatList, View, Text, TouchableOpacity } from "react-native";
import { readRemoteFile } from "react-native-csv";
import { v4 } from "uuid";
import tw from "twrnc";
import { TDataset, useAppState, KEY_FORMAT, TPartData } from "../hooks/appState";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { DateTime } from "luxon";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome5 } from "@expo/vector-icons";

export const Datasets = () => {
  const navigation = useNavigation<any>();
  const { datasets, addDataset } = useAppState();
  const handlePickFile = async () => {
    const resp = await DocumentPicker.getDocumentAsync();

    if (resp.type === "success") {
      const r = [];
      readRemoteFile(resp.uri, {
        complete: (results: { data: any[]; meta: any; errors: any }, file: any) => {
          addDataset({
            id: v4(),
            created: DateTime.now().toString(),
            items: results.data.map<TPartData>((row: any) => {
              let price = parseFloat(row?.[1]?.replace(/\,|\$/g, ""));

              if (!price || isNaN(price)) {
                price = -1;
              }

              return {
                id: v4(),
                name: row?.[0],
                price: price,
              };
            }),
          });
        },
      });
    }
  };
  return (
    <View style={tw`px-2`}>
      <View style={tw`flex flex-row justify-end py-3`}>
        <TouchableOpacity onPress={() => navigation.navigate("Receipts")}>
          <Text style={tw`font-bold text-blue-500`}>Receipts</Text>
        </TouchableOpacity>
      </View>

      <View>
        <Text style={tw`font-bold text-xl mb-2`}>Price Sheets</Text>

        <FlatList
          data={datasets ?? []}
          renderItem={({ item, index }) => {
            return (
              <View style={tw`mx-2 py-2`}>
                <Text style={tw`text-lg font-bold`}>#{index + 1}</Text>
                <Text>Created {DateTime.fromISO(item.created).toLocaleString()}</Text>
              </View>
            );
          }}
        />
        <TouchableOpacity
          onPress={() => handlePickFile()}
          style={tw`flex flex-row justify-center border border-gray-400 py-4 rounded-lg`}
        >
          <Text>Add Price Sheet +</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
