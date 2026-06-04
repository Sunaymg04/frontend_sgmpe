<template>
  <v-container>
    <div class="page-header">
      <div>
        <h2 class="mb-1">Planes de estudio</h2>
        <div class="text-body-2 text-medium-emphasis">
          Planes existentes en la base de datos
        </div>
      </div>

      <v-btn color="primary" @click="abrirCrear">
        <v-icon class="mr-2">mdi-plus</v-icon>
        Nuevo plan de estudio
      </v-btn>
    </div>

    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="search"
          label="Buscar por nombre, programa, modalidad o curso"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          rounded="lg"
          hide-details
        />
      </v-col>
    </v-row>

    <v-card class="modern-table">
      <v-data-table
        :headers="headers"
        :items="planesFiltrados"
        :loading="loading"
        class="elevation-1"
      >
        <template v-slot:[`item.programa`]="{ item }">
          {{
            getNestedName(item, [
              "programa_formacion",
              "programa_nombre",
              "programa",
            ])
          }}
        </template>

        <template v-slot:[`item.modalidad`]="{ item }">
          {{
            getNestedName(item, [
              "modalidad_carrera",
              "modalidad_nombre",
              "modalidad",
            ])
          }}
        </template>

        <template v-slot:[`item.calificacion`]="{ item }">
          {{ getNestedName(item, ["calificacion", "calificacion_nombre"]) }}
        </template>

        <template v-slot:[`item.curso`]="{ item }">
          {{ getNestedName(item, ["curso", "curso_nombre"]) }}
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialogCrear" max-width="760" persistent>
      <v-card class="wizard-card">
        <div class="wizard-header">
          <div>
            <div class="text-h6 font-weight-bold">Crear plan de estudio</div>
            <div class="text-body-2 text-medium-emphasis">
              Seleccione los datos requeridos por el backend
            </div>
          </div>
          <v-btn icon variant="text" :disabled="saving" @click="cerrarCrear">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <div class="step-strip">
          <div
            v-for="(label, index) in steps"
            :key="label"
            class="step-pill"
            :class="{ active: step === index + 1, done: step > index + 1 }"
          >
            <span>{{ index + 1 }}</span>
            {{ label }}
          </div>
        </div>

        <v-alert
          v-if="formError"
          type="error"
          variant="tonal"
          density="comfortable"
          class="mb-4"
        >
          {{ formError }}
        </v-alert>

        <v-card-text class="px-0">
          <section v-if="step === 1">
            <v-alert
              v-if="!departmentId"
              type="warning"
              variant="tonal"
              density="comfortable"
              class="mb-4"
            >
              La sesión actual no tiene un departamento activo de jefe de
              departamento.
            </v-alert>

            <v-select
              v-model="form.id_prog_form"
              :items="programasDepartamento"
              item-title="nombre"
              item-value="id"
              label="Programa de formación"
              prepend-inner-icon="mdi-school-outline"
              variant="outlined"
              rounded="lg"
              :loading="loadingPrograms"
              :disabled="loadingPrograms || !departmentId"
              @update:modelValue="onProgramChange"
            />
          </section>

          <section v-else-if="step === 2">
            <v-select
              v-model="form.id_modalidad"
              :items="modalidadesPrograma"
              item-title="nombre"
              item-value="id"
              label="Modalidad de la carrera"
              prepend-inner-icon="mdi-book-open-variant"
              variant="outlined"
              rounded="lg"
              :loading="loadingModalities"
              :disabled="loadingModalities"
            />
          </section>

          <section v-else-if="step === 3">
            <v-text-field
              :model-value="calificacionSeleccionada?.nombre || ''"
              label="Calificación de la carrera"
              prepend-inner-icon="mdi-certificate-outline"
              variant="outlined"
              rounded="lg"
              readonly
            />
          </section>

          <section v-else>
            <v-select
              v-model="form.id_curso"
              :items="cursos"
              item-title="nombre"
              item-value="id"
              label="Curso"
              prepend-inner-icon="mdi-calendar-clock"
              variant="outlined"
              rounded="lg"
              :loading="loadingCourses"
              :disabled="loadingCourses"
            />

            <v-card class="summary-card" elevation="0">
              <div class="text-subtitle-2 font-weight-bold mb-2">Resumen</div>
              <div class="summary-row">
                <span>Programa</span>
                <strong>{{ selectedProgram?.nombre || "-" }}</strong>
              </div>
              <div class="summary-row">
                <span>Modalidad</span>
                <strong>{{ selectedModality?.nombre || "-" }}</strong>
              </div>
              <div class="summary-row">
                <span>Calificación</span>
                <strong>{{ calificacionSeleccionada?.nombre || "-" }}</strong>
              </div>
              <div class="summary-row">
                <span>Curso</span>
                <strong>{{ selectedCourse?.nombre || "-" }}</strong>
              </div>
            </v-card>
          </section>
        </v-card-text>

        <v-card-actions class="px-0 pt-2">
          <v-btn
            variant="text"
            color="grey"
            :disabled="saving"
            @click="cerrarCrear"
          >
            Cancelar
          </v-btn>
          <v-spacer />
          <v-btn
            v-if="step > 1"
            variant="outlined"
            :disabled="saving"
            @click="step--"
          >
            Atrás
          </v-btn>
          <v-btn
            v-if="step < 4"
            color="primary"
            :disabled="saving"
            @click="siguiente"
          >
            Siguiente
          </v-btn>
          <v-btn v-else color="primary" :loading="saving" @click="guardarPlan">
            Crear plan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import api from "@/services/api";
import { toast } from "vue-sonner";

export default {
  name: "PlanEstudioListView",
  data() {
    return {
      search: "",
      loading: false,
      planes: [],
      programas: [],
      modalidades: [],
      calificaciones: [],
      cursos: [],
      dialogCrear: false,
      step: 1,
      steps: ["Programa", "Modalidad", "Calificación", "Curso"],
      formError: "",
      loadingPrograms: false,
      loadingModalities: false,
      loadingCourses: false,
      saving: false,
      form: {
        id_prog_form: null,
        id_modalidad: null,
        id_calificacion: null,
        id_curso: null,
      },
      headers: [
        { title: "Código", key: "id" },
        { title: "Nombre", key: "nombre" },
        { title: "Programa de formación", key: "programa" },
        { title: "Modalidad", key: "modalidad" },
        { title: "Calificación", key: "calificacion" },
        { title: "Curso", key: "curso" },
      ],
    };
  },
  computed: {
    authAccess() {
      return this.$store.getters.authAccess || [];
    },
    departmentId() {
      const jefe = this.authAccess.find(
        (item) => item?.active && item?.role === "jefe_departamento"
      );
      return jefe?.departamento_id ?? jefe?.id_departamento ?? null;
    },
    planesFiltrados() {
      if (!this.search) return this.planes;
      const needle = this.search.toLowerCase();
      return this.planes.filter((item) =>
        [
          item?.id,
          item?.nombre,
          this.getNestedName(item, [
            "programa_formacion",
            "programa_nombre",
            "programa",
          ]),
          this.getNestedName(item, [
            "modalidad_carrera",
            "modalidad_nombre",
            "modalidad",
          ]),
          this.getNestedName(item, ["calificacion", "calificacion_nombre"]),
          this.getNestedName(item, ["curso", "curso_nombre"]),
        ]
          .join(" ")
          .toLowerCase()
          .includes(needle)
      );
    },
    programasDepartamento() {
      return this.programas;
    },
    modalidadesPrograma() {
      return this.modalidades;
    },
    selectedProgram() {
      return this.programasDepartamento.find(
        (item) => Number(item.id) === Number(this.form.id_prog_form)
      );
    },
    selectedModality() {
      return this.modalidadesPrograma.find(
        (item) => Number(item.id) === Number(this.form.id_modalidad)
      );
    },
    selectedCourse() {
      return this.cursos.find(
        (item) => Number(item.id) === Number(this.form.id_curso)
      );
    },
    calificacionSeleccionada() {
      const found = this.calificaciones.find(
        (item) => Number(item.id) === Number(this.form.id_calificacion)
      );
      if (found) return found;
      if (this.selectedProgram?.calificacion)
        return this.selectedProgram.calificacion;
      if (this.form.id_calificacion) {
        return {
          id: this.form.id_calificacion,
          nombre: this.form.id_calificacion,
        };
      }
      return null;
    },
  },
  methods: {
    normalizeList(payload) {
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    },
    async getFirst(endpoints) {
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
    getNestedName(item, keys) {
      for (const key of keys) {
        const value = item?.[key];
        if (!value) continue;
        if (typeof value === "string") return value;
        if (value?.nombre) return value.nombre;
        if (value?.identificador) return value.identificador;
      }
      return "";
    },
    async cargarPlanes() {
      this.loading = true;
      try {
        const [planRes, progRes, modRes, calRes, cursoRes] = await Promise.all([
          api.get("/plan_estudio"),
          api.get("/progForm").catch(() => ({ data: [] })),
          this.getFirst(["/modalidad_carrera", "/modalidadCarrera"]).catch(
            () => ({ data: [] })
          ),
          api.get("/calificacion").catch(() => ({ data: [] })),
          api.get("/curso").catch(() => ({ data: [] })),
        ]);

        const programas = this.toMap(this.normalizeList(progRes.data));
        const modalidades = this.toMap(this.normalizeList(modRes.data));
        const calificaciones = this.toMap(this.normalizeList(calRes.data));
        const cursos = this.toMap(this.normalizeList(cursoRes.data));

        this.planes = this.normalizeList(planRes.data).map((plan) => ({
          ...plan,
          programa_nombre:
            programas[plan.id_prog_form]?.nombre ||
            programas[plan.id_programa]?.nombre ||
            "",
          modalidad_nombre:
            modalidades[plan.id_modalidad]?.nombre ||
            modalidades[plan.id_modalidad_carrera]?.nombre ||
            "",
          calificacion_nombre:
            calificaciones[plan.id_calificacion]?.nombre || "",
          curso_nombre:
            cursos[plan.id_curso]?.nombre || cursos[plan.id_curso]?.curso || "",
        }));
      } catch (error) {
        console.error(error);
        toast.error("No se pudieron cargar los planes de estudio");
      } finally {
        this.loading = false;
      }
    },
    toMap(items) {
      return items.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {});
    },
    abrirCrear() {
      this.dialogCrear = true;
      this.resetForm();
      this.cargarProgramasDepartamento();
      this.cargarCursos();
    },
    cerrarCrear() {
      if (this.saving) return;
      this.dialogCrear = false;
      this.resetForm();
    },
    resetForm() {
      this.step = 1;
      this.formError = "";
      this.programas = [];
      this.modalidades = [];
      this.calificaciones = [];
      this.form = {
        id_prog_form: null,
        id_modalidad: null,
        id_calificacion: null,
        id_curso: null,
      };
    },
    async cargarProgramasDepartamento() {
      if (!this.departmentId) return;
      this.loadingPrograms = true;
      try {
        const carrerasRes = await api.get(
          `/departamento/${this.departmentId}/carreras`
        );
        const carreras = this.normalizeList(carrerasRes.data);
        this.programas = carreras.map((programa) => ({
          ...programa,
          modalidades: this.normalizeList(programa.modalidades),
        }));
      } catch (error) {
        try {
          await this.cargarProgramasDepartamentoFallback();
        } catch (fallbackError) {
          console.error(fallbackError);
          this.formError =
            "No fue posible cargar los programas de formación del departamento.";
        }
      } finally {
        this.loadingPrograms = false;
      }
    },
    async cargarProgramasDepartamentoFallback() {
      const [relRes, progRes] = await Promise.all([
        this.getFirst([
          "/departamento_prog_d_form",
          "/departamento_prog_form",
          "/departamentoProgForm",
        ]),
        api.get("/progForm"),
      ]);

      const relaciones = this.normalizeList(relRes.data).filter(
        (item) => Number(item.id_departamento) === Number(this.departmentId)
      );
      const ids = relaciones.map((item) => Number(item.id_prog_form));
      this.programas = this.normalizeList(progRes.data).filter((item) =>
        ids.includes(Number(item.id))
      );
    },
    async onProgramChange() {
      this.form.id_modalidad = null;
      this.form.id_calificacion = null;
      this.modalidades = [];
      this.calificaciones = [];
      if (!this.form.id_prog_form) return;

      const idCalificacion =
        this.selectedProgram?.id_calificacion ??
        this.selectedProgram?.calificacion?.id ??
        null;
      if (idCalificacion) this.form.id_calificacion = Number(idCalificacion);

      await Promise.all([this.cargarModalidades(), this.cargarCalificacion()]);
    },
    async cargarModalidades() {
      this.loadingModalities = true;
      try {
        const modalidadesIncluidas = this.normalizeList(
          this.selectedProgram?.modalidades
        );
        if (modalidadesIncluidas.length) {
          this.modalidades = modalidadesIncluidas;
          return;
        }

        const modalidadesRes = await this.getFirst([
          `/progForm/${this.form.id_prog_form}/modalidades`,
          `/programa/${this.form.id_prog_form}/modalidades`,
        ]);
        this.modalidades = this.normalizeList(modalidadesRes.data);
      } catch (error) {
        try {
          await this.cargarModalidadesFallback();
        } catch (fallbackError) {
          console.error(fallbackError);
          this.formError =
            "No fue posible cargar las modalidades del programa seleccionado.";
        }
      } finally {
        this.loadingModalities = false;
      }
    },
    async cargarModalidadesFallback() {
      const [relRes, modRes] = await Promise.all([
        this.getFirst([
          "/prog_form_modalidad_carrera",
          "/progFormModalidadCarrera",
          "/programa_modalidad",
        ]),
        this.getFirst(["/modalidad_carrera", "/modalidadCarrera"]),
      ]);
      const relaciones = this.normalizeList(relRes.data).filter(
        (item) => Number(item.id_prog_form) === Number(this.form.id_prog_form)
      );
      const ids = relaciones.map((item) => Number(item.id_modalidad));
      this.modalidades = this.normalizeList(modRes.data).filter((item) =>
        ids.includes(Number(item.id))
      );
    },
    async cargarCalificacion() {
      try {
        const res = await this.getFirst([
          `/progForm/${this.form.id_prog_form}/calificacion`,
          `/programa/${this.form.id_prog_form}/calificacion`,
        ]);
        const calificacion = res?.data?.data?.calificacion;
        if (calificacion?.id) {
          this.calificaciones = [calificacion];
          this.form.id_calificacion = Number(calificacion.id);
          return;
        }
      } catch (error) {
        await this.cargarCalificacionFallback();
      }
    },
    async cargarCalificacionFallback() {
      try {
        const res = await api.get("/calificacion");
        this.calificaciones = this.normalizeList(res.data);
        if (this.form.id_calificacion) return;

        const programa = this.normalizeList(
          this.calificaciones.map((item) => item.programa_formacion)
        ).find((item) => Number(item?.id) === Number(this.form.id_prog_form));
        if (programa?.id_calificacion) {
          this.form.id_calificacion = Number(programa.id_calificacion);
        }
      } catch (fallbackError) {
        console.error(fallbackError);
        this.formError =
          "No fue posible cargar la calificación del programa seleccionado.";
      }
    },
    async cargarCursos() {
      this.loadingCourses = true;
      try {
        const res = await this.getFirst(["/cursos", "/curso"]);
        this.cursos = this.normalizeList(res.data).map((curso) => ({
          ...curso,
          nombre: curso.nombre || curso.curso,
        }));
      } catch (error) {
        console.error(error);
        this.formError = "No fue posible cargar los cursos.";
      } finally {
        this.loadingCourses = false;
      }
    },
    siguiente() {
      this.formError = "";
      if (this.step === 1 && !this.form.id_prog_form) {
        this.formError = "Seleccione un programa de formación.";
        return;
      }
      if (this.step === 2 && !this.form.id_modalidad) {
        this.formError = "Seleccione una modalidad.";
        return;
      }
      if (this.step === 3 && !this.form.id_calificacion) {
        this.formError =
          "El programa seleccionado no tiene una calificación asociada.";
        return;
      }
      this.step++;
    },
    async guardarPlan() {
      this.formError = "";
      if (!this.form.id_curso) {
        this.formError = "Seleccione un curso.";
        return;
      }

      this.saving = true;
      try {
        await api.post("/plan_estudio", {
          id_prog_form: Number(this.form.id_prog_form),
          id_modalidad: Number(this.form.id_modalidad),
          id_calificacion: Number(this.form.id_calificacion),
          id_curso: Number(this.form.id_curso),
        });
        this.dialogCrear = false;
        this.resetForm();
        await this.cargarPlanes();
        toast.success("Plan de estudio creado correctamente");
      } catch (error) {
        console.error(error);
        this.formError =
          error?.response?.data?.message ||
          "No fue posible crear el plan de estudio.";
      } finally {
        this.saving = false;
      }
    },
  },
  mounted() {
    this.cargarPlanes();
  },
};
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.modern-table {
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

.modern-table :deep(th) {
  font-weight: 700;
  color: #0f172a;
  font-size: 13.5px;
  letter-spacing: 0;
  text-transform: uppercase;
}

.modern-table :deep(thead) {
  background: linear-gradient(to right, #f8fafc, #f1f5f9);
}

.wizard-card {
  padding: 28px;
  border-radius: 8px !important;
}

.wizard-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.step-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 22px;
}

.step-pill {
  display: flex;
  align-items: center;
  min-height: 42px;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #475569;
  background: #f8fafc;
  font-size: 13px;
  font-weight: 600;
}

.step-pill span {
  display: grid;
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 50%;
  background: #e2e8f0;
  color: #334155;
  font-size: 12px;
}

.step-pill.active {
  border-color: #2563eb;
  color: #1d4ed8;
  background: #eff6ff;
}

.step-pill.active span,
.step-pill.done span {
  background: #2563eb;
  color: white;
}

.summary-card {
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px !important;
  background: #f8fafc !important;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0;
  border-top: 1px solid #e2e8f0;
}

.summary-row span {
  color: #64748b;
}

@media (max-width: 720px) {
  .page-header {
    flex-direction: column;
  }

  .page-header .v-btn {
    width: 100%;
  }

  .step-strip {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
