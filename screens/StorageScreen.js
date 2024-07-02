import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native"

const StorageScreen = () => {
    const [formDatas, setFormDatas] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        loadAllFormDatas();
    }, []);

    const loadAllFormDatas = async () => {
        try {
        const keys = await AsyncStorage.getAllKeys();
        const formDataKeys = keys.filter(key => key.startsWith('formData_'));
        const formDatas = await AsyncStorage.multiGet(formDataKeys);

        const parsedFormDatas = formDatas.map(([key, value]) => ({
            id: key.replace('formData_', ''),
            data: JSON.parse(value),
        }));

        setFormDatas(parsedFormDatas);
        } catch (error) {
        console.error('Error al cargar los formularios:', error);
        }
    };

    const handleDelete = async (formId) => {
        try {
          await AsyncStorage.removeItem(`formData_${formId}`);
          setFormDatas(formDatas.filter(item => item.id !== formId));
          console.log('Formulario eliminado exitosamente!');
        } catch (error) {
          console.error('Error al eliminar el formulario:', error);
        }
      };
    
    const handleEdit = (item) => {
    navigation.navigate('Inventory', { item });
    };

    const confirmDelete = (id) => {
        Alert.alert(
          'Confirmación',
          '¿Estás seguro de que deseas eliminar este elemento?',
          [
            {
              text: 'Cancelar',
              style: 'cancel',
            },
            {
              text: 'Eliminar',
              onPress: () => handleDelete(id),
              style: 'destructive',
            },
          ],
          { cancelable: true }
        );
      };

    const renderItem = ({ item }) => (        
        <View style={styles.itemContainer}>
            <Text>Barrio: {item.data.inputs[0]}</Text>
            <Text>Altura poste: {item.data.inputs[1]} m</Text>
            <Text>Coordenadas: {item.data.location.coords.longitude}, {item.data.location.coords.latitude}</Text>
            <Text>Numero Luminarias: {item.data.selectedValue}</Text>
            <View style={styles.buttonContainer}>
                <Button title="Eliminar" onPress={() => confirmDelete(item.id)} />
                <Button title="Editar" onPress={() => handleEdit(item)} />
                <Button title="Enviar" />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Button title="Cargar Datos" onPress={loadAllFormDatas} />
            <FlatList
                data={formDatas}
                keyExtractor={item => item.id}
                renderItem={renderItem}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    itemContainer: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
      },
});

export default StorageScreen;