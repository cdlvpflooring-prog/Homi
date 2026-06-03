import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
  Linking,
  Platform,
  TextInput,
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import {
  Phone,
  Shield,
  MapPin,
  Bell,
  Lock,
  Video,
  Users,
  Heart,
  MessageSquare,
  ChevronRight,
  AlertTriangle,
  Truck,
  Plus,
  Pencil,
  X,
  Check,
} from "lucide-react-native";
import { router } from "expo-router";
import { designTokens } from "@/constants/theme";
import * as Haptics from "expo-haptics";
import { ReportSheet } from "@/components/ReportSheet";
import type { EventType, IncidentReport } from "@/types/events";

// ── Types ──────────────────────────────────────────────────────────────

type PostType = "alert" | "info" | "update";

interface MockPost {
  id: string;
  author: string;
  initials: string;
  avatarColor: string;
  community: string;
  time: string;
  type: PostType;
  body: string;
  likes: number;
  comments: number;
}

interface EmergencyContact {
  id: string;
  name: string;
  number: string;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  isOfficial: boolean;
}

// ── Constants ──────────────────────────────────────────────────────────

const DEFAULT_CONTACTS: EmergencyContact[] = [
  {
    id: "police",
    name: "Police",
    number: "911",
    iconColor: "#DC2626",
    bgColor: "#FFF5F5",
    borderColor: "#FECACA",
    isOfficial: true,
  },
  {
    id: "security",
    name: "Building Security",
    number: "555-0100",
    iconColor: "#2563EB",
    bgColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    isOfficial: true,
  },
  {
    id: "tow",
    name: "Towing Company",
    number: "555-0200",
    iconColor: "#EA580C",
    bgColor: "#FFF7ED",
    borderColor: "#FDBA74",
    isOfficial: true,
  },
];

const CONTACT_COLORS: Array<{ iconColor: string; bgColor: string; borderColor: string }> = [
  { iconColor: "#7C3AED", bgColor: "#F5F3FF", borderColor: "#DDD6FE" },
  { iconColor: "#059669", bgColor: "#F0FDF4", borderColor: "#A7F3D0" },
  { iconColor: "#DB2777", bgColor: "#FDF2F8", borderColor: "#FBCFE8" },
  { iconColor: "#D97706", bgColor: "#FFFBEB", borderColor: "#FDE68A" },
];

const MOCK_POSTS: MockPost[] = [
  {
    id: "1",
    author: "A. Patel",
    initials: "AP",
    avatarColor: "#6366F1",
    community: "Downtown Watch",
    time: "5m ago",
    type: "alert",
    body: "Unknown person checking door handles near Lot C. Saw them around 8:30 PM, wearing dark hoodie. Already reported to security.",
    likes: 12,
    comments: 2,
  },
  {
    id: "2",
    author: "L. Nguyen",
    initials: "LN",
    avatarColor: "#059669",
    community: "Neighborhood Alert",
    time: "20m ago",
    type: "info",
    body: "Tip: Mark your bike and register the serial for faster recovery. Also, take photos from multiple angles.",
    likes: 24,
    comments: 2,
  },
  {
    id: "3",
    author: "Building Security",
    initials: "BS",
    avatarColor: "#2563EB",
    community: "Campus Safety",
    time: "1h ago",
    type: "alert",
    body: "Lobby camera maintenance 2-3 PM today. Temporary blind spot near south entrance. Extra personnel stationed during this time.",
    likes: 8,
    comments: 5,
  },
];

const SAFETY_FEATURES = [
  {
    id: "community_watch",
    icon: Users,
    color: "#EF4444",
    bgColor: "#FEF2F2",
    label: "Community Watch",
    desc: "Report incidents or post updates for your neighborhood group",
    badge: "REPORT",
    badgeColor: "#EF4444",
  },
  {
    id: "safety_alerts",
    icon: Bell,
    color: "#F59E0B",
    bgColor: "#FFFBEB",
    label: "Safety Alerts",
    desc: "Configure notification preferences for your area",
    badge: null,
    badgeColor: null,
  },
  {
    id: "evidence_locker",
    icon: Lock,
    color: "#10B981",
    bgColor: "#F0FDF4",
    label: "Evidence Locker",
    desc: "Store and share photos and evidence securely",
    badge: null,
    badgeColor: null,
  },
  {
    id: "witness_mode",
    icon: Video,
    color: "#8B5CF6",
    bgColor: "#F5F3FF",
    label: "Witness Mode",
    desc: "Quick record and report incidents",
    badge: null,
    badgeColor: null,
  },
];

const POST_BADGE_COLORS: Record<PostType, { bg: string; text: string }> = {
  alert: { bg: "#FEF2F2", text: "#DC2626" },
  info: { bg: "#EFF6FF", text: "#2563EB" },
  update: { bg: "#F0FDF4", text: "#16A34A" },
};

function triggerHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {}
}

// ── Component ──────────────────────────────────────────────────────────

export default function SafetyScreen() {
  const [locationSharing, setLocationSharing] = useState(false);
  const [contacts, setContacts] = useState<EmergencyContact[]>(DEFAULT_CONTACTS);
  const [reportVisible, setReportVisible] = useState(false);

  // Edit modal state
  const [editVisible, setEditVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<EmergencyContact | null>(null);
  const [editName, setEditName] = useState("");
  const [editNumber, setEditNumber] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleCallContact = useCallback(
    (contact: EmergencyContact) => {
      triggerHaptic();
      Alert.alert(`Call ${contact.name}`, `Dial ${contact.number}?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Call",
          style: "destructive",
          onPress: () =>
            Linking.openURL(`tel:${contact.number.replace(/[^0-9]/g, "")}`).catch(() =>
              Alert.alert("Unable to call", `Please dial ${contact.number} manually.`)
            ),
        },
      ]);
    },
    []
  );

  const openEdit = useCallback((contact: EmergencyContact) => {
    triggerHaptic();
    setEditTarget(contact);
    setEditName(contact.name);
    setEditNumber(contact.number);
    setIsAdding(false);
    setEditVisible(true);
  }, []);

  const openAdd = useCallback(() => {
    triggerHaptic();
    setEditTarget(null);
    setEditName("");
    setEditNumber("");
    setIsAdding(true);
    setEditVisible(true);
  }, []);

  const saveContact = useCallback(() => {
    const name = editName.trim();
    const number = editNumber.trim();
    if (!name || !number) {
      Alert.alert("Required", "Please enter both a name and a phone number.");
      return;
    }
    if (isAdding) {
      const colorSet = CONTACT_COLORS[(contacts.length - 3) % CONTACT_COLORS.length];
      setContacts((prev) => [
        ...prev,
        {
          id: `custom-${Date.now()}`,
          name,
          number,
          ...colorSet,
          isOfficial: false,
        },
      ]);
    } else if (editTarget) {
      setContacts((prev) =>
        prev.map((c) => (c.id === editTarget.id ? { ...c, name, number } : c))
      );
    }
    setEditVisible(false);
  }, [editName, editNumber, isAdding, editTarget, contacts.length]);

  const deleteContact = useCallback((id: string) => {
    Alert.alert("Remove contact", "Remove this emergency contact?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => setContacts((prev) => prev.filter((c) => c.id !== id)),
      },
    ]);
  }, []);

  const handleFeaturePress = useCallback(
    (id: string) => {
      triggerHaptic();
      if (id === "community_watch") {
        setReportVisible(true);
      } else {
        router.push("/safety-center");
      }
    },
    []
  );

  const handleReportSelect = useCallback((_type: EventType) => {}, []);
  const handleIncidentSent = useCallback((_report: IncidentReport) => {
    setReportVisible(false);
  }, []);

  const contactCountBadge = contacts.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* ── HEADER ─────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerIconWrap}>
          <Shield size={20} color="#FFFFFF" strokeWidth={2.2} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Community Safety</Text>
          <Text style={styles.headerSub}>Shielded communities, real-time support</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── EMERGENCY CONTACTS ─────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>EMERGENCY CONTACTS</Text>
            <View style={styles.sectionHeaderRight}>
              <View style={styles.contactCountBadge}>
                <Text style={styles.contactCountText}>{contactCountBadge}</Text>
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={openAdd} activeOpacity={0.75}>
                <Plus size={14} color="#2563EB" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.sectionSub}>Tap a card to call · pencil to edit</Text>

          <View style={styles.emergencyGrid}>
            {contacts.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                style={[
                  styles.emergencyCard,
                  {
                    backgroundColor: contact.bgColor,
                    borderColor: contact.borderColor,
                  },
                ]}
                onPress={() => handleCallContact(contact)}
                activeOpacity={0.82}
              >
                {/* Edit button */}
                <TouchableOpacity
                  style={styles.cardEditBtn}
                  onPress={() => openEdit(contact)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Pencil size={11} color={contact.iconColor} strokeWidth={2.2} />
                </TouchableOpacity>

                <View style={styles.emergencyCardInner}>
                  {/* Icon */}
                  <View
                    style={[
                      styles.emergencyBadge,
                      { backgroundColor: contact.iconColor + "18" },
                    ]}
                  >
                    {contact.id === "police" ? (
                      <AlertTriangle size={18} color={contact.iconColor} strokeWidth={2.2} />
                    ) : contact.id === "tow" ? (
                      <Truck size={18} color={contact.iconColor} strokeWidth={2.2} />
                    ) : (
                      <Phone size={18} color={contact.iconColor} strokeWidth={2.2} />
                    )}
                  </View>

                  {contact.isOfficial && (
                    <View style={styles.officialTag}>
                      <Text style={styles.officialTagText}>OFFICIAL</Text>
                    </View>
                  )}

                  <Text style={styles.emergencyCardTitle} numberOfLines={2}>
                    {contact.name}
                  </Text>

                  <View style={styles.emergencyNumberRow}>
                    <Phone size={12} color={contact.iconColor} strokeWidth={2} />
                    <Text style={[styles.emergencyNumber, { color: contact.iconColor }]}>
                      {contact.number}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {/* Add tile */}
            <TouchableOpacity
              style={styles.addTile}
              onPress={openAdd}
              activeOpacity={0.75}
            >
              <Plus size={22} color="#94A3B8" strokeWidth={2} />
              <Text style={styles.addTileText}>Add Contact</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── LOCATION SHARING ───────────────────────── */}
        <View style={styles.locationCard}>
          <View style={styles.locationLeft}>
            <View
              style={[
                styles.locationIconWrap,
                locationSharing && styles.locationIconWrapActive,
              ]}
            >
              <MapPin
                size={18}
                color={locationSharing ? "#16A34A" : "#64748B"}
                strokeWidth={2}
              />
            </View>
            <View>
              <Text style={styles.locationTitle}>Location Sharing</Text>
              <Text
                style={[styles.locationSub, locationSharing && styles.locationSubActive]}
              >
                {locationSharing ? "Active — visible to community" : "Inactive"}
              </Text>
            </View>
          </View>
          <Switch
            value={locationSharing}
            onValueChange={(v) => {
              triggerHaptic();
              setLocationSharing(v);
            }}
            trackColor={{ false: "#E2E8F0", true: "#BBF7D0" }}
            thumbColor={locationSharing ? "#16A34A" : "#94A3B8"}
          />
        </View>

        {/* ── SAFETY FEATURES ────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SAFETY FEATURES</Text>
          <View style={styles.featureList}>
            {SAFETY_FEATURES.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <TouchableOpacity
                  key={feat.id}
                  style={[
                    styles.featureRow,
                    i < SAFETY_FEATURES.length - 1 && styles.featureRowBorder,
                  ]}
                  onPress={() => handleFeaturePress(feat.id)}
                  activeOpacity={0.78}
                >
                  <View style={[styles.featureIconWrap, { backgroundColor: feat.bgColor }]}>
                    <Icon size={20} color={feat.color} strokeWidth={2} />
                  </View>
                  <View style={styles.featureContent}>
                    <View style={styles.featureTitleRow}>
                      <Text style={styles.featureLabel}>{feat.label}</Text>
                      {feat.badge && (
                        <View
                          style={[
                            styles.featureBadge,
                            { backgroundColor: feat.badgeColor + "18" },
                          ]}
                        >
                          <Text
                            style={[
                              styles.featureBadgeText,
                              { color: feat.badgeColor! },
                            ]}
                          >
                            {feat.badge}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.featureDesc} numberOfLines={2}>
                      {feat.desc}
                    </Text>
                  </View>
                  <ChevronRight size={18} color="#CBD5E1" strokeWidth={2} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── COMMUNITY FEED ─────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.feedHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>COMMUNITY FEED</Text>
              <Text style={styles.sectionSub}>Live activity from your groups</Text>
            </View>
            <TouchableOpacity
              style={styles.feedSeeAll}
              onPress={() => router.push("/safety-center")}
            >
              <Text style={styles.feedSeeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          {MOCK_POSTS.map((post) => {
            const badgeStyle = POST_BADGE_COLORS[post.type];
            return (
              <View key={post.id} style={styles.feedCard}>
                <View style={styles.feedCardHeader}>
                  <View
                    style={[styles.feedAvatar, { backgroundColor: post.avatarColor }]}
                  >
                    <Text style={styles.feedAvatarText}>{post.initials}</Text>
                  </View>
                  <View style={styles.feedMeta}>
                    <Text style={styles.feedAuthor}>{post.author}</Text>
                    <Text style={styles.feedMetaSub}>
                      {post.time} · {post.community}
                    </Text>
                  </View>
                  <View
                    style={[styles.feedBadge, { backgroundColor: badgeStyle.bg }]}
                  >
                    <Text
                      style={[styles.feedBadgeText, { color: badgeStyle.text }]}
                    >
                      {post.type}
                    </Text>
                  </View>
                </View>
                <Text style={styles.feedBody}>{post.body}</Text>
                <View style={styles.feedActions}>
                  <View style={styles.feedAction}>
                    <Heart size={14} color="#94A3B8" strokeWidth={2} />
                    <Text style={styles.feedActionCount}>{post.likes}</Text>
                  </View>
                  <View style={styles.feedAction}>
                    <MessageSquare size={14} color="#94A3B8" strokeWidth={2} />
                    <Text style={styles.feedActionCount}>{post.comments}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* ── EDIT / ADD CONTACT MODAL ────────────────── */}
      <Modal
        visible={editVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.editModalOverlay}
        >
          <View style={styles.editSheet}>
            {/* Handle */}
            <View style={styles.editHandle} />

            <View style={styles.editHeader}>
              <Text style={styles.editTitle}>
                {isAdding ? "Add Emergency Contact" : "Edit Contact"}
              </Text>
              <TouchableOpacity
                style={styles.editCloseBtn}
                onPress={() => setEditVisible(false)}
              >
                <X size={18} color="#64748B" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>

            <View style={styles.editFieldWrap}>
              <Text style={styles.editFieldLabel}>NAME</Text>
              <TextInput
                style={styles.editInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="e.g. Fire Department"
                placeholderTextColor="#94A3B8"
                returnKeyType="next"
                autoFocus
              />
            </View>

            <View style={styles.editFieldWrap}>
              <Text style={styles.editFieldLabel}>PHONE NUMBER</Text>
              <TextInput
                style={styles.editInput}
                value={editNumber}
                onChangeText={setEditNumber}
                placeholder="e.g. 555-0300"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                returnKeyType="done"
                onSubmitEditing={saveContact}
              />
            </View>

            {!isAdding && editTarget && !editTarget.isOfficial && (
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => {
                  setEditVisible(false);
                  deleteContact(editTarget.id);
                }}
              >
                <Text style={styles.deleteBtnText}>Remove Contact</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.saveBtn} onPress={saveContact} activeOpacity={0.85}>
              <Check size={16} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.saveBtnText}>
                {isAdding ? "Add Contact" : "Save Changes"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── REPORT INCIDENT SHEET ───────────────────── */}
      <ReportSheet
        visible={reportVisible}
        onClose={() => setReportVisible(false)}
        onSelect={handleReportSelect}
        onIncidentSent={handleIncidentSent}
      />
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFF",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: { flex: 1 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 1,
    fontStyle: "italic",
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },

  // Sections
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  sectionHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 14,
  },
  contactCountBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  contactCountText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },

  // Emergency Grid
  emergencyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  emergencyCard: {
    width: "30%",
    minWidth: 96,
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: "hidden",
    position: "relative",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
      default: {},
    }),
  },
  cardEditBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.07)",
  },
  emergencyCardInner: {
    padding: 12,
    paddingTop: 14,
    alignItems: "center",
    gap: 5,
  },
  emergencyBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  officialTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 4,
  },
  officialTagText: {
    fontSize: 8.5,
    fontWeight: "700",
    color: "#475569",
    letterSpacing: 0.4,
    textAlign: "center",
  },
  emergencyCardTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    lineHeight: 16,
  },
  emergencyNumberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 2,
  },
  emergencyNumber: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },

  // Add tile
  addTile: {
    width: "30%",
    minWidth: 96,
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    backgroundColor: "#F8FAFF",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 6,
  },
  addTileText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
    textAlign: "center",
  },

  // Location Card
  locationCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      default: { borderWidth: 1, borderColor: "#E2E8F0" },
    }),
  },
  locationLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  locationIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  locationIconWrapActive: { backgroundColor: "#DCFCE7" },
  locationTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  locationSub: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 1,
  },
  locationSubActive: { color: "#16A34A" },

  // Safety Features
  featureList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      default: { borderWidth: 1, borderColor: "#E2E8F0" },
    }),
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  featureRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  featureIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  featureContent: { flex: 1, gap: 2 },
  featureTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureLabel: {
    fontSize: 14.5,
    fontWeight: "600",
    color: "#0F172A",
  },
  featureBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  featureBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  featureDesc: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
  },

  // Community Feed
  feedHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  feedSeeAll: { paddingVertical: 4, paddingHorizontal: 8 },
  feedSeeAllText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563EB",
  },
  feedCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
      default: { borderWidth: 1, borderColor: "#E2E8F0" },
    }),
  },
  feedCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  feedAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  feedAvatarText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  feedMeta: { flex: 1 },
  feedAuthor: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#0F172A",
  },
  feedMetaSub: {
    fontSize: 11.5,
    color: "#94A3B8",
    marginTop: 1,
  },
  feedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  feedBadgeText: {
    fontSize: 10.5,
    fontWeight: "600",
  },
  feedBody: {
    fontSize: 13.5,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 12,
  },
  feedActions: {
    flexDirection: "row",
    gap: 16,
  },
  feedAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  feedActionCount: {
    fontSize: 12.5,
    color: "#94A3B8",
    fontWeight: "500",
  },

  // Edit Modal
  editModalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  editSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
      },
      android: { elevation: 20 },
      default: {},
    }),
  },
  editHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
    alignSelf: "center",
    marginBottom: 20,
  },
  editHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  editCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  editFieldWrap: { marginBottom: 18 },
  editFieldLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "500",
  },
  deleteBtn: {
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  deleteBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DC2626",
  },
  saveBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  bottomPad: { height: 110 },
});
