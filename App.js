import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, StyleSheet, TextInput, Button, FlatList, View, Text, TouchableOpacity } from 'react-native';
import { addDoc, collection, firestore, deleteDoc, SHOPPING_LIST, onSnapshot, query, orderBy , serverTimestamp, doc} from './Config';
import Icon from 'react-native-vector-icons/Ionicons';

export default function App() {
  const [newItem, setNewItem] = useState('');
  const [shoppingList, setShoppingList] = useState([]);

  const addItem = async () => {
    if (!newItem.trim()) return;

    try {
      await addDoc(collection(firestore, SHOPPING_LIST), {
        text: newItem,
        createdAt: serverTimestamp(),
      });
      setNewItem('');
    } catch (error) {
      console.error("Error adding item: ", error);
    }
  };

  const deleteItem = async (id) => {
    try {
      const itemRef = doc(firestore, SHOPPING_LIST, id);
      await deleteDoc(itemRef);
      console.log("Item deleted successfully.");
    } catch (error) {
      console.error("Error deleting item: ", error);
    }
  };

  useEffect(() => {
    const q = query(collection(firestore, SHOPPING_LIST), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setShoppingList(items);
    });

    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Shopping List</Text>
      </View>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Add a new item..."
          value={newItem}
          onChangeText={setNewItem}
          onSubmitEditing={addItem}
        />
          <TouchableOpacity onPress={addItem}>
              <Icon name="add-circle-outline" size={34} color="blue" />
            </TouchableOpacity>
      </View>
      <FlatList
        data={shoppingList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemText}>{item.text}</Text>
            <TouchableOpacity onPress={() => deleteItem(item.id)}>
              <Icon name="trash-outline" size={24} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    backgroundColor: '#000', 
    padding: 30,
    borderRadius: 5,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 30, 
    color: '#FF0000',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  itemText: {
    fontSize: 16,
  },
});
