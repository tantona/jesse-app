import { useNavigation } from "@react-navigation/native";
import { DateTime } from "luxon";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SheetManager } from "react-native-actions-sheet";
import tw from "twrnc";
import { useAppState } from "../hooks/appState";
import { FontAwesome5 } from "@expo/vector-icons";

export const PriceSheets = () => {
  const navigation = useNavigation<any>();
  const { priceSheets } = useAppState();

  return (
    <View style={tw`px-2 flex flex-col flex-1`}>
      <View style={tw`flex flex-row justify-end py-3`}>
        <TouchableOpacity onPress={() => navigation.navigate("Receipts")}>
          <Text style={tw`font-bold text-blue-500`}>Receipts</Text>
        </TouchableOpacity>
      </View>

      <View>
        <Text style={tw`font-bold text-xl mb-2`}>Price Sheets</Text>
      </View>
      <FlatList
        style={tw`flex-1`}
        data={priceSheets ?? []}
        renderItem={({ item, index }) => {
          return (
            <View style={tw`mx-2 py-2 flex flex-row items-center`}>
              <View style={tw`flex-1`}>
                <Text style={tw`text-lg font-bold`}>#{index + 1}</Text>
                <Text>Created {DateTime.fromISO(item.created).toLocaleString()}</Text>
              </View>
              <View>
                <View style={tw`bg-blue-800 py-1 px-2 rounded rounded-full`}>
                  <Text style={tw`text-xs text-white`}>{item.category}</Text>
                </View>
              </View>
            </View>
          );
        }}
      />

      <View>
        <TouchableOpacity
          style={tw`flex flex-row items-center py-1 px-2`}
          onPress={() => {
            SheetManager.show("create-price-sheet");
          }}
        >
          <FontAwesome5 name="plus-circle" size={16} style={tw`mr-1 text-blue-600`} />
          <Text style={tw`font-bold text-blue-600`}>Add Price Sheet</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
