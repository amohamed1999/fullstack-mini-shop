import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  FlatList,
  ActivityIndicator,
  
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { clearCart, selectCartItems } from "@/store/cartSlice";
import { useCreateOrderMutation } from "@/services/productsApi";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
export default function CartScreen() {
  let router = useRouter()
let dispatch=useDispatch()
const [createOrder, { isLoading }] =
  useCreateOrderMutation();

  const items = useSelector(selectCartItems);
  const subtotal = items.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0
);
const orderItems = items.map((item) => ({
  productId: item.id,
  quantity: item.quantity,
}));

const shipping = items.length ? 10 : 0;
const total = subtotal + shipping;

const handleCheckout = async () => {
  try {
    let oerder= await createOrder({
      items: orderItems,
    }).unwrap();
    console.log("order" , oerder)

    dispatch(clearCart());

    Toast.show({
      type: "success",
      text1: "Order Created Successfully",
    });

    router.replace("/orders");

  } catch (error) {
    Toast.show({
      type: "error",
      text1: "Checkout Failed",
    });
  }
};

if (isLoading) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator
        size="large"
        color="#8B5CF6"
      />

      <Text style={styles.loadingText}>
        Processing Order...
      </Text>
    </View>
  );
}

  return (
    <>
      <StatusBar barStyle="light-content" />

  <View style={styles.container}>
        <ScrollView style={{ padding: 20 }}>
          <Text style={styles.title}>My Cart</Text>
           {items.map((item) => (
    <View key={item.id} style={styles.card}>
      <Image
        source={{
          uri:
            item.image_url ||
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
        }}
        style={styles.image}
      />

      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>{item.price}</Text>
      </View>
    </View>
  ))}

  <View style={styles.summary}>
    <View style={styles.row}>
      <Text style={styles.label}>Subtotal</Text>
      <Text style={styles.value}>${subtotal}</Text>
    </View>

    <View style={styles.row}>
      <Text style={styles.label}>Shipping</Text>
      <Text style={styles.value}>${shipping}</Text>
    </View>

    <View style={styles.row}>
      <Text style={styles.total}>Total</Text>
      <Text style={styles.total}>
        ${Number(total).toFixed(1)}
      </Text>
    </View>
  </View>
          
          {/* BUTTON */}
  <TouchableOpacity
  style={styles.button}
  onPress={handleCheckout}
>
  <Text style={styles.buttonText}>
    Checkout
  </Text>
</TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F14",
  },

  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 24,
    marginTop: 50,
  },

  card: {
    backgroundColor: "#1A1A22",
    borderRadius: 22,
    padding: 16,
    flexDirection: "row",
    marginBottom: 30,
  },

  image: {
    width: 90,
    height: 90,
    borderRadius: 18,
    marginRight: 16,
  },

  name: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },

  price: {
    color: "#8B5CF6",
    fontSize: 20,
    fontWeight: "700",
  },

  summary: {
    backgroundColor: "#1A1A22",
    borderRadius: 22,
    padding: 20,
    marginBottom: 30,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  label: {
    color: "#A1A1AA",
    fontSize: 16,
  },

  value: {
    color: "#fff",
    fontSize: 16,
  },

  total: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  button: {
    height: 60,
    backgroundColor: "#7C3AED",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  loadingContainer: {
  flex: 1,
  backgroundColor: "#0F0F14",
  justifyContent: "center",
  alignItems: "center",
},

loadingText: {
  color: "#fff",
  marginTop: 16,
  fontSize: 16,
  fontWeight: "600",
},
});