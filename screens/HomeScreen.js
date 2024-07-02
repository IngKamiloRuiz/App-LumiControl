import React from "react";
import {View, Text, StyleSheet} from "react-native";
import ButtonDark from '../components/navigation/button';
import { useNavigation } from "@react-navigation/native";



const HomeScreen = () => {

    const navigation = useNavigation();

    return(
        <View style={styles.headerStyle}>
            <View style={styles.titleContainer}>
                <Text style={styles.titleApp}>Control Luminarias</Text>
            </View>
            <View style={styles.bottoms}>
              <View style={styles.stepContainer}>
                  <ButtonDark text="Inventario" onPress={() => navigation.navigate("Inventory")}/> 
              </View>
              <View style={styles.stepContainer}>
                  <ButtonDark text="Instalación" onPress={() => navigation.navigate("Inventory")}/> 
              </View>
              <View style={styles.stepContainer}>
                  <ButtonDark text="Mantenimiento" onPress={() => navigation.navigate("Inventory")}/> 
              </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    headerStyle:{
      flex: 1, 
      margin: 5       
    },
    bottoms:{
      marginLeft: 25
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 1,
      marginTop: 10,
    },
    titleApp:{
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 32,
      marginBottom: 50,
    },
    stepContainer: {
      gap: 8,
      marginBottom: 30,
    },
    reactLogo: {
      height: 50,
      width: 50,
      bottom: 0,
      left: 0,
      position: 'absolute',
    },
  });

export default HomeScreen;