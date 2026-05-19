import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";

import { useLocalSearchParams } from "expo-router";

export default function ProductDetailsScreen() {
  const { name, price, image } = useLocalSearchParams();
  const imageUri = Array.isArray(image) ? image[0] : image;
  let router = useRouter()
  return (
    <>
      <StatusBar barStyle="light-content" />

      <View
        style={styles.container}
      >
        <ScrollView>
        <Image source={{ uri: imageUri }} style={styles.image} />

          <View style={styles.content}>
            <Text style={styles.name}>{name}</Text>

            <Text style={styles.price}>{price}</Text>

            <Text style={styles.description}>
              Modern sneakers with premium
              comfort and stylish design for
              everyday use.
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={()=>router.back()}
            >
              <Text style={styles.buttonText}>
                back
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:"#1E1E2A"
  },

  image: {
    width: "100%",
    height: 350,
  },

  content: {
    padding: 24,
  },

  name: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 10,
  },

  price: {
    color: "#8B5CF6",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },

  description: {
    color: "#A1A1AA",
    fontSize: 16,
    lineHeight: 28,
    marginBottom: 30,
  },

  button: {
    height: 60,
    backgroundColor: "#7C3AED",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom:5
  },

  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});