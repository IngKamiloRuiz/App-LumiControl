import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

const CustomTitle = () => {
  return (
    <View style={styles.titleContainer}>
        {/* <Text style={styles.titleGreen}>Se</Text>
        <Text style={styles.titleBlue}>an</Text>
        <Text style={styles.titleOrange}>da</Text>
        <Text style={styles.titleRed}>to</Text>        */}
        <Text style={styles.titleGreen}>No</Text>
        <Text style={styles.titleBlue}>ma</Text>
        <Text style={styles.titleOrange}>des</Text>  
    </View>
  );
};

const styles = StyleSheet.create({
    titleContainer: {
      marginLeft: 10,
      marginTop: 50,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 1,
    },
    titleGreen:{
      color: '#23B854',
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 32,
    },
    titleBlue:{
      color: '#049EE6',
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 32,
    },
    titleOrange:{
      color: '#F0802C',
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 32,
    },
    titleRed:{
      color: '#E82126',
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 32,
    },
  });

export default CustomTitle;