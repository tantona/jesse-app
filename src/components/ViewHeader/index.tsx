import { FC } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import tw from "twrnc";

export const ViewHeader: FC<{
  onCancel?: () => void;
  onSubmit?: () => void;
  cancelLabel?: string;
  submitLabel?: string;
  title: string;
}> = ({ onCancel, onSubmit, cancelLabel, submitLabel, title }) => {
  return (
    <View style={tw`flex flex-row items-center mb-3`}>
      <View style={tw`w-3/12`}>
        {onCancel && (
          <TouchableOpacity onPress={() => onCancel()} style={tw`py-2`}>
            <Text style={tw`text-lg text-gray-500`}>{cancelLabel ?? "Cancel"}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={tw`w-6/12`}>
        <Text style={tw`text-center text-lg font-bold`}>{title}</Text>
      </View>
      <View style={tw`w-3/12 flex flex-row justify-end`}>
        {onSubmit && (
          <TouchableOpacity>
            <Text style={tw`text-lg text-blue-500 py-2`} onPress={() => onSubmit()}>
              {submitLabel ?? "Submit"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
