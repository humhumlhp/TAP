import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';

const classes = [
  { id: '12A1', label: '12A1' },
  { id: '12A2', label: '12A2' },
  { id: '12A3', label: '12A3' },
  { id: '12A4', label: '12A4' },
  { id: '12CL1', label: '12CL1' },
  { id: '12CL2', label: '12CL2' },
  { id: '12CT1', label: '12CT1' },
  { id: '12CT2', label: '12CT2' },
  { id: '12CA1', label: '12CA1' },
  { id: '12CA2', label: '12CA2' },
  { id: '12CS', label: '12CS' },
  { id: '12CSU', label: '12CSU' },
  { id: '12CDIA', label: '12CDIA' },
  { id: '12TH1', label: '12TH1' },
  { id: '12TH2', label: '12TH2' },
  { id: '12CV1', label: '12CV1' },
  { id: '12CV2', label: '12CV2' },
  { id: '12CH1', label: '12CH1' },
  { id: '12CH2', label: '12CH2' },
  { id: '12CTIN', label: '12CTIN' },
  // Add more classes as needed
];

const ClassChoiceList = ({ onSelect }) => {
  const [selected, setSelected] = useState(null);

  const handleSelect = (id) => {
    setSelected(id);
    if (onSelect) onSelect(id);
  };

  return (
    <FlatList
      data={classes}
      keyExtractor={(item, index) => item.id + index}
      renderItem={({ item }) => (
        <Pressable
          style={[
            styles.choice,
            selected === item.id && styles.selectedChoice,
          ]}
          onPress={() => handleSelect(item.id)}
        >
          <Text style={styles.choiceText}>
            {item.label} {selected === item.id ? '✓' : ''}
          </Text>
        </Pressable>
      )}
      style={{ maxHeight: 300 }} // Adjust height as needed
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  choice: {
    padding: 16,
    marginVertical: 6,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  selectedChoice: {
    backgroundColor: '#aaf',
  },
  choiceText: {
    fontSize: 16,
  },
});

export default ClassChoiceList;