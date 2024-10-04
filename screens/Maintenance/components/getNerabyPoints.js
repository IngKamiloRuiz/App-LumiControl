import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TextInput, ScrollView, TouchableOpacity } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { Icon } from '@rneui/themed';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Button } from '@rneui/themed';
import * as Location from 'expo-location';
import { API_URL_DEVELOPMENT, API_URL_PRODUCTION } from '@env';
import showToastSuccess from "../../../components/navigation/toastSuccess";
import showToastFail from "../../../components/navigation/toastFail";
import MapScreen from './MapScreen'; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from "@react-navigation/native"
import { useMunicipio } from '../../components/municipiesContext';

const GetNearbyPoints = () => {   
    const navigation = useNavigation()
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSend, setIsLoadingSend] = useState(false);
    const [location, setLocation] = useState(null);
    const [localReportsCount, setLocalReportsCount] = useState(0);
    const [errorMsg, setErrorMsg] = useState(null);
    const [nearbyPoints, setNearbyPoints] = useState([]);
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [description, setDescription] = useState("");
    const [selectedValue, setSelectedValue] = useState("");
    const [images, setImages] = useState(Array(selectedValue).fill(null));
    const [netOnline, setNetOnline] = useState(true); 
    const { municipio } = useMunicipio();
    const apiUrl = __DEV__ ? API_URL_DEVELOPMENT : API_URL_PRODUCTION;

    useEffect(() => {
        loadLocalReports();
      }, []);

      const loadLocalReports = async () => {
        try {
            const localReports = await AsyncStorage.getItem('pendingReports');
            const reports = localReports ? JSON.parse(localReports) : [];
            setLocalReportsCount(reports.length);
        } catch (error) {
            showToastFail("Error cargando reportes locales:", error);            
        }
    };

    const handleSubmit = async () => {
        const formData = new FormData();
        const idUsuario = await AsyncStorage.getItem('userId');
        formData.append('id', selectedPoint ? selectedPoint.id : null); // Si no hay punto, es null
        formData.append('consecutivo', selectedPoint ? selectedPoint.consecutivo : null);
        formData.append('latitud', location ? location.coords.latitude : null);
        formData.append('longitud', location ? location.coords.longitude : null);
        formData.append('descripcion', description);
        formData.append('tipo_novedad', selectedValue);
        formData.append('municipio', municipio);
        formData.append('usuario_crea', idUsuario);

        if (images[0]) { // Asegurarse de que existe una imagen
            const file = {
                uri: images[0], // URI de la imagen
                type: 'image/jpeg', // Tipo MIME de la imagen
                name: `image.jpg`, // Nombre del archivo en el backend
            };
            formData.append('images', file); // Aquí solo usamos 'image'
        }
        
        try {
            if (netOnline) {
                const timeout = (ms) =>
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms));

                // Intentar enviar al backend si hay internet
                const response = await Promise.race([ 
                    fetch(`${apiUrl}mantenimientos/reportar-falla`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    body: formData,
                }),
                timeout(30000), // 30 segundos
                ]);

                if (response.ok) {
                    showToastSuccess("Reporte enviado correctamente");
                    navigation.replace('ReportMaintenance');
                } else {                    
                    const errorData = await response.json(); // Obtener el cuerpo de la respuesta
                    const errorMessage = errorData.error || "Error en el servidor";
                    showToastFail(errorMessage);
                    throw new Error(errorMessage);
                }
            } else {
                // Si no hay internet, guardar en AsyncStorage

                const dataToSend = {
                    id: selectedPoint ? selectedPoint.id : null,
                    consecutivo: selectedPoint ? selectedPoint.consecutivo : null,
                    latitud: location ? location.coords.latitude : null,
                    longitud: location ? location.coords.longitude : null,
                    descripcion: description,
                    tipo_novedad: selectedValue,
                    municipio: municipio,
                    usuario_crea: idUsuario,
                    evidencia: images[0],
                };

                await saveToAsyncStorage(dataToSend);
                showToastSuccess("No hay conexión. El reporte se guardó localmente.");
                
            }
        } catch (error) {
            console.error("Error al enviar el reporte:", error);
        }
    };

    const saveToAsyncStorage = async (data) => {
        try {
            let storedReports = await AsyncStorage.getItem("pendingReports");
            storedReports = storedReports ? JSON.parse(storedReports) : [];
            storedReports.push(data);
            await AsyncStorage.setItem("pendingReports", JSON.stringify(storedReports));
            navigation.replace('ReportMaintenance');
        } catch (error) {
            console.error("Error guardando en AsyncStorage", error);
        }
    };

    const onSelectPoint = (point) => {
        setSelectedPoint(point);
        console.log("Punto seleccionado:", point);
    };

    const getLocation = async () => {
        // Obteniendo Geolocalización actual
        setIsLoading(true);
        setErrorMsg(null);
        
        try {
          // Solicitando permisos de ubicación
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            setErrorMsg('Permiso para acceder a la ubicación denegado');
            setIsLoading(false);
            return;
          }
      
          // Obteniendo la ubicación actual
          let location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
      
          setLocation(location);
      
          // Extrayendo latitud y longitud
          const { latitude, longitude } = location.coords;
      
          // Construyendo la URL con los parámetros de latitud y longitud
          const urlWithParams = `${apiUrl}mantenimientos/get-puntos-cercanos?latitud=${latitude}&longitud=${longitude}`;
      
          // Timeout personalizado para la solicitud
          const timeout = (ms) =>
            new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms));
      
          // Obteniendo puntos cercanos
          const response = await Promise.race([
            fetch(urlWithParams, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            }),
            timeout(20000), // 20 segundos
          ]);
      
          if (!response.ok) {
            setNetOnline(false)
            showToastFail('No se obtuvo conexión con el servidor.');
            throw new Error('Error en la respuesta del servidor');
          }
      
          const responseData = await response.json();

          puntos = responseData.length

          showToastSuccess(`Se obtuvieron ${puntos} puntos cercanos`);
          
          setNearbyPoints(responseData);
          
        } catch (error) {
          setNetOnline(false)
          showToastFail('No se obtuvo conexión con el servidor.');
        } finally {
          setIsLoading(false);
        }
    };

    const handleInputChange = (itemValue) => {
        setSelectedValue(itemValue);
      };

    const pickImage = async (index) => {
        try {
            const freeSpace = await FileSystem.getFreeDiskStorageAsync(); // Obtener el espacio libre en bytes        
            const minimumSpaceRequired = 1000 * 1024 * 1024; // Ejemplo: 1000 MB

            if (freeSpace < minimumSpaceRequired) {
            showToastFail('No hay suficiente espacio de almacenamiento disponible.');
            return;
            }

            let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            aspect: [4, 3],
            quality: 1,
            });

            if (!result.canceled) {
            const imageUri = result.assets[0].uri;
        
            // Guardar la imagen de manera persistente
            const fileName = imageUri.split('/').pop(); // Obtener el nombre de la imagen
            const newPath = `${FileSystem.documentDirectory}${fileName}`;
            await FileSystem.moveAsync({
                from: imageUri,
                to: newPath,
            });
        
            let newImages = [...images];
            newImages[index] = newPath;  // Guardar la nueva ruta persistente en tu estado
            setImages(newImages);
            }
        } catch (error) {
            showToastFail("Error al capturar la imagen:", error);
        }
    };

    const retrySendingReports = async () => {
        try {
            setIsLoadingSend(true);
            const localReports = await AsyncStorage.getItem('pendingReports');
            const reports = localReports ? JSON.parse(localReports) : [];
    
            if (reports.length === 0) {
                showToastFail("No hay reportes locales para enviar.");
                setIsLoadingSend(false);
                return;
            }
    
            const timeout = (ms) =>
                new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms));
    
            for (const report of reports) {
                const formData = new FormData();
                formData.append('usuario_crea', report.usuario_crea);
                formData.append('municipio', report.municipio);
                formData.append('descripcion', report.descripcion);
                formData.append('tipo_novedad', report.tipo_novedad);
                formData.append('latitud', report.latitud);
                formData.append('longitud', report.longitud);
                formData.append('id', report.id);
    
                // Agregar una sola imagen al FormData
                if (report.evidencia) { // Asegurarse de que existe una imagen
                    const file = {
                        uri: report.evidencia, // URI de la imagen
                        type: 'image/jpeg', // Tipo MIME de la imagen
                        name: `image.jpg`, // Nombre del archivo en el backend
                    };
                    formData.append('image', file); // Aquí solo usamos 'image'
                }
    
                try {
                    const response = await Promise.race([
                        fetch(`${apiUrl}mantenimientos/reportar-falla`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'multipart/form-data', // Content-Type para multipart
                            },
                            body: formData, // Enviar FormData
                        }),
                        timeout(30000) // 30 segundos de espera
                    ]);
    
                    if (response.ok) {
                        showToastSuccess(`Reporte enviado: ${report.descripcion}`);
                        // Eliminar reporte enviado de la lista
                        reports.shift(); 
                        await AsyncStorage.setItem('pendingReports', JSON.stringify(reports));
                        setLocalReportsCount(reports.length); // Actualizar contador
                    } else {
                        showToastFail(`Error enviando reporte: ${report.descripcion}`);
                        break; // Detener el proceso si ocurre un error
                    }
                } catch (error) {
                    if (error.message === 'Request timed out') {
                        showToastFail('Error: El tiempo de espera de la solicitud ha expirado.');
                    } else {
                        showToastFail('Error enviando el reporte.');
                    }
                    break; // Detener el proceso si ocurre un error
                }
            }
    
            setIsLoadingSend(false);
        } catch (error) {
            setIsLoadingSend(false);
            showToastFail("Error al intentar enviar reportes.");
        }
    };

    const clearStorage = async () => {
        try {
            await AsyncStorage.removeItem('pendingReports');
            setLocalReportsCount(0);
            alert("Datos de puntos guardados eliminados del almacenamiento");
            navigation.replace('ReportMaintenance');
        } catch (error) {
            console.error("Error al limpiar los datos de puntos guardados:", error);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {netOnline ? 
                <>
                {/* Botón para obtener la geolocalización */}
                <View style={styles.buttonContainer}>
                    <Button title="Obtener Puntos Cercanos" onPress={getLocation} />
                </View>
                
                {/* Mostrar loading mientras se obtienen datos */}
                {isLoading && (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                )}
        
                {/* Mostrar mensaje de error si hay algún error */}
                {errorMsg && (
                    <View style={styles.center}>
                        <Text>{errorMsg}</Text>
                    </View>
                )}
        
                {/* Mostrar el mapa solo si tenemos los puntos cercanos y la ubicación */}
                {location && nearbyPoints.length > 0 && (
                    <View style={styles.mapContainer}>
                        <MapScreen nearbyPoints={nearbyPoints} onSelectPoint={onSelectPoint} />
                    </View>
                )}
                {selectedPoint && (
                    <View style={styles.items}>
                        <View style={styles.selectedInfo}>
                            <View style={styles.info}>
                                <Text>Consecutivo: {selectedPoint.consecutivo}</Text>
                                <Text>ID: {selectedPoint.id}</Text>
                                <Text>Latitud: {selectedPoint.latitud}</Text>
                                <Text>Longitud: {selectedPoint.longitud}</Text>
                            </View>
                            <Text>Tipo Novedad:</Text>
                            <Picker
                                selectedValue={selectedValue} // Valor controlado
                                style={styles.picker}
                                onValueChange={(itemValue) => handleInputChange(itemValue)}
                            >
                                <Picker.Item label="Seleccione tipo de novedad" value="" />
                                <Picker.Item label="Luminaria Apagada" value="1" />
                                <Picker.Item label="Cambio Fotocelda" value="2" />
                                <Picker.Item label="Intermitencia" value="3" />
                                <Picker.Item label="Daño del Poste" value="4" />
                                <Picker.Item label="Falla Electrica" value="5" />
                                <Picker.Item label="Vandalismo" value="6" />
                                <Picker.Item label="Problema de Cableado" value="7" />
                                <Picker.Item label="Mantenimiento Preventivo" value="8" />
                                <Picker.Item label="Cambio Luminaria Por Mejora" value="9" />
                                <Picker.Item label="Obstruccion Visual" value="10" />
                                <Picker.Item label="Otros" value="11" />
                            </Picker>
                
                            {/* Formulario para capturar la descripción */}
                            <Text>Descripción:</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Describe el problema"
                                onChangeText={setDescription} // Actualizar el estado cuando el usuario escribe
                            />
                            <Text>Evidencia:</Text>
                            <TouchableOpacity key="Evidencia" onPress={() => pickImage(0)} style={styles.PhotoInventaryButton}>
                                {images[0] ? (
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
                        <Button title="Enviar" onPress={handleSubmit} />
                    </View>
                )}
                </>
            : <>
                <View style={styles.items}>
                        <View style={styles.selectedInfo}>
                            <View style={styles.info}>                                
                                <Text>Latitud: {location.coords.latitude}</Text>
                                <Text>Longitud: {location.coords.longitude}</Text>
                            </View>
                            <Text>Tipo Novedad:</Text>
                            <Picker
                                selectedValue={selectedValue}
                                style={styles.picker}
                                onValueChange={(itemValue) => handleInputChange(itemValue)}
                            >
                                <Picker.Item label="Seleccione tipo de novedad" value="" />
                                <Picker.Item label="Luminaria Apagada" value="1" />
                                <Picker.Item label="Cambio Fotocelda" value="2" />
                                <Picker.Item label="Intermitencia" value="3" />
                                <Picker.Item label="Daño del Poste" value="4" />
                                <Picker.Item label="Falla Electrica" value="5" />
                                <Picker.Item label="Vandalismo" value="6" />
                                <Picker.Item label="Problema de Cableado" value="7" />
                                <Picker.Item label="Mantenimiento Preventivo" value="8" />
                                <Picker.Item label="Cambio Luminaria Por Mejora" value="9" />
                                <Picker.Item label="Obstruccion Visual" value="10" />
                                <Picker.Item label="Otros" value="11" />
                            </Picker>                
                            
                            <Text>Descripción:</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Describe el problema"
                                onChangeText={setDescription}
                            />
                            <Text>Evidencia:</Text>
                            <TouchableOpacity key="Evidencia" onPress={() => pickImage(0)} style={styles.PhotoInventaryButton}>
                                {images[0] ? (
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
                    <Button title="Guardar" onPress={handleSubmit} />
                </View>
            </>}
            <View style={styles.footer}>
                <Text>Reportes guardados localmente: {localReportsCount}</Text>
                <TouchableOpacity onPress={retrySendingReports} style={styles.uploadButton}>
                    {isLoadingSend ?
                        <View style={styles.center}>
                            <ActivityIndicator size="large" color="#0000ff" />
                        </View>
                    : 
                        <Icon name="upload" type="font-awesome" color="blue" size={30} />                 
                    }
                    
                </TouchableOpacity>
            </View>
            {/* Botón temporal para limpiar AsyncStorage 
            <Button title="Limpiar Almacenamiento" onPress={clearStorage} />
            */}
            
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1, // El contenedor principal ocupa todo el espacio disponible
        justifyContent: 'center',
        backgroundColor: '#f2f2f2',
    },
    buttonContainer: {
        padding: 20, // Solo el botón tiene padding
    },
    mapContainer: {
        flex: 1, // El mapa ocupa todo el espacio restante
        padding: 10,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedInfo: {
        padding: 10,
        backgroundColor: '#e8e8e8',
        borderRadius: 5,
        marginVertical: 10,
        marginBottom: 20
    },
    info: {
        paddingBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#f8f8f8',
        padding: 8,
        marginVertical: 10,
        borderRadius: 5,
    },
    items: {
        padding: 10,
    },
    picker: {   
        marginVertical: 10,     
        width: '100%',
        marginBottom: 10,
        backgroundColor: '#f8f8f8',
    },
    PhotoInventaryButton: {
    marginVertical: 10,
    width: '100%',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderTopWidth: 1,
        borderColor: '#ccc',
    },
    uploadButton: {
        padding: 10,
    },
});

export default GetNearbyPoints;