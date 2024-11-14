import React, { useState, useEffect } from "react";
import {View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TextInput, TouchableOpacity, Switch } from "react-native";
import { Input, Icon, CheckBox } from '@rneui/themed';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from '@rneui/themed';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { RadioButton } from 'react-native-paper';
import { Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import showToastSuccess from "../../components/navigation/toastSuccess";
import showToastFail from "../../components/navigation/toastFail";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapScreen from './components/MapScreen';
import { useMunicipio } from '../components/municipiesContext';
import * as FileSystem from 'expo-file-system';
import { API_URL_DEVELOPMENT, API_URL_PRODUCTION } from '@env';

const estados = {
  1: 'Pendiente por punto',
  2: 'Pendiente',
  3: 'Inspeccionado',
  4: 'Atendido',
  5: 'Finalizado',
  6: 'Cerrado',
};

const tipo_novedad = {
  1: 'Luminaria Apagada',
  2: 'Cambio Fotocelda',
  3: 'Intermitencia',
  4: 'Daño del Poste',
  5: 'Falla Electrica',
  6: 'Vandalismo',
  7: 'Problema de Cableado',
  8: 'Mantenimiento Preventivo',
  9: 'Cambio Luminaria Por Mejora',
  10: 'Obstruccion Visual',
  11: 'Otros',
};

const tipo_atencion = {
  1: 'Apertura',
  2: 'Registro de Inspección',
  3: 'Registro de Atención',
  4: 'Novedad',
  5: 'Finalizado',
};

const AttendMaintenance = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [maintenancePoints, setMaintenancePoints] = useState([]);
  const [changedMaintenancePoints, setChangedMaintenancePoints] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [netOnline, setNetOnline] = useState(true);
  const [selectedValue, setSelectedValue] = useState("");
  const [description, setDescription] = useState("");
  const { municipio } = useMunicipio();
  const [checked, setChecked] = useState('');
  const apiUrl = __DEV__ ? API_URL_DEVELOPMENT : API_URL_PRODUCTION;
  const [dataLoaded, setDataLoaded] = useState(false);

  //Para el form
  const [descripcion, setDescripcion] = useState('');
  const [fechaAtencion, setFechaAtencion] = useState(new Date());
  const [horaInicio, setHoraInicio] = useState(new Date());
  const [horaFin, setHoraFin] = useState(new Date());
  const [pendiente, setPendiente] = useState(false);
  const [agregarSoportes, setAgregarSoportes] = useState(false);
  const [pendienteDescripcion, setPendienteDescripcion] = useState('');
  const [soporteFile, setSoporteFile] = useState([]);
  const [images, setImages] = useState([]);

  const [showFechaAtencion, setShowFechaAtencion] = useState(false);
  const [showHoraInicio, setShowHoraInicio] = useState(false);
  const [showHoraFin, setShowHoraFin] = useState(false);

  const [completedCount, setCompletedCount] = useState(0);
  const [toSend, setToSend] = useState([]);
  const isFinalizado = selectedPoint?.estado === 5;

  // Maneja la lógica de habilitar o deshabilitar campos
  const isFullFormEnabled = checked === 'inspeccion' || checked === 'atencion';
  const isDescriptionOnly = checked === 'novedad' || checked === 'finalizar';
  

  useEffect(() => {
    const completedMantenimientos = maintenancePoints.filter(point => point.estado === 5); // Estado 5 es Finalizado
    setCompletedCount(completedMantenimientos.length);
  }, [maintenancePoints]); // Se ejecuta cada vez que `maintenancePoints` cambia

  useEffect(() => {
    const loadMaintenancesFromStorage = async () => {
        try {
            const storedData = await AsyncStorage.getItem('maintenances');
            const storedChangeData = await AsyncStorage.getItem('changedMaintenances');
            
            if (storedData) {
                setMaintenancePoints(JSON.parse(storedData));
            }
            if (storedChangeData) {
                setChangedMaintenancePoints(JSON.parse(storedChangeData));
            }

            setDataLoaded(true); // Marcar que los datos se han cargado desde AsyncStorage
        } catch (error) {
            console.error("Error loading maintenances from storage:", error);
        }
    };

    loadMaintenancesFromStorage();
  }, []);

const validateForm = () => {
  if (!descripcion) {
      showToastFail('Por favor, completa la descripción.');
      return false;
  }

  if ((checked === 'inspeccion' || checked === 'atencion') && (!fechaAtencion || !horaInicio || !horaFin)) {
      showToastFail('Por favor, completa la fecha y las horas de atención.');
      return false;
  }

  if (pendiente && !pendienteDescripcion) {
      showToastFail('Por favor, completa la descripción de los pendientes.');
      return false;
  }

  return true;
};

const handleSubmitForm = async () => {
  if (!validateForm()) return;

  try {
      // Crear el nuevo registro con la información del formulario
      const tipoAtencionValue = checked === 'inspeccion' ? 2 
                            : checked === 'atencion' ? 3
                            : checked === 'novedad' ? 4
                            : checked === 'finalizar' ? 5
                            : null;

      const newRegistro = {
          fecha_atencion: fechaAtencion,
          hora_inicio: horaInicio,
          hora_finalizacion: horaFin,
          reporte_tecnico: descripcion,
          pendientes: pendiente ? pendienteDescripcion : null,
          tipo_atencion: tipoAtencionValue,
          images: images || [], // Agregar imágenes
          soporteFiles: soporteFile ? [soporteFile] : [] // Agregar archivos de soporte si existen
      };

      // Actualizar `maintenancePoints` con el nuevo registro
      const updatedMaintenancePoints = maintenancePoints.map(point => {
          if (point.id === selectedPoint.id) {
              // Agregar el nuevo registro en `data_registro`
              const updatedPoint = {
                  ...point,
                  estado: tipoAtencionValue === 5 ? 5 : point.estado, // Marcar como finalizado si aplica
                  data_registro: [...point.data_registro, newRegistro]
              };
              return updatedPoint;
          }
          return point;
      });

      // Guardar el estado actualizado de todos los mantenimientos en `maintenancePoints`
      setMaintenancePoints(updatedMaintenancePoints);

      // Actualizar `changedMaintenancePoints` solo con el nuevo registro
      setChangedMaintenancePoints(prev => {
        const existingIndex = prev.findIndex(point => point.id === selectedPoint.id);
        let updatedPoints;
    
        if (existingIndex !== -1) {
            // Si el mantenimiento ya tiene cambios, actualizamos `data_registro`
            const updatedPoint = { 
                ...prev[existingIndex], 
                data_registro: [...prev[existingIndex].data_registro, newRegistro] 
            };
            updatedPoints = [...prev];
            updatedPoints[existingIndex] = updatedPoint;
        } else {
            // Si el mantenimiento no estaba en `changedMaintenancePoints`, lo agregamos
            updatedPoints = [...prev, { 
                ...selectedPoint, 
                data_registro: [newRegistro] 
            }];
        }
    
        // Guardar `updatedPoints` en AsyncStorage
        AsyncStorage.setItem('changedMaintenances', JSON.stringify(updatedPoints))
            .then(() => console.log('changedMaintenances guardado exitosamente'))
            .catch(error => console.error('Error guardando changedMaintenances:', error));
    
        return updatedPoints;
      });

      // Actualizar el punto en el estado `selectedPoint` solo para la visualización en la UI
      setSelectedPoint(prevPoint => ({
          ...prevPoint,
          estado: tipoAtencionValue === 5 ? 5 : prevPoint.estado, // Marcar como finalizado si aplica
          data_registro: [...prevPoint.data_registro, newRegistro]
      }));

      // Limpiar el formulario después de enviar
      resetForm();
      
      showToastSuccess('Registro agregado exitosamente');
  } catch (error) {
      showToastFail("Error al guardar el registro: " + error.message);
  }
};



const resetForm = () => {
  setDescripcion(''); // Limpiar la descripción
  setFechaAtencion(new Date()); // Reiniciar la fecha de atención a la actual
  setHoraInicio(new Date()); // Reiniciar la hora de inicio a la actual
  setHoraFin(new Date()); // Reiniciar la hora de fin a la actual
  setPendiente(false); // Reiniciar el estado de pendientes
  setPendienteDescripcion(''); // Limpiar la descripción de pendientes
  setAgregarSoportes(false); // Reiniciar el estado de soportes
  setSoporteFile([]); // Limpiar el archivo de soporte
  setImages([]); // Limpiar las imágenes seleccionadas
};


// Función para seleccionar un punto y combinar la información de `changedMaintenancePoints`
const onSelectPoint = (point) => {
  // Buscar en `changedMaintenancePoints` si hay algún cambio para este punto
  const changedPoint = changedMaintenancePoints.find(p => p.id === point.id);

  // Si hay cambios, fusionarlos con el `selectedPoint`
  if (changedPoint) {
      const updatedPoint = {
          ...point,
          data_registro: [...point.data_registro, ...changedPoint.data_registro]
      };
      setSelectedPoint(updatedPoint);
  } else {
      // Si no hay cambios, solo establece `selectedPoint` con el `point` original
      setSelectedPoint(point);
  }
};


const getMaintenances = async () => {
  setIsLoading(true); // Muestra el ícono de carga
  const idUsuario = await AsyncStorage.getItem('userId');

  const urlWithParams = `${apiUrl}mantenimientos/get-mantenimientos?municipio=${municipio}&usuario=${idUsuario}`;

  try {
      const timeout = (ms) =>
          new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms));

      const response = await Promise.race([
          fetch(urlWithParams, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
              },
          }),
          timeout(30000),
      ]);

      if (!response.ok) {
          showToastFail('No se obtuvo conexión con el servidor.');
          throw new Error('Error en la respuesta del servidor');
      }

      const responseData = await response.json();

      // Guardar los datos en AsyncStorage
      await AsyncStorage.setItem('maintenances', JSON.stringify(responseData));

      // Actualizar el estado local y marcar los datos como cargados
      setMaintenancePoints(responseData);
      setDataLoaded(true); // Marcar que los datos se han cargado
  } catch (error) {
      console.log("Error fetching data: ", error);
  } finally {
      setIsLoading(false); // Oculta el ícono de carga
  }
};


const pickImage = async () => {
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

          await saveFilePath(newPath);

          // Agregar la nueva imagen al arreglo de imágenes
          setImages(prevImages => [...prevImages, { uri: newPath, name: fileName }]);
      }
  } catch (error) {
      showToastFail("Error al capturar la imagen:", error);
  }
};


const handleUploadFile = async () => {
    try {
        let result = await DocumentPicker.getDocumentAsync({
            type: '*/*', // Aceptar cualquier tipo de archivo
            copyToCacheDirectory: true,
            multiple: true, // Permitir múltiples selecciones
        });

        if (result.canceled) {
            showToastFail('Carga de archivo cancelada.');
            return;
        }

        if (result.assets && result.assets.length > 0) {
            const persistedFiles = await Promise.all(
                result.assets.map(async (asset) => {
                    const fileName = asset.name || asset.uri.split('/').pop(); // Obtener el nombre del archivo
                    const newPath = `${FileSystem.documentDirectory}mantenimientos/files/${fileName}`;

                    // Mover el archivo desde la ubicación temporal a la persistente
                    await FileSystem.copyAsync({
                        from: asset.uri,
                        to: newPath,
                    });

                    await saveFilePath(newPath);

                    return {
                        uri: newPath, // Guardamos la ruta persistente
                        name: fileName,
                    };
                })
            );

            // Guardamos los archivos persistentes en el estado
            setSoporteFile(prevFiles => [...prevFiles, ...persistedFiles]);
            showToastSuccess('Archivos cargados y guardados exitosamente');
        } else {
            showToastFail('No se cargó ningún archivo.');
        }
    } catch (error) {
        console.error("Error al cargar el archivo:", error);
        showToastFail('Error al cargar el archivo.');
    }
};


const handleReloadData = async () => {
  Alert.alert(
      "Advertencia",
      "Para obtener la información más reciente de mantenimientos, primero se enviarán los cambios realizados. ¿Deseas continuar?",
      [
          {
              text: "Cancelar",
              style: "cancel"
          },
          {
              text: "Aceptar",
              onPress: async () => {
                  const success = await sendLocalChanges();

                  // Solo recargar datos si sendLocalChanges fue exitoso
                  if (success) {
                      await getMaintenances();
                  }
              }
          }
      ]
  );
};

const sendLocalChanges = async () => {
  try {
      if (changedMaintenancePoints.length === 0) {
          showToastSuccess("No hay cambios para enviar.");
          return true;
      }

      const formData = new FormData();

      const idUsuario = await AsyncStorage.getItem('userId');

      // Serializar los datos de mantenimientos en un objeto JSON
      const mantenimientoData = changedMaintenancePoints.map(point => ({
          id: point.id,
          data_registro: point.data_registro.map(registro => ({
              fecha_atencion: registro.fecha_atencion,
              hora_inicio: registro.hora_inicio || '',
              hora_finalizacion: registro.hora_finalizacion || '',
              reporte_tecnico: registro.reporte_tecnico,
              pendientes: registro.pendientes || '',
              tipo_atencion: registro.tipo_atencion,
              usuario_crea: idUsuario
          })),
      }));

      // Agregar el JSON serializado al FormData
      formData.append('mantenimientos', JSON.stringify(mantenimientoData));

      

      // Agregar archivos al FormData
      changedMaintenancePoints.forEach((point, index) => {
          point.data_registro.forEach((registro, regIndex) => {
              registro.images?.forEach((image, imgIndex) => {
                  if (image?.uri && image?.name) {
                      formData.append(
                          `mantenimientos_images_${point.id}_${regIndex}_${imgIndex}`,
                          {
                              uri: image.uri,
                              name: image.name,
                              type: 'image/jpeg',
                          }
                      );
                  } else {
                      console.warn(`La imagen en el índice ${imgIndex} no tiene un archivo válido.`);
                  }
              });

              const soporteFilesFlattened = registro.soporteFiles ? registro.soporteFiles.flat() : [];
      
              // Adjuntar archivos de soporte
              soporteFilesFlattened.forEach((file, fileIndex) => {
                  if (file?.uri && file?.name) {
                      formData.append(
                          `mantenimientos_files_${point.id}_${regIndex}_${fileIndex}`,
                          {
                              uri: file.uri,
                              name: file.name,
                              type: 'application/pdf',
                          }
                      );
                  } else {
                      console.warn(`El archivo de soporte en el índice ${fileIndex} no tiene un archivo válido.`);
                  }
              });
          });
      });

      const response = await fetch(`${apiUrl}mantenimientos/actualizar-cambios`, {
          method: 'POST',          
          body: formData,
      });

      if (response.ok) {
          showToastSuccess("Cambios enviados exitosamente");
          await AsyncStorage.removeItem('changedMaintenances');
          setChangedMaintenancePoints([]);
          await clearMaintenanceFilesFromStorage();
          setCompletedCount(0)
          return true;
      } else {
          showToastFail("Error al enviar los cambios al backend.");
          return false;
      }
  } catch (error) {
      console.error("Error al enviar los cambios:", error);
      showToastFail("Error al enviar los cambios.");
      return false;
  }
};

const saveFilePath = async (filePath) => {
  try {
    const existingFiles = await AsyncStorage.getItem('maintenanceFiles');
    const files = existingFiles ? JSON.parse(existingFiles) : [];
    files.push(filePath);
    await AsyncStorage.setItem('maintenanceFiles', JSON.stringify(files));
  } catch (error) {
    console.error("Error al guardar la ruta del archivo:", error);
  }
};

const clearMaintenanceFilesFromStorage = async () => {
  try {
    const files = await AsyncStorage.getItem('maintenanceFiles');
    if (files) {
      const filePaths = JSON.parse(files);

      // Eliminar cada archivo registrado
      for (const filePath of filePaths) {
        await FileSystem.deleteAsync(filePath, { idempotent: true });
      }

      // Limpiar la lista de archivos en AsyncStorage
      await AsyncStorage.removeItem('maintenanceFiles');
      console.log("Archivos de mantenimiento eliminados exitosamente.");
    }
  } catch (error) {
    console.error("Error al eliminar archivos de mantenimiento:", error);
  }
};

const formatTime = (timeString) => {
  if (!timeString) return ''; // Verificar que timeString exista
  try {
    const [hours, minutes] = timeString.split(':'); // Dividir en horas y minutos
    return `${hours}:${minutes}`; // Devolver en formato "HH:MM"
  } catch {
    return `${new Date(timeString).toLocaleTimeString()}`
  }  
};

  const clearStorage = async () => {
    try {
        await AsyncStorage.removeItem('maintenances');
        alert("Datos de puntos guardados eliminados del almacenamiento");
    } catch (error) {
        console.error("Error al limpiar los datos de puntos guardados:", error);
    }
};

    return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.buttonContainer}>
        {/* Mostrar el botón solo si los datos no han sido cargados */}
        {!isLoading && !dataLoaded && (
            <Button title="Obtener Mantenimientos Pendientes" onPress={getMaintenances} />
        )}
      </View>
      <Icon
          name="refresh"
          type="font-awesome"
          color="black"
          size={24}
          containerStyle={styles.refreshIcon}
          onPress={handleReloadData}
      />

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

      {/* Mostrar mapa si hay puntos de mantenimiento */}
      {maintenancePoints.length > 0 && (
      <View style={styles.mapContainer}>
          <MapScreen
              nearbyPoints={maintenancePoints.filter(point => point.estado !== 5)} // Filtrar los finalizados
              onSelectPoint={onSelectPoint}
          />
      </View>
      )}

      {/* Mostrar información del punto seleccionado */}
      {selectedPoint && (
        <View>
          <View style={styles.items}>
            <View style={styles.imageContainer}>
              {selectedPoint.foto_poste ? (
                <Image
                  source={{ uri: selectedPoint.foto_poste }}
                  style={styles.image}
                />
              ) : (
                <Text>No Image</Text>
              )}
            </View>

            <View style={styles.selectedInfo}>
              <Text>Punto: {selectedPoint.consecutivo}</Text>
              <Text>Mantenimiento: {selectedPoint.consecutivo_orden}</Text>
              <Text>Estado: {estados[selectedPoint.estado] || 'Estado desconocido'}</Text>
              <Text>Tipo Novedad: {tipo_novedad[selectedPoint.tipo_novedad]} </Text>
            </View>
          </View>
          {!isFinalizado && (
            <>
          <View style={styles.radioContainer}>
            <View style={styles.radioItem}>
              <RadioButton
                value="inspeccion"
                status={checked === 'inspeccion' ? 'checked' : 'unchecked'}
                onPress={() => setChecked('inspeccion')}
              />
              <Text>Inspección</Text>
            </View>

            <View style={styles.radioItem}>
              <RadioButton
                value="atencion"
                status={checked === 'atencion' ? 'checked' : 'unchecked'}
                onPress={() => setChecked('atencion')}
              />
              <Text>Atención</Text>
            </View>

            <View style={styles.radioItem}>
              <RadioButton
                value="novedad"
                status={checked === 'novedad' ? 'checked' : 'unchecked'}
                onPress={() => setChecked('novedad')}
              />
              <Text>Novedad</Text>
            </View>

            <View style={styles.radioItem}>
              <RadioButton
                value="finalizar"
                status={checked === 'finalizar' ? 'checked' : 'unchecked'}
                onPress={() => setChecked('finalizar')}
              />
              <Text>Finalizar</Text>
            </View>
          </View>

          {/*Form Agregar Atención*/}
          {checked && (
          <View style={styles.formContainer}>
            <Text>Descripción</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Descripción del avance"
              value={descripcion}
              onChangeText={setDescripcion}
            />
          {isFullFormEnabled && (<>
          <View style={styles.rowContainer}>
              <View style={styles.dateTimeItem}>
                <Text>Fecha Atención</Text>
                <TouchableOpacity onPress={() => setShowFechaAtencion(true)}>
                  <TextInput
                    style={styles.textInput}
                    value={fechaAtencion.toLocaleDateString()} // Muestra la fecha seleccionada en formato legible
                    editable={false} // Esto evita que el usuario escriba directamente
                  />
                </TouchableOpacity>
                {showFechaAtencion && (
                  <DateTimePicker
                    value={fechaAtencion}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowFechaAtencion(false);
                      if (selectedDate) {
                        setFechaAtencion(selectedDate);
                      }
                    }}
                  />
                )}
              </View>
            
              {/* Hora Inicio */}
              <View style={styles.dateTimeItem}>
                <Text>Hora Inicio</Text>
                <TouchableOpacity onPress={() => setShowHoraInicio(true)}>
                  <TextInput
                    style={styles.textInput}
                    value={horaInicio.toLocaleTimeString()} // Muestra la hora seleccionada
                    editable={false} // Evita la edición directa
                  />
                </TouchableOpacity>
                {showHoraInicio && (
                  <DateTimePicker
                    value={horaInicio}
                    mode="time"
                    display="default"
                    onChange={(event, selectedTime) => {
                      setShowHoraInicio(false);
                      if (selectedTime) {
                        setHoraInicio(selectedTime);
                      }
                    }}
                  />
                )}
              </View>
              
              {/* Hora Fin */}
              <View style={styles.dateTimeItem}>
                <Text>Hora Fin</Text>
                <TouchableOpacity onPress={() => setShowHoraFin(true)}>
                  <TextInput
                    style={styles.textInput}
                    value={horaFin.toLocaleTimeString()} // Muestra la hora seleccionada
                    editable={false} // Evita la edición directa
                  />
                </TouchableOpacity>
                {showHoraFin && (
                  <DateTimePicker
                    value={horaFin}
                    mode="time"
                    display="default"
                    onChange={(event, selectedTime) => {
                      setShowHoraFin(false);
                      if (selectedTime) {
                        setHoraFin(selectedTime);
                      }
                    }}
                  />
                )}
                </View>
            </View>
              

              <View style={styles.switchContainer}>
                <Text>¿Pendientes?</Text>
                <Switch value={pendiente} onValueChange={setPendiente} />
              </View>

              {pendiente && (
                  <TextInput
                    style={styles.textInput}
                    placeholder="Descripción del pendiente"
                    value={pendienteDescripcion}
                    onChangeText={setPendienteDescripcion}
                  />
                )}

              <View style={styles.switchContainer}>
                <Text>¿Agregar Soportes?</Text>
                <Switch value={agregarSoportes} onValueChange={setAgregarSoportes} />
              </View>

              {/* Mostrar opciones de carga de soportes si está seleccionado */}
              {agregarSoportes && (
                <View style={styles.containerSoporte}>
                  <TouchableOpacity onPress={pickImage} style={styles.PhotoInventaryButton}>
                      <MaterialCommunityIcons name="camera-marker-outline" size={40} color="black" />
                      {images.length > 0 && (
                          <View style={styles.badgeContainer}>
                              <Text style={styles.badgeText}>{images.length}</Text>
                          </View>
                      )}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleUploadFile} style={styles.UploadDocumentButton}>
                      <MaterialCommunityIcons name="file-document-outline" size={40} color="black" />
                      {soporteFile.length > 0 && (
                          <View style={styles.badgeContainer}>
                              <Text style={styles.badgeText}>{soporteFile.length}</Text>
                          </View>
                      )}
                  </TouchableOpacity>                 
                </View>
              )}
            
           </> 
          )}
          <Button title="Agregar" onPress={handleSubmitForm} />
          </View>          
          )}
            </>
          )}

          {/* Sección para las tarjetas */}
          <View style={styles.cardsContainer}>
            {selectedPoint.data_registro.map((registro, index) => (              
              <View style={styles.card} key={index}>
                <Text style={styles.cardHeader}>
                  {tipo_atencion[registro.tipo_atencion]} 
                  {registro.tipo_atencion === 1 ? '' : ` ${formatTime(registro.hora_inicio)} - ${formatTime(registro.hora_finalizacion)}`}
                </Text>
                <Text style={styles.cardDescription}>
                    Descripción: {registro.reporte_tecnico}
                </Text>
                {registro.pendientes ? (
                    <Text style={styles.cardDescription}>
                        Pendientes: {registro.pendientes}
                    </Text>
                ) : null}
            </View>
            ))}
          </View>
          <View style={styles.footer}>
            <Text>Mantenimientos Realizados: {completedCount}</Text>
            {completedCount > 0 && (
                <Button
                    title="Enviar Mantenimientos Realizados"
                    onPress={sendLocalChanges}
                    icon={<Icon name="send" size={20} color="white" />}
                />
            )}
          </View>
          {/* Botón temporal para limpiar AsyncStorage 
            <Button title="Limpiar Almacenamiento" onPress={clearStorage} />
            */}
        </View>
      )}
  </ScrollView>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: '#f2f2f2',
    },
    buttonContainer: {
      padding: 20,
    },
    mapContainer: {
      height: 200, // Reducir la altura del mapa
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
      marginBottom: 20,
    },
    items: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      backgroundColor: '#fff',
      borderRadius: 8,
      marginVertical: 10,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    imageContainer: {
      marginRight: 10,
    },
    image: {
      width: 100,
      height: 100,
      resizeMode: 'cover',
      borderRadius: 8,
    },
    cardsContainer: {
      padding: 10,
      backgroundColor: '#fff',
      borderRadius: 8,
      marginTop: 20,
      marginBottom: 10,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    card: {
      backgroundColor: '#2E3A59',
      padding: 15,
      borderRadius: 8,
      marginBottom: 10,
    },
    cardHeader: {
      color: '#00BFFF',
      fontWeight: 'bold',
      marginBottom: 5,
    },
    cardDescription: {
      color: '#fff',
    },
    formContainer: {
      padding: 20,
      backgroundColor: '#f2f2f2',
    },
    textInput: {
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 10,
      marginVertical: 10,
      borderRadius: 5,
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: 10,
    },
    rowContainer: {
      flexDirection: 'row', 
      justifyContent: 'space-between',  
      alignItems: 'center', 
      marginBottom: 10, 
    },
    radioContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    radioItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    input: {
      borderColor: 'gray',
      borderWidth: 1,
      padding: 10,
      marginBottom: 20,
    },
    containerSoporte: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 20,
    },
    PhotoInventaryButton: {
      marginRight: 10,
    },
    UploadDocumentButton: {
      marginLeft: 10,
    },
    textFile: {
      marginTop: 10,
      textAlign: 'center',
    },
    badgeContainer: {
      position: 'absolute',
      top: -5,
      right: -5,
      backgroundColor: 'red',
      borderRadius: 10,
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    refreshIcon: {
      position: 'absolute',
      top: 10,
      right: 10,
  },
  });

export default AttendMaintenance;