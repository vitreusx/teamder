import React, { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { configureStore, createAsyncThunk } from "@reduxjs/toolkit";
import { createAction, createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import {
  NativeStackScreenProps,
  createNativeStackNavigator,
} from "@react-navigation/native-stack";
import { initializeApp, FirebaseOptions } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { View, Text, Button, TextInput } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { LogBox } from "react-native";

LogBox.ignoreLogs(["Setting a timer"]);

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyDxmqZR7V9TjEcGlaWgtZVvr0zqghDA5_c",
  authDomain: "teamder-8c70d.firebaseapp.com",
  projectId: "teamder-8c70d",
  storageBucket: "teamder-8c70d.appspot.com",
  databaseURL: "https://teamder-8c70d.firebaseio.com",
  messagingSenderId: "68783010094",
  appId: "1:68783010094:web:6f51644c46a23b32bf4abf",
  measurementId: "G-RWJVW6KS40",
};

initializeApp(firebaseConfig);
export const db = getFirestore();

interface AuthState {
  username: string | null;
  signedIn: boolean;
}

const signIn = createAsyncThunk("signIn", async (payload: string, thunkAPI) => {
  const username = payload;
  const userDoc = await getDoc(doc(db, "users", username));
  if (!userDoc.exists()) {
    throw new Error(`User with an username ${username} not found!`);
  } else {
    return username;
  }
});

const signOut = createAction<void>("signOut");
const register = createAsyncThunk(
  "register",
  async (payload: string, thunkAPI) => {
    const username = payload;
    const userDoc = { username: username };
    await setDoc(doc(db, "users", username), userDoc);
    return username;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: { username: null, signedIn: false } as AuthState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(signOut, (state, _) => {
        state.username = null;
        state.signedIn = false;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        const username = action.payload;
        state.username = username;
        state.signedIn = true;
      });
  },
});

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
  devTools: true,
});
type State = ReturnType<typeof store.getState>;

type NotSignedInParamList = {
  SignIn: undefined;
  Register: undefined;
};

type SignInProps = NativeStackScreenProps<NotSignedInParamList, "SignIn">;
const SignInScreen = ({ route, navigation }: SignInProps) => {
  const [username, setUsername] = useState("");

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
      />
      <Button
        title="Sign in"
        disabled={username === ""}
        onPress={async () => {
          try {
            await store.dispatch(signIn(username)).unwrap();
          } catch (e) {
            setUsername("");
          }
        }}
      />
    </View>
  );
};

type RegisterProps = NativeStackScreenProps<NotSignedInParamList, "Register">;
const RegisterScreen = ({ route, navigation }: RegisterProps) => {
  const [username, setUsername] = useState("");
  const state = useSelector((state: State) => state);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Register</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
      />
      <Button
        title="Register"
        disabled={username === ""}
        onPress={async () => {
          await store.dispatch(register(username));
          navigation.navigate("SignIn");
        }}
      />
    </View>
  );
};

const NotSignedInTab = createBottomTabNavigator();

const NotSignedInNavigator = () => {
  return (
    <NotSignedInTab.Navigator initialRouteName="SignIn">
      <NotSignedInTab.Screen
        name="SignIn"
        component={SignInScreen}
        options={{
          title: "Sign in",
        }}
      />
      <NotSignedInTab.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          title: "Register",
        }}
      />
    </NotSignedInTab.Navigator>
  );
};

type SignedInParamList = {
  Home: undefined;
};

type HomeProps = NativeStackScreenProps<SignedInParamList, "Home">;
const HomeScreen = ({ route, navigation }: HomeProps) => {
  const username = useSelector((state: State) => state.auth.username);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Home</Text>
      <Text>Username: {username} </Text>
      <Button
        title="Sign out"
        onPress={() => {
          store.dispatch(signOut());
        }}
      />
    </View>
  );
};

const Stack = createNativeStackNavigator();

const SignedInNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Home" }}
      />
    </Stack.Navigator>
  );
};

const Root = () => {
  const signedIn = useSelector((state: State) => state.auth.signedIn);
  return (
    <NavigationContainer>
      {signedIn ? <SignedInNavigator /> : <NotSignedInNavigator />}
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <Root />
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;
