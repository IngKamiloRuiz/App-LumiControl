import Toast from 'react-native-toast-message';

const showToastFail = (message) => {    
    Toast.show({
        type: 'error',
        text1: message,
        visibilityTime: 2000, // Duración en milisegundos
        autoHide: true,
    });
}

export default showToastFail;