import React, { useState, useEffect } from "react";
import {View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity } from "react-native";
import GetNearbyPoints from "./components/getNerabyPoints";


const ReportMaintenance = () => {   

    return (
      <ScrollView contentContainerStyle={styles.container}>        
            <GetNearbyPoints/>
      </ScrollView>
    );
  };
  
  const styles = StyleSheet.create({
     
  });

export default ReportMaintenance;