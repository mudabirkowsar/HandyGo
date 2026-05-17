import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get('window');

const COLORS = {
    primary: "#08B36A",
    secondary: "#0F172A",
    background: "#F8FAFC",
    card: "#FFFFFF",
    text: "#111827",
    subtext: "#6B7280",
    border: "#E5E7EB",
    white: "#FFFFFF",
    accent: "#6366F1",
};

const EarningsScreen = () => {
    // Mock Data for Earnings
    const transactions = [
        { id: '1', service: 'Pipe Leakage Repair', date: '12 May, 2024', amount: '₹299', status: 'Completed' },
        { id: '2', service: 'Full Bathroom Fitting', date: '10 May, 2024', amount: '₹2,500', status: 'Completed' },
        { id: '3', service: 'Tap Replacement', date: '08 May, 2024', amount: '₹150', status: 'Completed' },
        { id: '4', service: 'Kitchen Sink Unclog', date: '05 May, 2024', amount: '₹450', status: 'Completed' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Earnings Header Card */}
                <View style={styles.headerCard}>
                    <Text style={styles.totalLabel}>Available Balance</Text>
                    <Text style={styles.totalAmount}>₹12,450.00</Text>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>This Week</Text>
                            <Text style={styles.statValue}>+ ₹3,200</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Jobs Done</Text>
                            <Text style={styles.statValue}>24</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.withdrawBtn}>
                        <Text style={styles.withdrawBtnText}>Withdraw to Bank</Text>
                        <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
                    </TouchableOpacity>
                </View>

                {/* Weekly Chart Placeholder */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Weekly Revenue</Text>
                    <View style={styles.chartContainer}>
                        {[40, 70, 45, 90, 65, 80, 30].map((height, i) => (
                            <View key={i} style={styles.barWrapper}>
                                <View style={[styles.bar, { height: height, backgroundColor: i === 3 ? COLORS.primary : COLORS.border }]} />
                                <Text style={styles.barLabel}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Transaction History */}
                <View style={styles.section}>
                    <View style={styles.historyHeader}>
                        <Text style={styles.sectionTitle}>Recent Payouts</Text>
                        <TouchableOpacity>
                            <Text style={styles.viewAll}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    {transactions.map((item) => (
                        <View key={item.id} style={styles.transactionCard}>
                            <View style={styles.iconBox}>
                                <Ionicons name="receipt-outline" size={20} color={COLORS.primary} />
                            </View>
                            <View style={styles.transDetails}>
                                <Text style={styles.transService}>{item.service}</Text>
                                <Text style={styles.transDate}>{item.date}</Text>
                            </View>
                            <View style={styles.transAmountBox}>
                                <Text style={styles.transAmount}>{item.amount}</Text>
                                <Text style={styles.transStatus}>{item.status}</Text>
                            </View>
                        </View>
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: 30,
        paddingBottom: 40,
    },
    headerCard: {
        backgroundColor: COLORS.secondary,
        margin: 20,
        borderRadius: 30,
        padding: 25,
        alignItems: 'center',
        elevation: 10,
        shadowColor: COLORS.secondary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    totalLabel: {
        color: COLORS.subtext,
        fontSize: 14,
        fontWeight: '600',
    },
    totalAmount: {
        color: COLORS.white,
        fontSize: 36,
        fontWeight: '900',
        marginVertical: 10,
    },
    statsRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-around',
        marginTop: 10,
        marginBottom: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        color: COLORS.subtext,
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    statValue: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '800',
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    withdrawBtn: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 15,
    },
    withdrawBtnText: {
        color: COLORS.white,
        fontWeight: '800',
        fontSize: 14,
        marginRight: 8,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.secondary,
        marginBottom: 15,
    },
    chartContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 150,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    barWrapper: {
        alignItems: 'center',
    },
    bar: {
        width: 12,
        borderRadius: 6,
    },
    barLabel: {
        fontSize: 10,
        color: COLORS.subtext,
        marginTop: 8,
        fontWeight: '700',
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    viewAll: {
        color: COLORS.primary,
        fontSize: 13,
        fontWeight: '700',
    },
    transactionCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    iconBox: {
        width: 45,
        height: 45,
        borderRadius: 12,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    transDetails: {
        flex: 1,
        marginLeft: 15,
    },
    transService: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.secondary,
    },
    transDate: {
        fontSize: 12,
        color: COLORS.subtext,
        marginTop: 2,
    },
    transAmountBox: {
        alignItems: 'flex-end',
    },
    transAmount: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.secondary,
    },
    transStatus: {
        fontSize: 10,
        color: COLORS.primary,
        fontWeight: '700',
        marginTop: 2,
    }
});

export default EarningsScreen;