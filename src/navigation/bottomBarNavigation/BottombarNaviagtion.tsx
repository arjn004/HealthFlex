import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import History from '../../screens/history/History';
import Home from '../../screens/home/Home';
import SvgImageWrapper from '../../components/svgImageWrapper/SvgImageWrapper';
import { backArrow, historyIcon, homeIcon } from '../../assets/svgImages/SvgImages';





// Define the bottom tab navigator
const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        // tabBarActiveTintColor: colors.maroon, // Set active tab color to orange
        // tabBarInactiveTintColor: "white", // Inactive tab color
        headerShown: false,
        tabBarStyle: { 
        //   backgroundColor: colors.backGroundBlue,
          height: 75,
          paddingBottom: 10,
          paddingTop: 5,
         }, 
        tabBarLabelStyle:{
          fontSize: 16,
        },
         unmountOnBlur: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
        //   tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <SvgImageWrapper xml={homeIcon} width={30} height={30} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={History}
        options={{
        //   tabBarLabel: 'Time Card',
          tabBarIcon: ({ color, size }) => (
            <SvgImageWrapper xml={historyIcon} width={30} height={30} color={color} />
          ),
        }}
      />
      {/* <Tab.Screen
        name="Profile"
        component={Profile}
        // options={{
        //   tabBarLabel: 'Profile',
        //   tabBarIcon: ({ color, size }) => (
        //     <SvgImageWrapper xml={profileIcon} width={size} height={size} color={color} />
        //   ),
        // }}
      /> */}
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
