import "react-native-get-random-values";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Contacts from "expo-contacts";
import * as Linking from "expo-linking";
import { FC, useEffect } from "react";
import { SafeAreaView, Text, View, TouchableOpacity } from "react-native";
import { SheetProvider } from "react-native-actions-sheet";
import tw from "twrnc";
import { RootStackParamList } from "./src/navigation";
import { Receipts } from "./src/Screens/Receipts";
import { PriceSheets } from "./src/Screens/PriceSheets";
import "./src/Sheets";
import { AppStateProvider } from "./src/hooks/appState";
import { DefaultTheme } from "@react-navigation/native";
import { PriceSheetCategory } from "./src/Screens/PriceSheetsCategory";
import PagerView from "react-native-pager-view";

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#FFFFFF",
  },
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

const prefix = Linking.createURL("/");

const Intro = () => {
  const navigation = useNavigation<any>();
  return (
    <PagerView style={tw`flex-1 `} initialPage={0}>
      <View style={tw`bg-red-400 flex flex-col items-center justify-center`} key="1">
        <Text>First page</Text>
        <Text>Swipe ➡️</Text>
      </View>
      <View style={tw`bg-blue-400 flex flex-col items-center justify-center`} key="2">
        <Text>Second page</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Receipts")}>
          <Text>Get Started</Text>
        </TouchableOpacity>
      </View>
    </PagerView>
  );
};

const Root = () => {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="PriceSheets">
      {/* <RootStack.Screen name="Intro" component={Intro} /> */}
      <RootStack.Screen name="PriceSheets" component={PriceSheets} />
      <RootStack.Screen name="PriceSheetCategory" component={PriceSheetCategory} />
      <RootStack.Screen name="Receipts" component={Receipts} />
    </RootStack.Navigator>
  );
};

const App: FC = () => {
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
      theme={MyTheme}
      linking={{
        prefixes: [prefix],
        config: {
          initialRouteName: "Receipts",
          screens: {
            PriceSheets: "PriceSheets",
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
};

export default App;
