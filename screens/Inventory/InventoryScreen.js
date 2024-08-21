import React, { useState, useEffect } from "react";
import {View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity } from "react-native";
import { Input, Icon, CheckBox } from '@rneui/themed';
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
import { useMunicipio } from '../../screens/components/municipiesContext';


const InventoryScreen = ({ route }) => {
    const [selectedValue, setSelectedValue] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [idValue, setSelectedId] = useState(null);
    const [images, setImages] = useState(Array(selectedValue).fill(null));
    const [inputs, setInputs] = useState(Array(selectedValue).fill(''));
    const [lightInputs, setLightInputs] = useState(Array(selectedValue).fill(''));
    const [sector, setSector] = useState('Urbano');
    const navigation = useNavigation()
    const [currentDateTime, setCurrentDateTime] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [status, setStatus] = useState('Activo');
    const { municipio } = useMunicipio();

    useEffect(() => {
      if (route.params?.item) {
        const { id, inputs, images, lightInputs, location, selectedValue } = route.params.item.data;
        setSelectedId(id);
        setIsEditing(true);
        setInputs(inputs);
        setLightInputs(lightInputs);
        setImages(images);
        setLocation(location);
        setSelectedValue(selectedValue);
      }
    }, [route.params]);

    const renderInputs = () => {
        let inputs = [];
        for (let i = 0; i < selectedValue; i++) {
          let countInputs = i * 5
          inputs.push(
            <View key={`luminaria-${i}`} style={styles.containerSelected}>
                <Text style={styles.label}>Luminaria {i + 1}</Text>
                <Input
                key={`Serial-${countInputs}`}
                placeholder={`Serial`}
                value={lightInputs[(countInputs)]}
                containerStyle={styles.dynamicInputContainer}
                inputStyle={styles.input}
                onChangeText={(text) => handleLightInputChange(text, countInputs)}
                />
                <Input
                  placeholder="Potencia"
                  containerStyle={styles.dynamicInputContainer}
                  inputStyle={styles.input}
                  value={lightInputs[countInputs + 2]}
                  onChangeText={(text) => handleLightInputChange(text, countInputs + 2)}
                />
                <Picker
                  selectedValue={lightInputs[countInputs + 1]}
                  style={styles.picker}
                  onValueChange={(itemValue) => handleLightInputChange(itemValue, countInputs + 1)}
                >
                  <Picker.Item label="Seleccione collarin" value="" enabled={false} />
                  <Picker.Item label="120" value="120" />
                  <Picker.Item label="140" value="140" />
                  <Picker.Item label="160" value="160" />
                  <Picker.Item label="180" value="180" />
                  <Picker.Item label="200" value="200" />
                  <Picker.Item label="220" value="220" />
                  <Picker.Item label="240" value="240" />
                  <Picker.Item label="260" value="260" />
                  <Picker.Item label="280" value="280" />
                </Picker>
                <Picker
                  selectedValue={lightInputs[countInputs + 3]}
                  style={styles.picker}
                  onValueChange={(itemValue) => handleLightInputChange(itemValue, countInputs + 3)}
                >
                  <Picker.Item label="Seleccione tipo de luminaria" value="" enabled={false} />
                  <Picker.Item label="Sodio" value="1" />
                  <Picker.Item label="Mercurio" value="2" />
                  <Picker.Item label="MetalHalide" value="3" />
                  <Picker.Item label="Reflector" value="4" />
                  <Picker.Item label="Incandescente" value="5" />
                  <Picker.Item label="Ahorrador" value="6" />
                  <Picker.Item label="Farol" value="7" />
                  <Picker.Item label="LED" value="8" />
                  <Picker.Item label="Halógeno" value="9" />
                  <Picker.Item label="Otro" value="10" />
                </Picker>
                <View style={styles.radioGroup}>
                  <Text style={styles.label}>Estado:</Text>
                  <CheckBox
                    checked={lightInputs[countInputs + 4] === 1}
                    title='Activo'
                    onPress={() => handleCheckboxChange(true, countInputs + 4)}
                    containerStyle={styles.radioButton}
                    textStyle={styles.radioText}
                  />
                  <CheckBox
                    checked={lightInputs[countInputs + 4] === 2}
                    title='Inactivo'
                    onPress={() => handleCheckboxChange(false, countInputs + 4)}
                    containerStyle={styles.radioButton}
                    textStyle={styles.radioText}
                  />
                </View>
                <TouchableOpacity key={`FotoLuminaria-${i}`} onPress={() => pickImage(i)} style={styles.PhotoInventaryButton}>
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
      setLightInputs(newLightInputs);
    };

    const handleCheckboxChange = (value, index) => {
      // Asignar 1 si es "Activo", 2 si es "Inactivo"
      const newValue = value ? 1 : 2;
    
      // Actualizar solo el estado correspondiente en el array
      const newLightInputs = [...lightInputs];
      newLightInputs[index] = newValue;
      setLightInputs(newLightInputs);
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
        let formData = {}
        let valueSend = null
        if(isEditing){   
          formData = {
            id: idValue,
            municipio: municipio,
            inputs: inputs,
            sector: sector,
            lightInputs: lightInputs,
            images: images,
            location: location,
            selectedValue: selectedValue,
            date_time: currentDateTime,
          };
          valueSend = idValue
        }else{
          let uuid_inventory = uuid.v4();
          formData = {
            id: uuid_inventory,
            inputs: inputs,            
            sector: sector,
            lightInputs: lightInputs,
            images: images,
            location: location,
            selectedValue: selectedValue,
            date_time: currentDateTime,
          };
          valueSend = uuid_inventory
        } 

        let imagesIsCompleted = true 
        for (let i = 0; i < selectedValue; i++) {
          if (!images[i]){
            imagesIsCompleted = false
          }
        }

        if (inputs.length === 5 && images[10] && imagesIsCompleted && location && lightInputs.length === 5*selectedValue){
          await AsyncStorage.setItem(`formData_inventory_${valueSend}`, JSON.stringify(formData));
          if(isEditing){  
            showToastSuccess("Editado exitosamente");
          }else{
            showToastSuccess("Agregado exitosamente");
          }
          navigation.navigate("HomeScreen")
        }else{
          showToastFail('Se deben completar todos los campos')
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
          value={inputs[0]}
          onChangeText={(text) => handleInputChange(text, 0)}
        />
        <Input
          placeholder="Dirección"
          containerStyle={styles.inputContainer}
          inputStyle={styles.input}
          value={inputs[2]}
          onChangeText={(text) => handleInputChange(text, 2)}
        />
        <Input
          placeholder="Id Poste/Placa"
          containerStyle={styles.inputContainer}
          inputStyle={styles.input}
          value={inputs[3]}
          onChangeText={(text) => handleInputChange(text, 3)}
        />        
        <Picker
          selectedValue={inputs[1]}
          style={styles.picker}
          onValueChange={(itemValue) => handleInputChange(itemValue, 1)}
        >
          <Picker.Item label="Seleccione altura del poste" value="" enabled={false} />
          <Picker.Item label="2" value="2" />
          <Picker.Item label="4" value="4" />
          <Picker.Item label="6" value="6" />
          <Picker.Item label="8" value="8" />
          <Picker.Item label="10" value="10" />
          <Picker.Item label="12" value="12" />
          <Picker.Item label="14" value="14" />
          <Picker.Item label="16" value="16" />
          <Picker.Item label="18" value="18" />
          <Picker.Item label="20" value="20" />
          <Picker.Item label="22" value="22" />
        </Picker>
        <Picker
          selectedValue={inputs[4]}
          style={styles.picker}
          onValueChange={(itemValue) => handleInputChange(itemValue, 4)}
        >
          <Picker.Item label="Seleccione tipo de red" value="" enabled={false} />
          <Picker.Item label="Encauchetada" value="1" />
          <Picker.Item label="Abierta" value="2" />
          <Picker.Item label="Trenzada" value="3" />
        </Picker>
        <View style={styles.radioGroup}>
          <Text style={styles.label}>Sector:</Text>
          <CheckBox
            title='Urbano'
            checked={sector === 'Urbano'}
            onPress={() => setSector('Urbano')}
            containerStyle={styles.radioButton}
            textStyle={styles.radioText}
          />
          <CheckBox
            title='Rural'
            checked={sector === 'Rural'}
            onPress={() => setSector('Rural')}
            containerStyle={styles.radioButton}
            textStyle={styles.radioText}
          />
        </View>
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
        <Button title={isEditing ? "Editar Datos" : "Guardar Datos"} onPress={handleSubmit} />
      </ScrollView>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 20,
      backgroundColor: '#f2f2f2',
    },
    containerSelected: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      padding: 10,
      marginBottom: 15,
      backgroundColor: '#fff',
    },
    inputContainer: {
      marginBottom: 15,
    },
    input: {
      fontSize: 16,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    dynamicInputContainer: {
      marginBottom: 10,
    },
    pickerContainer: {
      marginBottom: 15,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
    },
    picker: {
      height: 50,
      width: '100%',
      marginBottom: 10,
    },
    label: {
      fontSize: 16,
      marginBottom: 5,
    },
    PhotoInventaryButton: {
      width: '100%',
      padding: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8f8f8',
      borderRadius: 5,
      borderWidth: 1,
      borderColor: '#ccc',
    },
    radioGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
      marginLeft: 12,
    },
    radioButton: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      padding: 0,            
    },
    radioText: {
      fontSize: 16,
    },
  });

export default InventoryScreen;