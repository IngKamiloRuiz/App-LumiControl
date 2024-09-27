import React, { useState, useEffect } from "react";
import {View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity } from "react-native";
import ButtonDark from '../../components/navigation/button';


const AttendMaintenance = () => {   

    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.buttonsContainer}>
                <View style={styles.stepContainer}>
                    <ButtonDark text="Atender Mantenimiento" onPress={() => navigation.navigate("Inventory")}/> 
                </View>                
                <View style={styles.stepContainer}>
                    <ButtonDark text="Reportar Falla" onPress={() => navigation.navigate("Inventory")}/> 
                </View> 
            </View> 
      </ScrollView>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 20,
      backgroundColor: '#f2f2f2',
    },
    stepContainer: {
        width: '80%',
        marginBottom: 30,
    },
    buttonsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },    
  });

export default AttendMaintenance;