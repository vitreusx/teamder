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
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
} from "firebase/firestore";
import {
  View,
  Text,
  Button,
  TextInput,
  FlatList,
  ListRenderItem,
} from "react-native";
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
import { ListItem } from "react-native-elements";
import Swiper from "react-native-deck-swiper";

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
    const userDoc = { username: username, joined: [], managed: [], bio: "" };
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

const setCurProject = createAction<string>("setCurProject");
const setSelTeam = createAction<string>("setSelTeam");

interface ProjectState {
  curProject: string | null;
  selTeam: string | null;
}

const projectSlice = createSlice({
  name: "project",
  initialState: { curProject: null, selTeam: null } as ProjectState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(setCurProject, (state, action) => {
        const project = action.payload;
        state.curProject = project;
      })
      .addCase(setSelTeam, (state, action) => {
        const team = action.payload;
        state.selTeam = team;
      });
  },
});

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    project: projectSlice.reducer,
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
          setUsername("");
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
  Project: NavigatorScreenParams<ProjectParamList>;
};

type SignedInTabsParamList = {
  Joined: undefined;
  Managed: undefined;
  Account: undefined;
};

type ProjectParamList = {
  AdminView: NavigatorScreenParams<AdminViewParamList>;
  UserView: NavigatorScreenParams<UserViewParamList>;
};

type AdminViewParamList = {
  AV_Tabs: NavigatorScreenParams<AV_TabsParamList>;
  CreateTeam: undefined;
  AV_Team: undefined;
  AddSkill: undefined;
};

type AV_TabsParamList = {
  Members: undefined;
  Teams: undefined;
  AllSkills: undefined;
};

type UserViewParamList = {
  Team: undefined;
  Swipe: undefined;
  Skills: undefined;
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
type ProjectProps = NativeStackScreenProps<SignedInParamList, "Project">;

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

type AdminViewProps = CompositeScreenProps<
  NativeStackScreenProps<ProjectParamList, "AdminView">,
  ProjectProps
>;
type UserViewProps = CompositeScreenProps<
  NativeStackScreenProps<ProjectParamList, "UserView">,
  ProjectProps
>;

type AV_TabsProps = CompositeScreenProps<
  NativeStackScreenProps<AdminViewParamList, "AV_Tabs">,
  AdminViewProps
>;
type CreateTeamProps = CompositeScreenProps<
  NativeStackScreenProps<AdminViewParamList, "CreateTeam">,
  AdminViewProps
>;
type AV_TeamProps = CompositeScreenProps<
  NativeStackScreenProps<AdminViewParamList, "AV_Team">,
  AdminViewProps
>;
type AddSkillProps = CompositeScreenProps<
  NativeStackScreenProps<AdminViewParamList, "AddSkill">,
  AdminViewProps
>;

type AV_MembersProps = CompositeScreenProps<
  BottomTabScreenProps<AV_TabsParamList, "Members">,
  AV_TabsProps
>;
type AV_TeamsProps = CompositeScreenProps<
  BottomTabScreenProps<AV_TabsParamList, "Teams">,
  AV_TabsProps
>;
type AV_AllSkillsProps = CompositeScreenProps<
  BottomTabScreenProps<AV_TabsParamList, "AllSkills">,
  AV_TabsProps
>;

type UV_TeamProps = CompositeScreenProps<
  BottomTabScreenProps<UserViewParamList, "Skills">,
  UserViewProps
>;
type UV_SwipeProps = CompositeScreenProps<
  BottomTabScreenProps<UserViewParamList, "Swipe">,
  UserViewProps
>;
type UV_SkillsProps = CompositeScreenProps<
  BottomTabScreenProps<UserViewParamList, "Skills">,
  UserViewProps
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
      <SignedInStackNav.Screen
        name="Project"
        component={ProjectScreen}
        options={{ title: "Project" }}
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

const useUserData = () => {
  const [updateValue, forceUpdate] = useForceUpdate();
  const username = useSelector((state: State) => state.auth.username);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const ref = doc(db, "users", username!);
      const userDoc = await getDoc(ref);
      setUserData(userDoc.data());
    })();
  }, [username, updateValue]);

  console.log(userData);
  return [userData, forceUpdate];
};

const useProjectData = () => {
  const [updateValue, forceUpdate] = useForceUpdate();
  const curProject = useSelector((state: State) => state.project.curProject);
  const [projectData, setProjectData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const ref = doc(db, "projects", curProject!);
      const projectDoc = await getDoc(ref);
      setProjectData(projectDoc.data());
    })();
  }, [curProject, updateValue]);

  console.log(projectData);
  return [projectData, forceUpdate];
};

const JoinedScreen = ({ route, navigation }: JoinedProps) => {
  const [userData, forceUpdate] = useUserData();
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
      if (userData) {
        const projects: any[] = [];
        for (const name of userData["joined"]) {
          const ref = doc(db, "projects", name);
          const projectData: any = (await getDoc(ref)).data();
          projects.push(projectData["name"]);
        }
        setJoinedProjects(projects);
      } else {
        setJoinedProjects([]);
      }
    })();
  }, [userData]);

  const renderItem: ListRenderItem<string> = ({ item }) => (
    <ListItem
      bottomDivider
      onPress={() => {
        store.dispatch(setCurProject(item));
        navigation.navigate("Project");
      }}
    >
      <ListItem.Content>
        <Text>{item}</Text>
      </ListItem.Content>
      <ListItem.Chevron />
    </ListItem>
  );

  return (
    <View>
      <FlatList
        data={joinedProjects}
        renderItem={renderItem}
        keyExtractor={(name) => name}
      />
    </View>
  );
};

const ManagedScreen = ({ route, navigation }: ManagedProps) => {
  const [userData, forceUpdate] = useUserData();
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
      if (userData) {
        const projects: any[] = [];
        for (const name of userData["managed"]) {
          const ref = doc(db, "projects", name);
          const projectData: any = (await getDoc(ref)).data();
          projects.push(projectData["name"]);
        }
        setManagedProjects(projects);
      } else {
        setManagedProjects([]);
      }
    })();
  }, [userData]);

  const renderItem: ListRenderItem<string> = ({ item }) => (
    <ListItem
      bottomDivider
      onPress={() => {
        store.dispatch(setCurProject(item));
        navigation.navigate("Project");
      }}
    >
      <ListItem.Content>
        <Text>{item}</Text>
      </ListItem.Content>
      <ListItem.Chevron />
    </ListItem>
  );

  return (
    <View>
      <FlatList
        data={managedProjects}
        renderItem={renderItem}
        keyExtractor={(name) => name}
      />
    </View>
  );
};

const AccountScreen = ({ route, navigation }: AccountProps) => {
  const [userData, forceUpdate] = useUserData();
  const username: string | null = userData && userData["username"];
  const [bio, setBio] = useState("");

  const header = () => (
    <View style={{ flex: 1, flexDirection: "row" }}>
      <Button
        onPress={async () => {
          const ref = doc(db, "users", username!);
          await setDoc(ref, { bio: bio }, { merge: true });
        }}
        title="Commit"
      />
    </View>
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: header,
    });
  });

  useEffect(() => {
    (async () => {
      if (userData) {
        setBio(userData["bio"]);
      } else {
        setBio("");
      }
    })();
  }, [userData]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Username: {username} </Text>
      <TextInput value={bio} onChangeText={setBio} placeholder="Bio" />
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
          const currentMembers: string[] = projectData["members"];
          await setDoc(
            projectRef,
            { members: currentMembers.concat(username!) },
            { merge: true }
          );

          const userData: any = (await getDoc(userRef)).data();
          const currentJoined: string[] = userData["joined"];
          await setDoc(
            userRef,
            { joined: currentJoined.concat(name) },
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

const CreateProjectScreen = ({ route, navigation }: CreateProjectProps) => {
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

          const projectData = {
            name: name,
            members: [],
            skills: [],
            admin: username!,
          };
          await setDoc(projectRef, projectData);

          const userData: any = (await getDoc(userRef)).data();
          const currentManaged: string[] = userData["managed"];
          await setDoc(
            userRef,
            { managed: currentManaged.concat(name) },
            { merge: true }
          );

          navigation.goBack();
        }}
      />
    </View>
  );
};

const ProjectScreenNav = createNativeStackNavigator();

const ProjectScreen = ({ route, navigation }: ProjectProps) => {
  const [projectData, _] = useProjectData();
  const username = useSelector((state: State) => state.auth.username);
  const isAdmin = projectData && projectData["admin"] === username!;

  return projectData ? (
    <ProjectScreenNav.Navigator screenOptions={{ headerShown: false }}>
      {isAdmin ? (
        <ProjectScreenNav.Screen name="AdminView" component={AdminViewScreen} />
      ) : (
        <ProjectScreenNav.Screen name="UserView" component={UserViewScreen} />
      )}
    </ProjectScreenNav.Navigator>
  ) : (
    <View></View>
  );
};

const AdminViewNav = createNativeStackNavigator();

const AdminViewScreen = ({ route, navigation }: AdminViewProps) => {
  return (
    <AdminViewNav.Navigator screenOptions={{ headerShown: false }}>
      <AdminViewNav.Screen name="AV_Tabs" component={AV_TabsScreen} />
      <AdminViewNav.Screen name="CreateTeam" component={CreateTeamScreen} />
      <AdminViewNav.Screen name="AV_Team" component={AV_TeamScreen} />
      <AdminViewNav.Screen name="AddSkill" component={AddSkillScreen} />
    </AdminViewNav.Navigator>
  );
};

const AdminViewTab = createBottomTabNavigator();

const AV_TabsScreen = ({ route, navigation }: AV_TabsProps) => {
  return (
    <AdminViewTab.Navigator>
      <AdminViewTab.Screen
        name="Members"
        component={AV_MembersScreen}
        options={{ title: "Project members" }}
      />
      <AdminViewTab.Screen
        name="Teams"
        component={AV_TeamsScreen}
        options={{ title: "Teams" }}
      />
      <AdminViewTab.Screen
        name="AllSkills"
        component={AV_AllSkillsScreen}
        options={{ title: "All skills" }}
      />
    </AdminViewTab.Navigator>
  );
};

const AV_MembersScreen = ({ route, navigation }: AV_MembersProps) => {
  const [projectData, _] = useProjectData();
  const members = projectData ? projectData["members"] : [];

  const renderItem: ListRenderItem<string> = ({ item }) => (
    <ListItem bottomDivider>
      <ListItem.Content>
        <Text>{item}</Text>
      </ListItem.Content>
    </ListItem>
  );

  return (
    <View>
      <FlatList
        data={members}
        renderItem={renderItem}
        keyExtractor={(item) => item}
      />
    </View>
  );
};

const AV_TeamsScreen = ({ route, navigation }: AV_TeamsProps) => {
  const [projectData, forceUpdate] = useProjectData();
  const projectName = projectData && projectData["name"];
  const [teams, setTeams] = useState<any[]>([]);

  const header = () => (
    <View style={{ flex: 1, flexDirection: "row" }}>
      <Button
        onPress={() => navigation.navigate("CreateTeam")}
        title="Create"
      />
      <Button onPress={forceUpdate} title="Refresh" />
    </View>
  );

  useLayoutEffect(() =>
    navigation.setOptions({
      headerRight: header,
    })
  );

  useEffect(() => {
    (async () => {
      if (projectData) {
        const ref = collection(db, "projects", projectName, "teams");
        const res = await getDocs(ref);
        const teams_ = res.docs.map((doc) => doc.data()["name"]);
        setTeams(teams_);
      } else {
        setTeams([]);
      }
    })();
  }, [projectData]);

  const renderItem: ListRenderItem<string> = ({ item }) => (
    <ListItem
      bottomDivider
      onPress={() => {
        store.dispatch(setSelTeam(item));
        navigation.navigate("AV_Team");
      }}
    >
      <ListItem.Content>
        <Text>{item}</Text>
      </ListItem.Content>
    </ListItem>
  );

  return (
    <View>
      <FlatList
        data={teams}
        renderItem={renderItem}
        keyExtractor={(name) => name}
      />
    </View>
  );
};

const AV_AllSkillsScreen = ({ route, navigation }: AV_AllSkillsProps) => {
  const [projectData, forceUpdate] = useProjectData();
  const [skills, setSkills] = useState<any[]>([]);

  const header = () => (
    <View style={{ flex: 1, flexDirection: "row" }}>
      <Button onPress={() => navigation.navigate("AddSkill")} title="Add" />
      <Button onPress={forceUpdate} title="Refresh" />
    </View>
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: header,
    });
  });

  useEffect(() => {
    if (projectData) {
      setSkills(projectData["skills"]);
    } else {
      setSkills([]);
    }
  }, [projectData]);

  const renderItem: ListRenderItem<string> = ({ item }) => (
    <ListItem bottomDivider>
      <ListItem.Content>
        <Text>{item}</Text>
      </ListItem.Content>
    </ListItem>
  );

  return (
    <View>
      <FlatList
        data={skills}
        renderItem={renderItem}
        keyExtractor={(name) => name}
      />
    </View>
  );
};

const CreateTeamNav = createNativeStackNavigator();

type CreateTeamParamList = {
  CreateTeamInner: undefined;
};

type CreateTeamInnerProps = NativeStackScreenProps<
  CreateTeamParamList,
  "CreateTeamInner"
>;

const CreateTeamScreen = ({ route, navigation }: CreateTeamProps) => {
  return (
    <CreateTeamNav.Navigator>
      <CreateTeamNav.Screen
        name="CreateTeamInner"
        component={CreateTeamInnerScreen}
        options={{ title: "Create a team" }}
      />
    </CreateTeamNav.Navigator>
  );
};

const CreateTeamInnerScreen = ({ route, navigation }: CreateTeamInnerProps) => {
  const projectName = useSelector((state: State) => state.project.curProject);
  const [teamName, setTeamName] = useState("");

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TextInput
        value={teamName}
        onChangeText={setTeamName}
        placeholder="Team name"
      />
      <Button
        title="Create"
        disabled={teamName === ""}
        onPress={async () => {
          const ref = doc(db, "projects", projectName!, "teams", teamName);
          const data = { name: teamName, members: [] };
          await setDoc(ref, data);

          navigation.goBack();
        }}
      />
    </View>
  );
};

const AV_TeamTab = createBottomTabNavigator();

type AV_TeamParamList = {
  AV_Team_Members: undefined;
  AV_Team_Info: undefined;
};

type AV_Team_MembersProps = BottomTabScreenProps<
  AV_TeamParamList,
  "AV_Team_Members"
>;
type AV_Team_InfoProps = BottomTabScreenProps<AV_TeamParamList, "AV_Team_Info">;

const AV_TeamScreen = ({ route, navigation }: AV_TeamProps) => {
  return (
    <AV_TeamTab.Navigator>
      <AV_TeamTab.Screen
        name="AV_Team_Members"
        component={AV_Team_MembersScreen}
        options={{ title: "Team members" }}
      />
      <AV_TeamTab.Screen
        name="AV_Team_Info"
        component={AV_Team_InfoScreen}
        options={{ title: "Team info" }}
      />
    </AV_TeamTab.Navigator>
  );
};

const AV_Team_MembersScreen = ({ route, navigation }: AV_Team_MembersProps) => {
  return <View></View>;
};

const AV_Team_InfoScreen = ({ route, navigation }: AV_Team_InfoProps) => {
  return <View></View>;
};

const AddSkillStack = createNativeStackNavigator();

type AddSkillParamList = {
  AddSkillInner: undefined;
};

type AddSkillInnerProps = NativeStackScreenProps<
  AddSkillParamList,
  "AddSkillInner"
>;

const AddSkillScreen = ({ route, navigation }: AddSkillProps) => {
  return (
    <AddSkillStack.Navigator>
      <AddSkillStack.Screen
        name="AddSkillInner"
        component={AddSkillInnerScreen}
        options={{ title: "Add a skill" }}
      />
    </AddSkillStack.Navigator>
  );
};

const AddSkillInnerScreen = ({ route, navigation }: AddSkillInnerProps) => {
  const [name, setName] = useState("");
  const [projectData, _] = useProjectData();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TextInput value={name} onChangeText={setName} placeholder="Skill name" />
      <Button
        title="Add"
        disabled={name === ""}
        onPress={async () => {
          if (projectData) {
            const projectName = projectData["name"];
            const ref = doc(db, "projects", projectName);
            const skills = projectData["skills"] as any[];

            await setDoc(ref, { skills: skills.concat(name) }, { merge: true });

            navigation.goBack();
          }
        }}
      />
    </View>
  );
};

const UserViewTab = createBottomTabNavigator();

const UserViewScreen = ({ route, navigation }: UserViewProps) => {
  return (
    <UserViewTab.Navigator>
      <UserViewTab.Screen
        name="Team"
        component={UV_TeamScreen}
        options={{ title: "Team" }}
      />
      <UserViewTab.Screen
        name="Swipe"
        component={UV_SwipeScreen}
        options={{ headerShown: false }}
      />
      <UserViewTab.Screen
        name="Skills"
        component={UV_SkillsScreen}
        options={{ title: "Skills" }}
      />
    </UserViewTab.Navigator>
  );
};

const UV_SwipeScreen = ({ route, navigation }: UV_SwipeProps) => {
  const [userData, forceUpdateU] = useUserData();
  const username = userData && userData["username"];
  const [projectData, forceUpdateP] = useProjectData();
  const members =
    projectData && projectData["members"].filter((x: string) => x !== username);

  const [membersInfo, setMembersInfo] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      if (members) {
        const a = [];
        for (const name of members) {
          const fellowUserDoc = await getDoc(doc(db, "users", name));
          const fellowUserData: any = fellowUserDoc.data();
          a.push({ username: name, bio: fellowUserData["bio"] });
        }
        setMembersInfo(a);
      } else {
        setMembersInfo([]);
      }
    })();
  }, [userData, projectData]);

  const renderCard = (info: any) =>
    info ? (
      <View
        testID={info.username}
        key={info.username}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>Username: {info.username}</Text>
        <Text>Bio: {info.bio}</Text>
      </View>
    ) : (
      <View />
    );

  console.log(membersInfo);
  return (
    <Swiper cards={membersInfo} renderCard={renderCard} verticalSwipe={false} />
  );
};

const UV_TeamScreen = ({ route, navigation }: UV_TeamProps) => {
  return <View></View>;
};

const UV_SkillsScreen = ({ route, navigation }: UV_SkillsProps) => {
  const [projectData, forceUpdate] = useProjectData();
  const [skills, setSkills] = useState<any[]>([]);
  const [checked, setChecked] = useState<boolean[]>([]);
  const [updateValue, forceUpdateV] = useForceUpdate();

  const header = () => (
    <View style={{ flex: 1, flexDirection: "row" }}>
      <Button onPress={() => {}} title="Commit" />
      <Button onPress={forceUpdate} title="Refresh" />
    </View>
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: header,
    });
  });

  useEffect(() => {
    if (projectData) {
      setSkills(projectData["skills"]);
      const checked_ = [];
      for (const skill of projectData["skills"]) {
        checked_.push(false);
      }
      setChecked(checked_);
    } else {
      setSkills([]);
      setChecked([]);
    }
  }, [projectData]);

  const renderItem: ListRenderItem<string> = ({ item, index }) => (
    <ListItem bottomDivider>
      <ListItem.Content>
        <Text>{item}</Text>
      </ListItem.Content>
      <ListItem.CheckBox
        checked={checked[index]}
        onPress={() => {
          checked[index] = !checked[index];
          setChecked(checked);
          forceUpdateV();
        }}
      />
    </ListItem>
  );

  return (
    <View>
      <FlatList
        data={skills}
        renderItem={renderItem}
        keyExtractor={(name) => name}
        extraData={updateValue}
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
