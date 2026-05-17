import React from "react";
import { 
  View, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  StatusBar 
} from "react-native";
import ServicePageHeader from "./components/ServicePageHeader";
import ServiceBundles from "./components/ServiceBundles"; 
import SomeServices from "./components/SomeServices";

const COLORS = {
    background: "#F8FAFC",
    white: "#FFFFFF",
};

export default function ServicesScreen({ navigation }) {
    
    // Sections to show after the main header
    const SCREEN_DATA = [
        { id: 'bundles', component: <ServiceBundles /> },
        { id: 'main_services', component: <SomeServices /> },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
            
            <View style={styles.container}>
                <FlatList
                    data={SCREEN_DATA}
                    keyExtractor={(item) => item.id}
                    
                    /* 
                       Placing the header here makes it part of the scroll flow.
                       It will now scroll away as the user moves down.
                    */
                    ListHeaderComponent={<ServicePageHeader />}
                    
                    renderItem={({ item }) => (
                        <View>
                            {item.component}
                        </View>
                    )}
                    
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    decelerationRate="normal" 
                    // Adds a premium bounce effect on iOS
                    bounces={true}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        // We remove paddingTop here because the Header handles its own spacing
        paddingBottom: 120, 
    }
});