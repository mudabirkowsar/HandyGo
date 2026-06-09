import React from "react";
import { SafeAreaView, StyleSheet, FlatList, StatusBar, View } from "react-native";
import TopComponent from "./components/TopComponent";
import SearchComponent from "./components/SearchComponent";
import ProductsBanner from "./components/ProductsBanner";
import Products from "./components/Products";

const ProductsScreen = () => {
  // Define our dashboard segments as a structured data array
  const screenSections = [
    { id: "top-header", component: <TopComponent /> },
    { 
      id: "search-bar", 
      component: (
        // FIX: Wrapping the SearchComponent in a View with absolute top padding 
        // ensures that when it sticks, it maintains a beautiful gap from the screen top.
        <View style={styles.stickyWrapper}>
          <SearchComponent />
        </View>
      ) 
    },
    { id: "promo-carousel", component: <ProductsBanner /> },
    { id: "product-grid", component: <Products /> },
  ];

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" />
      
      <FlatList
        data={screenSections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => item.component}
        showsVerticalScrollIndicator={false}
        // index positioning indicator tells FlatList that the wrapped SearchComponent stays sticky
        stickyHeaderIndices={[1]} 
        contentContainerStyle={styles.scrollContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF", 
  },
  scrollContent: {
    backgroundColor: "#F8FAFC", 
    paddingBottom: 30,
  },
  stickyWrapper: {
    backgroundColor: "#FFFFFF", // Matches your white header/search bar background color
    paddingTop: 8,              // This sets it exactly "a little below" the top when stuck!
    paddingBottom: 4,           // Subtle spacing beneath the search bar
  },
});

export default ProductsScreen;