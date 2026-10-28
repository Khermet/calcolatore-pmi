import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { Calcolo } from './src/schermate/Calcolo.tsx';
import { stili } from './src/ui/stili.ts';

export default function App() {
  return (
    <KeyboardAvoidingView style={stili.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* sul telefono lascia spazio alla barra di stato; sul web no */}
      <View style={{ flex: 1, paddingTop: Platform.OS === 'web' ? 0 : 44 }}>
        <Calcolo />
      </View>
      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  );
}
