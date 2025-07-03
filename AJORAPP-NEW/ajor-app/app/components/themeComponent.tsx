// components/ThemedComponents.tsx
import {
  View as RNView,
  Text as RNText,
  TextInput as RNTextInput,
} from "react-native";
import { useTheme } from "./themeContext";

const ThemedView = ({ style, ...props }) => {
  const { colors } = useTheme();
  return (
    <RNView
      style={[{ backgroundColor: colors.background }, style]}
      {...props}
    />
  );
};

export const ThemedText = ({ style, ...props }) => {
  const { colors } = useTheme();
  return <RNText style={[{ color: colors.text }, style]} {...props} />;
};

export const ThemedTextInput = ({ style, ...props }) => {
  const { colors } = useTheme();
  return (
    <RNTextInput
      style={[
        {
          color: colors.text,
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        style,
      ]}
      placeholderTextColor={colors.text}
      {...props}
    />
  );
};
export default ThemedView;