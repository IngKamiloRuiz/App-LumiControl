import Toast from 'react-native-toast-message';

const showToastSuccess = (message) => {    
    Toast.show({
        type: 'success',
        text1: message,
        visibilityTime: 2000, // Duración en milisegundos
        autoHide: true,
    });
}

export default showToastSuccess;