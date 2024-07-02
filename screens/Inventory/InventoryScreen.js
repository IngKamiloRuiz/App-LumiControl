import React, { useState, useEffect } from "react";
import {View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity } from "react-native";
import { Input, Icon } from '@rneui/themed';
import { Picker } from '@react-native-picker/picker';
import { Button } from '@rneui/themed';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import uuid from 'react-native-uuid';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native"
import showToastSuccess from "../../components/navigation/toastSuccess";
import showToastFail from "../../components/navigation/toastFail";
import { format } from 'date-fns';


const InventoryScreen = ({ route }) => {
    const [selectedValue, setSelectedValue] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [images, setImages] = useState(Array(selectedValue).fill(null));
    const [inputs, setInputs] = useState(Array(selectedValue).fill(''));
    const [lightInputs, setLigthInputs] = useState(Array(selectedValue).fill(''));
    const navigation = useNavigation()
    const [currentDateTime, setCurrentDateTime] = useState(null);
    

    useEffect(() => {
      if (route.params?.item) {
        const { inputs, images, lightInputs, location, selectedValue } = route.params.item.data;        
        setInputs(inputs);
        setLigthInputs(lightInputs);
        setImages(images);
        setLocation(location);
        setSelectedValue(selectedValue);
      }
    }, [route.params]);

    const renderInputs = () => {
        let inputs = [];
        for (let i = 0; i < selectedValue; i++) {
          let countInputs = i * 2
          inputs.push(
            <View style={styles.containerSelected}>
                <Text style={styles.label}>Luminaria {i + 1}</Text>
                <Input
                key={`Serial-${i + 1}`}
                placeholder={`Serial`}
                containerStyle={styles.dynamicInputContainer}
                inputStyle={styles.input}
                onChangeText={(text) => handleLightInputChange(text, countInputs)}
                />
                <Input
                key={`Collarin-${i + 1}`}
                placeholder={`Collarin`}
                containerStyle={styles.dynamicInputContainer}
                inputStyle={styles.input}
                onChangeText={(text) => handleLightInputChange(text, countInputs + 1)}
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

    const handleInputChange = (text, index) => {
      const newInputs = [...inputs];
      newInputs[index] = text;
      setInputs(newInputs);
    };

    const handleLightInputChange = (text, index) => {
      const newLightInputs = [...lightInputs];
      newLightInputs[index] = text;
      setLigthInputs(newLightInputs);
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

            const now = new Date();
            const formattedDateTime = format(now, 'yyyy-MM-dd HH:mm:ss');
            setCurrentDateTime(formattedDateTime);

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


    const saveData = async () => {
      try {        

        let uuid_inventory = uuid.v4();
        let formData = {
          id: uuid_inventory,
          inputs: inputs,
          lightInputs: lightInputs,
          images: images,
          location: location,
          selectedValue: selectedValue,
          date_time: currentDateTime,
        };
        if (inputs && images && location && selectedValue){
          await AsyncStorage.setItem(`formData_inventory_${uuid_inventory}`, JSON.stringify(formData));
          showToastSuccess("Agregado exitosamente");    
          navigation.navigate("HomeScreen")
        }else{
          showToastFail('Se deben llenar todos los campos')
        }        
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };

    const handleSubmit = () => {
      saveData();
    };
  
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Input
          placeholder="Barrio"
          containerStyle={styles.inputContainer}
          inputStyle={styles.input}
          value={inputs.barrio}
          onChangeText={(text) => handleInputChange(text, 0)}
        />
        <Input
          placeholder="Altura poste"
          containerStyle={styles.inputContainer}
          inputStyle={styles.input}
          value={inputs.alturaPoste}
          onChangeText={(text) => handleInputChange(text, 1)}
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
        <Button title="Guardar Datos" onPress={handleSubmit} />
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