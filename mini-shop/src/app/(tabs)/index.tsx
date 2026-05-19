import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useGetProductsQuery, useRegisterMutation } from "@/services/productsApi";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/store/cartSlice";
import { selectCartCount } from "@/store/cartSlice";
import { useState, useMemo } from "react";

const categories = ["All", "Fashion", "Electronics", "Shoes"];
 

export default function ShopScreen() {
  const [selectedCategory, setSelectedCategory] = useState("All");
const [search, setSearch] = useState("");
     const [registerUser, {data:userdata }] =
       useRegisterMutation();
       console.log("userdata" , userdata)
const dispatch = useDispatch();
const cartCount = useSelector(selectCartCount); 

const { data:productAppi, isLoading, error } = useGetProductsQuery();
const products = productAppi?.data?.items || [];

const filteredProducts = useMemo(() => {
  return products
    .filter((item:any) => {
      // CATEGORY FILTER
      if (selectedCategory === "All") return true;

      return (
        item.category?.toLowerCase() ===
        selectedCategory.toLowerCase()
      );
    })
    .filter((item:any) => {
      // SEARCH FILTER
      return item.name
        ?.toLowerCase()
        .includes(search.toLowerCase());
    });
}, [products, selectedCategory, search]);
  console.log("dataaaaaa" , productAppi)
  let router =useRouter()
  if (isLoading) {
    return <ActivityIndicator size="large" />;
  }


  return (
    <>
      <StatusBar barStyle="light-content" />

      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <View>
              <Text style={styles.welcome}>Welcome 👋</Text>
              <Text style={styles.username}>{userdata?.name || "Guest"}</Text>
            </View>

            <TouchableOpacity style={styles.iconButton}>
              <Text style={{ color: "#fff", fontSize: 18 }}>🔔</Text>
            </TouchableOpacity>
          </View>

          {/* SEARCH */}
          <View style={styles.searchBox}>
            <Text style={{ fontSize: 16, marginRight: 10 }}>🔍</Text>

          <TextInput
  placeholder="Search products..."
  placeholderTextColor="#71717A"
  style={styles.searchInput}
  value={search}
  onChangeText={setSearch}
/>
          </View>

          {/* CATEGORIES */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 30 }}
          >
         {categories.map((item, index) => (
  <TouchableOpacity
    key={index}
    onPress={() => setSelectedCategory(item)}
    style={[
      styles.categoryButton,
      selectedCategory === item && styles.activeCategory,
    ]}
  >
    <Text
      style={[
        styles.categoryText,
        selectedCategory === item && styles.activeCategoryText,
      ]}
    >
      {item}
    </Text>
  </TouchableOpacity>
))}
          </ScrollView>

          {/* PRODUCTS */}
          <View style={styles.productsWrapper}>
            {filteredProducts.map((item:any) => (
              <TouchableOpacity key={item.id} style={styles.card}
               onPress={() =>
    router.push({
      pathname: "../products/productDetails",
      params: {
        name: item.name,
        price: item.price,
        image: item.image_url,
      },
    })
  }
              >
                <Image
                  source={{ uri: item.image_url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e" }}
                  style={styles.productImage}
                />

                <Text style={styles.productName}>{item.name}</Text>

                <Text style={styles.productPrice}>{item.price}</Text>

                <TouchableOpacity 
                style={styles.cartButton}
                 onPress={() =>
    dispatch(
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        image_url: item.image,
      })
    )
  }
                
                >
                  <Text style={{ color: "#fff", marginRight: 6 }}>
                    🛒
                  </Text>

                  <Text style={styles.cartText}>Add</Text>
                </TouchableOpacity>

              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F14",
    paddingTop: 70,
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },

  welcome: {
    color: "#A1A1AA",
    fontSize: 16,
  },

  username: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginTop: 4,
  },

  iconButton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#1E1E2A",
    justifyContent: "center",
    alignItems: "center",
  },

  searchBox: {
    height: 60,
    backgroundColor: "#1E1E2A",
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    marginBottom: 25,
  },

  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
  },

  categoryButton: {
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: "#1E1E2A",
    justifyContent: "center",
    marginRight: 12,
  },

  activeCategory: {
    backgroundColor: "#7C3AED",
  },

  categoryText: {
    color: "#A1A1AA",
    fontWeight: "600",
  },

  activeCategoryText: {
    color: "#fff",
  },

  productsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: "#1A1A22",
    borderRadius: 24,
    padding: 14,
    marginBottom: 18,
  },

  productImage: {
    width: "100%",
    height: 140,
    borderRadius: 18,
    marginBottom: 14,
  },

  productName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },

  productPrice: {
    color: "#8B5CF6",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },

  cartButton: {
    height: 44,
    borderRadius: 16,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  cartText: {
    color: "#fff",
    fontWeight: "600",
  },
});