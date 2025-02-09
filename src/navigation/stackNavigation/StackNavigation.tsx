import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from '../bottomBarNavigation/BottombarNaviagtion';
import NewTimer from '../../screens/newTimer/NewTimer';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState("DashBoard"); // State to hold initial route

  // useEffect(() => {
  //   const determineInitialRoute = async () => {
  //     try {
  //       const token = await AsyncStorage.getItem('authToken');
  //       const rememberMe = await AsyncStorage.getItem('RememberMe');
  //       const TandC = await AsyncStorage.getItem('TandC');
  //       if (token && rememberMe) {
  //         if(TandC){
  //           setInitialRoute('Main')
  //         }
  //         else{
  //           setInitialRoute('PermissionAndFlow');
  //         }
         
  //       } else {
  //         setInitialRoute('Login'); // Default to "Login"
  //       }
  //     } catch (error) {
  //       console.error("Error accessing AsyncStorage:", error);
  //       setInitialRoute('Login'); // Fallback to "Login"
  //     }
  //   };

  //   determineInitialRoute();
  // }, []);

  if (initialRoute === null) {
    // Render a loading state until the initial route is determined
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute} // Use the dynamically set initial route
        screenOptions={{
          headerShown: false, // Hide the default header
        }}>
        <Stack.Screen name="DashBoard" component={BottomTabNavigator} />
        <Stack.Screen name="NewTimer" component={NewTimer} />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
