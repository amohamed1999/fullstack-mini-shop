import { useGetMyOrdersQuery } from "@/services/productsApi";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from "react-native";

export interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  quantity: number;
  product_id: string;
  unit_price: number;
  products: Product;
}

export interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  created_at: string;
  order_items: OrderItem[];
}

export default function OrdersScreen() {
  const {data:myOrders , isLoading}=useGetMyOrdersQuery(undefined)
  console.log("ordeeers" , myOrders)
  return (
    <>
      <StatusBar barStyle="light-content" />

      <View style={styles.container}>
        <ScrollView style={{ padding: 20 }}>
          <Text style={styles.title}>My Orders</Text>

          {myOrders?.data?.map((item: Order) => {
            return (
              <View style={styles.card} key={item.id}>
                <View style={styles.row}>
                  <Text style={styles.orderId}>Order #{item.id}</Text>
                </View>

                <Text style={styles.date}>
                  {new Date(item.created_at).toDateString()}
                </Text>

                <Text style={styles.price}>${item.total_amount.toFixed(2)}</Text>
              </View>
            );
          })}
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
    marginBottom: 30,
    marginTop: 50,
  },

  card: {
    backgroundColor: "#1A1A22",
    borderRadius: 22,
    padding: 20,
    marginBottom: 18,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  orderId: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  status: {
    backgroundColor: "#7C3AED",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },

  statusText: {
    color: "#fff",
    fontWeight: "600",
  },

  date: {
    color: "#A1A1AA",
    marginBottom: 12,
  },

  price: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
});