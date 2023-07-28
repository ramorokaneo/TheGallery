import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import ImagePicker from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

const PhotoGalleryApp = () => {
  const [photoData, setPhotoData] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateTaken, setDateTaken] = useState(new Date());

  const takePhoto = () => {
    const options = {
      quality: 0.7,
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    ImagePicker.launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled the camera');
      } else if (response.error) {
        console.log('Camera error:', response.error);
      } else {
        setPhotoData(response);
        setShowDatePicker(true);
        getCurrentLocation();
      }
    });
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        // Save location in photo data (if needed)
        // photoData.location = location;
      },
      (error) => console.log('Location error:', error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    setDateTaken(selectedDate || new Date());
  };

  const savePhotoData = async () => {
    // Save the photo data and other details in AsyncStorage or any database of your choice
    try {
      const photoDetails = {
        image: photoData.uri,
        location: photoData.location,
        dateTaken: dateTaken.getTime(),
      };
      // Save photo details
      await AsyncStorage.setItem('photoData', JSON.stringify(photoDetails));
      setPhotoData(null);
      setDateTaken(new Date());
    } catch (error) {
      console.log('Error saving photo data:', error);
    }
  };

  return (
    <View style={styles.container}>
      {photoData ? (
        <>
          <Image source={{ uri: photoData.uri }} style={styles.image} />
          {showDatePicker && (
            <DateTimePicker
              value={dateTaken}
              mode="datetime"
              display="default"
              onChange={handleDateChange}
            />
          )}
          <Button title="Save" onPress={savePhotoData} />
        </>
      ) : (
        <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
          <Text style={styles.buttonText}>Take a Photo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: 'cover',
    marginBottom: 20,
  },
});

export default PhotoGalleryApp;
