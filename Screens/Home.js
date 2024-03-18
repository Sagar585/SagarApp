import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { getAuth, signOut } from "firebase/auth";
import { app } from "firebase/app";
import { MaterialIcons } from "@expo/vector-icons"; // Import MaterialIcons from Expo

const auth = getAuth(app);

const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;

const Home = ({ navigation }) => {
  const [location, setLocation] = useState({
    latitude: 19.139094119217912,
    longitude: 72.84048431056259,
  });
  const [showWelcome, setShowWelcome] = useState(false);
  const [searchText, setSearchText] = useState("");
  const mapRef = useRef(null);
  const userEmail = auth.currentUser ? auth.currentUser.email : "User";
  const HamburgerName = userEmail.charAt(0).toUpperCase();

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") console.log("Permission Denied!");

    let location = await Location.getCurrentPositionAsync({});
    setLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    console.log(location);
    // Move map to the current location
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("LogOut Successful");
      navigation.navigate("Login");
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  const handleToggleSidebar = () => {
    setShowWelcome(!showWelcome);
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${searchText}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const selectedLocation = data[0];
        // Move map to the selected location
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: parseFloat(selectedLocation.lat),
            longitude: parseFloat(selectedLocation.lon),
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        }
      } else {
        console.log("Location not found");
      }
    } catch (error) {
      console.error("Error searching location:", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
        >
          <MaterialIcons name="location-on" size={30} color="blue" />
        </Marker>
      </MapView>
      {showWelcome && (
        <View style={styles.sidebar}>
          <Text style={styles.emailText}>Welcome, {userEmail}</Text>
          <Button title="Logout" onPress={handleLogout} />
        </View>
      )}
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={handleToggleSidebar}
      >
        <Text style={styles.toggleButtonText}>{HamburgerName}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.locationButton} onPress={getLocation}>
        <MaterialIcons name="my-location" size={30} color="green" />
      </TouchableOpacity>
      <TextInput
        style={styles.searchInput}
        placeholder="Search for a location"
        value={searchText}
        onChangeText={(text) => setSearchText(text)}
      />
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.buttonText}>Search</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 250,
    backgroundColor: "white",
    borderRightWidth: 1,
    borderColor: "gray",
    justifyContent: "center",
    alignItems: "center",
  },
  emailText: {
    fontSize: 20,
    marginBottom: 20,
  },
  map: {
    flex: 1,
    width: deviceWidth,
    height: deviceHeight,
  },
  toggleButton: {
    position: "absolute",
    top: 100,
    left: 20,
    backgroundColor: "grey",
    height: 60,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 150,
  },
  locationButton: {
    position: "absolute",
    top: 150, // Adjusted position for better visibility
    left: 20,
    backgroundColor: "grey",
    height: 60,
    width: 60, // Adjusted width for better visibility
    borderRadius: 150,
    justifyContent: "center", // Center the icon vertically
    alignItems: "center", // Center the icon horizontally
  },
  toggleButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 30,
    textAlign: "center",
    marginTop: 5,
  },
  searchInput: {
    position: "absolute",
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 50,
    width: 300,
    height: 35,
    fontSize: 16,
    top: 50,
    left: 5,
    backgroundColor: "white",
  },
  searchButton: {
    position: "absolute",
    top: 50,
    right: 5,
    padding: 8,
    backgroundColor: "grey",
    borderRadius: 4,
    width: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default Home;
