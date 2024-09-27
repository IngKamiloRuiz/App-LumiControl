import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { Icon } from '@rneui/themed';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '@rneui/themed';
import MapScreen from './MapScreen';
import { API_URL_DEVELOPMENT, API_URL_PRODUCTION } from '@env';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from "@react-navigation/native";
import showToastSuccess from "../../components/navigation/toastSuccess";
import showToastFail from "../../components/navigation/toastFail";

const TemporalScreen = () => {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [nearbyPoints, setNearbyPoints] = useState([]);
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [showMap, setShowMap] = useState(false);
    const [onlySend, setOnlySend] = useState(false);
    const [images, setImages] = useState([]);
    const [saveCounter, setSaveCounter] = useState(0);
    const [puntosGuardados, setPuntosGuardados] = useState([]);
    const apiUrl = __DEV__ ? API_URL_DEVELOPMENT : API_URL_PRODUCTION;

    const getPoints = async () => {
        setIsLoading(true);
        try {
            const urlWithParams = `${apiUrl}puntos_luminosos/pendientes-imagenes`;
            const response = await fetch(urlWithParams, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }

            const responseData = await response.json();
            await savePointsToStorage(responseData);
            setShowMap(true);
        } catch (error) {
            showToastFail('Error enviando datos, no se obtuvo conexión con el servidor.');
        } finally {
            setIsLoading(false);            
        }
    };

    const savePointsToStorage = async (points) => {
        try {
            await AsyncStorage.removeItem('PointsPending');
            const storedSavedPoints = await AsyncStorage.getItem('PointsPending');
            const savedPoints = storedSavedPoints ? JSON.parse(storedSavedPoints) : [];        

            const updatedSavedPoints = [...savedPoints, ...points];
            await AsyncStorage.setItem('PointsPending', JSON.stringify(updatedSavedPoints));
            
            setPuntosGuardados(updatedSavedPoints);
        } catch (error) {
            showToastFail('Error guardando los puntos en AsyncStorage:', error);
        }
    };

    const loadPuntosAndCounterFromStorage = async () => {
        try {            
            let storedSavedPoints = await AsyncStorage.getItem('savedPoints');
            let storedPendingPoints = await AsyncStorage.getItem('PointsPending');

            if (storedSavedPoints){                
                setSaveCounter(JSON.parse(storedSavedPoints).length)
            }            
            if (JSON.parse(storedPendingPoints).length !== 0) {
                setShowMap(true)
                setPuntosGuardados(JSON.parse(storedPendingPoints));
            } else {
                if(JSON.parse(storedSavedPoints).length == 0) 
                {
                    setShowMap(false)
                }else{
                    setShowMap(true)
                    setOnlySend(true)
                }                   
            }
            
            if(JSON.parse(storedPendingPoints).length === JSON.parse(storedSavedPoints).length) {
                setOnlySend(true)
            }
            
        } catch (error) {
            showToastFail('Error al cargar los puntos guardados y el contador:', error);
        }
    };

    useEffect(() => {        
        loadPuntosAndCounterFromStorage(); 
    }, []);


    const saveSelectedPoint = async () => {
        try {           
            const storedSavedPoints = await AsyncStorage.getItem('savedPoints');

            let savedPointsArray = storedSavedPoints ? JSON.parse(storedSavedPoints) : [];
            let pointToSave = [] 
            if (images.length > 1){
                pointToSave = {
                    id: selectedPoint.id,
                    consecutivo: selectedPoint.consecutivo,
                    images,
                };  
            } else {
                showToastFail('Se deben cargar imagenes');
                return;
            }                                    
            
            savedPointsArray.push(pointToSave);
            await AsyncStorage.setItem('savedPoints', JSON.stringify(savedPointsArray));

            const storedPendingPoints = await AsyncStorage.getItem('PointsPending');
            const PendeingPoints = storedPendingPoints ? JSON.parse(storedPendingPoints) : [];
            
            const updatedPoints = PendeingPoints.filter(point => point.id !== selectedPoint.id);

            await AsyncStorage.setItem('PointsPending', JSON.stringify(updatedPoints));

            navigation.replace('Temporal');
        } catch (error) {
            showToastFail('Error al guardar el punto seleccionado:', error);
        }
    };

    const sendPendingPoints = async () => {
        try {
            // Obtén los puntos guardados desde AsyncStorage
            const storedSavedPoints = await AsyncStorage.getItem('savedPoints');
            
            if (storedSavedPoints) {
                const puntosGuardados = JSON.parse(storedSavedPoints); // Parsear la lista de puntos guardados
    
                if (Array.isArray(puntosGuardados) && puntosGuardados.length > 0) {
                    for (let i = 0; i < puntosGuardados.length; i++) {
                        const point = puntosGuardados[i]; // Toma el punto individual
    
                        // Crear un FormData para enviar imágenes y datos
                        const formData = new FormData();
                        formData.append('id', point.id);
                        formData.append('consecutivo', point.consecutivo);
    
                        // Agregar imágenes al FormData
                        point.images.forEach((imageUri, index) => {
                            const file = {
                                uri: imageUri,
                                type: 'image/jpeg', // o el tipo MIME correcto para tus imágenes
                                name: `image_${index}.jpg`, // Nombre del archivo en el backend
                            };
                            formData.append('images', file);
                        });
                        try {
                            // Envía el punto al backend
                            setIsLoading(true)
                            const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms));

                            
                            const response = await Promise.race([fetch(`${apiUrl}puntos_luminosos/envio-pendientes`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                },
                                body: formData, // Envía el FormData
                            }),
                                timeout(60000)// 60 segundos
                            ]);
                            // Si el punto se envió correctamente, lo eliminamos de AsyncStorage
                            if (response.ok) {
                                setIsLoading(false)
                                showToastSuccess(`Punto con id ${point.id} enviado exitosamente`);
                                
                                // Elimina el punto ya enviado del array
                                puntosGuardados.splice(i, 1);
                                i--; // Ajustar el índice tras eliminar
                                
                                // Guarda la nueva lista sin el punto enviado
                                await AsyncStorage.setItem('savedPoints', JSON.stringify(puntosGuardados));
                                //se reduce el contador en 1
                                setSaveCounter(saveCounter-1)
                                navigation.replace('Temporal');
                            } else {
                                setIsLoading(false)
                                showToastFail(`Error al enviar el punto con id ${point.id}`);
                            }
                            
                        } catch (error) {
                            setIsLoading(false)
                            if (error.message === 'Request timed out') {
                            showToastFail('Error: El tiempo de espera de la solicitud ha expirado.');
                            } else {
                            showToastFail('Error enviando datos, no se obtuvo conexión con el servidor.');
                            }
                        }
                    }
    
                    // Si no quedan puntos pendientes, actualizamos el estado
                    if (puntosGuardados.length === 0) {
                        setSaveCounter(0);
                        setPuntosGuardados([]);
                        alert('Todos los puntos enviados exitosamente');
                    }
                } else {
                    alert('No hay puntos pendientes por enviar');
                }
            } else {
                alert('No hay puntos guardados.');
            }
        } catch (error) {
            showToastFail('Error enviando los puntos pendientes:', error);
        }
    };   

    const pickImage = async (index) => {
        try {
          const freeSpace = await FileSystem.getFreeDiskStorageAsync();
          const minimumSpaceRequired = 100 * 1024 * 1024; 

          if (freeSpace < minimumSpaceRequired) {
            alert('No hay suficiente espacio de almacenamiento disponible.');
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
            const fileName = imageUri.split('/').pop(); 
            const newPath = `${FileSystem.documentDirectory}${fileName}`;
            await FileSystem.moveAsync({
              from: imageUri,
              to: newPath,
            });

            let newImages = [...images];
            newImages[index] = newPath;  
            setImages(newImages);
          }
          } catch (error) {
            console.error("Error al capturar la imagen:", error);
          }
        };

    const clearStorage = async () => {
        try {
            await AsyncStorage.removeItem('PointsPending');
            await AsyncStorage.removeItem('savedPoints');
            setSaveCounter(0);
            setPuntosGuardados([]);
            alert("Datos de puntos guardados eliminados del almacenamiento");
            navigation.replace('Temporal');
        } catch (error) {
            console.error("Error al limpiar los datos de puntos guardados:", error);
        }
    };

    const onSelectPoint = (point) => {
        setSelectedPoint(point);
    };

    return (
        <ScrollView>
            {isLoading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <View>
                    {!showMap ? (
                        <Button title="Obtener Puntos Pendientes" onPress={getPoints} />
                    ) : ( 
                        <>  
                            {!onlySend ? <>                          
                                {puntosGuardados.length > 0 && (
                                    <View style={styles.mapContainer}>
                                        <MapScreen nearbyPoints={puntosGuardados} onSelectPoint={onSelectPoint} />
                                    </View>
                                )}

                                {selectedPoint && (
                                    <View style={styles.selectedPointContainer}>
                                        <Text style={styles.selectedPointText}>
                                            Punto Seleccionado: {selectedPoint.consecutivo}
                                        </Text>
                                        <Text style={styles.label}>Evidencia Punto</Text>
                                        <TouchableOpacity key="FotoPoste" onPress={() => pickImage(0)} style={styles.PhotoInventaryButton}>
                                            {images[0] ? (
                                                <Icon name="check" type="font-awesome" color="green" size={30} />
                                            ) : (
                                                <MaterialCommunityIcons name="camera-marker-outline" size={40} color="black" />
                                            )}
                                        </TouchableOpacity>
                                        <Text style={styles.label}>Evidencia Luminaria</Text>
                                        <TouchableOpacity key="FotoLuminaria" onPress={() => pickImage(1)} style={styles.PhotoInventaryButton}>
                                            {images[1] ? (
                                                <Icon name="check" type="font-awesome" color="green" size={30} />
                                            ) : (
                                                <MaterialCommunityIcons name="camera-marker-outline" size={40} color="black" />
                                            )}
                                        </TouchableOpacity>
                                        { selectedPoint.cantidad_luminarias === 2 ?
                                            <>
                                                <Text style={styles.label}>Evidencia Luminaria 2</Text>
                                                <TouchableOpacity key="FotoLuminaria2" onPress={() => pickImage(2)} style={styles.PhotoInventaryButton}>
                                                {images[2] ? (
                                                    <Icon name="check" type="font-awesome" color="green" size={30} />
                                                ) : (
                                                    <MaterialCommunityIcons name="camera-marker-outline" size={40} color="black" />
                                                )}
                                                </TouchableOpacity>
                                            </> : <></>
                                        }
                                        { selectedPoint.cantidad_luminarias === 3 ?
                                            <>
                                                <Text style={styles.label}>Evidencia Luminaria 3</Text>
                                                <TouchableOpacity key="FotoLuminaria3" onPress={() => pickImage(3)} style={styles.PhotoInventaryButton}>
                                                {images[3] ? (
                                                    <Icon name="check" type="font-awesome" color="green" size={30} />
                                                ) : (
                                                    <MaterialCommunityIcons name="camera-marker-outline" size={40} color="black" />
                                                )}
                                                </TouchableOpacity>
                                            </> : <></>
                                        }
                                        

                                        <Button title="Guardar" onPress={saveSelectedPoint} />
                                    </View>
                                )}
                            </> : <></>}
                            
                            <Text>Guardados: {saveCounter}</Text>
                            { saveCounter > 0 ?
                                <Button title="Enviar Puntos Guardados" onPress={sendPendingPoints} /> : <></>
                            }                            
                            
                        </>
                    )}

                    {/* Botón temporal para limpiar AsyncStorage 
                    <Button title="Limpiar Almacenamiento" onPress={clearStorage} />
                    */}
                    {errorMsg && <Text>{errorMsg}</Text>}
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({    
    mapContainer: {
        flex: 1,
    },
    selectedPointContainer: {
        marginTop: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        width: '100%',
    },
    selectedPointText: {
        fontSize: 16,
        fontWeight: 'bold',
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
});

export default TemporalScreen;
