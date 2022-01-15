import React, { useEffect, useLayoutEffect, useState } from "react";
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
import { View, Text, Button, TextInput, FlatList } from "react-native";
import {
  NavigationContainer,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { CompositeScreenProps } from "@react-navigation/core";
import {
  createBottomTabNavigator,
  BottomTabScreenProps,
} from "@react-navigation/bottom-tabs";
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
    const userDoc = { username: username, joined: [], managed: [] };
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

type SignInProps = BottomTabScreenProps<NotSignedInParamList, "SignIn">;

type RegisterProps = BottomTabScreenProps<NotSignedInParamList, "Register">;

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

const RegisterScreen = ({ route, navigation }: RegisterProps) => {
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

type SignedInParamList = {
  Tabs: NavigatorScreenParams<SignedInTabsParamList>;
  CreateProject: undefined;
  JoinProject: undefined;
};

type SignedInTabsParamList = {
  Joined: undefined;
  Managed: undefined;
  Account: undefined;
};

type TabsProps = NativeStackScreenProps<SignedInParamList, "Tabs">;
type CreateProjectProps = NativeStackScreenProps<
  SignedInParamList,
  "CreateProject"
>;
type JoinProjectProps = NativeStackScreenProps<
  SignedInParamList,
  "JoinProject"
>;

type JoinedProps = CompositeScreenProps<
  BottomTabScreenProps<SignedInTabsParamList, "Joined">,
  TabsProps
>;
type ManagedProps = CompositeScreenProps<
  BottomTabScreenProps<SignedInTabsParamList, "Managed">,
  TabsProps
>;
type AccountProps = CompositeScreenProps<
  BottomTabScreenProps<SignedInTabsParamList, "Account">,
  TabsProps
>;

const SignedInStackNav = createNativeStackNavigator();

const SignedInNavigator = () => {
  return (
    <SignedInStackNav.Navigator
      initialRouteName="Tabs"
      screenOptions={{ headerShown: false }}
    >
      <SignedInStackNav.Screen
        name="Tabs"
        component={SignedInTabs}
        options={{ title: "Tabs" }}
      />
      <SignedInStackNav.Screen
        name="JoinProject"
        component={JoinProjectScreen}
        options={{ title: "Join a project" }}
      />
      <SignedInStackNav.Screen
        name="CreateProject"
        component={CreateProjectScreen}
        options={{ title: "Create a project" }}
      />
    </SignedInStackNav.Navigator>
  );
};

const SignedInTabNav = createBottomTabNavigator();

type SignedInTabsProps = NativeStackScreenProps<SignedInParamList, "Tabs">;
const SignedInTabs = ({ route, navigation }: SignedInTabsProps) => {
  return (
    <SignedInTabNav.Navigator initialRouteName="Joined">
      <SignedInTabNav.Screen
        name="Joined"
        component={JoinedScreen}
        options={{ title: "Joined projects" }}
      />
      <SignedInTabNav.Screen
        name="Managed"
        component={ManagedScreen}
        options={{ title: "Managed projects" }}
      />
      <SignedInTabNav.Screen
        name="Account"
        component={AccountScreen}
        options={{ title: "Account" }}
      />
    </SignedInTabNav.Navigator>
  );
};

const useForceUpdate = () => {
  const [counter, setCounter] = useState(0);
  const update = () => {
    setCounter(counter + 1);
  };
  return [counter, update] as [number, () => void];
};

const JoinedScreen = ({ route, navigation }: JoinedProps) => {
  const [updateCounter, forceUpdate] = useForceUpdate();
  const username = useSelector((state: State) => state.auth.username);
  const [joinedProjects, setJoinedProjects] = useState<any[]>([]);

  const header = () => (
    <View style={{ flex: 1, flexDirection: "row" }}>
      <Button onPress={() => navigation.navigate("JoinProject")} title="Join" />
      <Button onPress={forceUpdate} title="Refresh" />
    </View>
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: header,
    });
  });

  useEffect(() => {
    (async () => {
      const userRef = doc(db, "users", username!);
      const userData: any = (await getDoc(userRef)).data();

      const projects = [];
      for (const projectRef of userData["joined"]) {
        const data: any = (await getDoc(projectRef)).data();
        projects.push(data["name"]);
      }

      setJoinedProjects(projects);
    })();
  }, [updateCounter]);

  return (
    <View>
      <FlatList
        data={joinedProjects}
        renderItem={({ item }) => (
          <Text style={{ margin: 10, fontSize: 32 }}>{item}</Text>
        )}
        keyExtractor={(name) => name}
      />
    </View>
  );
};

const ManagedScreen = ({ route, navigation }: ManagedProps) => {
  const [updateCounter, forceUpdate] = useForceUpdate();
  const username = useSelector((state: State) => state.auth.username);
  const [managedProjects, setManagedProjects] = useState<any[]>([]);

  const header = () => (
    <View style={{ flex: 1, flexDirection: "row" }}>
      <Button
        onPress={() => navigation.navigate("CreateProject")}
        title="Create"
      />
      <Button onPress={forceUpdate} title="Refresh" />
    </View>
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: header,
    });
  });

  useEffect(() => {
    (async () => {
      const userRef = doc(db, "users", username!);
      const userData: any = (await getDoc(userRef)).data();

      const projects = [];
      for (const projectRef of userData["managed"]) {
        const data: any = (await getDoc(projectRef)).data();
        projects.push(data["name"]);
      }

      setManagedProjects(projects);
    })();
  }, [updateCounter]);

  return (
    <View>
      <FlatList
        data={managedProjects}
        renderItem={({ item }) => (
          <Text style={{ margin: 10, fontSize: 32 }}>{item}</Text>
        )}
        keyExtractor={(name) => name}
      />
    </View>
  );
};

const AccountScreen = ({ route, navigation }: AccountProps) => {
  const username = useSelector((state: State) => state.auth.username);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
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

const JoinProjectStack = createNativeStackNavigator();

type JoinProjectParamList = {
  JoinProjectInner: undefined;
};

type JoinProjectInnerProps = NativeStackScreenProps<
  JoinProjectParamList,
  "JoinProjectInner"
>;

const JoinProjectScreen = ({ route, navigation }: JoinProjectProps) => {
  return (
    <JoinProjectStack.Navigator>
      <JoinProjectStack.Screen
        name="JoinProjectInner"
        component={JoinProjectInnerScreen}
        options={{ title: "Join a project" }}
      />
    </JoinProjectStack.Navigator>
  );
};

const JoinProjectInnerScreen = ({
  route,
  navigation,
}: JoinProjectInnerProps) => {
  const username = useSelector((state: State) => state.auth.username);
  const [name, setName] = useState("");

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Project name"
      />
      <Button
        title="Join"
        disabled={name === ""}
        onPress={async () => {
          const projectRef = doc(db, "projects", name);
          const userRef = doc(db, "users", username!);

          const projectData: any = (await getDoc(projectRef)).data();
          const currentMembers: typeof userRef[] = projectData["members"];
          setDoc(
            projectRef,
            { members: currentMembers.concat(userRef) },
            { merge: true }
          );

          const userData: any = (await getDoc(userRef)).data();
          const currentJoined: typeof projectRef[] = userData["joined"];
          setDoc(
            userRef,
            { joined: currentJoined.concat(projectRef) },
            { merge: true }
          );

          navigation.goBack();
        }}
      />
    </View>
  );
};

const CreateProjectStack = createNativeStackNavigator();

type CreateProjectParamList = {
  CreateProjectInner: undefined;
};

type CreateProjectInnerProps = NativeStackScreenProps<
  CreateProjectParamList,
  "CreateProjectInner"
>;

const CreateProjectScreen = ({ route, navigation }: JoinProjectProps) => {
  return (
    <CreateProjectStack.Navigator>
      <CreateProjectStack.Screen
        name="CreateProjectInner"
        component={CreateProjectInnerScreen}
        options={{ title: "Create a project" }}
      />
    </CreateProjectStack.Navigator>
  );
};

const CreateProjectInnerScreen = ({
  route,
  navigation,
}: CreateProjectInnerProps) => {
  const username = useSelector((state: State) => state.auth.username);
  const [name, setName] = useState("");

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Project name"
      />
      <Button
        title="Create"
        disabled={name === ""}
        onPress={async () => {
          const projectRef = doc(db, "projects", name);
          const userRef = doc(db, "users", username!);

          const projectData = { name: name, members: [], admins: [userRef] };
          setDoc(projectRef, projectData);

          const userData: any = (await getDoc(userRef)).data();
          const currentManaged: typeof projectRef[] = userData["managed"];
          setDoc(
            userRef,
            { managed: currentManaged.concat(projectRef) },
            { merge: true }
          );

          navigation.goBack();
        }}
      />
    </View>
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
