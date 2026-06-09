# Data Models

All core TypeScript types are defined in `expo/types/index.ts` and `expo/types/events.ts`.

---

## Vehicle

```typescript
interface Vehicle {
  id: string;
  licensePlate: string;      // Normalized: uppercase, alphanumeric only
  country: string;            // ISO country code (e.g., "US")
  state?: string;             // US/CA state abbreviation
  make?: string;
  model?: string;
  color?: string;
  year?: string;
  nickname?: string;
  type?: 'car' | 'truck' | 'motorcycle' | 'boat' | 'rv' | 'trailer' | 'offroad';
  isPrimary: boolean;
  isActive: boolean;
  verificationStatus: VerificationStatus;
  addedAt: string;            // ISO timestamp
  plateImage?: string;        // URL
}
```

---

## UserProfile

```typescript
interface UserProfile {
  id: string;
  email?: string;
  phone?: string;
  displayName?: string;
  avatar?: string;
  isAnonymous: boolean;
  createdAt: string;
  allowNotifications: boolean;
  notificationPreferences?: NotificationPreferences;
  rating: number;
  reviewCount: number;
  communityScore: number;
  badges: UserBadge[];
  verificationStatus: VerificationStatus;
  accountType: AccountType;
  blockedUsers: string[];
  trustedContacts: string[];
  emergencyContacts: EmergencyContact[];
  doNotContactWindows?: TimeWindow[];
  preferredLanguage: string;
  organizationId?: string;
  vehicles: Vehicle[];
  primaryVehicleId?: string;
  termsAccepted: boolean;
  termsAcceptedAt?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
}
```

---

## Message

```typescript
interface Message {
  id: string;
  fromPlate: string;
  toPlate: string;
  toCountry?: string;
  toState?: string;
  fromName?: string;
  content: string;
  type: MessageType;
  isAnonymous: boolean;
  timestamp: string;           // ISO timestamp
  isRead: boolean;
  location?: string;
  rating?: number;
  hasBeenRated?: boolean;
  intent?: MessageIntent;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  attachments?: MessageAttachment[];
  quickReplyUsed?: string;
  geofenceId?: string;
  isModerated?: boolean;
  reportCount?: number;
  metadata?: { [key: string]: any };
}
```

---

## Key Enums / Union Types

### VerificationStatus
```typescript
type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
```

### AccountType
```typescript
type AccountType = 
  | 'personal' | 'fleet' | 'business' 
  | 'municipal' | 'property_manager' 
  | 'event_organizer' | 'campus';
```

### MessageType
See [[Message Types]] for the full union — 25 values.

### MarketplaceCategory
```typescript
type MarketplaceCategory = 
  | 'whole_car' | 'engine_parts' | 'body_parts' | 'interior'
  | 'wheels_tires' | 'electronics' | 'accessories' | 'tools' | 'services';
```

### ServiceType
```typescript
type ServiceType = 
  | 'body_shop' | 'tire_service' | 'oil_change' | 'window_repair'
  | 'detailing' | 'mechanic' | 'towing' | 'inspection' | 'insurance' | 'parts_dealer';
```

---

## Supporting Types

### EmergencyContact
```typescript
interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  isPrimary: boolean;
}
```

### NotificationPreferences
```typescript
interface NotificationPreferences {
  enabled: boolean;
  messages: boolean;
  listings: boolean;
  general: boolean;
  pushToken?: string;
  platform?: 'ios' | 'android' | 'web' | 'unknown';
  lastPromptAt?: string;
}
```

### MarketplaceItem
```typescript
interface MarketplaceItem {
  id: string;
  sellerId: string;
  sellerPlate: string;
  sellerName?: string;
  title: string;
  description: string;
  price: number;
  category: MarketplaceCategory;
  condition: 'new' | 'used' | 'refurbished';
  images: string[];
  location?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  contactMethod: 'plate' | 'anonymous';
}
```

---

## Computed Values

Located in `hooks/useAppStore.tsx`:

### RatingTotals
```typescript
type RatingTotals = {
  averageRating: number;
  count: number;
  sum: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

// Compute from PlateRating[]
computeRatingTotals(ratings: readonly PlateRating[]): RatingTotals
```

### Community Score
```typescript
computeCommunityScoreFromRatings(ratings: readonly PlateRating[]): number
// Each rating = 10 base points + (rating * 5)
```

---

## Related Notes

- [[State Management]] — How these types flow through stores
- [[Message Types]] — Full MessageType taxonomy
- [[Storage & Persistence]] — How these types are stored/loaded
