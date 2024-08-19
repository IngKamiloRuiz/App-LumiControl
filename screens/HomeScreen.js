import React from "react";
import {View, Text, StyleSheet} from "react-native";
import ButtonDark from '../components/navigation/button';
import { useNavigation } from "@react-navigation/native";



const HomeScreen = () => {

    const navigation = useNavigation();

    return(
      <View style={styles.container}>
      <View style={styles.titleContainer}>
          <Text style={styles.titleApp}>Control Luminarias</Text>
      </View>
      <View style={styles.buttonsContainer}>
        <View style={styles.stepContainer}>
            <ButtonDark text="Inventario" onPress={() => navigation.navigate("Inventory")}/> 
        </View>
        {/* <View style={styles.stepContainer}>
            <ButtonDark text="Instalación" onPress={() => navigation.navigate("Inventory")}/> 
        </View>
        <View style={styles.stepContainer}>
            <ButtonDark text="Mantenimiento" onPress={() => navigation.navigate("Inventory")}/> 
        </View> */}
      </View>
  </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    titleContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    titleApp: {
        fontSize: 32,
        fontWeight: 'bold',
        lineHeight: 32,
    },
    buttonsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepContainer: {
        width: '80%',
        marginBottom: 30,
    },   
  });

export default HomeScreen;