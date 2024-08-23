import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";
import { useAuth } from '../Login/authContext';

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();
    const { login } = useAuth();

    const handleLogin = async () => {
        
            const payload = {
                username: username,
                password: password
            };

            const timeout = (ms) => new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out')), ms)
            );

            const response = await Promise.race([
                //fetch('http://10.0.2.2:8000/api/token/', {
                fetch('https://seandato-ab16d5fddecb.herokuapp.com/api/token/', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(payload),
                }),
                timeout(30000) // 30 segundos
              ]);

            const data = await response.json();

            const token = data.access

            //const response_user = await fetch('http://10.0.2.2:8000/api/user/', {
            const response_user = await fetch('https://seandato-ab16d5fddecb.herokuapp.com/api/user/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data_user = await response_user.json();     

            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userId', String(data_user.id));
            await AsyncStorage.setItem('userName', data_user.username);
            
            login(token);            
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.logoContainer}>
                <Image 
                    source={require('../../assets/Logo_Login.png')}
                    style={styles.logo}
                />
            </View>
            <View style={styles.form}>
                <Text style={styles.label}>Usuario</Text>
                <TextInput
                    style={styles.input} 
                    onChangeText={setUsername} 
                    placeholder="Ingrese su usuario"
                    placeholderTextColor="#888"
                />
                <Text style={styles.label}>Contraseña</Text>
                <TextInput 
                    style={styles.input} 
                    onChangeText={setPassword} 
                    secureTextEntry 
                    placeholder="Ingrese su contraseña"
                    placeholderTextColor="#888"
                />
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    logoContainer: {
        marginBottom: 5,
        alignItems: 'center',
    },
    logo: {
        width: 250,
        height: 150,
        resizeMode: 'contain',
    },
    form: {
        width: '80%',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 15,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#2289DC',
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});