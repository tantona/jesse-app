import { useNavigation } from "@react-navigation/native";
import { DateTime } from "luxon";
import { Alert, FlatList, Text, TouchableOpacity, View, Button, SafeAreaView } from "react-native";
import { SheetManager } from "react-native-actions-sheet";
import tw from "twrnc";
import { useAppState } from "../hooks/appState";
import { FontAwesome5 } from "@expo/vector-icons";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation";

export const PriceSheets = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, "PriceSheetCategory">>();
  const { priceSheets, categories, clear } = useAppState();

  return (
    <SafeAreaView style={tw`flex-1`}>
      <View style={tw`px-2 flex flex-col flex-1`}>
        <View style={tw`flex flex-row justify-end py-3`}>
          <TouchableOpacity onPress={() => navigation.navigate("Receipts")}>
            <Text style={tw`font-bold text-blue-500`}>Receipts</Text>
          </TouchableOpacity>
        </View>

        <View>
          <Text style={tw`font-bold text-xl mb-2`}>Price Sheet Categories</Text>
        </View>
        <FlatList
          style={tw`flex-1`}
          data={Array.from(categories) ?? []}
          ListEmptyComponent={() => {
            return (
              <View style={tw`flex flex-row items-center justify-center mt-16`}>
                <Text style={tw`text-gray-400`}>No categories yet</Text>
              </View>
            );
          }}
          renderItem={({ item, index }) => {
            return (
              <TouchableOpacity
                style={tw`px-2 py-4 flex flex-row items-center border-b border-b-gray-200`}
                onPress={() => {
                  navigation.navigate("PriceSheetCategory", { category: item });
                }}
              >
                <View style={tw`flex-1`}>
                  <Text style={tw`text-lg`}>{item}</Text>
                </View>
                <View>
                  <FontAwesome5 name="chevron-right" />
                </View>
              </TouchableOpacity>
            );
          }}
        />

        <View>
          <TouchableOpacity
            style={tw`flex flex-row items-center py-1 px-2`}
            onPress={() => {
              SheetManager.show("create-price-sheet-category");
            }}
          >
            <FontAwesome5 name="plus-circle" size={16} style={tw`mr-1 text-blue-600`} />
            <Text style={tw`font-bold text-blue-600`}>Add Category</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
