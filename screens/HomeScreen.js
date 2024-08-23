import React from "react";
import {View, Text, StyleSheet, Button, Alert} from "react-native";
import ButtonDark from '../components/navigation/button';
import { useNavigation } from "@react-navigation/native";
import { useMunicipio } from '../screens/components/municipiesContext';
import showToastFail from "../components/navigation/toastFail";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from "react";
import { useAuth } from '../screens/Login/authContext';

const HomeScreen = () => {
    const { municipio } = useMunicipio();
    const navigation = useNavigation();
    const [user, setUser] = useState();
    const { logout } = useAuth();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userName = await AsyncStorage.getItem('userName');
                if (userName) {
                    setUser(userName);
                } else {
                    // Maneja el caso en que el nombre de usuario no está disponible
                    setUser('Nombre de usuario no disponible');
                }
            } catch (error) {
                console.error('Error al obtener el nombre de usuario:', error);
                setUser('Error al cargar el nombre de usuario');
            }
        };

        fetchUser();
    }, []);

    const handlePress = () => {
        if (municipio) {
            navigation.navigate("Inventory");
        } else {
            showToastFail('Por favor selecciona un municipio antes de continuar.')
        }
      };

    const confirmDelete = (id) => {
        Alert.alert(
            'Confirmación',
            '¿Seguro de que desea cerrar sesión?',
            [
            {
                text: 'Cancelar',
                style: 'cancel',
            },
            {
                text: 'Continuar',
                onPress: () => handleLogout(),
                style: 'destructive',
            },
            ],
            { cancelable: true }
        );
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userId');
        await AsyncStorage.removeItem('userName');
        logout();        
    };

    return(
        <>
        <Text style={styles.user}>{user}</Text>        
        <View style={styles.container}>        
            <View style={styles.titleContainer}>
                <Text style={styles.titleApp}>Control Luminarias</Text>
            </View>
            <View style={styles.buttonsContainer}>
                <View style={styles.stepContainer}>
                    <ButtonDark text="Inventario" onPress={handlePress}/> 
                </View>
                {/* <View style={styles.stepContainer}>
                    <ButtonDark text="Instalación" onPress={() => navigation.navigate("Inventory")}/> 
                </View>
                <View style={styles.stepContainer}>
                    <ButtonDark text="Mantenimiento" onPress={() => navigation.navigate("Inventory")}/> 
                </View> */}
            </View>
            <View>
                <Button title="Logout" onPress={confirmDelete} />
            </View>
        </View>
    </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    titleContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    user: {
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 10,
        marginTop: 5,
    },
    titleApp: {
        fontSize: 32,
        fontWeight: 'bold',
        lineHeight: 32,
    },
    buttonsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepContainer: {
        width: '80%',
        marginBottom: 30,
    },   
  });

export default HomeScreen;