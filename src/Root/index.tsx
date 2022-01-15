import { NavigationContainer } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { View, Text, Button, TextInput } from "react-native";
import { logIn, logOut } from "../Login/slice";
import State from "../state";
import store from "../store";

type RootStackParamList = {
  LogIn: undefined;
  Home: undefined;
};

type LogInProps = NativeStackScreenProps<RootStackParamList, "LogIn">;

const LogInScreen = ({ route, navigation }: LogInProps) => {
  const [username, setUsername] = useState("");
  const state = useSelector((state: State) => state);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Log in</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
      />
      <Button
        title="Log in"
        disabled={username === ""}
        onPress={() => {
          store.dispatch(logIn(username));
        }}
      />
    </View>
  );
};

type HomeProps = NativeStackScreenProps<RootStackParamList, "Home">;

const HomeScreen = ({ route, navigation }: HomeProps) => {
  const username = useSelector((state: State) => state.login.username);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Home</Text>
      <Text>Username: {username} </Text>
      <Button
        title="Log out"
        onPress={() => {
          store.dispatch(logOut());
        }}
      />
    </View>
  );
};

const Stack = createNativeStackNavigator();

const Root = () => {
  const username = useSelector((state: State) => state.login.username);
  const signedIn = username !== null;

  const [screens, initialRouteName] = signedIn
    ? [
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
        </>,
        "Home",
      ]
    : [
        <>
          <Stack.Screen name="LogIn" component={LogInScreen} />
        </>,
        "LogIn",
      ];

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRouteName}>
        {screens}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Root;
