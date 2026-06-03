import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  RefreshControl,
  TextInput,
  Platform,
  Keyboard,
  Modal,
  FlatList,
} from "react-native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import {
  Camera,
  Globe,
  MapPin,
  ChevronDown,
  Send,
  Zap,
  Car,
  Bike,
  Truck,
  Caravan,
  Shield,
  X,
  CheckCircle,
  Clock,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { designTokens } from "@/constants/theme";
import { useAppStore } from "@/hooks/useAppStore";
import { useToast } from "@/hooks/useToast";
import { Message, MessageType } from "@/types";
import { getQuickActionIcon, formatCountryLabel } from "@/constants/actionIcons";
import { COUNTRIES, getRegionsByCountry, getCountryByCode, getRegionByCode } from "@/constants/regions";

// ─── Types ─────────────────────────────────────────────────────────────────

type QuickAction = {
  id: string;
  label: string;
  emoji: string;
  tint: string;
  type: MessageType;
  prefilledMessage: string;
};

type VehicleType = {
  id: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
};

// ─── Data ──────────────────────────────────────────────────────────────────

const VEHICLE_TYPES: VehicleType[] = [
  { id: "car",        label: "Car",        Icon: Car    },
  { id: "motorcycle", label: "Motorcycle", Icon: Bike   },
  { id: "truck",      label: "Truck",      Icon: Truck  },
  { id: "rv",         label: "RV",         Icon: Caravan },
];

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "blocking",
    label: "Blocking me",
    emoji: "🚗",
    tint: "#FF7A6E",
    type: "blocking",
    prefilledMessage: "Hi! Your vehicle is blocking me. Could you please move it when you get a chance? Thanks!",
  },
  {
    id: "lights",
    label: "Lights on",
    emoji: "💡",
    tint: "#F5A623",
    type: "lights_on",
    prefilledMessage: "Hi! Just a heads up — your headlights seem to be on. Wanted to save you a dead battery.",
  },
  {
    id: "window",
    label: "Window open",
    emoji: "🪟",
    tint: "#4FB6FF",
    type: "window_open",
    prefilledMessage: "Hi! It looks like one of your windows is open. Thought you'd want to know.",
  },
  {
    id: "parking",
    label: "Parking",
    emoji: "⚠️",
    tint: "#F26530",
    type: "parking_alert",
    prefilledMessage: "Hi! Just a quick note about where your vehicle is currently parked.",
  },
  {
    id: "keys",
    label: "Keys visible",
    emoji: "🔑",
    tint: "#7E5BF0",
    type: "keys_visible",
    prefilledMessage: "Hi! It looks like your keys may be visible from outside. Wanted to flag it.",
  },
  {
    id: "compliment",
    label: "Nice ride",
    emoji: "❤️",
    tint: "#2ED3B7",
    type: "compliment",
    prefilledMessage: "Hey! Just wanted to say your car looks amazing. Nice ride!",
  },
  {
    id: "towing",
    label: "Being towed",
    emoji: "🚨",
    tint: "#FF4757",
    type: "general",
    prefilledMessage: "⚠️ Your vehicle is about to be towed. Please return immediately if possible!",
  },
  {
    id: "hit_and_run",
    label: "Hit & run",
    emoji: "💥",
    tint: "#8E2DE2",
    type: "general",
    prefilledMessage: "Heads up — your vehicle appears to have been hit. I have details and may have witnessed it. Please check ASAP.",
  },
  {
    id: "low_tire",
    label: "Low tire",
    emoji: "🛞",
    tint: "#3498DB",
    type: "general",
    prefilledMessage: "Hi! One of your tires looks low on air. Thought you'd want to check it.",
  },
];

const MAX_PLATE_LENGTH = 12;
const EMPTY_MESSAGES: Message[] = [];

function normalizePlateInput(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, MAX_PLATE_LENGTH);
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const appStore = useAppStore();
  const userProfile    = appStore?.userProfile    ?? null;
  const primaryVehicle = appStore?.primaryVehicle  ?? null;
  const messages       = appStore?.messages        ?? EMPTY_MESSAGES;
  const sendMessage    = appStore?.sendMessage;
  const { showToast }  = useToast();

  const [refreshing,           setRefreshing]           = useState(false);
  const [plateInput,           setPlateInput]           = useState("");
  const [inputFocused,         setInputFocused]         = useState(false);
  const [sendingActionId,      setSendingActionId]      = useState<string | null>(null);
  const [helperVisible,        setHelperVisible]        = useState(false);
  const [recipientCountry,     setRecipientCountry]     = useState("US");
  const [recipientState,       setRecipientState]       = useState("");
  const [recipientVehicleType, setRecipientVehicleType] = useState("car");
  const [showCountryPicker,    setShowCountryPicker]    = useState(false);
  const [showStatePicker,      setShowStatePicker]      = useState(false);
  const [countrySearch,        setCountrySearch]        = useState("");
  const [stateSearch,          setStateSearch]          = useState("");

  const plateInputRef = useRef<TextInput | null>(null);
  const fadeAnim      = useRef(new Animated.Value(0)).current;
  const slideAnim     = useRef(new Animated.Value(24)).current;
  const inputShake    = useRef(new Animated.Value(0)).current;
  const sendScale     = useRef(new Animated.Value(1)).current;
  const actionsSlide  = useRef(new Animated.Value(16)).current;
  const actionsFade   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Animate quick actions in/out when plate changes
  useEffect(() => {
    const hasPlate = plateInput.length > 0;
    Animated.parallel([
      Animated.timing(actionsFade,  { toValue: hasPlate ? 1 : 0.55, duration: 200, useNativeDriver: true }),
      Animated.spring(actionsSlide, { toValue: hasPlate ? 0 : 6, tension: 80, friction: 12, useNativeDriver: true }),
    ]).start();
  }, [plateInput, actionsFade, actionsSlide]);

  const shakeInput = useCallback(() => {
    setHelperVisible(true);
    inputShake.setValue(0);
    Animated.sequence([
      Animated.timing(inputShake, { toValue: 1,    duration: 50, useNativeDriver: true }),
      Animated.timing(inputShake, { toValue: -1,   duration: 50, useNativeDriver: true }),
      Animated.timing(inputShake, { toValue: 0.7,  duration: 50, useNativeDriver: true }),
      Animated.timing(inputShake, { toValue: -0.4, duration: 50, useNativeDriver: true }),
      Animated.timing(inputShake, { toValue: 0,    duration: 50, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setHelperVisible(false), 2200);
  }, [inputShake]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const recentMessages = useMemo(() => {
    return messages
      .slice()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 4);
  }, [messages]);

  const userPlates = useMemo(
    () => userProfile?.vehicles?.map((v) => v.licensePlate) ?? [],
    [userProfile?.vehicles]
  );

  const recentPlates = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const m of messages
      .slice()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())) {
      const plate = userPlates.includes(m.fromPlate) ? m.toPlate : m.fromPlate;
      if (!plate || userPlates.includes(plate)) continue;
      if (seen.has(plate)) continue;
      seen.add(plate);
      out.push(plate);
      if (out.length >= 4) break;
    }
    return out;
  }, [messages, userPlates]);

  const triggerHaptic = useCallback(async (style: Haptics.ImpactFeedbackStyle) => {
    try { await Haptics.impactAsync(style); } catch {}
  }, []);

  const handlePlateChange = useCallback((text: string) => {
    setPlateInput(normalizePlateInput(text));
  }, []);

  const handlePlateBlur = useCallback(() => {
    setInputFocused(false);
    setPlateInput(normalizePlateInput(plateInput));
  }, [plateInput]);

  const handleOpenCompose = useCallback(async () => {
    const plate = normalizePlateInput(plateInput);
    if (!plate) { shakeInput(); await triggerHaptic(Haptics.ImpactFeedbackStyle.Light); return; }
    await triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/send-message",
      params: { toPlate: plate, type: "general", prefilledMessage: "", actionTitle: "Send Message" },
    });
  }, [plateInput, shakeInput, triggerHaptic]);

  const handleQuickAction = useCallback(async (action: QuickAction) => {
    const plate = normalizePlateInput(plateInput);
    if (!plate) { shakeInput(); await triggerHaptic(Haptics.ImpactFeedbackStyle.Light); return; }
    if (!sendMessage) return;

    Keyboard.dismiss();
    setSendingActionId(action.id);
    sendScale.setValue(1);
    Animated.sequence([
      Animated.spring(sendScale, { toValue: 1.06, tension: 180, friction: 6, useNativeDriver: true }),
      Animated.spring(sendScale, { toValue: 1,    tension: 140, friction: 9, useNativeDriver: true }),
    ]).start();
    await triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);

    const outgoing: Message = {
      id: Date.now().toString(),
      fromPlate:   primaryVehicle?.licensePlate || "UNKNOWN",
      toPlate:     plate,
      toCountry:   primaryVehicle?.country,
      fromName:    userProfile?.isAnonymous ? undefined : userProfile?.displayName,
      content:     action.prefilledMessage,
      type:        action.type,
      isAnonymous: userProfile?.isAnonymous ?? true,
      timestamp:   new Date().toISOString(),
      isRead:      false,
      metadata:    { good_neighbor_type: action.id },
    };

    try {
      await sendMessage(outgoing);
      try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      showToast(`${action.emoji} Sent to ${plate}`, "success", 1800);
      setPlateInput("");
    } catch {
      showToast("Couldn't send. Try again.", "error", 1800);
    } finally {
      setSendingActionId(null);
    }
  }, [plateInput, sendMessage, primaryVehicle, userProfile, shakeInput, triggerHaptic, showToast, sendScale]);

  const handleCameraPress = useCallback(async () => {
    await triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(tabs)/scan");
  }, [triggerHaptic]);

  const filteredCountries = useMemo(
    () => COUNTRIES.filter(c =>
      !countrySearch || c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.code.toLowerCase().includes(countrySearch.toLowerCase())
    ),
    [countrySearch]
  );

  const availableStates = useMemo(
    () => getRegionsByCountry(recipientCountry) ?? [],
    [recipientCountry]
  );

  const filteredStates = useMemo(
    () => availableStates.filter(s =>
      !stateSearch || s.name.toLowerCase().includes(stateSearch.toLowerCase()) || s.code.toLowerCase().includes(stateSearch.toLowerCase())
    ),
    [availableStates, stateSearch]
  );

  const selectedStateName = useMemo(
    () => recipientState ? (getRegionByCode(recipientCountry, recipientState)?.name || recipientState) : '',
    [recipientCountry, recipientState]
  );

  const hasPlate = plateInput.length > 0;

  return (
    <SafeAreaView style={styles.container} testID="dashboard-screen">
      {/* ── TOP BAR ─────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topBarEyebrow}>Message any plate</Text>
          <Text style={styles.topBarTitle}>Who do you want to reach?</Text>
        </View>
        <TouchableOpacity
          style={styles.safetyBtn}
          onPress={() => router.push('/safety-center')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Shield size={20} color="#2563EB" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />
        }
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── PLATE HERO ───────────────────────────────────── */}
          <Animated.View
            style={[
              styles.plateShakeWrap,
              {
                transform: [{
                  translateX: inputShake.interpolate({ inputRange: [-1, 1], outputRange: [-8, 8] }),
                }],
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => plateInputRef.current?.focus()}
              style={[styles.plateOuter, inputFocused && styles.plateOuterFocused]}
              testID="plate-hero"
            >
              {/* Bolts */}
              <View style={[styles.bolt, styles.boltTL]} />
              <View style={[styles.bolt, styles.boltTR]} />
              <View style={[styles.bolt, styles.boltBL]} />
              <View style={[styles.bolt, styles.boltBR]} />

              {/* Year/Month stickers */}
              <View style={styles.stickerRow}>
                <View style={styles.stickerRed}><Text style={styles.stickerText}>04</Text></View>
                <View style={styles.stickerYellow}><Text style={styles.stickerText}>26</Text></View>
              </View>

              {/* Hidden text input */}
              <TextInput
                ref={plateInputRef}
                style={styles.hiddenInput}
                value={plateInput}
                onChangeText={handlePlateChange}
                onFocus={() => setInputFocused(true)}
                onBlur={handlePlateBlur}
                placeholder=""
                maxLength={MAX_PLATE_LENGTH}
                autoCapitalize="characters"
                autoCorrect={false}
                spellCheck={false}
                returnKeyType="send"
                onSubmitEditing={handleOpenCompose}
              />

              {/* Plate display */}
              <Text
                style={[styles.plateDisplayText, !plateInput && styles.plateDisplayPlaceholder]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {plateInput || 'ABC 1234'}
              </Text>
              <Text style={styles.plateCountry}>
                {getCountryByCode(recipientCountry)?.name?.toUpperCase() ?? 'UNITED STATES'}
              </Text>

              {/* Camera button */}
              <TouchableOpacity
                style={styles.cameraBtn}
                onPress={handleCameraPress}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                testID="camera-button"
              >
                <Camera size={16} color="#FFFFFF" strokeWidth={2.2} />
              </TouchableOpacity>
            </TouchableOpacity>

            {/* Helper hint */}
            {helperVisible && (
              <View style={styles.helperBubble}>
                <Text style={styles.helperText}>Enter a license plate first</Text>
              </View>
            )}
          </Animated.View>

          {/* ── RECENT PLATES (if any) ────────────────────────── */}
          {recentPlates.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentPlatesRow}
              style={styles.recentPlatesScroll}
            >
              {recentPlates.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.recentPlateChip, plateInput === p && styles.recentPlateChipActive]}
                  onPress={() => { setPlateInput(p); plateInputRef.current?.focus(); }}
                >
                  <Clock size={11} color={plateInput === p ? '#2563EB' : '#94A3B8'} strokeWidth={2} />
                  <Text style={[styles.recentPlateText, plateInput === p && styles.recentPlateTextActive]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* ── CONTEXT PILLS (country, state, vehicle type) ─── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsRow}
            style={styles.pillsScroll}
          >
            {/* Country */}
            <TouchableOpacity style={styles.contextPill} onPress={() => setShowCountryPicker(true)}>
              <Globe size={13} color="#2563EB" strokeWidth={2} />
              <Text style={styles.contextPillText}>{formatCountryLabel(recipientCountry)}</Text>
              <ChevronDown size={11} color="#94A3B8" strokeWidth={2} />
            </TouchableOpacity>

            {/* State */}
            <TouchableOpacity
              style={styles.contextPill}
              onPress={() => availableStates.length > 0 && setShowStatePicker(true)}
            >
              <MapPin size={13} color="#2563EB" strokeWidth={2} />
              <Text style={styles.contextPillText}>
                {selectedStateName || 'State / Region'}
              </Text>
              {availableStates.length > 0 && <ChevronDown size={11} color="#94A3B8" strokeWidth={2} />}
            </TouchableOpacity>

            <View style={styles.pillDivider} />

            {/* Vehicle types */}
            {VEHICLE_TYPES.map((vt) => {
              const active = recipientVehicleType === vt.id;
              return (
                <TouchableOpacity
                  key={vt.id}
                  style={[styles.vehiclePill, active && styles.vehiclePillActive]}
                  onPress={() => setRecipientVehicleType(vt.id)}
                >
                  <vt.Icon size={14} color={active ? '#2563EB' : '#64748B'} strokeWidth={active ? 2.2 : 1.8} />
                  <Text style={[styles.vehiclePillText, active && styles.vehiclePillTextActive]}>
                    {vt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ── QUICK ACTIONS ─────────────────────────────────── */}
          <Animated.View
            style={[styles.quickSection, { opacity: actionsFade, transform: [{ translateY: actionsSlide }] }]}
          >
            <View style={styles.quickHeader}>
              <View style={styles.quickTitleRow}>
                <Zap size={14} color="#F59E0B" strokeWidth={2.5} fill="#F59E0B" />
                <Text style={styles.quickTitle}>One-tap message</Text>
              </View>
              {!hasPlate && <Text style={styles.quickHint}>Type a plate first</Text>}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickList}
            >
              {QUICK_ACTIONS.map((action) => {
                const isSending = sendingActionId === action.id;
                return (
                  <TouchableOpacity
                    key={action.id}
                    style={[styles.quickChip, !hasPlate && styles.quickChipDim]}
                    onPress={() => handleQuickAction(action)}
                    disabled={isSending}
                    activeOpacity={0.78}
                  >
                    <View style={[styles.quickChipIconWrap, { backgroundColor: action.tint + '22' }]}>
                      <Text style={styles.quickChipEmoji}>{action.emoji}</Text>
                    </View>
                    <Text style={styles.quickChipLabel} numberOfLines={2}>{action.label}</Text>
                    {isSending && (
                      <View style={styles.quickChipSending}>
                        <CheckCircle size={14} color="#22C55E" strokeWidth={2.5} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>

          {/* ── CUSTOM MESSAGE CTA ────────────────────────────── */}
          <Animated.View style={{ transform: [{ scale: sendScale }] }}>
            <TouchableOpacity
              style={[styles.customBtn, !hasPlate && styles.customBtnDim]}
              onPress={handleOpenCompose}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={hasPlate ? ['#2563EB', '#1D4ED8'] : ['#94A3B8', '#94A3B8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.customBtnGradient}
              >
                <Send size={17} color="#FFFFFF" strokeWidth={2.2} />
                <Text style={styles.customBtnText}>Write a custom message</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* ── CLAIM PLATE BANNER ───────────────────────────── */}
          {!primaryVehicle && (
            <TouchableOpacity
              style={styles.claimBanner}
              onPress={() => router.push('/claim')}
              activeOpacity={0.84}
            >
              <View style={styles.claimBannerLeft}>
                <View style={styles.claimDot} />
                <View>
                  <Text style={styles.claimTitle}>Claim your plate</Text>
                  <Text style={styles.claimSub}>to receive replies from drivers</Text>
                </View>
              </View>
              <Text style={styles.claimArrow}>→</Text>
            </TouchableOpacity>
          )}

          {/* ── RECENT ACTIVITY ──────────────────────────────── */}
          <View style={styles.recentSection}>
            <Text style={styles.recentTitle}>Recent activity</Text>
            <Text style={styles.recentSub}>Your latest plate conversations</Text>

            {recentMessages.length > 0 ? (
              recentMessages.map((msg) => {
                const isSent = userPlates.includes(msg.fromPlate);
                const plate  = isSent ? msg.toPlate : msg.fromPlate;
                return (
                  <TouchableOpacity
                    key={msg.id}
                    style={styles.recentCard}
                    onPress={() => router.push({ pathname: '/message-detail', params: { id: msg.id } })}
                    activeOpacity={0.82}
                  >
                    <View style={[styles.recentIcon, { backgroundColor: isSent ? '#EFF6FF' : '#F0FDF4' }]}>
                      <Send size={15} color={isSent ? '#2563EB' : '#22C55E'} strokeWidth={2} />
                    </View>
                    <View style={styles.recentContent}>
                      <Text style={styles.recentPlate}>{plate || '—'}</Text>
                      <Text style={styles.recentMsgText} numberOfLines={1}>
                        {msg.content || msg.prefilledMessage || 'Tap to view message'}
                      </Text>
                    </View>
                    <Text style={styles.recentTime}>{formatTimestamp(msg.timestamp)}</Text>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                  <Send size={26} color="#CBD5E1" strokeWidth={1.5} />
                </View>
                <Text style={styles.emptyTitle}>No messages yet</Text>
                <Text style={styles.emptyDesc}>
                  Type any plate above and tap a quick action to send your first message.
                </Text>
              </View>
            )}
          </View>

        </Animated.View>
        <View style={styles.bottomPad} />
      </ScrollView>

      {/* ── COUNTRY PICKER MODAL ─────────────────────────────── */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <TouchableOpacity onPress={() => { setShowCountryPicker(false); setCountrySearch(""); }}>
              <X size={22} color="#64748B" strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.modalSearch}
            placeholder="Search countries..."
            placeholderTextColor="#94A3B8"
            value={countrySearch}
            onChangeText={setCountrySearch}
            autoFocus
          />
          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.pickerItem, recipientCountry === item.code && styles.pickerItemActive]}
                onPress={() => {
                  setRecipientCountry(item.code);
                  setRecipientState("");
                  setShowCountryPicker(false);
                  setCountrySearch("");
                }}
              >
                <Text style={styles.pickerItemText}>{item.name}</Text>
                {recipientCountry === item.code && (
                  <CheckCircle size={18} color="#2563EB" strokeWidth={2.5} />
                )}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>

      {/* ── STATE PICKER MODAL ───────────────────────────────── */}
      <Modal
        visible={showStatePicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowStatePicker(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select State / Region</Text>
            <TouchableOpacity onPress={() => { setShowStatePicker(false); setStateSearch(""); }}>
              <X size={22} color="#64748B" strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.modalSearch}
            placeholder="Search regions..."
            placeholderTextColor="#94A3B8"
            value={stateSearch}
            onChangeText={setStateSearch}
            autoFocus
          />
          <FlatList
            data={filteredStates}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.pickerItem, recipientState === item.code && styles.pickerItemActive]}
                onPress={() => {
                  setRecipientState(item.code);
                  setShowStatePicker(false);
                  setStateSearch("");
                }}
              >
                <Text style={styles.pickerItemText}>{item.name}</Text>
                {recipientState === item.code && (
                  <CheckCircle size={18} color="#2563EB" strokeWidth={2.5} />
                )}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  topBarEyebrow: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  topBarTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  safetyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 4 },

  // Plate shake wrapper
  plateShakeWrap: { marginBottom: 12 },

  // License plate hero
  plateOuter: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '#0F172A',
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'visible',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.14, shadowRadius: 16 },
      android: { elevation: 6 },
      default: {},
    }),
  },
  plateOuterFocused: {
    borderColor: '#2563EB',
    ...Platform.select({
      ios:     { shadowOpacity: 0.22, shadowColor: '#2563EB' },
      android: { elevation: 10 },
      default: {},
    }),
  },

  // Corner bolts
  bolt: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E2E8F0',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  boltTL: { top: 10,  left: 10  },
  boltTR: { top: 10,  right: 10 },
  boltBL: { bottom: 10, left: 10  },
  boltBR: { bottom: 10, right: 10 },

  // Sticker tags
  stickerRow: {
    position: 'absolute',
    top: 10,
    right: 28,
    flexDirection: 'row',
    gap: 4,
  },
  stickerRed: {
    backgroundColor: '#DC2626',
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  stickerYellow: {
    backgroundColor: '#F59E0B',
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  stickerText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Hidden input
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: '100%',
    height: '100%',
  },

  // Plate text display
  plateDisplayText: {
    fontSize: 44,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 4,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  plateDisplayPlaceholder: {
    color: 'rgba(15, 23, 42, 0.18)',
  },
  plateCountry: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: 4,
  },

  // Camera button
  cameraBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Helper bubble
  helperBubble: {
    alignSelf: 'center',
    marginTop: 8,
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  // Recent plates
  recentPlatesScroll: { marginBottom: 8 },
  recentPlatesRow: { gap: 8, paddingRight: 4 },
  recentPlateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recentPlateChipActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  recentPlateText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 1,
  },
  recentPlateTextActive: {
    color: '#2563EB',
  },

  // Context pills
  pillsScroll: { marginBottom: 16 },
  pillsRow: { gap: 8, paddingRight: 8, alignItems: 'center' },
  contextPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
      android: { elevation: 1 },
      default: {},
    }),
  },
  contextPillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#374151',
    maxWidth: 100,
  },
  pillDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 2,
  },
  vehiclePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  vehiclePillActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  vehiclePillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  vehiclePillTextActive: {
    color: '#2563EB',
  },

  // Quick actions
  quickSection: { marginBottom: 14 },
  quickHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  quickTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  quickHint: {
    fontSize: 12,
    color: '#94A3B8',
  },
  quickList: {
    gap: 10,
    paddingRight: 4,
  },
  quickChip: {
    width: 96,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8 },
      android: { elevation: 2 },
      default: {},
    }),
  },
  quickChipDim: {
    opacity: 0.55,
  },
  quickChipIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickChipEmoji: {
    fontSize: 22,
  },
  quickChipLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 15,
  },
  quickChipSending: {
    position: 'absolute',
    top: 6,
    right: 6,
  },

  // Custom message button
  customBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  customBtnDim: { opacity: 0.55 },
  customBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  customBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.1,
  },

  // Claim banner
  claimBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  claimBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  claimDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  claimTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#166534',
  },
  claimSub: {
    fontSize: 12,
    color: '#4ADE80',
    marginTop: 1,
  },
  claimArrow: {
    fontSize: 18,
    color: '#16A34A',
    fontWeight: '700',
  },

  // Recent activity
  recentSection: { marginBottom: 16 },
  recentTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  recentSub: {
    fontSize: 12.5,
    color: '#94A3B8',
    marginBottom: 12,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { elevation: 1 },
      default: {},
    }),
  },
  recentIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentContent: { flex: 1 },
  recentPlate: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  recentMsgText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  recentTime: {
    fontSize: 11.5,
    color: '#94A3B8',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  emptyIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8FAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 19,
  },

  // Bottom pad
  bottomPad: { height: 110 },

  // Modals
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalSearch: {
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFF',
    borderRadius: 12,
    fontSize: 15,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pickerItemActive: {
    backgroundColor: '#EFF6FF',
  },
  pickerItemText: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
  },
});
