/**
 * Custom Slider Component
 * A simple slider implementation using React Native components
 * Used as a fallback when native slider module is not available
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  Animated,
} from 'react-native';

const CustomSlider = ({
  value = 0,
  minimumValue = 0,
  maximumValue = 100,
  onValueChange,
  minimumTrackTintColor = '#007AFF',
  maximumTrackTintColor = '#E0E0E0',
  thumbTintColor = '#007AFF',
  style,
  disabled = false,
}) => {
  const [sliderWidth, setSliderWidth] = React.useState(0);
  const [thumbPosition] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    const percentage = ((value - minimumValue) / (maximumValue - minimumValue)) * 100;
    const position = (sliderWidth * percentage) / 100;
    thumbPosition.setValue(position);
  }, [value, minimumValue, maximumValue, sliderWidth]);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: () => {
        thumbPosition.setOffset(thumbPosition._value);
      },
      onPanResponderMove: (evt, gestureState) => {
        const newValue = Math.max(
          0,
          Math.min(sliderWidth, thumbPosition._value + gestureState.dx)
        );
        thumbPosition.setValue(newValue);
      },
      onPanResponderRelease: () => {
        thumbPosition.flattenOffset();
        const percentage = (thumbPosition._value / sliderWidth) * 100;
        const newValue = minimumValue + (percentage / 100) * (maximumValue - minimumValue);
        if (onValueChange) {
          onValueChange(newValue);
        }
      },
    })
  ).current;

  const handleLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setSliderWidth(width);
    const percentage = ((value - minimumValue) / (maximumValue - minimumValue)) * 100;
    thumbPosition.setValue((width * percentage) / 100);
  };

  const handlePress = (event) => {
    if (disabled) return;
    const { locationX } = event.nativeEvent;
    const newValue = Math.max(0, Math.min(sliderWidth, locationX));
    thumbPosition.setValue(newValue);
    const percentage = (newValue / sliderWidth) * 100;
    const calculatedValue = minimumValue + (percentage / 100) * (maximumValue - minimumValue);
    if (onValueChange) {
      onValueChange(calculatedValue);
    }
  };

  const fillPercentage = sliderWidth > 0 
    ? ((value - minimumValue) / (maximumValue - minimumValue)) * 100 
    : 0;

  return (
    <View
      style={[styles.container, style]}
      onLayout={handleLayout}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={handlePress}
        style={styles.trackContainer}
        disabled={disabled}
      >
        <View
          style={[
            styles.track,
            { backgroundColor: maximumTrackTintColor },
          ]}
        />
        <View
          style={[
            styles.fill,
            {
              backgroundColor: minimumTrackTintColor,
              width: `${fillPercentage}%`,
            },
          ]}
        />
      </TouchableOpacity>
      <Animated.View
        style={[
          styles.thumb,
          {
            backgroundColor: thumbTintColor,
            transform: [{ translateX: thumbPosition }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  trackContainer: {
    height: 4,
    width: '100%',
    position: 'relative',
  },
  track: {
    height: 4,
    width: '100%',
    borderRadius: 2,
    position: 'absolute',
  },
  fill: {
    height: 4,
    borderRadius: 2,
    position: 'absolute',
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    marginLeft: -10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default CustomSlider;

