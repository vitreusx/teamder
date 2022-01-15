import React, { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { createAction, createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import {
  NativeStackScreenProps,
  createNativeStackNavigator,
} from "@react-navigation/native-stack";
import { initializeApp, FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { View, Text, Button, TextInput } from "react-native";
import { NavigationContainer } from "@react-navigation/native";

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
export const firestore = getFirestore();

const Stack = createNativeStackNavigator();
interface AuthState {
  username: string | null;
  signedIn: boolean;
}

const signIn = createAction<string>("signIn");
const signOut = createAction<void>("signOut");

const authSlice = createSlice({
  name: "auth",
  initialState: { username: null, signedIn: false } as AuthState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(signIn, (state, action) => {
        state.username = action.payload;
        state.signedIn = true;
      })
      .addCase(signOut, (state, _) => {
        state.username = null;
        state.signedIn = false;
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
};

type SignInProps = NativeStackScreenProps<NotSignedInParamList, "SignIn">;
const SignInScreen = ({ route, navigation }: SignInProps) => {
  const [username, setUsername] = useState("");
  const state = useSelector((state: State) => state);

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
        onPress={() => {
          store.dispatch(signIn(username));
        }}
      />
    </View>
  );
};

const NotSignedInNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="SignIn">
      <Stack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{
          title: "Sign in",
        }}
      />
    </Stack.Navigator>
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
    </View>
  );
};

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
  const auth = useSelector((state: State) => state.auth);
  return (
    <NavigationContainer>
      {auth.signedIn ? <SignedInNavigator /> : <NotSignedInNavigator />}
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
