import { theme } from "@/app/theme";
import { View, Text, Image, Pressable } from "react-native";

export default function ProductCard({ item, onAdd }: any) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.lg,
        padding: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
      }}
    >
      <Image
        source={{ uri: item.image }}
        style={{
          height: 120,
          borderRadius: 14,
          marginBottom: 10,
        }}
      />

      <Text style={{ fontWeight: "700", fontSize: 14 }}>
        {item.name}
      </Text>

      <Text style={{ color: theme.colors.muted, marginTop: 4 }}>
        {item.category}
      </Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 10,
          alignItems: "center",
        }}
      >
        <Text style={{ fontWeight: "700", color: theme.colors.primary }}>
          ${item.price}
        </Text>

        <Pressable
          onPress={onAdd}
          style={{
            backgroundColor: theme.colors.accent,
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "white", fontSize: 12 }}>Add</Text>
        </Pressable>
      </View>
    </View>
  );
}