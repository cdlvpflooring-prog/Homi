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
  Eye,
  Radio,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { designTokens } from "@/constants/theme";
import * as Haptics from "expo-haptics";

type PostType = 'alert' | 'info' | 'update';

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

const MOCK_POSTS: MockPost[] = [
  {
    id: '1',
    author: 'A. Patel',
    initials: 'AP',
    avatarColor: '#6366F1',
    community: 'Downtown Watch',
    time: '5m ago',
    type: 'alert',
    body: 'Unknown person checking door handles near Lot C. Saw them around 8:30 PM, wearing dark hoodie. Already reported to security.',
    likes: 12,
    comments: 2,
  },
  {
    id: '2',
    author: 'L. Nguyen',
    initials: 'LN',
    avatarColor: '#059669',
    community: 'Neighborhood Alert',
    time: '20m ago',
    type: 'info',
    body: 'Tip: Mark your bike and register the serial for faster recovery. Also, take photos of your bike from multiple angles.',
    likes: 24,
    comments: 2,
  },
  {
    id: '3',
    author: 'Building Security',
    initials: 'BS',
    avatarColor: '#2563EB',
    community: 'Campus Safety',
    time: '1h ago',
    type: 'alert',
    body: 'Lobby camera maintenance 2-3 PM today. Temporary blind spot near south entrance. Extra security personnel will be stationed during this time.',
    likes: 8,
    comments: 5,
  },
];

const SAFETY_FEATURES = [
  {
    id: 'community_watch',
    icon: Users,
    color: '#EF4444',
    bgColor: '#FEF2F2',
    label: 'Community Watch',
    desc: 'Report incidents or post updates for your neighborhood group',
    badge: 'REPORT',
    badgeColor: '#EF4444',
  },
  {
    id: 'safety_alerts',
    icon: Bell,
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    label: 'Safety Alerts',
    desc: 'Configure notification preferences for your area',
    badge: null,
    badgeColor: null,
  },
  {
    id: 'evidence_locker',
    icon: Lock,
    color: '#10B981',
    bgColor: '#F0FDF4',
    label: 'Evidence Locker',
    desc: 'Store and share photos and evidence securely',
    badge: null,
    badgeColor: null,
  },
  {
    id: 'witness_mode',
    icon: Video,
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    label: 'Witness Mode',
    desc: 'Quick record and report incidents',
    badge: null,
    badgeColor: null,
  },
];

const POST_BADGE_COLORS: Record<PostType, { bg: string; text: string }> = {
  alert: { bg: '#FEF2F2', text: '#DC2626' },
  info: { bg: '#EFF6FF', text: '#2563EB' },
  update: { bg: '#F0FDF4', text: '#16A34A' },
};

function triggerHaptic() {
  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
}

export default function SafetyScreen() {
  const [locationSharing, setLocationSharing] = useState(false);

  const handleCallEmergency = useCallback((name: string, number: string) => {
    triggerHaptic();
    Alert.alert(
      `Call ${name}`,
      `Are you sure you want to call ${number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          style: 'destructive',
          onPress: () => {
            Linking.openURL(`tel:${number}`).catch(() => {
              Alert.alert('Unable to place call', 'Please dial ' + number + ' manually.');
            });
          },
        },
      ]
    );
  }, []);

  const handleLocationToggle = useCallback((val: boolean) => {
    triggerHaptic();
    setLocationSharing(val);
  }, []);

  const handleFeaturePress = useCallback((id: string) => {
    triggerHaptic();
    router.push('/safety-center');
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* ── HEADER ─────────────────────────────────────────── */}
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
        {/* ── EMERGENCY CONTACTS ─────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>EMERGENCY CONTACTS</Text>
            <View style={styles.contactCountBadge}>
              <Text style={styles.contactCountText}>3</Text>
            </View>
          </View>
          <Text style={styles.sectionSub}>Fast-access help cards</Text>

          <View style={styles.emergencyGrid}>
            {/* Police */}
            <TouchableOpacity
              style={[styles.emergencyCard, styles.emergencyCardRed]}
              onPress={() => handleCallEmergency('Police', '911')}
              activeOpacity={0.82}
            >
              <View style={styles.emergencyCardInner}>
                <View style={[styles.emergencyBadge, { backgroundColor: 'rgba(220,38,38,0.15)' }]}>
                  <AlertTriangle size={18} color="#DC2626" strokeWidth={2.2} />
                </View>
                <View style={styles.officialTag}>
                  <Text style={styles.officialTagText}>OFFICIAL</Text>
                </View>
                <Text style={styles.emergencyCardTitle}>Police</Text>
                <Text style={styles.emergencyCardDesc}>Emergency dispatch</Text>
                <View style={styles.emergencyNumberRow}>
                  <Phone size={13} color="#DC2626" strokeWidth={2} />
                  <Text style={[styles.emergencyNumber, { color: '#DC2626' }]}>911</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Building Security */}
            <TouchableOpacity
              style={[styles.emergencyCard, styles.emergencyCardBlue]}
              onPress={() => handleCallEmergency('Building Security', '555-0100')}
              activeOpacity={0.82}
            >
              <View style={styles.emergencyCardInner}>
                <View style={[styles.emergencyBadge, { backgroundColor: 'rgba(37,99,235,0.12)' }]}>
                  <Shield size={18} color="#2563EB" strokeWidth={2.2} />
                </View>
                <View style={styles.officialTag}>
                  <Text style={styles.officialTagText}>OFFICIAL</Text>
                </View>
                <Text style={styles.emergencyCardTitle}>Building Security</Text>
                <Text style={styles.emergencyCardDesc}>On-site response</Text>
                <View style={styles.emergencyNumberRow}>
                  <Phone size={13} color="#2563EB" strokeWidth={2} />
                  <Text style={[styles.emergencyNumber, { color: '#2563EB' }]}>555-0100</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Towing */}
            <TouchableOpacity
              style={[styles.emergencyCard, styles.emergencyCardOrange]}
              onPress={() => handleCallEmergency('Towing Company', '555-0200')}
              activeOpacity={0.82}
            >
              <View style={styles.emergencyCardInner}>
                <View style={[styles.emergencyBadge, { backgroundColor: 'rgba(234,88,12,0.12)' }]}>
                  <Truck size={18} color="#EA580C" strokeWidth={2.2} />
                </View>
                <View style={styles.officialTag}>
                  <Text style={styles.officialTagText}>OFFICIAL</Text>
                </View>
                <Text style={styles.emergencyCardTitle}>Towing Company</Text>
                <Text style={styles.emergencyCardDesc}>Roadside assist</Text>
                <View style={styles.emergencyNumberRow}>
                  <Phone size={13} color="#EA580C" strokeWidth={2} />
                  <Text style={[styles.emergencyNumber, { color: '#EA580C' }]}>555-0200</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── LOCATION SHARING ───────────────────────────────── */}
        <View style={styles.locationCard}>
          <View style={[styles.locationLeft]}>
            <View style={[styles.locationIconWrap, locationSharing && styles.locationIconWrapActive]}>
              <MapPin size={18} color={locationSharing ? '#16A34A' : '#64748B'} strokeWidth={2} />
            </View>
            <View>
              <Text style={styles.locationTitle}>Location Sharing</Text>
              <Text style={[styles.locationSub, locationSharing && styles.locationSubActive]}>
                {locationSharing ? 'Active — visible to community' : 'Inactive'}
              </Text>
            </View>
          </View>
          <Switch
            value={locationSharing}
            onValueChange={handleLocationToggle}
            trackColor={{ false: '#E2E8F0', true: '#BBF7D0' }}
            thumbColor={locationSharing ? '#16A34A' : '#94A3B8'}
          />
        </View>

        {/* ── SAFETY FEATURES ────────────────────────────────── */}
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
                        <View style={[styles.featureBadge, { backgroundColor: feat.badgeColor + '18' }]}>
                          <Text style={[styles.featureBadgeText, { color: feat.badgeColor! }]}>
                            {feat.badge}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.featureDesc} numberOfLines={1}>{feat.desc}</Text>
                  </View>
                  <ChevronRight size={18} color="#CBD5E1" strokeWidth={2} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── COMMUNITY FEED ─────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.feedHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>COMMUNITY FEED</Text>
              <Text style={styles.sectionSub}>Live activity from your groups</Text>
            </View>
            <TouchableOpacity style={styles.feedSeeAll} onPress={() => router.push('/safety-center')}>
              <Text style={styles.feedSeeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          {MOCK_POSTS.map((post) => {
            const badgeStyle = POST_BADGE_COLORS[post.type];
            return (
              <View key={post.id} style={styles.feedCard}>
                <View style={styles.feedCardHeader}>
                  <View style={[styles.feedAvatar, { backgroundColor: post.avatarColor }]}>
                    <Text style={styles.feedAvatarText}>{post.initials}</Text>
                  </View>
                  <View style={styles.feedMeta}>
                    <Text style={styles.feedAuthor}>{post.author}</Text>
                    <Text style={styles.feedMetaSub}>
                      {post.time} · {post.community}
                    </Text>
                  </View>
                  <View style={[styles.feedBadge, { backgroundColor: badgeStyle.bg }]}>
                    <Text style={[styles.feedBadgeText, { color: badgeStyle.text }]}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },

  // ── Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
    fontStyle: 'italic',
  },

  // ── Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },

  // ── Sections
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 12.5,
    color: '#64748B',
    marginBottom: 14,
  },
  contactCountBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  contactCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ── Emergency Grid
  emergencyGrid: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  emergencyCard: {
    flex: 1,
    minWidth: 100,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 3 },
      default: {},
    }),
  },
  emergencyCardRed: { backgroundColor: '#FFF5F5' },
  emergencyCardBlue: { backgroundColor: '#EFF6FF' },
  emergencyCardOrange: { backgroundColor: '#FFF7ED' },
  emergencyCardInner: {
    padding: 14,
    gap: 6,
  },
  emergencyBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  officialTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 4,
  },
  officialTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.5,
  },
  emergencyCardTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  emergencyCardDesc: {
    fontSize: 11,
    color: '#64748B',
  },
  emergencyNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  emergencyNumber: {
    fontSize: 15,
    fontWeight: '700',
  },

  // ── Location Card
  locationCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 2 },
      default: { borderWidth: 1, borderColor: '#E2E8F0' },
    }),
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  locationIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationIconWrapActive: {
    backgroundColor: '#DCFCE7',
  },
  locationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  locationSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 1,
  },
  locationSubActive: {
    color: '#16A34A',
  },

  // ── Safety Features
  featureList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 2 },
      default: { borderWidth: 1, borderColor: '#E2E8F0' },
    }),
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  featureRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  featureIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: { flex: 1, gap: 2 },
  featureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureLabel: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  featureBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  featureBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  featureDesc: {
    fontSize: 12,
    color: '#64748B',
  },

  // ── Community Feed
  feedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  feedSeeAll: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  feedSeeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  feedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { elevation: 2 },
      default: { borderWidth: 1, borderColor: '#E2E8F0' },
    }),
  },
  feedCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  feedAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  feedMeta: { flex: 1 },
  feedAuthor: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  feedMetaSub: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  feedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  feedBadgeText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  feedBody: {
    fontSize: 13.5,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  feedActions: {
    flexDirection: 'row',
    gap: 16,
  },
  feedAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  feedActionCount: {
    fontSize: 12.5,
    color: '#94A3B8',
    fontWeight: '500',
  },

  bottomPad: { height: 110 },
});
