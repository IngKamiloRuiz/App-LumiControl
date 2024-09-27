import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import showToastSuccess from "../components/navigation/toastSuccess";
import showToastFail from "../components/navigation/toastFail";
import { API_URL_DEVELOPMENT, API_URL_PRODUCTION } from '@env';
import * as FileSystem from 'expo-file-system';

const StorageScreen = () => {
    const [formDatas, setFormDatas] = useState([]);
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const apiUrl = __DEV__ ? API_URL_DEVELOPMENT : API_URL_PRODUCTION;

    useFocusEffect(
      React.useCallback(() => {
        loadAllFormDatas();
      }, [])
    );

    const sendDataToBackend = async (formData) => {
      const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms));
    
      try {
        const response = await Promise.race([          
          fetch(`${apiUrl}puntos_luminosos/add`, {
            method: 'POST',
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            body: formData,
          }),
          timeout(60000) // 60 segundos
        ]);
    
        if (!response.ok) {
          throw new Error('Error en la respuesta del servidor');
        }
    
        const responseData = await response.json();
        showToastSuccess('Data enviada exitosamente:', responseData);
        return true;
      } catch (error) {
        if (error.message === 'Request timed out') {
          showToastFail('Error: El tiempo de espera de la solicitud ha expirado.');
        } else {
          showToastFail('Error enviando datos, no se obtuvo conexión con el servidor.');
        }
        return false;
      }
    };
    
    const handleSendAll = async () => {
      if (formDatas && formDatas.length > 0){
        setLoading(true);
        for (const formData of formDatas) {          
          let id = 'inventory_' + formData.data.id;
          const preparedData = await prepareDataForBackend(formData.data);          
          const success = await sendDataToBackend(preparedData);          
          if (success) {
            handleDelete(id);
            showToastSuccess("Enviado exitosamente");
            loadAllFormDatas();
          } else {
            showToastFail('Error al enviar todos los datos, verifique su conexión o comuníquese con el área encargada.');
            loadAllFormDatas();
          }
        }
        setLoading(false);
      } else {
        showToastFail('No hay datos disponibles para enviar.');
      }
    };
    
    const handleSend = async (formData) => {
      let id = 'inventory_' + formData.data.id;
      const preparedData = await prepareDataForBackend(formData.data);
      setLoading(true);
      const success = await sendDataToBackend(preparedData);
      setLoading(false);
      if (success) {        
        showToastSuccess("Enviado exitosamente");
        handleDelete(id);
        loadAllFormDatas();
      } else {
        showToastFail('Error al enviar el formulario, verifique su conexión o comuníquese con el área encargada.');
        loadAllFormDatas();
      }
    };
    
    const prepareDataForBackend = async (formData) => {
      try {
        const { inputs, lightInputs, images, date_time, location, sector, municipio, usuario_crea, observaciones } = formData;
      
        const formDataObject = new FormData();
      
        formDataObject.append('municipio', municipio);
        formDataObject.append('usuario_crea', usuario_crea);
        formDataObject.append('barrio', inputs[0]);
        formDataObject.append('altura_poste', inputs[1]);
        formDataObject.append('direccion', inputs[2]);
        formDataObject.append('poste', inputs[3]);
        formDataObject.append('tipo_red', inputs[4]);
        formDataObject.append('sector', sector === 'Urbano' ? 1 : 2);
        formDataObject.append('latitud', location.coords.latitude);
        formDataObject.append('longitud', location.coords.longitude);
        formDataObject.append('fecha_captura', date_time);
        formDataObject.append('observaciones', observaciones);
      
        if (images.length > 10) {
          try {
            const mainImageExists = await FileSystem.getInfoAsync(images[10]);
            if (mainImageExists.exists) {
              formDataObject.append('foto_poste', {
                uri: images[10],
                name: 'foto_poste.jpg',
                type: 'image/jpeg'
              });
            } else {
              showToastFail('La imagen foto_poste no fue encontrada.');
              return null;
            }
          } catch (error) {
            showToastFail('Error al verificar la existencia de foto_poste.');
            return null;
          }
        } else {
          showToastFail('No se encontró imagen de poste en la posición esperada.');
          return null;
        }

        const luminarias = [];
        let cont_image = 0;
    
        for (let i = 0; i < lightInputs.length; i += 5) {        
          luminarias.push({
            serial: lightInputs[i],
            collarin: lightInputs[i + 1],
            potencia: lightInputs[i + 2],
            tipo_luminaria: lightInputs[i + 3],
            estado: lightInputs[i + 4],
          });
    
          // Manejar la imagen de cada luminaria
          if (images.length > cont_image) {
            try {
              const luminariaImageExists = await FileSystem.getInfoAsync(images[cont_image]);
              if (luminariaImageExists.exists) {
                formDataObject.append(`luminarias[${cont_image}][foto_luminaria]`, {
                  uri: images[cont_image],
                  name: `foto_luminaria_${cont_image}.jpg`,
                  type: 'image/jpeg'
                });
              } else {
                showToastFail(`La imagen de luminaria ${cont_image + 1} no fue encontrada`);
                return null;
              }
            } catch (error) {
              showToastFail(`Error al verificar la existencia de la imagen de luminaria ${cont_image + 1}`);
              return null;
            }
          }
    
          cont_image += 1;
        }
    
        formDataObject.append('luminarias', JSON.stringify(luminarias));
    
        return formDataObject;
      } catch (error) {
        showToastFail('Error al preparar los datos para el backend. Verifique el formulario.');
        throw error;
      }
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
        showToastFail('Error al cargar los formularios almacenados.');
      }
    };
    

    const handleDelete = async (formId) => {
      try {
        // Obtener los datos del formulario desde AsyncStorage
        const formDataString = await AsyncStorage.getItem(`formData_${formId}`);
        const formData = formDataString ? JSON.parse(formDataString) : null;
    
        if (formData && formData.images) {
          // Eliminar cada imagen almacenada localmente
          for (const imageUri of formData.images) {
            if (imageUri) {  // Verifica que la imagen no sea null o undefined
              try {
                // Verifica si la imagen existe antes de intentar eliminarla
                const imageExists = await FileSystem.getInfoAsync(imageUri);
                if (imageExists.exists) {
                  await FileSystem.deleteAsync(imageUri);
                }
              } catch (imageError) {
                showToastFail(`Error al eliminar la imagen ${imageUri}:`, imageError);
              }
            }
          }
        }
    
        // Eliminar el formulario del AsyncStorage
        await AsyncStorage.removeItem(`formData_${formId}`);
        setFormDatas(formDatas.filter(item => item.id !== formId));
      } catch (error) {
        showToastFail('Error al eliminar el formulario o las imágenes');
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
            <View style={styles.header}>
              <View style={styles.counterContainer}>
                <Text style={styles.counterText}>Capturas Realizadas: {formDatas.length}</Text>
              </View>
            </View>            
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
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      padding: 10,
    },
    counterContainer: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
      backgroundColor: '#f9f9f9',
    },
    counterText: {
      fontSize: 12,
      fontWeight: 'bold',
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