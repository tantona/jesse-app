import { FC, PropsWithChildren } from "react";
import { Dimensions, View } from "react-native";
import ActionSheet from "react-native-actions-sheet";
import tw from "twrnc";

const { height } = Dimensions.get("window");

export const BaseSheet: FC<PropsWithChildren<{ sheetId: string }>> = ({ sheetId, children }) => {
  return (
    <ActionSheet id={sheetId} headerAlwaysVisible isModal gestureEnabled>
      <View style={{ ...tw`p-2`, height: height * 0.92 }}>{children}</View>
    </ActionSheet>
  );
};
