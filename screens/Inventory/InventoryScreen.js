import React, { useState } from "react";
import {View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity } from "react-native";
import { Input, Icon } from '@rneui/themed';
import { Picker } from '@react-native-picker/picker';
import { Button } from '@rneui/themed';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const InventoryScreen = () => {
    const [selectedValue, setSelectedValue] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [images, setImages] = useState(Array(selectedValue).fill(null));

    const renderInputs = () => {
        let inputs = [];
        for (let i = 0; i < selectedValue; i++) {
          inputs.push(
            <View style={styles.containerSelected}>
                <Text style={styles.label}>Luminaria {i + 1}</Text>
                <Input
                key={`Serial-${i + 1}`}
                placeholder={`Serial`}
                containerStyle={styles.dynamicInputContainer}
                inputStyle={styles.input}
                />
                <Input
                key={`Collarin-${i + 1}`}
                placeholder={`Collarin`}
                containerStyle={styles.dynamicInputContainer}
                inputStyle={styles.input}
                />
                <TouchableOpacity onPress={() => pickImage(i)} style={styles.PhotoInventaryButton}>
                    {images[i] ? (
                        <Icon
                        name="check"
                        type="font-awesome"
                        color="green"
                        size={30}
                        />
                    ) : (
                      <MaterialCommunityIcons name="camera-marker-outline" size={40} color="black" />
                    )}
                </TouchableOpacity>
            </View>
          );
        }
        return inputs;
      };

    const getLocation = async () => {
        setIsLoading(true);
        setErrorMsg(null);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
            setErrorMsg('Permiso para acceder a la ubicación denegado');
            setIsLoading(false);
            return;
            }

            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
              });
            setLocation(location);
        } catch (error) {
            setErrorMsg('Error al obtener la ubicación');
        } finally {
            setIsLoading(false);
        }
    };

    const pickImage = async (index) => {
        let result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          aspect: [4, 3],
          quality: 1,
        });
            
        if (!result.canceled) {
          let newImages = [...images];
          newImages[index] = result.assets[0].uri;       
          setImages(newImages);          
        }
      };

    const handleSubmit = () => {
      console.log("Imágenes:", images);
      console.log("Ubicación:", location);
    };
  
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Input
          placeholder="Barrio"
          containerStyle={styles.inputContainer}
          inputStyle={styles.input}
        />
        <Input
          placeholder="Altura poste"
          containerStyle={styles.inputContainer}
          inputStyle={styles.input}
        />
        <TouchableOpacity key="FotoPoste" onPress={() => pickImage(10)} style={styles.PhotoInventaryButton}>
            {images[10] ? (
                <Icon
                name="check"
                type="font-awesome"
                color="green"
                size={30}
                />
            ) : (
              <MaterialCommunityIcons name="camera-marker-outline" size={40} color="black" />
            )}
        </TouchableOpacity>
        <View style={styles.inputContainer}>
            <Button key="geolocalizacion" title="Obtener Geolocalización" onPress={getLocation} style={styles.GeoButton}/>
            {isLoading && <ActivityIndicator size="large" color="#7171F4" />}
            {location && (
                <Text style={styles.locationText}>
                Latitud: {location.coords.latitude}, Longitud: {location.coords.longitude}
                </Text>
            )}
            {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
        </View>

        <Text style={styles.label}>Cantidad de Luminarias</Text>
        <Picker
          selectedValue={selectedValue}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedValue(itemValue)}
        >
          <Picker.Item label="1" value={1} />
          <Picker.Item label="2" value={2} />
          <Picker.Item label="3" value={3} />
          <Picker.Item label="4" value={4} />
        </Picker>

        {renderInputs()}
        <Button title="Enviar Datos" onPress={handleSubmit} />
      </ScrollView>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 25,
      backgroundColor: '#f5f5f5',
    },
    inputContainer: {
      marginBottom: 10,
    },
    containerSelected: {      
      backgroundColor: '#D8E2DC',
      borderRadius: 5,
      marginBottom: 10
    },
    input: {
      paddingHorizontal: 10,
      paddingVertical: 3,
      backgroundColor: 'white',
      borderRadius: 5,
      borderColor: '#ccc',
      borderWidth: 1,
    },
    label: {
      fontSize: 18,
      marginLeft: 5,
      marginBottom: 10,
      color: '#333',
    },
    GeoButton:{
      tintColor: '#7171F4'
    },
    picker: {
      width: '100%',
      backgroundColor: 'white',
      borderRadius: 5,
      borderColor: '#ccc',
      borderWidth: 1,
      marginBottom: 20,
    },
    dynamicInputContainer: {
      marginBottom: 15,
    },
    imagePickerButton: {
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 5,
    },
    PhotoInventaryButton: {
      alignItems: 'center',
      marginBottom: 20,
    },
    image: {  
      width: 100,
      height: 100,
      marginTop: 10,
    },
    locationText: {
      marginTop: 20,
      fontSize: 16,
      color: '#333',
    },
    errorText: {
      marginTop: 20,
      fontSize: 16,
      color: 'red',
    },

  });

export default InventoryScreen;