import React, { useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TextInput } from "react-native";
import { Button } from '@rneui/themed';
import * as Location from 'expo-location';
import { API_URL_DEVELOPMENT, API_URL_PRODUCTION } from '@env';
import MapScreen from './MapScreen'; // Asegúrate de que la ruta esté bien

const GetNearbyPoints = () => {   
    const [isLoading, setIsLoading] = useState(false);
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [nearbyPoints, setNearbyPoints] = useState([]);
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [description, setDescription] = useState("");
    const apiUrl = __DEV__ ? API_URL_DEVELOPMENT : API_URL_PRODUCTION;

    const handleSubmit = async () => {
        if (!selectedPoint) {
            alert("Por favor, selecciona un punto.");
            return;
        }

        const dataToSend = {
            id: selectedPoint.id,
            consecutivo: selectedPoint.consecutivo,
            latitud: selectedPoint.latitud,
            longitud: selectedPoint.longitud,
            descripcion: description,
        };
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
            timeout(60000), // 60 segundos
          ]);
      
          if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
          }
      
          const responseData = await response.json();
          
          setNearbyPoints(responseData);
          
        } catch (error) {
          console.log('Error:', error);
          setErrorMsg('Error enviando datos, no se obtuvo conexión con el servidor.');
        } finally {
          setIsLoading(false);
        }
    };

    return (
        <View >
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
            {/* Mostrar información del punto seleccionado */}
            {selectedPoint && (
                <View style={styles.selectedInfo}>
                    <Text>Consecutivo: {selectedPoint.consecutivo}</Text>
                    <Text>ID: {selectedPoint.id}</Text>
                    <Text>Latitud: {selectedPoint.latitud}</Text>
                    <Text>Longitud: {selectedPoint.longitud}</Text>
                </View>
            )}

            {/* Formulario para capturar la descripción */}
            <Text>Descripción:</Text>
            <TextInput
                style={styles.input}
                placeholder="Describe el problema"
                value={description}
                onChangeText={setDescription} // Actualizar el estado cuando el usuario escribe
            />
            
            {/* Botón para enviar el formulario */}
            <Button title="Enviar" onPress={handleSubmit} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1, // El contenedor principal ocupa todo el espacio disponible
        backgroundColor: '#f2f2f2',
    },
    buttonContainer: {
        padding: 20, // Solo el botón tiene padding
    },
    mapContainer: {
        flex: 1, // El mapa ocupa todo el espacio restante
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedInfo: {
        padding: 10,
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
        marginVertical: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        marginVertical: 10,
        borderRadius: 5,
    },
});

export default GetNearbyPoints;