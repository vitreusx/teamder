/** @jsxImportSource theme-ui */
import { ThemeProvider, Container } from 'theme-ui'
import { toTheme } from '@theme-ui/typography'
import oceanBeach from "typography-theme-ocean-beach";
import merge from 'lodash.merge'
import IndexMDX from "./_index.mdx";

const theme = merge(toTheme(oceanBeach), {
  sizes: {
    container: "40%"
  }
});

export const App = () => {
  return <ThemeProvider theme={theme}>
    <Container>
      <IndexMDX />
    </Container>
  </ThemeProvider>
}

export default App;