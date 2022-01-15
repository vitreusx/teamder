import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import Root from "./src/Root";
import store from "./src/store";

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <Root />
      </SafeAreaProvider>
    </Provider>
  );
}
