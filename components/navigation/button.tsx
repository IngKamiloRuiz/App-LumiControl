import * as React from 'react';
import { Button } from '@rneui/themed';

interface ButtonDarkProps {
    text: string;
    onPress: (event?: any) => void;
    }
  

const ButtonDark = ({ text, onPress }: ButtonDarkProps) => (
      
      <Button
      title={text}
      buttonStyle={{ backgroundColor: 'rgba(39, 39, 39, 1)' }}
      onPress={onPress}
      containerStyle={{
        width: 200,
        marginHorizontal: 50,
        marginVertical: 10,
      }}
      titleStyle={{ color: 'white', marginHorizontal: 20 }}
      />

);

export default ButtonDark;