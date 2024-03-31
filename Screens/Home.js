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
  const [searchedLocation, setSearchedLocation] = useState(null); // New state to store searched location
  const mapRef = useRef(null);

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
        // Set searched location state
        setSearchedLocation({
          latitude: parseFloat(selectedLocation.lat),
          longitude: parseFloat(selectedLocation.lon),
        });
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
      {/* Navbar */}
      <View style={styles.navbar}>
      <View style={styles.searchContainer}>
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
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={30} color="white" />
        </TouchableOpacity>
      </View>

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
        {/* Marker for current location */}
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
        >
          <MaterialIcons name="location-on" size={30} color="blue" />
        </Marker>
        {/* Marker for searched location */}
        {searchedLocation && (
          <Marker
            coordinate={{
              latitude: searchedLocation.latitude,
              longitude: searchedLocation.longitude,
            }}
          />
        )}
      </MapView>

      {/* Location Button */}
      <TouchableOpacity
        style={styles.locationButton}
        onPress={getLocation}
      >
        <MaterialIcons name="my-location" size={30} color="green" />
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "blue",
    padding: 10,
    marginTop: 40,
  },

  logoutButton: {
    padding: 5,
  },
  map: {
    flex: 1,
    width: deviceWidth,
    height: deviceHeight,
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
  searchContainer: {
    // position: "absolute",
    // top: 110,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 50,
    width: 250,
    height: 35,
    fontSize: 16,
    backgroundColor: "white",
  },
  searchButton: {
    padding: 8,
    backgroundColor: "grey",
    borderRadius: 50,
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
