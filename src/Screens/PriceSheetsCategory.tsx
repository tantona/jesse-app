import { useCallback, useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { readRemoteFile } from "react-native-csv";
import { v4 } from "uuid";
import { DateTime } from "luxon";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SheetManager } from "react-native-actions-sheet";
import tw from "twrnc";
import { TPartData, useAppState } from "../hooks/appState";
import { FontAwesome5 } from "@expo/vector-icons";
import { BackButton } from "../components/BackButton";
import { RootStackParamList } from "../navigation";
import { Swipeable } from "react-native-gesture-handler";

const parseResults = (row: any) => {
  let price = parseFloat(row?.[1]?.replace(/\,|\$/g, ""));

  if (!price || isNaN(price)) {
    price = -1;
  }

  return {
    id: v4(),
    name: row?.[0],
    price,
  };
};

interface ICompleteArgs {
  data: any[];
  meta: any;
  errors: any;
}

const readCSV = (uri: string) => {
  return new Promise<ICompleteArgs>((resolve) => {
    readRemoteFile(uri, {
      complete: (results: ICompleteArgs, file: any) => {
        resolve(results);
      },
    });
  });
};

export const PriceSheetCategory = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, "PriceSheetCategory">>();
  const { priceSheets, removePricesheet, createPriceSheet } = useAppState();
  const [loading, setloading] = useState(false);
  const category = route.params.category;

  const handlePickFile = useCallback(async () => {
    const resp = await DocumentPicker.getDocumentAsync();
    if (resp.type === "success") {
      setloading(true);
      try {
        const { data } = await readCSV(resp.uri);

        createPriceSheet({
          id: v4(),
          category,
          created: DateTime.now().toString(),
          items: data.map<TPartData>(parseResults),
          fileName: resp?.name ?? "no filename",
        });
        SheetManager.hide("create-price-sheet-category");
      } catch (err) {
        console.log(err);
      } finally {
        setloading(false);
      }
    }

    if (resp.type === "cancel") {
      SheetManager.hide("create-price-sheet-category");
    }
  }, [category]);

  return (
    <View style={tw`px-2 flex flex-col flex-1`}>
      <BackButton />

      <View style={tw`flex flex-row justify-end py-3`}>
        <TouchableOpacity onPress={() => navigation.navigate("Receipts")}>
          <Text style={tw`font-bold text-blue-500`}>Receipts</Text>
        </TouchableOpacity>
      </View>

      <View>
        <Text style={tw`font-bold text-gray-600`}>{category}</Text>
        <Text style={tw`font-bold text-xl mb-2`}>Price Sheets</Text>
      </View>
      <FlatList
        style={tw`flex-1`}
        data={priceSheets?.[category] ?? []}
        ListEmptyComponent={() => {
          return (
            <View style={tw`flex flex-row items-center justify-center mt-16`}>
              <Text style={tw`text-gray-400`}>No price sheets in this category</Text>
            </View>
          );
        }}
        renderItem={({ item, index }) => {
          return (
            <Swipeable
              renderRightActions={() => {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert("Remove price sheet", "Are you sure you want to remove this price sheet?", [
                        { text: "Cancel", style: "cancel" },
                        { text: "Delete", style: "destructive", onPress: () => removePricesheet(category, index) },
                      ]);
                    }}
                    style={tw`bg-red-500 flex items-center justify-center w-1/3`}
                  >
                    <FontAwesome5 name="trash-alt" size={16} style={tw`mr-1 text-white`} />
                  </TouchableOpacity>
                );
              }}
            >
              <View style={tw`mx-2 py-2 flex flex-row items-center bg-white`}>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-lg font-bold`}>#{index + 1}</Text>
                  <Text>Added {DateTime.fromISO(item.created).toLocaleString()}</Text>
                  <Text>{item?.fileName ?? "No filename"}</Text>
                </View>
              </View>
            </Swipeable>
          );
        }}
      />

      <View>
        <TouchableOpacity
          style={tw`flex flex-row items-center py-1 px-2`}
          onPress={() => {
            handlePickFile();
          }}
        >
          <FontAwesome5 name="plus-circle" size={16} style={tw`mr-1 text-blue-600`} />
          <Text style={tw`font-bold text-blue-600`}>Add Price Sheet</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
