import React, { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";

const Home = () => {
    const navigation = useNavigation();
    const [timers, setTimers] = useState({});
    const [expandedCategories, setExpandedCategories] = useState({});
    const [intervals, setIntervals] = useState({}); // Store intervals
    const [modalVisible, setModalVisible] = useState(false);
    const [completedTimerName, setCompletedTimerName] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        loadTimers();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadTimers();  // Reload timers whenever Home gains focus
        }, [])
    );

    const loadTimers = async () => {
        try {
            const storedTimers = await AsyncStorage.getItem("timers");
            console.log("Timers", storedTimers)
            if (storedTimers) {
                const parsedTimers = JSON.parse(storedTimers);
                const groupedTimers = parsedTimers.reduce((acc, timer) => {
                    acc[timer.category] = acc[timer.category] || [];
                    acc[timer.category].push({ ...timer, remainingTime: timer.duration, status: timer.status });
                    return acc;
                }, {});
                setTimers(groupedTimers);
                setCategories(["All", ...Object.keys(groupedTimers)]);
            }
        } catch (error) {
            console.error("Failed to load timers", error);
        }
    };

    const toggleCategory = (category) => {
        setExpandedCategories((prev) => ({
            ...prev,
            [category]: !prev[category],
        }));
    };

    const updateTimerStatus = (category, timerId, newStatus) => {
        setTimers((prevTimers) => {
            const updatedTimers = { ...prevTimers };
            updatedTimers[category] = updatedTimers[category].map((timer) =>
                timer.id === timerId ? { ...timer, status: newStatus } : timer
            );
            return updatedTimers;
        });
    };

    const handleStart = (category, timerId) => {
        if (intervals[timerId]) return; // Prevent multiple intervals
    
        updateTimerStatus(category, timerId, "Running");
    
        const interval = setInterval(async () => {
            setTimers((prevTimers) => {
                const updatedTimers = { ...prevTimers };
                updatedTimers[category] = updatedTimers[category].map((timer) => {
                    if (timer.id === timerId) {
                        if (timer.remainingTime > 0) {
                            return { ...timer, remainingTime: timer.remainingTime - 1 };
                        } else {
                            clearInterval(intervals[timerId]);
                            setIntervals((prev) => {
                                const newIntervals = { ...prev };
                                delete newIntervals[timerId];
                                return newIntervals;
                            });
    
                            // Only show modal if not already completed
                            if (timer.status !== "Completed") {
                                setCompletedTimerName(timer.name);
                                setModalVisible(true);
                            }
    
                            // Update the existing timers in AsyncStorage
                            const completedTimer = {
                                ...timer,
                                status: "Completed",
                                completedAt: new Date().toISOString(),
                            };
    
                            updateAsyncStorage(category, completedTimer);
    
                            return completedTimer;
                        }
                    }
                    return timer;
                });
                return updatedTimers;
            });
        }, 1000);
    
        setIntervals((prev) => ({ ...prev, [timerId]: interval }));
    };
    
    
    // Function to save completed timer in AsyncStorage
    const updateAsyncStorage = async (category, updatedTimer) => {
        try {
            const storedTimers = await AsyncStorage.getItem("timers");
            if (storedTimers) {
                let parsedTimers = JSON.parse(storedTimers);
                
                // Find and update the specific timer
                parsedTimers = parsedTimers.map(timer =>
                    timer.id === updatedTimer.id ? updatedTimer : timer
                );
    
                await AsyncStorage.setItem("timers", JSON.stringify(parsedTimers));
            }
        } catch (error) {
            console.error("Failed to update timer status in AsyncStorage:", error);
        }
    };
    
    
    

    const handlePause = (category, timerId) => {
        if (intervals[timerId]) {
            clearInterval(intervals[timerId]);
            setIntervals((prev) => {
                const newIntervals = { ...prev };
                delete newIntervals[timerId];
                return newIntervals;
            });
        }
        updateTimerStatus(category, timerId, "Paused");
    };

   const handleReset = (category, timerId, originalDuration) => {
    // Clear any existing interval
    if (intervals[timerId]) {
        clearInterval(intervals[timerId]);
        setIntervals((prev) => {
            const newIntervals = { ...prev };
            delete newIntervals[timerId];
            return newIntervals;
        });
    }

    // Reset the timer's state without starting it
    setTimers((prevTimers) => {
        const updatedTimers = { ...prevTimers };
        updatedTimers[category] = updatedTimers[category].map((timer) =>
            timer.id === timerId
                ? { ...timer, remainingTime: originalDuration, status: "Paused" } // Ensure it stays paused
                : timer
        );
        return updatedTimers;
    });
};

    const handleStartAll = (category) => {
        timers[category].forEach((timer) => {
            if (timer.status !== "Running") {
                handleStart(category, timer.id);
            }
        });
    };
    
    const handlePauseAll = (category) => {
        timers[category].forEach((timer) => {
            if (timer.status === "Running") {
                handlePause(category, timer.id);
            }
        });
    };
    
    const handleResetAll = (category) => {
        timers[category].forEach((timer) => {
            handleReset(category, timer.id, timer.duration);
        });
    };

    const getFilteredCategories = () => {
        const categoryMap = {};
      
        timers.forEach((timer) => {
          if (timer.status !== "Completed") {
            if (!categoryMap[timer.category]) {
              categoryMap[timer.category] = [];
            }
            categoryMap[timer.category].push(timer);
          }
        });
      
        return Object.keys(categoryMap).map((category) => ({
          category,
          timers: categoryMap[category],
        }));
      };

  

    return (
        <View style={styles.container}>
            <Text style={styles.header}>HealthFlex Timers</Text>

            <View style={styles.pickerContainer}>
                <Text style={styles.filterLabel}>Filter by Category:</Text>
                <Picker
                    selectedValue={selectedCategory}
                    onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                    style={styles.picker}
                >
                    {categories.map((category) => (
                        <Picker.Item key={category} label={category} value={category} />
                    ))}
                </Picker>
            </View>
            
            <FlatList
              data={Object.keys(timers).filter(
                (category) =>
                    (selectedCategory === "All" || category === selectedCategory) &&
                    timers[category].some((timer) => timer.status !== "Completed")
            )}

                keyExtractor={(category) => category}
                renderItem={({ item: category }) => (


                    <View style={styles.categoryContainer}>

                        <TouchableOpacity onPress={() => toggleCategory(category)}>
                            <Text style={styles.categoryTitle}>{category}</Text>
                        </TouchableOpacity>

                        <View style={styles.bulkActions}>
        <TouchableOpacity onPress={() => handleStartAll(category)} style={styles.bulkButton}>
            <Text>Start All</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handlePauseAll(category)} style={styles.bulkButton}>
            <Text>Pause All</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleResetAll(category)} style={styles.bulkButton}>
            <Text>Reset All</Text>
        </TouchableOpacity>
    </View>
                        {expandedCategories[category] && (
                            <FlatList
                            data={timers[category].filter(timer => timer.status !== "Completed")}

                                keyExtractor={(timer) => timer.id.toString()}
                                renderItem={({ item: timer }) => (
                                    <View style={styles.timerItem}>
                                        {/* Background progress bar */}
                                        <View
                                            style={{
                                                position: "absolute",
                                                left: 0,
                                                top: 0,
                                                bottom: 0,
                                                width: `${((timer.duration - timer.remainingTime) / timer.duration) * 100}%`,
                                                backgroundColor: "lightgreen",
                                                borderTopLeftRadius: 5, // Only round left corners
                                                borderBottomLeftRadius: 5, // Only round left corners
                                            }}
                                        />

                                        {/* Timer Content */}
                                        <Text style={{color: "black"}}>{timer.name} - {timer.remainingTime}s</Text>
                                        <Text style={{color: "black"}}>Status: {timer.status}</Text>
                                        <View style={styles.buttonRow}>
                                            <TouchableOpacity onPress={() => handleStart(category, timer.id)} style={styles.startButton}>
                                                <Text>Start</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handlePause(category, timer.id)} style={styles.pauseButton}>
                                                <Text>Pause</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleReset(category, timer.id, timer.duration)} style={styles.resetButton}>
                                                <Text>Reset</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                )}
                            />
                        )}
                    </View>
                )}
            />
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>🎉 {completedTimerName} Completed! 🎉</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
                            <Text>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            {/* Floating Button to Add New Timer */}
            <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate("NewTimer")}>
                <Text style={styles.plusText}>+</Text>
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
    categoryContainer: {
        marginBottom: 15,
        backgroundColor: "#e3f2fd",
        padding: 10,
        borderRadius: 5,
    },
    categoryTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    timerItem: {
        backgroundColor: "#ffffff",
        padding: 10,
        marginVertical: 5,
        borderRadius: 5,
        overflow: "hidden",
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 5,
    },
    startButton: {
        backgroundColor: "lightgreen",
        padding: 5,
        borderRadius: 12,
        height: 40,
        width: "25%",
        alignItems: "center",
        justifyContent: "center",
        borderColor: "black",
        borderWidth: 1
    },
    pauseButton: {
        backgroundColor: "#FF6961",
        padding: 5,
        borderRadius: 12,
        height: 40,
        width: "25%",
        alignItems: "center",
        justifyContent: "center",
        borderColor: "black",
        borderWidth: 1
    },
    resetButton: {
        backgroundColor: "dodgerblue",
        padding: 5,
        borderRadius: 12,
        height: 40,
        width: "25%",
        alignItems: "center",
        justifyContent: "center",
        borderColor: "black",
        borderWidth: 1
    },
    floatingButton: {
        position: "absolute",
        bottom: 20,
        right: 20,
        width: 60,
        height: 60,
        backgroundColor: "skyblue",
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 5 },
    },
    plusText: {
        fontSize: 30,
        color: "white",
        fontWeight: "bold",
    },
    bulkActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 5,
    },
    bulkButton: {
        backgroundColor: "#ccc",
        padding: 8,
        borderRadius: 5,
        alignItems: "center",
        flex: 1,
        marginHorizontal: 5,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
    },
    modalText: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    modalButton: {
        backgroundColor: "dodgerblue",
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    pickerContainer: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
    filterLabel: { fontSize: 16, marginRight: 10 },
    picker: { flex: 1,
         height: 55,
          backgroundColor: "#e3f2fd",
           borderRadius: 5, 
           color: "black",
        },
});

export default Home;
