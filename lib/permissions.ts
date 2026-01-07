/**
 * AI Matrx Mobile - Permission Utilities
 * Request permissions on-demand for camera, microphone, photos, etc.
 */

import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert, Linking } from 'react-native';

export type PermissionType = 
  | 'camera'
  | 'microphone'
  | 'mediaLibrary'
  | 'notifications';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

interface PermissionResult {
  status: PermissionStatus;
  canAskAgain: boolean;
}

/**
 * Check if a permission is granted
 */
export async function checkPermission(type: PermissionType): Promise<PermissionResult> {
  switch (type) {
    case 'camera': {
      const { status, canAskAgain } = await Camera.getCameraPermissionsAsync();
      return { 
        status: status as PermissionStatus, 
        canAskAgain: canAskAgain ?? true 
      };
    }
    case 'microphone': {
      const { status, canAskAgain } = await Audio.getPermissionsAsync();
      return { 
        status: status as PermissionStatus, 
        canAskAgain: canAskAgain ?? true 
      };
    }
    case 'mediaLibrary': {
      const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync();
      return { 
        status: status as PermissionStatus, 
        canAskAgain: canAskAgain ?? true 
      };
    }
    case 'notifications': {
      const { status, canAskAgain } = await Notifications.getPermissionsAsync();
      return { 
        status: status as PermissionStatus, 
        canAskAgain: canAskAgain ?? true 
      };
    }
    default:
      return { status: 'undetermined', canAskAgain: true };
  }
}

/**
 * Request a permission
 */
export async function requestPermission(type: PermissionType): Promise<PermissionResult> {
  switch (type) {
    case 'camera': {
      const { status, canAskAgain } = await Camera.requestCameraPermissionsAsync();
      return { 
        status: status as PermissionStatus, 
        canAskAgain: canAskAgain ?? false 
      };
    }
    case 'microphone': {
      const { status, canAskAgain } = await Audio.requestPermissionsAsync();
      return { 
        status: status as PermissionStatus, 
        canAskAgain: canAskAgain ?? false 
      };
    }
    case 'mediaLibrary': {
      const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();
      return { 
        status: status as PermissionStatus, 
        canAskAgain: canAskAgain ?? false 
      };
    }
    case 'notifications': {
      const { status, canAskAgain } = await Notifications.requestPermissionsAsync();
      return { 
        status: status as PermissionStatus, 
        canAskAgain: canAskAgain ?? false 
      };
    }
    default:
      return { status: 'denied', canAskAgain: false };
  }
}

/**
 * Request permission with user-friendly handling
 * Shows alert if permission was denied and can't ask again
 */
export async function requestPermissionWithAlert(
  type: PermissionType,
  purpose: string
): Promise<boolean> {
  // First check current status
  const current = await checkPermission(type);
  
  if (current.status === 'granted') {
    return true;
  }

  // Try to request
  const result = await requestPermission(type);
  
  if (result.status === 'granted') {
    return true;
  }

  // If denied and can't ask again, prompt to open settings
  if (!result.canAskAgain) {
    const permissionName = getPermissionDisplayName(type);
    
    Alert.alert(
      `${permissionName} Access Required`,
      `${purpose} Please enable ${permissionName.toLowerCase()} access in Settings.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open Settings', 
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          }
        },
      ]
    );
  }

  return false;
}

/**
 * Get display name for permission type
 */
function getPermissionDisplayName(type: PermissionType): string {
  const names: Record<PermissionType, string> = {
    camera: 'Camera',
    microphone: 'Microphone',
    mediaLibrary: 'Photo Library',
    notifications: 'Notifications',
  };
  return names[type];
}

/**
 * Pick image from library with permission handling
 */
export async function pickImage(): Promise<ImagePicker.ImagePickerAsset | null> {
  const hasPermission = await requestPermissionWithAlert(
    'mediaLibrary',
    'AI Matrx needs access to your photos to attach images to conversations.'
  );
  
  if (!hasPermission) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) return null;
  return result.assets[0];
}

/**
 * Take photo with camera with permission handling
 */
export async function takePhoto(): Promise<ImagePicker.ImagePickerAsset | null> {
  const hasPermission = await requestPermissionWithAlert(
    'camera',
    'AI Matrx needs camera access to take photos for your conversations.'
  );
  
  if (!hasPermission) return null;

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) return null;
  return result.assets[0];
}

/**
 * Register for push notifications
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  const hasPermission = await requestPermissionWithAlert(
    'notifications',
    'Enable notifications to receive updates about your conversations.'
  );

  if (!hasPermission) return null;

  const token = await Notifications.getExpoPushTokenAsync();
  return token.data;
}
