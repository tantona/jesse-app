import "react-native-get-random-values";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Contacts from "expo-contacts";
import * as Linking from "expo-linking";
import { useEffect } from "react";
import { SafeAreaView, Text, View, Dimensions } from "react-native";
import { SheetProvider } from "react-native-actions-sheet";
import tw from "twrnc";
import { RootStackParamList } from "./src/navigation";
import { Receipts } from "./src/Screens/Receipts";
import { Datasets } from "./src/Screens/Datasets";
import { Receipt } from "./src/Screens/Receipt";
import "./src/Sheets";
import { AppStateProvider } from "./src/hooks/appState";
const RootStack = createNativeStackNavigator<RootStackParamList>();

const prefix = Linking.createURL("/");

const Root = () => {
  return (
    <SafeAreaView style={tw`h-full`}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Datasets" component={Datasets} />
        <RootStack.Screen name="Receipts" component={Receipts} />
        <RootStack.Screen name="Receipt" component={Receipt} />
      </RootStack.Navigator>
    </SafeAreaView>
  );
};

export default function App() {
  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Emails, Contacts.Fields.Addresses, Contacts.Fields.PhoneNumbers],
        });

        if (data.length > 0) {
          const contact = data.find((contact) => contact.name === "John Appleseed");
        }
      }
    })();
  }, []);
  return (
    <NavigationContainer<RootStackParamList>
      linking={{
        prefixes: [prefix],
        config: {
          initialRouteName: "Receipts",
          screens: {
            Datasets: "Datasets",
            Receipts: "Receipts",
            Receipt: "Reciept",
          },
        },
      }}
      fallback={<Text>Loading...</Text>}
    >
      <AppStateProvider>
        <SheetProvider>
          <Root />
        </SheetProvider>
      </AppStateProvider>
    </NavigationContainer>
  );
}
