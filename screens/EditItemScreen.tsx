import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Alert, Button, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, StyleSheet, TouchableOpacity, TextInput, Keyboard } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import { Item, itemsStore } from '../store/itemsStore';

export default function EditItemScreen(props : any) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const item : Item = props.route.params.item
  const [text, onChangeText] = React.useState(item.name);
  const [notes, onChangeNotes] = React.useState(item.notes);
  const [editing, onChangeEditing] = React.useState(false);

  const onPressSave = () => {
    if (text === "") {
      Alert.alert(
        "Invalid Item",
        "Item must have a name",
        [
          {
            text: "Cancel",
            style: "cancel"
          }
        ]
      )
    } else {
      if (editing) {
        saveNotes()
      }
      onChangeEditing(!editing)
    }
  }

  const saveNotes = () => {
    itemsStore.updateItem(item.id, text, notes)
  }

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable
          onPress={() => navigation.pop()}
          hitSlop={50}
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
          })}>
          <Text style={{color: "#007AFF"}}>Go Back</Text>
        </Pressable>
      ),
      headerRight: () => (
        <Pressable
          onPress={onPressSave}
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
          })}>
          <Text style={{color: "#007AFF"}}>{editing ? "Save" : "Edit"}</Text>
        </Pressable>
      )
    })
  })

  let inputBackground = editing ? "#252526" : "#161616"

  return (
    <KeyboardAwareScrollView style={styles.container} bounces={editing} keyboardShouldPersistTaps={'always'}>
      <View style={styles.searchContainer}>
        <Text style={styles.headText}>Item Name</Text>
        <TextInput
          // placeholder="Item Name"
          autoFocus={false}
          style={[styles.input, {backgroundColor: inputBackground}]}
          onChangeText={onChangeText}
          value={text}
          editable={editing}
        />
      </View>
      <View style={styles.notesSearchContainer}>
        <View style={{display: 'flex', flexDirection: "row"}}>
          <Text style={styles.headText}>Notes</Text>
          <Pressable onPress={onPressSave}><Text style={[styles.headText, {color: "#007AFF"}]}>{editing ? "Save" : "Edit"}</Text></Pressable>
        </View>
        <TextInput
          // placeholder="Notes"
          placeholderTextColor={"#616164"}
          autoFocus={false}
          editable={editing}
          style={[styles.notesInput, {backgroundColor: inputBackground}]}
          multiline={true}
          scrollEnabled={false}
          value={notes}
          onChangeText={onChangeNotes}
        />
      </View>
      {/* <TouchableOpacity activeOpacity={.8} onPress={onSubmit}>
        <View style={styles.submitButtonContainer}>
          <Text style={styles.submitButtonText}>Save</Text>
        </View>
      </TouchableOpacity> */}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  searchContainer: {
    // height: 100,
    // marginBottom: 10,
    margin: 10,
    marginTop: 20,
    marginBottom: 10,
    overflow: "hidden",
    // display: "flex",
    // flexDirection: "row",
    // alignItems: "center"
  },
  input: {
    // flex: 1,
    // height: "100%",
    borderRadius: 4,
    backgroundColor: "#252526",
    fontSize: 20,
    padding: 10,
    color: "#eee",
  },
  notesSearchContainer: {
    margin: 10,
    marginTop: 10,
    marginBottom: 30,
    overflow: "hidden",
  },
  notesInput: {
    borderRadius: 4,
    backgroundColor: "#252526",
    paddingTop: 15,
    paddingBottom: 15,
    fontSize: 15,
    paddingHorizontal: 12,
    color: "#eee",
  },
  headText: {
    fontSize: 15,
    marginBottom: 5,
    color: "#8E8E92",
    paddingLeft: 10
  },
  submitButtonContainer: {
    margin: 10,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#252526",
    display: "flex",
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 20,
    fontFamily: "System",
    padding: 10,
  }
});
