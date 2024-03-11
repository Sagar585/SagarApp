import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { getAuth, signOut } from "firebase/auth";
import HamburgerIcon from "../assets/hamburger.png";
import SearchIcon from "../assets/search.png";

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
    mapRef.current.animateToRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
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
        mapRef.current.animateToRegion({
          latitude: parseFloat(selectedLocation.lat),
          longitude: parseFloat(selectedLocation.lon),
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
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
        />
      </MapView>
      {showWelcome && (
        <View style={styles.sidebar}>
          <Text style={styles.emailText}>Welcome, {userEmail}</Text>
          <Button title="Logout" onPress={handleLogout} />
        </View>
      )}
      <TouchableOpacity
        style={styles.navbar}
        onPress={handleToggleSidebar}
        activeOpacity={1}
      >
        <Image source={HamburgerIcon} style={styles.hamburgerIcon} />
      </TouchableOpacity>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Location"
          value={searchText}
          onChangeText={(text) => setSearchText(text)}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Image source={SearchIcon} style={styles.searchIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  navbar: {
    position: "absolute",
    top: 29,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: "lightgray",
    justifyContent: "center",
    alignItems: "flex-end",
    zIndex: 2,
  },
  sidebar: {
    position: "absolute",
    top: 80,
    width: "100%",
    backgroundColor: "rgba(53, 53, 53, 0.8)",
    borderRightWidth: 1,
    borderColor: "gray",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3,
  },
  emailText: {
    fontSize: 20,
    marginBottom: 20,
    color: "white",
  },
  map: {
    flex: 1,
    width: deviceWidth,
    height: deviceHeight,
    zIndex: 1,
  },
  hamburgerIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  searchContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 2,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 20,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: "white",
  },
});

export default Home;
