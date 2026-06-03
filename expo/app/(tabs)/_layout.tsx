import { Tabs } from "expo-router";
import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Home, MessageCircle, Shield, User } from "lucide-react-native";
import { designTokens } from "@/constants/theme";
import { useAppStore } from "@/hooks/useAppStore";

const GOLD = '#FFD700';
const GOLD_INACTIVE = 'rgba(255, 215, 0, 0.45)';
const TAB_ICON_SIZE = 26;
const TAB_BAR_HEIGHT = 70;

export default function TabLayout() {
  const appStore = useAppStore();
  const unreadCount = appStore?.unreadCount ?? 0;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: GOLD,
        tabBarInactiveTintColor: GOLD_INACTIVE,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Platform.OS === 'web'
            ? 'rgba(15, 23, 42, 0.96)'
            : 'rgba(15, 23, 42, 0.94)',
          borderTopWidth: 0,
          position: 'absolute' as const,
          left: 20,
          right: 20,
          marginHorizontal: 20,
          bottom: 20,
          height: TAB_BAR_HEIGHT,
          paddingTop: 10,
          paddingBottom: 10,
          borderRadius: 28,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.28,
              shadowRadius: 28,
            },
            android: {
              elevation: 24,
            },
            default: {
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)',
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: '600' as const,
          marginTop: 3,
          letterSpacing: 0.4,
          textAlign: 'center' as const,
        },
        tabBarIconStyle: {
          alignSelf: 'center' as const,
        },
        tabBarItemStyle: {
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconWrap}>
              <Home
                size={TAB_ICON_SIZE}
                color={focused ? GOLD : GOLD_INACTIVE}
                strokeWidth={focused ? 2.4 : 1.8}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconWrap}>
              <MessageCircle
                size={TAB_ICON_SIZE}
                color={focused ? GOLD : GOLD_INACTIVE}
                strokeWidth={focused ? 2.4 : 1.8}
              />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="safety"
        options={{
          title: "Safety",
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconWrap}>
              {focused && <View style={styles.safetyGlow} />}
              <Shield
                size={TAB_ICON_SIZE}
                color={focused ? GOLD : GOLD_INACTIVE}
                strokeWidth={focused ? 2.4 : 1.8}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconWrap}>
              <User
                size={TAB_ICON_SIZE}
                color={focused ? GOLD : GOLD_INACTIVE}
                strokeWidth={focused ? 2.4 : 1.8}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen name="nearby" options={{ href: null }} />
      <Tabs.Screen name="scan" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    position: 'relative' as const,
    width: TAB_ICON_SIZE + 8,
    height: TAB_ICON_SIZE + 4,
  },
  safetyGlow: {
    position: 'absolute',
    width: TAB_ICON_SIZE + 16,
    height: TAB_ICON_SIZE + 16,
    borderRadius: (TAB_ICON_SIZE + 16) / 2,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: designTokens.color.error,
    borderRadius: 10,
    minWidth: 17,
    height: 17,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 2,
    borderColor: 'rgba(15, 23, 42, 0.94)',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700' as const,
  },
});
