import { theme } from "@/app/theme";
import { Pressable, Text } from "react-native";


export function Button({ title, onPress }: any) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: theme.colors.primary,
        padding: 14,
        borderRadius: theme.radius.md,
      }}
    >
      <Text style={{ color: "white", textAlign: "center", fontWeight: "600" }}>
        {title}
      </Text>
    </Pressable>
  );
}