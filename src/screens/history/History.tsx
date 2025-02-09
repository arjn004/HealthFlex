import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import RNFS from "react-native-fs";
import Share from "react-native-share";

const History = () => {
    const [completedTimers, setCompletedTimers] = useState<Record<string, any>>({});

    useEffect(() => {
        loadCompletedTimers();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadCompletedTimers(); // Reload timers when screen is focused
        }, [])
    );

    const loadCompletedTimers = async () => {
        try {
            const storedTimers = await AsyncStorage.getItem("timers");
            if (storedTimers) {
                const parsedTimers = JSON.parse(storedTimers);
                const groupedTimers = parsedTimers.reduce((acc: any, timer: any) => {
                    if (timer.status === "Completed") { // Filter only completed timers
                        if (!acc[timer.category]) acc[timer.category] = [];
                        acc[timer.category].push(timer);
                    }
                    return acc;
                }, {});
                setCompletedTimers(groupedTimers);
            }
        } catch (error) {
            console.error("Failed to load completed timers", error);
        }
    };

    const exportTimersToFile = async () => {
        try {
            const filePath = `${RNFS.DocumentDirectoryPath}/timers.json`;
            const jsonContent = JSON.stringify(completedTimers, null, 2);

            await RNFS.writeFile(filePath, jsonContent, "utf8");
            console.log("File saved at:", filePath);

            await Share.open({
                url: `file://${filePath}`,
                type: "application/json",
                title: "Exported Timers",
                message: "Here is your exported timer history!",
            });
        } catch (error) {
            console.error("Error exporting timers:", error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>History</Text>
            {Object.keys(completedTimers).length === 0 ? (
                <Text style={styles.noHistoryText}>No completed timers yet.</Text>
            ) : (
                <FlatList
                    data={Object.keys(completedTimers)}
                    keyExtractor={(category) => category}
                    renderItem={({ item: category }) => (
                        <View style={styles.categoryContainer}>
                            <Text style={styles.categoryHeader}>{category}</Text>
                            {completedTimers[category].map((timer: any, index: number) => (
                                <View key={index} style={styles.timerItem}>
                                    <Text style={styles.timerName}>{timer.name}</Text>
                                    <Text>Status: {timer.status}</Text>
                                    <Text>Completed At: {new Date(timer.completedAt).toLocaleString()}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                />
            )}

            {/* Floating Export Button */}
            <TouchableOpacity style={styles.exportButton} onPress={exportTimersToFile}>
                <Text style={styles.exportButtonText}>📥 Export JSON</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f8f9fa",
    },
    header: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    noHistoryText: {
        textAlign: "center",
        marginTop: 20,
        fontSize: 16,
        color: "gray",
    },
    categoryContainer: {
        marginBottom: 15,
    },
    categoryHeader: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
    },
    timerItem: {
        backgroundColor: "#ffffff",
        padding: 10,
        marginVertical: 5,
        borderRadius: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    timerName: {
        fontSize: 16,
        fontWeight: "bold",
    },
    exportButton: {
        position: "absolute",
        bottom: 20,
        right: 20,
        backgroundColor: "#007bff",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        elevation: 5,
    },
    exportButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default History;
