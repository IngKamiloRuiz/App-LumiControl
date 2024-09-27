import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { PROVIDER_GOOGLE } from 'react-native-maps';

const MapScreen = ({ nearbyPoints, onSelectPoint }) => {
    // Definir una ubicación inicial en caso de que no recibas la ubicación del usuario
    const initialRegion = {
        latitude: nearbyPoints[0]?.latitud || 0, // Usa la latitud de un punto cercano o un valor por defecto
        longitude: nearbyPoints[0]?.longitud || 0, // Usa la longitud de un punto cercano o un valor por defecto
        latitudeDelta: 0.01, // Zoom del mapa (ajusta si es necesario)
        longitudeDelta: 0.01,
    };

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={initialRegion}
                showsUserLocation={true} // Muestra la ubicación actual
            >
                {/* Renderizar los puntos cercanos como marcadores */}
                {nearbyPoints.map((point, index) => (
                    <Marker
                        key={index}
                        coordinate={{ latitude: parseFloat(point.latitud), longitude: parseFloat(point.longitud) }}
                        title={point.consecutivo}  // Mostrar el consecutivo como título
                        description={`Lat: ${point.latitud}, Lon: ${point.longitud}`}
                        onPress={() => onSelectPoint(point)} // Llamar a la función onSelectPoint al hacer clic
                    />
                ))}
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: 300,  // Asegura un valor mínimo de altura
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
});

export default MapScreen;