import { FC, PropsWithChildren } from "react";
import { Dimensions, View } from "react-native";
import ActionSheet, { ActionSheetProps } from "react-native-actions-sheet";
import tw from "twrnc";

const { height } = Dimensions.get("window");

export const BaseSheet: FC<PropsWithChildren<ActionSheetProps>> = ({ id, children, ...rest }) => {
  return (
    <ActionSheet id={id} headerAlwaysVisible isModal {...rest}>
      <View style={{ ...tw`p-2`, height: height * 0.92 }}>{children}</View>
    </ActionSheet>
  );
};
