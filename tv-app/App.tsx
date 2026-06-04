import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  TVFocusGuideView,
  Platform,
} from 'react-native';

const CONTENT_ROWS: { title: string; items: { id: string; label: string; color: string }[] }[] = [
  {
    title: 'Featured',
    items: [
      { id: 'f1', label: 'Action', color: '#e74c3c' },
      { id: 'f2', label: 'Drama', color: '#8e44ad' },
      { id: 'f3', label: 'Comedy', color: '#2980b9' },
      { id: 'f4', label: 'Thriller', color: '#27ae60' },
    ],
  },
  {
    title: 'Continue Watching',
    items: [
      { id: 'c1', label: 'Episode 4', color: '#f39c12' },
      { id: 'c2', label: 'Episode 7', color: '#16a085' },
      { id: 'c3', label: 'Episode 2', color: '#c0392b' },
    ],
  },
  {
    title: 'Top Picks',
    items: [
      { id: 't1', label: 'Show A', color: '#2c3e50' },
      { id: 't2', label: 'Show B', color: '#6c3483' },
      { id: 't3', label: 'Show C', color: '#1a5276' },
      { id: 't4', label: 'Show D', color: '#1e8449' },
      { id: 't5', label: 'Show E', color: '#784212' },
    ],
  },
];

function ContentCard({
  label,
  color,
  onSelect,
}: {
  label: string;
  color: string;
  onSelect: (label: string) => void;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      style={[styles.card, { backgroundColor: color }, focused && styles.cardFocused]}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onPress={() => onSelect(label)}
    >
      <Text style={styles.cardLabel}>{label}</Text>
      {focused && <View style={styles.focusRing} />}
    </Pressable>
  );
}

export default function App() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>TV App</Text>
        {selected && (
          <Text style={styles.selectedHint}>Selected: {selected}</Text>
        )}
      </View>

      {/* Content rows — TVFocusGuideView keeps D-pad nav inside each row */}
      <View style={styles.content}>
        {CONTENT_ROWS.map((row) => (
          <View key={row.title} style={styles.row}>
            <Text style={styles.rowTitle}>{row.title}</Text>
            <TVFocusGuideView style={styles.rowItems} autoFocus>
              {row.items.map((item, idx) => (
                <ContentCard
                  key={item.id}
                  label={item.label}
                  color={item.color}
                  onSelect={setSelected}
                  {...(row.title === 'Featured' && idx === 0
                    ? { hasTVPreferredFocus: true }
                    : {})}
                />
              ))}
            </TVFocusGuideView>
          </View>
        ))}
      </View>

      {/* Dev hint */}
      {Platform.isTV && (
        <Text style={styles.devHint}>
          D-pad to navigate · Select to pick · Menu/Back to go back
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0f0f23',
    paddingHorizontal: 60,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  appTitle: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 1,
  },
  selectedHint: {
    color: '#aaaaaa',
    fontSize: 18,
    marginLeft: 24,
  },
  content: {
    flex: 1,
  },
  row: {
    marginBottom: 36,
  },
  rowTitle: {
    color: '#cccccc',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
  },
  rowItems: {
    flexDirection: 'row',
  },
  card: {
    width: 200,
    height: 120,
    borderRadius: 8,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardFocused: {
    transform: [{ scale: 1.08 }],
    shadowColor: '#fff',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  cardLabel: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  focusRing: {
    position: 'absolute',
    inset: 0,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  devHint: {
    color: '#555555',
    fontSize: 14,
    textAlign: 'center',
    paddingBottom: 20,
  },
});
