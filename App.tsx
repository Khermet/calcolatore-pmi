import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import { Calcolo } from './src/schermate/Calcolo.tsx';
import { Esercizi } from './src/schermate/Esercizi.tsx';
import { stili } from './src/ui/stili.ts';

const SCHEDE = [
  { id: 'calcolo', titolo: 'Calcolo' },
  { id: 'esercizi', titolo: 'Esercizi' },
] as const;

export default function App() {
  const [scheda, setScheda] = useState<(typeof SCHEDE)[number]['id']>('calcolo');
  return (
    <KeyboardAvoidingView style={stili.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={stili.barraSchede}>
        {SCHEDE.map((s) => (
          <Pressable key={s.id} onPress={() => setScheda(s.id)} style={[stili.scheda2, scheda === s.id && stili.schedaAttiva]}>
            <Text style={scheda === s.id ? stili.schedaTestoAttivo : stili.schedaTesto}>{s.titolo}</Text>
          </Pressable>
        ))}
      </View>
      {/* entrambe restano montate: passando da una scheda all'altra non si perdono i dati inseriti */}
      <View style={{ flex: 1, display: scheda === 'calcolo' ? 'flex' : 'none' }}>
        <Calcolo />
      </View>
      <View style={{ flex: 1, display: scheda === 'esercizi' ? 'flex' : 'none' }}>
        <Esercizi />
      </View>
      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  );
}
