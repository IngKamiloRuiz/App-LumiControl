import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import showToastSuccess from "../components/navigation/toastSuccess";
import showToastFail from "../components/navigation/toastFail";

const StorageScreen = () => {
    const [formDatas, setFormDatas] = useState([]);
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);

    useFocusEffect(
      React.useCallback(() => {
        loadAllFormDatas();
      }, [])
    );

    const sendDataToBackend = async (formData) => {

      const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms));

      try {
        const response = await Promise.race([
          fetch('http://10.0.2.2:8000/api/puntos_luminosos/add/', {
            method: 'POST',
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            body: formData,
          }),
          timeout(10000) // 10 segundos
        ]);        
    
        if (!response.ok) {
          throw new Error('Error en la respuesta del servidor');
        }
    
        const responseData = await response.json();
        console.log('Data enviada exitosamente:', responseData);
        return true;
      } catch (error) {
        showToastFail('Error enviando datos, no se obtuvo conexión con el servidor.')
        return false;
      }
    };

    const handleSendAll = async () => {
      if (formDatas && formDatas.length > 0){
        for (const formData of formDatas) {
          let id = 'inventory_' + formData.data.id
          const preparedData = prepareDataForBackend(formData.data);
          setLoading(true);
          const success = await sendDataToBackend(preparedData);
          setLoading(false);
          if (success) {
            handleDelete(id)
            showToastSuccess("Enviado exitosamente");
            loadAllFormDatas();
          } else {
            showToastFail('Error al enviar, verifique su conexión o comuniquese con el area encargada')
            loadAllFormDatas();
          }
        }
      }else{
        showToastFail('No hay datos disponibles para enviar.')
      }
      
    };

    const handleSend = async (formData) => {
      let id = 'inventory_' + formData.data.id
      const preparedData = prepareDataForBackend(formData.data);
      setLoading(true);
      const success = await sendDataToBackend(preparedData);
      setLoading(false);
      if (success) {        
        handleDelete(id);
        showToastSuccess("Enviado exitosamente");
        loadAllFormDatas();
      } else {
        showToastFail('Error al enviar, verifique su conexión o comuniquese con el area encargada');
        loadAllFormDatas();
      }
    };

    const prepareDataForBackend = (formData) => {
      const { inputs, lightInputs, images, date_time, location} = formData;   
      
      const formDataObject = new FormData();
      
      formDataObject.append('barrio', inputs[0]);
      formDataObject.append('altura_poste', inputs[1]);
      formDataObject.append('latitud', location.coords.latitude);
      formDataObject.append('longitud', location.coords.longitude);
      formDataObject.append('fecha_instalacion', date_time);
      if (images.length > 0) {
        formDataObject.append('foto_poste', {
          uri: images[10],
          name: 'foto_poste.jpg',
          type: 'image/jpeg'
        });
      }
      
      const luminarias = [];
      let cont_image = 0;
      for (let i = 0; i < lightInputs.length; i += 2) {        
        luminarias.push({
          serial: lightInputs[i],
          collarin: lightInputs[i + 1]
        });
        if (images.length > 0) {
          formDataObject.append(`luminarias[${cont_image}][foto_luminaria]`, {
            uri: images[cont_image],
            name: `foto_luminaria_${cont_image}.jpg`,
            type: 'image/jpeg'
          });
        }
        cont_image += 1
      }

      formDataObject.append('luminarias', JSON.stringify(luminarias));
    
      return formDataObject;
    };

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
          showToastSuccess("Formulario eliminado exitosamente!");
        } catch (error) {
          showToastFail('Error al eliminar el formulario');
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
                <Button title="Enviar" onPress={() => handleSend(item)}/>
            </View>
        </View>
    );

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Enviando datos...</Text>
        </View>
      );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={formDatas}
                keyExtractor={item => item.id}
                renderItem={renderItem}
            />            
            <Button title="Enviar Todo" onPress={handleSendAll} />        
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
});

export default StorageScreen;