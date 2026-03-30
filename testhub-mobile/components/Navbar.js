import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
// 🌟 FIX: Web wale primer ki jagah native Octicons use kar rahe hain
import Icon from 'react-native-vector-icons/Octicons'; 

export default function Navbar({ state, descriptors, navigation }) {
  return (
    <View style={styles.floatingContainer}>
      <View style={styles.pillBackground}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate({ name: route.name, merge: true });
            }
          };

          // 🌟 Octicons ke best matching icons set kiye hain
          let iconName;
          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Exams') {
            iconName = 'calendar'; // Exams ke liye calendar
          } else if (route.name === 'Tests') {
            iconName = 'mortar-board'; // Graduation Cap icon Octicons mein yahi hota hai
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              style={styles.tabButton}
            >
              <View style={[styles.iconContainer, isFocused && styles.activeIconContainer]}>
                <Icon 
                  name={iconName} 
                  // 🌟 Thoda chota size rakha hai taaki Octicons sharp dikhein
                  size={22} 
                  color={isFocused ? '#FFFFFF' : '#9ca3af'} 
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  pillBackground: {
    flexDirection: 'row',
    backgroundColor: '#262626',
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 8,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 350,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconContainer: {
    backgroundColor: '#8b5cf6', // Premium Indigo color
  }
});