import React from 'react';
import { View, Text, Spinner } from 'reshaped';

interface LoadingSpinnerProps {
  size?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  color?: 'primary' | 'neutral' | 'critical' | 'success' | 'warning';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 4,
  color = 'primary',
  text
}) => {
  return (
    <View direction="column" align="center" justify="center" gap={3}>
      <Spinner size={size} color={color} />
      {text && (
        <Text variant="body-2" color="neutral-faded">
          {text}
        </Text>
      )}
    </View>
  );
};

export default LoadingSpinner;
