// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// Vuetify
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

const myTheme = {
  dark: false,
  colors: {
    primary: "#2563eb",
    secondary: "#1e293b",
    background: "#f1f5f9",
    surface: "#ffffff",
  },
};

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: "myTheme",
    themes: {
      myTheme,
    },
  },
});
