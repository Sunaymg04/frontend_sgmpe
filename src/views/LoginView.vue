<template>
  <section class="login-page">
    <v-btn
      class="settings-btn"
      icon
      variant="tonal"
      color="secondary"
      :disabled="loading"
      @click="openSettings"
    >
      <v-icon>mdi-cog-outline</v-icon>
    </v-btn>

    <div class="login-shell">
      <div class="brand-panel">
        <div class="brand-mark">
          <v-icon size="32">mdi-school-outline</v-icon>
        </div>
        <h1>Gestión de Plan de Estudio</h1>
        <p>
          Acceso reservado a usuarios con roles activos para esta aplicación.
        </p>
      </div>

      <v-card class="login-card" elevation="0">
        <div class="text-h5 font-weight-bold mb-1">Iniciar sesión</div>
        <div class="text-body-2 text-medium-emphasis mb-6">
          Valida tus credenciales y el acceso asignado.
        </div>

        <v-form @submit.prevent="onSubmit">
          <v-text-field
            v-model="username"
            label="Usuario"
            prepend-inner-icon="mdi-account"
            name="username"
            autocomplete="username"
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
            autocomplete="current-password"
            variant="outlined"
            density="comfortable"
            :type="showPassword ? 'text' : 'password'"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            :disabled="loading"
            :error-messages="fieldErrors.password"
            @click:append-inner="showPassword = !showPassword"
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
    </div>

    <v-dialog v-model="settingsOpen" max-width="720" persistent>
      <v-card class="admin-card" elevation="0">
        <div class="admin-header">
          <div>
            <div class="text-h6 font-weight-bold">Configuración de acceso</div>
            <div class="text-body-2 text-medium-emphasis">
              Administración de roles
            </div>
          </div>
          <v-btn
            icon
            variant="text"
            :disabled="adminLoading"
            @click="closeSettings"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <v-divider class="mb-5" />

        <v-form v-if="!adminVerified" @submit.prevent="authenticateAdmin">
          <v-alert
            type="info"
            variant="tonal"
            density="comfortable"
            class="mb-5"
          >
            Primero debe autenticarse una cuenta con rol activo de
            administrador.
          </v-alert>

          <v-text-field
            v-model="admin.username"
            label="Usuario administrador"
            prepend-inner-icon="mdi-account-key-outline"
            autocomplete="username"
            variant="outlined"
            density="comfortable"
            :disabled="adminLoading"
            :error-messages="adminErrors.username"
          />

          <v-text-field
            v-model="admin.password"
            label="Contraseña"
            prepend-inner-icon="mdi-lock-check-outline"
            autocomplete="current-password"
            variant="outlined"
            density="comfortable"
            :type="showAdminPassword ? 'text' : 'password'"
            :append-inner-icon="showAdminPassword ? 'mdi-eye-off' : 'mdi-eye'"
            :disabled="adminLoading"
            :error-messages="adminErrors.password"
            @click:append-inner="showAdminPassword = !showAdminPassword"
          />

          <v-btn
            color="primary"
            block
            size="large"
            type="submit"
            :loading="adminLoading"
          >
            Validar administrador
          </v-btn>
        </v-form>

        <v-form v-else @submit.prevent="assignApplicationRole">
          <v-alert
            type="success"
            variant="tonal"
            density="comfortable"
            class="mb-5"
          >
            Administrador validado. Seleccione el rol y el contexto de acceso.
          </v-alert>

          <v-text-field
            v-model="assignment.username"
            label="Usuario a asignar"
            prepend-inner-icon="mdi-account-plus-outline"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            variant="outlined"
            density="comfortable"
            :disabled="assignLoading"
            :error-messages="assignmentErrors.username"
          />

          <v-select
            v-model="assignment.role"
            :items="roleOptions"
            label="Rol"
            prepend-inner-icon="mdi-shield-account-outline"
            variant="outlined"
            density="comfortable"
            :disabled="assignLoading"
            :error-messages="assignmentErrors.role"
          />

          <v-select
            v-if="assignment.role === 'jefe_departamento'"
            v-model="assignment.departmentKey"
            :items="departmentOptions"
            label="Departamento"
            prepend-inner-icon="mdi-domain"
            variant="outlined"
            density="comfortable"
            :loading="departmentsLoading"
            :disabled="assignLoading || departmentsLoading"
            :error-messages="assignmentErrors.departmentId"
          />

          <v-select
            v-else-if="assignment.role === 'decano'"
            v-model="assignment.facultyId"
            :items="facultyOptions"
            item-title="nombre"
            item-value="id"
            label="Facultad"
            prepend-inner-icon="mdi-bank-outline"
            variant="outlined"
            density="comfortable"
            :loading="departmentsLoading"
            :disabled="assignLoading || departmentsLoading"
            :error-messages="assignmentErrors.facultyId"
          />

          <v-btn
            color="primary"
            block
            size="large"
            type="submit"
            :loading="assignLoading"
            :disabled="departmentsLoading"
          >
            Asignar rol
          </v-btn>
        </v-form>

        <v-alert
          v-if="adminMessage"
          :type="adminMessageType"
          variant="tonal"
          class="mt-5"
          density="comfortable"
        >
          {{ adminMessage }}
        </v-alert>
      </v-card>
    </v-dialog>
  </section>
</template>

<script>
import api from "@/services/api";
import usersApi from "@/services/usersApi";

const APPLICATION_CODE = "gestion_plan_estudio";
const DEPARTMENT_CHIEF_ROLE = "jefe_departamento";
const DEAN_ROLE = "decano";
const VICE_DEAN_ROLE = "vicedecano_docente";

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
      settingsOpen: false,
      adminVerified: false,
      adminLoading: false,
      showAdminPassword: false,
      adminMessage: "",
      adminMessageType: "info",
      admin: {
        username: "",
        password: "",
      },
      adminErrors: {
        username: "",
        password: "",
      },
      departments: [],
      faculties: [],
      departmentsLoading: false,
      assignment: {
        username: "",
        role: DEPARTMENT_CHIEF_ROLE,
        departmentId: null,
        departmentKey: "",
        facultyId: null,
      },
      assignmentErrors: {
        username: "",
        role: "",
        departmentId: "",
        facultyId: "",
      },
      assignLoading: false,
    };
  },
  computed: {
    departmentOptions() {
      return this.departments.map((department) => department.__key);
    },
    facultyOptions() {
      return this.faculties;
    },
    roleOptions() {
      return [
        { title: "Jefe de departamento", value: DEPARTMENT_CHIEF_ROLE },
        { title: "Decano", value: DEAN_ROLE },
        { title: "Vicedecano Docente", value: VICE_DEAN_ROLE },
      ];
    },
  },
  methods: {
    normalizeList(payload) {
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    },
    getFriendlyLoginError(error) {
      if (error?.response?.status === 401) {
        return "Usuario o contraseña incorrectos.";
      }

      if (error?.message === "Credenciales inválidas.") {
        return "Usuario o contraseña incorrectos.";
      }

      return error?.message || "No fue posible iniciar sesión.";
    },
    departmentTitle(item) {
      if (!item) return "";
      const faculty =
        item.facultad?.nombre || item.facultad_nombre || item.__facultad_nombre;
      return faculty ? `${item.nombre} - ${faculty}` : item.nombre;
    },
    getDepartmentFacultyId(department) {
      return (
        department?.__facultad_id ??
        department?.facultad_id ??
        department?.id_facultad ??
        department?.facultad?.id ??
        null
      );
    },
    makeDepartmentKey(department) {
      return String(department?.id ?? "");
    },
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
          api,
        });
        const role = this.$store.getters.primaryRole;
        this.$router.replace({
          name:
            role === DEAN_ROLE
              ? "decano_solicitudes"
              : role === VICE_DEAN_ROLE
              ? "vicedecano_solicitudes"
              : "dashboard",
        });
      } catch (e) {
        this.error = this.getFriendlyLoginError(e);
      } finally {
        this.loading = false;
      }
    },
    openSettings() {
      this.settingsOpen = true;
      this.adminMessage = "";
    },
    closeSettings() {
      this.settingsOpen = false;
      this.adminVerified = false;
      this.showAdminPassword = false;
      this.adminMessage = "";
      this.admin = { username: "", password: "" };
      this.adminErrors = { username: "", password: "" };
      this.resetAssignment();
    },
    validateAdminFields() {
      const errors = { username: "", password: "" };
      if (!this.admin.username?.trim()) {
        errors.username = "El usuario administrador es requerido.";
      }
      if (!this.admin.password) {
        errors.password = "La contraseña es requerida.";
      }
      this.adminErrors = errors;
      return !errors.username && !errors.password;
    },
    async authenticateAdmin() {
      this.adminMessage = "";
      if (!this.validateAdminFields()) return;

      this.adminLoading = true;
      try {
        const username = this.admin.username.trim();
        const validateRes = await api.post("/login", {
          username,
          password: this.admin.password,
          application: APPLICATION_CODE,
        });

        if (!validateRes?.data?.valid) {
          throw new Error("Credenciales de administrador inválidas.");
        }

        const accessRes = validateRes;
        const access = Array.isArray(accessRes?.data?.access)
          ? accessRes.data.access
          : [];
        const isAdmin = access.some(
          (item) => item?.role === "admin" && item?.active
        );

        if (!accessRes?.data?.can_access || !isAdmin) {
          throw new Error(
            "El usuario validado no tiene rol admin activo para esta aplicación."
          );
        }

        this.adminVerified = true;
        this.adminMessageType = "success";
        this.adminMessage = "Administrador validado correctamente.";
        await this.loadDepartments();
      } catch (e) {
        this.adminMessageType = "error";
        this.adminMessage = this.getFriendlyLoginError(e);
      } finally {
        this.adminLoading = false;
      }
    },
    async loadDepartments() {
      this.departmentsLoading = true;
      try {
        const departmentsRes = await this.getFirstFromApi([
          "/departamento",
          "/departamentos",
        ]);

        const relationsRes = await this.getFirstFromApi([
          "/facultad_departamento",
          "/facultad_departamentos",
          "/facultadDepartamento",
          "/facultad-departamento",
        ]).catch(() => ({ data: [] }));

        const facultiesRes = await this.getFirstFromApi([
          "/facultad",
          "/facultades",
        ]).catch(() => ({
          data: [],
        }));

        const relations = this.normalizeList(relationsRes.data);
        const facultiesById = this.normalizeList(facultiesRes.data).reduce(
          (acc, faculty) => {
            acc[Number(faculty.id)] = faculty;
            return acc;
          },
          {}
        );

        this.faculties = Object.values(facultiesById);
        this.departments = await Promise.all(
          this.normalizeList(departmentsRes.data).map(async (department) => {
            const relation = relations.find(
              (item) => Number(item.id_departamento) === Number(department.id)
            );
            const endpointFaculty = await this.resolveDepartmentFaculty(
              department.id
            );
            const facultyId =
              endpointFaculty?.id ?? relation?.id_facultad ?? null;
            const faculty = endpointFaculty || facultiesById[Number(facultyId)];

            const nombreCompleto = this.departmentTitle({
              ...department,
              __facultad_nombre: faculty?.nombre || "",
            });

            return {
              ...department,
              __facultad_id: facultyId,
              __facultad_nombre: faculty?.nombre || "",
              __key: nombreCompleto,
              nombre_completo: nombreCompleto,
            };
          })
        );
      } catch (e) {
        this.adminMessageType = "error";
        this.adminMessage =
          "No fue posible cargar los departamentos desde la API principal.";
      } finally {
        this.departmentsLoading = false;
      }
    },
    async resolveDepartmentFaculty(departmentId) {
      const facultyRes = await api
        .get(`/departamento/${departmentId}/facultad`)
        .catch(() => null);
      if (facultyRes?.data?.res && facultyRes?.data?.data) {
        return facultyRes.data.data;
      }
      return null;
    },
    async resolveDepartmentFacultyId(departmentId) {
      const faculty = await this.resolveDepartmentFaculty(departmentId);
      if (faculty?.id) return faculty.id;

      const relationsRes = await this.getFirstFromApi([
        "/facultad_departamento",
        "/facultad_departamentos",
        "/facultadDepartamento",
        "/facultad-departamento",
      ]);
      const relation = this.normalizeList(relationsRes.data).find(
        (item) => Number(item.id_departamento) === Number(departmentId)
      );
      return relation?.id_facultad ?? null;
    },
    async getFirstFromApi(endpoints) {
      let lastError;
      for (const endpoint of endpoints) {
        try {
          return await api.get(endpoint);
        } catch (error) {
          lastError = error;
        }
      }
      throw lastError;
    },
    validateAssignmentFields() {
      const errors = {
        username: "",
        role: "",
        departmentId: "",
        facultyId: "",
      };
      if (!this.assignment.username?.trim()) {
        errors.username = "El usuario es requerido.";
      }
      if (
        ![DEPARTMENT_CHIEF_ROLE, DEAN_ROLE, VICE_DEAN_ROLE].includes(
          this.assignment.role
        )
      ) {
        errors.role = "Seleccione un rol.";
      }
      if (
        this.assignment.role === DEPARTMENT_CHIEF_ROLE &&
        !this.assignment.departmentKey
      ) {
        errors.departmentId = "Seleccione un departamento.";
      }
      if (this.assignment.role === DEAN_ROLE && !this.assignment.facultyId) {
        errors.facultyId = "Seleccione una facultad.";
      }
      this.assignmentErrors = errors;
      return (
        !errors.username &&
        !errors.role &&
        !errors.departmentId &&
        !errors.facultyId
      );
    },
    async userExists(username) {
      const res = await usersApi.get("/users");
      const users = this.normalizeList(res.data);
      return users.some((user) => user?.username === username);
    },
    async getApplicationAccess(username) {
      const endpoint = `/users/${encodeURIComponent(username)}/access`;
      const config = { params: { application: APPLICATION_CODE } };

      return api.get(endpoint, config);
    },
    async assignApplicationAccess(payload) {
      return api.post("/access/assign", payload);
    },
    resetAssignment() {
      this.assignment = {
        username: "",
        role: DEPARTMENT_CHIEF_ROLE,
        departmentId: null,
        departmentKey: "",
        facultyId: null,
      };
      this.assignmentErrors = {
        username: "",
        role: "",
        departmentId: "",
        facultyId: "",
      };
    },
    async assignApplicationRole() {
      this.adminMessage = "";
      if (!this.validateAssignmentFields()) return;

      const username = this.assignment.username.trim();
      const isDepartmentChief = this.assignment.role === DEPARTMENT_CHIEF_ROLE;
      const department = isDepartmentChief
        ? this.departments.find(
            (item) => item.__key === this.assignment.departmentKey
          )
        : null;
      const isViceDean = this.assignment.role === VICE_DEAN_ROLE;
      let facultyId = isDepartmentChief
        ? this.getDepartmentFacultyId(department)
        : isViceDean
        ? null
        : this.assignment.facultyId;

      if (isDepartmentChief && !facultyId && department?.id) {
        facultyId = await this.resolveDepartmentFacultyId(department.id).catch(
          () => null
        );
      }

      if (isDepartmentChief && (!department || !facultyId)) {
        this.assignmentErrors.departmentId =
          "El departamento seleccionado no tiene facultad asociada.";
        return;
      }

      const assignedRole = this.assignment.role;
      this.assignLoading = true;
      try {
        const exists = await this.userExists(username);
        if (!exists) {
          throw new Error("Ese usuario no existe en la API de usuarios.");
        }

        await this.assignApplicationAccess({
          application_code: APPLICATION_CODE,
          username,
          role: this.assignment.role,
          facultad_id: facultyId ? Number(facultyId) : null,
          departamento_id: isDepartmentChief ? Number(department.id) : null,
        });

        this.resetAssignment();
        this.adminMessageType = "success";
        this.adminMessage =
          "Jefe de Departamento asignado. Si ya existía uno para ese departamento se dejará activo solo el nuevo acceso";
      } catch (e) {
        this.adminMessageType = "error";
        this.adminMessage =
          e?.response?.data?.message ||
          e?.message ||
          "No fue posible asignar el rol.";
      } finally {
        if (this.adminMessageType === "success") {
          this.adminMessage = isDepartmentChief
            ? "Jefe de Departamento asignado. Si ya existia uno para ese departamento se dejara activo solo el nuevo acceso."
            : assignedRole === VICE_DEAN_ROLE
            ? "Vicedecano Docente asignado. Si ya existia uno activo se dejara activo solo el nuevo acceso."
            : "Decano asignado. Si ya existia uno para esa facultad se dejara activo solo el nuevo acceso.";
        }
        this.assignLoading = false;
      }
    },
  },
  mounted() {
    if (this.$store.getters.isAuthenticated) {
      const role = this.$store.getters.primaryRole;
      this.$router.replace({
        name:
          role === DEAN_ROLE
            ? "decano_solicitudes"
            : role === VICE_DEAN_ROLE
            ? "vicedecano_solicitudes"
            : "dashboard",
      });
    }
  },
};
</script>

<style scoped>
.login-page {
  position: relative;
  display: grid;
  min-height: 100vh;
  width: 100%;
  place-items: center;
  overflow: hidden;
  padding: 32px;
  background: linear-gradient(
      135deg,
      rgba(12, 74, 110, 0.94),
      rgba(15, 23, 42, 0.92)
    ),
    linear-gradient(45deg, #f8fafc 0%, #dbeafe 42%, #fde68a 100%);
}

.login-page::before {
  position: absolute;
  inset: auto -12% -18% 28%;
  height: 52vh;
  content: "";
  background: rgba(250, 204, 21, 0.22);
  filter: blur(90px);
  transform: rotate(-7deg);
}

.login-shell {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(280px, 430px) minmax(320px, 460px);
  gap: 32px;
  align-items: center;
  width: min(100%, 980px);
}

.settings-btn {
  position: fixed;
  z-index: 3;
  top: 22px;
  right: 22px;
  border: 1px solid rgba(255, 255, 255, 0.36);
  background: rgba(255, 255, 255, 0.88) !important;
}

.brand-panel {
  color: #ffffff;
}

.brand-mark {
  display: grid;
  width: 64px;
  height: 64px;
  margin-bottom: 24px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.12);
}

.brand-panel h1 {
  max-width: 420px;
  margin: 0 0 16px;
  font-size: 44px;
  line-height: 1.05;
  letter-spacing: 0;
}

.brand-panel p {
  max-width: 390px;
  margin: 0;
  color: rgba(255, 255, 255, 0.78);
  font-size: 17px;
  line-height: 1.6;
}

.login-card,
.admin-card {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.68);
  border-radius: 8px !important;
  background: rgba(255, 255, 255, 0.94) !important;
  box-shadow: 0 24px 70px rgba(2, 6, 23, 0.24);
}

.login-card {
  padding: 34px;
}

.admin-card {
  padding: 28px;
}

.admin-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

@media (max-width: 820px) {
  .login-page {
    align-items: start;
    padding: 84px 18px 24px;
  }

  .login-shell {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .brand-panel h1 {
    font-size: 34px;
  }

  .brand-panel p {
    font-size: 15px;
  }

  .login-card {
    padding: 24px;
  }
}
</style>
