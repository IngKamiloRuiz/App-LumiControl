import React, { useState } from 'react';
import { StyleSheet, View, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { PROVIDER_GOOGLE } from 'react-native-maps';

const MapScreenInventory = ({ currentlyPoint, onConfirm }) => {

    const [region, setRegion] = useState({
        latitude: currentlyPoint.coords.latitude || 0, // Usa la latitud inicial
        longitude: currentlyPoint.coords.longitude || 0, // Usa la longitud inicial
        latitudeDelta: 0.01, // Zoom inicial
        longitudeDelta: 0.01,
    });

    const [markerCoordinate, setMarkerCoordinate] = useState({        
        latitude: currentlyPoint.coords.latitude || 0,
        longitude: currentlyPoint.coords.longitude || 0,
    });

    // Actualiza la posición del marcador al mover el mapa
    const handleRegionChange = (newRegion) => {
        setRegion(newRegion);
        setMarkerCoordinate({
            latitude: newRegion.latitude,
            longitude: newRegion.longitude,
        });
    };

    // Confirma las coordenadas seleccionadas
    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm(markerCoordinate);
        }
    };

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={region}
                onRegionChangeComplete={handleRegionChange}
            >
                <Marker coordinate={markerCoordinate} />
            </MapView>
            <View style={styles.buttonContainer}>
                <Button title="Confirmar Ubicación" onPress={handleConfirm} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: 300,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
});

export default MapScreenInventory;
