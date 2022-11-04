import { FC, useRef } from "react";
import { Dimensions, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import ActionSheet, { SheetManager, SheetProps } from "react-native-actions-sheet";
import SignatureScreen, { SignatureViewRef } from "react-native-signature-canvas";
import tw from "twrnc";
import { TSignature } from "../hooks/appState";
const { height } = Dimensions.get("window");

export const GetSignature: FC<SheetProps> = ({ sheetId }) => {
  const ref = useRef<SignatureViewRef>();

  const handleCancel = () => {
    SheetManager.hide("get-signature", {
      context: "create-receipt",
    });
  };
  const handleOK = (signature: string) => {
    const date = new Date();
    SheetManager.hide<TSignature>("get-signature", {
      context: "create-receipt",
      payload: {
        uri: signature,
        date: date.toISOString(),
      },
    });
  };

  const handleClear = () => {
    ref?.current?.clearSignature();
  };

  const handleConfirm = () => {
    ref?.current?.readSignature();
  };

  return (
    <ActionSheet id={sheetId} isModal>
      <SafeAreaView>
        <View style={{ ...tw`p-4 flex flex-row`, height: height }}>
          <View
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              height: "90%",
              width: 20,
              marginRight: 10,
            }}
          >
            <TouchableOpacity
              onPress={() => handleClear()}
              style={{ position: "absolute", top: 50, transform: [{ rotate: "-90deg" }] }}
            >
              <Text style={tw`text-sm text-gray-400`}>Clear</Text>
            </TouchableOpacity>
          </View>
          <View style={{ backgroundColor: "blue", height: "90%", flex: 1 }}>
            <SignatureScreen backgroundColor="#FFF" ref={ref} onOK={handleOK} autoClear={false} rotated />
          </View>
          <View
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              height: "90%",
              width: 40,
              marginLeft: 10,
            }}
          >
            <TouchableOpacity
              onPress={() => handleConfirm()}
              style={{ ...tw`px-3 py-2`, position: "absolute", top: 50, transform: [{ rotate: "-90deg" }] }}
            >
              <Text style={tw`text-lg text-blue-500`}>Accept</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleCancel()}
              style={{
                ...tw`px-3 py-2`,

                position: "absolute",
                bottom: 50,
                transform: [{ rotate: "-90deg" }],
              }}
            >
              <Text style={tw`text-lg text-blue-500`}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ActionSheet>
  );
};
