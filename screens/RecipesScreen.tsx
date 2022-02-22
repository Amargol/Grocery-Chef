import React, { Component } from "react";
import { Alert, Button, Keyboard, KeyboardAvoidingView, LayoutAnimation, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Entypo, FontAwesome5 } from '@expo/vector-icons'; 


import EditScreenInfo from '../components/EditScreenInfo';
import CheckList from "../components/CheckList";
import { itemsStore, Recipe } from "../store/itemsStore";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { observer } from "mobx-react";
import * as Haptics from 'expo-haptics';
import { ScrollView } from "react-native-gesture-handler";

interface RecipesScreenProps {
  navigation : NativeStackNavigationProp<any, string>
}

// lightColor="#eee" darkColor="rgba(255,255,255,0.1)" 
@observer
class ItemsScreenInner extends Component<RecipesScreenProps> {

  constructor(props : any) {
    super(props);
  }

  checkFirstItem = () => {
    if (itemsStore.searchQuery !== "" && itemsStore.sortedItems.length > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      itemsStore.toggleItemCheck(itemsStore.sortedItems[0].id)
      itemsStore.setSearchQuery("")
    }
  }

  addItem = () => {
    if (itemsStore.searchQuery == "") {
      this.props.navigation.push('Add Recipe')
    } else {
      var success = itemsStore.addRecipe(itemsStore.searchQuery)

      if (success) {
        itemsStore.setSearchQuery("")
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        setTimeout(() => {
          this.props.navigation.push("Edit Recipe", {
            recipe: success,
            editing: true
          })
        }, 0)
      }
    }
  }

  openRecipe = (recipe : Recipe) => {
    this.props.navigation.push("Edit Recipe", {
      recipe: recipe,
      editing: false
    })
  }

  onChangeText = (value: string) => {
    LayoutAnimation.configureNext({
      duration: 100,
      create: {
        type: LayoutAnimation.Types.linear,
        property: LayoutAnimation.Properties.opacity
      },
      update: {
        type: LayoutAnimation.Types.linear,
      },
      delete: {
        type: LayoutAnimation.Types.linear,
        property: LayoutAnimation.Properties.opacity
      }
    })

    itemsStore.setSearchQuery(value)
  }

  render () {
    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding" keyboardVerticalOffset={90}>
        <ScrollView style={[styles.container, {marginTop: 10}]}>
          {/* <CheckList query={itemsStore.searchQuery} /> */}
          {
            itemsStore.recipes.map((recipe) => (
              <TouchableOpacity key={recipe.id} onPress={() => {this.openRecipe(recipe)}} activeOpacity={.8}>
                <View style={styles.recipeCard}>
                  <View>
                    <FontAwesome5 name="check" size={28} color="green" />
                  </View>
                  <View>
                    <Text style={styles.recipeTitle}>{recipe.name}</Text>
                    <View style={styles.recipeDetails}>
                      {
                        itemsStore.getPopulatedIngredients(recipe.optionalIngredients, itemsStore.items).map((item) => {
                          return <Text style={styles.recipeDetailText}>{item.name}</Text>
                        })
                      }
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          }
        </ScrollView>
        <View style={styles.searchContainer}>
          <TouchableOpacity onPress={this.addItem} activeOpacity={.5}>
            <View style={styles.addButton}>
              <FontAwesome5 name="plus" size={28} color="#23A9DD" />
            </View>
          </TouchableOpacity>
          <TextInput
            placeholder="Search or Add Recipe"
            style={styles.input}
            value={itemsStore.searchQuery}
            onChangeText={(value) => {this.onChangeText(value)}}
            clearButtonMode="always"
            autoCapitalize="words"
          />
          <TouchableOpacity onPress={this.checkFirstItem} activeOpacity={.5}>
            <View style={styles.addButton}>
              <Entypo name="shuffle" size={28} color="#23A9DD" />
            </View>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

export default function ItemsScreen(props : any) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return <ItemsScreenInner {...props} navigation={navigation} />
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    color: "white"
  },
  spacer: {
    height: 10,
    width: 10
  },
  header: {
    color: "#eee"
  },
  searchContainer: {
    // height: 100,
    margin: 5,
    marginBottom: 10,
    borderRadius: 4,
    overflow: "hidden",
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },
  addButton: {
    backgroundColor: "black",
    padding: 12,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 20,
    padding: 10,
    paddingLeft: 15,
    color: "#eee",
    backgroundColor: "#252526",
    borderRadius: 4
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  recipeCard: {
    padding: 20,
    paddingVertical: 10,
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#161616",
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
  recipeDetails: {
    // borderLeftWidth: 5,
    borderLeftColor: "green",
    paddingHorizontal: 10,
  },
  recipeTitle: {
    color: "green",
    fontSize: 25,
    fontWeight: "bold",
    paddingHorizontal: 10,
  },
  recipeDetailText: {
    marginTop: 10,
    color: "white",
  }
});