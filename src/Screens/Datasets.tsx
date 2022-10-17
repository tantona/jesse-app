import * as DocumentPicker from "expo-document-picker";
import { Button, FlatList, View, Text } from "react-native";
import { readRemoteFile } from "react-native-csv";
import { v4 } from "uuid";
import { TDataset, useAppState, KEY_FORMAT } from "../hooks/appState";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { DateTime } from "luxon";
import { useNavigation } from "@react-navigation/native";
export const Datasets = () => {
  const navigation = useNavigation<any>();
  const { setItem, removeItem } = useAsyncStorage("@datasets");
  const { datasets, addDataset } = useAppState();
  const handlePickFile = async () => {
    const resp = await DocumentPicker.getDocumentAsync();

    if (resp.type === "success") {
      const r = [];
      readRemoteFile(resp.uri, {
        // step: (results: any) => {
        //     r.push( results.data)
        // },
        // transform: (row: any) => {
        //   console.log(row);
        //   return {
        //     id: v4(),
        //     name: row?.[0],
        //     price: row?.[1],
        //   };
        // },
        complete: async (results: { data: any; meta: any; errors: any }, file: any) => {
          const dataset = results.data.map((row: any) => {
            return {
              id: v4(),
              name: row?.[0],
              price: row?.[1],
            };
          });

          await addDataset(dataset);
        },
      });
    }
  };
  return (
    <View>
      <Button title="Back" onPress={() => navigation.navigate("Receipts")} />
      <Button title="delete" onPress={() => removeItem()} />
      <Button title="import" onPress={() => handlePickFile()} />
      <FlatList
        data={datasets ?? []}
        renderItem={({ item, index }) => {
          return (
            <View>
              <Text>Dataset {index + 1}</Text>
              <Text>{item.id}</Text>
            </View>
          );
        }}
      />
    </View>
  );
};
