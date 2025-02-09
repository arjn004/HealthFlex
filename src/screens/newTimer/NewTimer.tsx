import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SvgImageWrapper from "../../components/svgImageWrapper/SvgImageWrapper";
import { backArrow } from "../../assets/svgImages/SvgImages";
import { useNavigation } from "@react-navigation/native";

const NewTimer = () => {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [category, setCategory] = useState("");
  const [timers, setTimers] = useState([]);

  const navigation = useNavigation()

  useEffect(() => {
    loadTimers();
  }, []);

  /** 📌 Load Saved Timers from AsyncStorage */
  const loadTimers = async () => {
    try {
      const storedTimers = await AsyncStorage.getItem("timers");
      if (storedTimers) {
        setTimers(JSON.parse(storedTimers));
      }
    } catch (error) {
      console.error("Failed to load timers", error);
    }
  };

  /** 📌 Save Timer */
  const saveTimer = async () => {
    if (!name || !duration || !category) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }
  
    const newTimer = {
      id: Date.now(),
      name,
      duration: parseInt(duration, 10),
      category,
      status: "Paused", // Set initial status to "paused"
    };
  
    const updatedTimers = [...timers, newTimer];
    setTimers(updatedTimers);
  
    try {
      await AsyncStorage.setItem("timers", JSON.stringify(updatedTimers));
      Alert.alert("Success", "Timer saved!");
      setName("");
      setDuration("");
      setCategory("");
    } catch (error) {
      console.error("Failed to save timer", error);
    }
  };
  

  return (

      <View  style={styles.container}>
        <TouchableOpacity onPress={()=> {navigation.goBack()}}>
            <SvgImageWrapper
                xml={backArrow}
                height={35}
                width={30}
                />

        </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Enter timer name"
        value={name}
        onChangeText={setName}
      />

      {/* Duration */}
      <TextInput
        style={styles.input}
        placeholder="Enter duration (seconds)"
        keyboardType="numeric"
        value={duration}
        onChangeText={setDuration}
      />

      {/* Category */}
      <TextInput
        style={styles.input}
        placeholder="Enter category"
        value={category}
        onChangeText={setCategory}
      />

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={saveTimer}>
        <Text style={styles.buttonText}>Save Timer</Text>
      </TouchableOpacity>

      {/* Saved Timers List */}
      <Text style={styles.listHeader}>Saved Timers</Text>
      <FlatList
        data={timers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.timerItem}>
            <Text style={styles.timerText}>
              {item.name} - {item.duration}s ({item.category})
            </Text>
          </View>
        )}
      />
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
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  saveButton: {
    backgroundColor: "dodgerblue",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  listHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  timerItem: {
    backgroundColor: "#e3f2fd",
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
  },
  timerText: {
    fontSize: 16,
  },
});

export default NewTimer;
