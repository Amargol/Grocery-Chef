import { action, computed, makeObservable, observable } from "mobx"
import { Alert, AsyncStorage, LayoutAnimation } from "react-native"

export enum ItemState {
  Pinned = 0,
  Standard = 1,
  Disabled = 2
}

export interface SplitSortedItems {
  pinned: Item[],
  standard: Item[],
  disabled: Item[]
}

export class Item {
  name: string
  isChecked: boolean
  state: ItemState
  notes: string
  id: string

  get cpd () {
    return this.isChecked ? "check" : "none"
  }

  constructor (name : string, notes : string) {
    this.name = name
    this.isChecked = false
    this.state = ItemState.Standard
    this.notes = notes
    this.id = Date.now().toString() + "_" + ((Math.random() * 1000000) >> 0).toString()

    makeObservable(this, {
      name: observable,
      isChecked: observable,
      state: observable,
      notes: observable
    })
  }

  static clone (item : Item) : Item {
    let res = new Item(item.name, item.notes)
    res.isChecked = item.isChecked
    res.state = item.state
    res.id = item.id

    return res
  }
}

export enum RecipeState {
  Pinned = 0,
  Standard = 1,
  Disabled = 2
}

export interface SplitSortedRecipes {
  pinned: Recipe[],
  standard: Recipe[],
  disabled: Recipe[]
}

export class Recipe {
  name: string
  requiredIngredients: Item[]
  optionalIngredients: Item[]
  state: RecipeState
  notes: string
  id: string

  constructor (name : string) {
    this.name = name
    this.requiredIngredients = [];
    this.optionalIngredients = [];
    this.notes = ""
    this.state = RecipeState.Standard
    this.id = Date.now().toString() + "_" + ((Math.random() * 1000000) >> 0).toString()

    makeObservable(this, {
      name: observable,
      requiredIngredients: observable,
      optionalIngredients: observable,
      state: observable,
      notes: observable,
    })
  }
}

class ItemsStore {
  items : Item[] = []
  recipes : Recipe[] = []
  searchQuery : string = ""

  constructor () {
    AsyncStorage.getItem("items").then(items => {
      if (items !== null) {
        this.items = JSON.parse(items)
      } else {
        this.items = []
      }
    });

    AsyncStorage.getItem("recipes").then(recipes => {
      if (recipes !== null) {
        this.recipes = JSON.parse(recipes)
      } else {
        this.items = []
      }
    });

    makeObservable(this, {
      searchQuery: observable,
      items: observable,
      recipes: observable,
      setSearchQuery: action,
      addItem: action,
      removeItem: action,
      updateItem: action,
      setItemState: action,
      moveItem: action,
      toggleItemCheck: action,
      addRecipe: action,
      removeRecipe: action,
      updateRecipe: action,
      setRecipeState: action,
      moveRecipe: action,
      shuffleRecipes: action,
      addItemToRecipe: action,
      removeItemFromRecipe: action,
      count: computed,
      sortedItems: computed,
      sortedRecipes: computed,
      splitSortedItems: computed,
      splitSortedRecipes: computed
    })
  }

  setSearchQuery(newQuery : string) {
    this.searchQuery = newQuery
  }


  addItem(name : string, notes : string) : boolean {
    let nameDoesNotExist = this.items.findIndex((item) => item.name == name) == -1

    if (!nameDoesNotExist) {
      Alert.alert(
        "Invalid Name",
        "Item with this name already exists",
        [
          {
            text: "Cancel",
            style: "cancel"
          }
        ]
      )
      
      return false
    }

    if (name === "") {
      return false
    }

    this.items = [new Item(name, notes), ...this.items]
    this.saveToStore()
    return true
  }

  removeItem(id : string) {
    this.items = this.items.filter(item => item.id != id)

    this.recipes = this.recipes.map((recipe) => {
      recipe.optionalIngredients = recipe.optionalIngredients.filter(item => item.id != id)
      recipe.requiredIngredients = recipe.requiredIngredients.filter(item => item.id != id)
      return recipe
    })

    this.saveToStore()
  }

  updateItem(id : string, name : string, notes : string) {
    let item = this.items.find((item) => item.id == id)

    if (item) {
      item.name = name
      item.notes = notes

      this.recipes.forEach((recipe) => {
        recipe.optionalIngredients.forEach((item) => {
          if (item.id == id) {
            item.name = name
            item.notes = notes
          }
        })
        recipe.requiredIngredients.forEach((item) => {
          if (item.id == id) {
            item.name = name
            item.notes = notes      
          }
        })
      })
    }

    this.saveToStore()
  }

  setItemState(id : string, itemState : ItemState) {
    let item = this.items.find((item) => item.id == id)

    if (item) {
      item.state = itemState

      this.recipes.forEach((recipe) => {
        recipe.optionalIngredients.forEach((item) => {
          if (item.id == id) {
            item.state = itemState
          }
        })
        recipe.requiredIngredients.forEach((item) => {
          if (item.id == id) {
            item.state = itemState
          }
        })
      })
    }

    this.saveToStore()
  }

  moveItem (id : string, distance : number) {
    let i = this.items.findIndex((item) => {
      return item.id == id
    })

    if (i == -1) {
      return false
    }

    if (i + distance < 0) {
      distance = 0 - i
    }

    if (i + distance >= this.items.length) {
      distance = this.items.length - i
    }

    let temp = this.items[i]
    let res = this.items.filter((_, index) => index !== i)

    res.splice(i + distance, 0, temp)

    this.items = res

    this.saveToStore()

    return true
  }

  toggleItemCheck(id : string) {
    let item = this.items.find((item) => item.id == id)

    if (item) {
      item.isChecked = !item.isChecked

      let isChecked = item.isChecked

      this.recipes.forEach((recipe) => {
        recipe.optionalIngredients.forEach((item) => {
          if (item.id == id) {
            item.isChecked = isChecked
          }
        })
        recipe.requiredIngredients.forEach((item) => {
          if (item.id == id) {
            item.isChecked = isChecked
          }
        })
      })
    }

    this.saveToStore()
  }

  addRecipe(name : string) : Recipe | undefined {
    let nameDoesNotExist = this.recipes.findIndex((item) => item.name == name) == -1

    if (name === "") {
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

      return undefined
    }

    if (!nameDoesNotExist) {
      Alert.alert(
        "Invalid Name",
        "Recipe with this name already exists",
        [
          {
            text: "Cancel",
            style: "cancel"
          }
        ]
      )
      
      return undefined
    }

    let recipe = new Recipe(name)
    this.recipes = [recipe, ...this.recipes]
    this.saveToStore()
    return recipe
  }

  removeRecipe(id : string) {
    this.recipes = this.recipes.filter(item => item.id != id)

    this.saveToStore()
  }

  updateRecipe(recipe : Recipe, name : string, notes : string) {
    recipe.name = name
    recipe.notes = notes

    this.saveToStore()
  }

  setRecipeState(recipe : Recipe, recipeState : RecipeState) {
    // Works because there are no other stored objects that reference a recipe
    // Would not work for item because items are stored in two places. 
    recipe.state = recipeState

    this.saveToStore()
  }

  moveRecipe (id : string, distance : number) {
    let i = this.recipes.findIndex((item) => {
      return item.id == id
    })

    if (i == -1) {
      return false
    }

    if (i + distance < 0) {
      distance = 0 - i
    }

    if (i + distance >= this.recipes.length) {
      distance = this.recipes.length - i
    }

    let temp = this.recipes[i]
    let res = this.recipes.filter((_, index) => index !== i)

    res.splice(i + distance, 0, temp)

    this.recipes = res

    this.saveToStore()

    return true
  }

  shuffleRecipes() {
    this.recipes = this.recipes.sort((a, b) => 0.5 - Math.random())
    console.log(this.recipes)
  }

  addItemToRecipe(item : Item, recipe : Recipe, isRequired : boolean) {
    // Make sure item is not already in recipe
    let canAdd = recipe.requiredIngredients.every((i) => i.id !== item.id) && recipe.optionalIngredients.every((i) => i.id !== item.id)

    if (!canAdd) {
      return false
    }

    if (isRequired) {
      recipe.requiredIngredients.push(item)
    } else {
      recipe.optionalIngredients.push(item)
    }

    this.saveToStore()

    return true
  }

  removeItemFromRecipe(item : Item, recipe : Recipe) {
    recipe.optionalIngredients = recipe.optionalIngredients.filter(i => i.id != item.id)
    recipe.requiredIngredients = recipe.requiredIngredients.filter(i => i.id != item.id)
  }

  get count() {
    return this.items.length
  }

  get sortedItems() {
    let res = this.items.filter((item) => {
      return item.name.toLowerCase().indexOf(this.searchQuery.toLowerCase()) >= 0
    }).sort((a, b) => {
      if (a.isChecked == b.isChecked) {
        return 0
      } else {
        return a.isChecked ? 1 : -1
      }
    })

    return res
  }

  get splitSortedItems() {
    let res : SplitSortedItems = {
      pinned: [],
      standard: [],
      disabled: []
    }

    this.sortedItems.forEach(item => {
      if(item.state === ItemState.Pinned) {
        res.pinned.push(item)
      }
      if(item.state === ItemState.Disabled) {
        res.disabled.push(item)
      }
      if(item.state === ItemState.Standard) {
        res.standard.push(item)
      }
    })

    return res
  }

  get sortedRecipes() {
    let res = this.recipes.filter((recipe) => {
      return recipe.name.toLowerCase().indexOf(this.searchQuery.toLowerCase()) >= 0
    }).sort((a, b) => {
      let x = a.requiredIngredients.every((item) => item.isChecked)
      let y = b.requiredIngredients.every((item) => item.isChecked)
      
      return (x === y)? 0 : x? -1 : 1;
    })

    return res
  }

  get splitSortedRecipes() {
    let res : SplitSortedRecipes = {
      pinned: [],
      standard: [],
      disabled: []
    }

    this.sortedRecipes.forEach(recipe => {
      if(recipe.state === RecipeState.Pinned) {
        res.pinned.push(recipe)
      }
      if(recipe.state === RecipeState.Disabled) {
        res.disabled.push(recipe)
      }
      if(recipe.state === RecipeState.Standard) {
        res.standard.push(recipe)
      }
    })

    return res
  }

  saveToStore() {
    AsyncStorage.setItem("items", JSON.stringify(this.items));
    AsyncStorage.setItem("recipes", JSON.stringify(this.recipes));
  }
}

export const itemsStore = new ItemsStore()

/*
Fix rendering problem
Made deletes safe
Make functionality to delete items via swipe

implement disable

*/