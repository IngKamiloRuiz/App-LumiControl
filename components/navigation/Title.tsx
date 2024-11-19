import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { useMunicipio } from '../../screens/components/municipiesContext';

const CustomTitle = () => {
  const { municipio, setMunicipio } = useMunicipio();

  const handleValueChange = (value) => {
    setMunicipio(value);
  };

  return (
    <View style={styles.titleContainer}>
        {/* <Text style={styles.titleGreen}>Se</Text>
        <Text style={styles.titleBlue}>an</Text>
        <Text style={styles.titleOrange}>da</Text>
        <Text style={styles.titleRed}>to</Text>        */}
        <Text style={styles.titleGreen}>No</Text>
        <Text style={styles.titleBlue}>ma</Text>
        <Text style={styles.titleOrange}>des</Text>
        <RNPickerSelect
        onValueChange={handleValueChange}
        items={[
          { label: 'Garzón', value: '1' },
          { label: 'Palermo', value: '2' },
          { label: 'Soracá', value: '3' },
          { label: 'Sutamarchán', value: '4' },
        ]}
        value={municipio}
        style={pickerSelectStyles}
        placeholder={{ label: 'Seleccione un municipio', value: null }}
      />
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

  const pickerSelectStyles = StyleSheet.create({
    inputAndroid: {
      fontSize: 16,
      paddingHorizontal: 1,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: 'gray',
      borderRadius: 8,
      color: 'black',
      width: 140,
      marginLeft: 90,
    },
  });

export default CustomTitle;