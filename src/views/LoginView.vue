<template>
  <v-container
    fluid
    class="fill-height d-flex align-center justify-center login-page"
  >
    <v-card class="pa-8 login-card" elevation="0" rounded="xl">
      <div class="text-h5 font-weight-bold mb-1">Iniciar sesión</div>
      <div class="text-body-2 text-medium-emphasis mb-6">
        Gestión de Plan de Estudio
      </div>

      <v-form @submit.prevent="onSubmit">
        <v-text-field
          v-model="username"
          label="Usuario"
          prepend-inner-icon="mdi-account"
          name="username"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          variant="outlined"
          density="comfortable"
          :disabled="loading"
          :error-messages="fieldErrors.username"
        />

        <v-text-field
          v-model="password"
          label="Contraseña"
          prepend-inner-icon="mdi-lock-outline"
          name="password"
          autocomplete="new-password"
          variant="outlined"
          density="comfortable"
          :type="showPassword ? 'text' : 'password'"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showPassword = !showPassword"
          :disabled="loading"
          :error-messages="fieldErrors.password"
        />

        <v-btn
          block
          color="primary"
          class="mt-2"
          size="large"
          :loading="loading"
          type="submit"
        >
          Entrar
        </v-btn>

        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mt-4"
          density="comfortable"
        >
          {{ error }}
        </v-alert>
      </v-form>
    </v-card>
  </v-container>
</template>

<script>
import api from "@/services/api";
import usersApi from "@/services/usersApi";

export default {
  name: "LoginView",
  data() {
    return {
      username: "",
      password: "",
      showPassword: false,
      loading: false,
      error: "",
      fieldErrors: {
        username: "",
        password: "",
      },
    };
  },
  methods: {
    validateFields() {
      const errors = { username: "", password: "" };
      if (!this.username?.trim()) errors.username = "El usuario es requerido.";
      if (!this.password) errors.password = "La contraseña es requerida.";
      this.fieldErrors = errors;
      return !errors.username && !errors.password;
    },
    async onSubmit() {
      this.error = "";
      if (!this.validateFields()) return;

      this.loading = true;
      try {
        await this.$store.dispatch("login", {
          username: this.username.trim(),
          password: this.password,
          usersApi,
          api,
        });
        this.$router.replace({ name: "dashboard" });
      } catch (e) {
        this.error = e?.message || "No fue posible iniciar sesión.";
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    if (this.$store.getters.isAuthenticated) {
      this.$router.replace({ name: "dashboard" });
    }
  },
};
</script>

<style scoped>
.login-page {
  padding: 24px;
  background: radial-gradient(
      1200px 600px at 20% 10%,
      rgba(59, 130, 246, 0.18),
      transparent 60%
    ),
    radial-gradient(
      900px 500px at 85% 35%,
      rgba(29, 78, 216, 0.14),
      transparent 55%
    );
}

.login-card {
  width: 100%;
  max-width: 520px;
  border: 1px solid rgba(2, 6, 23, 0.08);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 12px 40px rgba(2, 6, 23, 0.08);
  border-radius: 24px;
}
</style>
