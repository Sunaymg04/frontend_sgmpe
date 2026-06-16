<template>
  <v-dialog
    v-model="dialog"
    max-width="700"
    transition="dialog-bottom-transition"
  >
    <v-card class="rounded-xl pa-2">
      <!-- Header -->
      <v-card-title class="text-h5 font-weight-bold d-flex align-center">
        <v-icon class="mr-2" color="primary"> mdi-book-education </v-icon>

        {{ form.id ? "Editar Asignatura" : "Crear Asignatura" }}
      </v-card-title>

      <!-- Form -->
      <v-card-text>
        <v-form>
          <!-- Nombre -->
          <v-text-field
            v-model="form.nombre"
            label="Nombre de la asignatura"
            variant="outlined"
            rounded="lg"
            prepend-inner-icon="mdi-book-outline"
            class="mb-4"
          />

          <!-- Cantidad de horas -->
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                :model-value="fondoTiempoTotal"
                label="Fondo de tiempo"
                type="number"
                variant="outlined"
                rounded="lg"
                prepend-inner-icon="mdi-timer-outline"
                class="mb-4"
                readonly
                disabled
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="form.horas_clase"
                label="Horas clase"
                type="number"
                min="0"
                variant="outlined"
                rounded="lg"
                prepend-inner-icon="mdi-school-outline"
                class="mb-4"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="form.horas_practica_laboral"
                label="Práctica laboral"
                type="number"
                min="0"
                variant="outlined"
                rounded="lg"
                prepend-inner-icon="mdi-briefcase-outline"
                class="mb-4"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-switch
                v-model="form.tiene_examen_final"
                color="primary"
                label="Tiene examen final"
                hide-details
                inset
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-switch
                v-model="form.tiene_trabajo_curso"
                color="primary"
                label="Tiene trabajo de curso"
                hide-details
                inset
              />
            </v-col>
          </v-row>

          <!-- Disciplinas -->
          <v-select
            v-model="form.id_disciplina"
            :items="disciplinas"
            item-title="nombre"
            item-value="id"
            label="Disciplinas"
            variant="outlined"
            rounded="lg"
            prepend-inner-icon="mdi-book-multiple-outline"
            multiple
            chips
            class="mb-4"
          />

          <v-select
            v-model="form.id_a_academico"
            :items="aniosAcademicos"
            item-title="nombre_completo"
            item-value="id"
            label="Años Académicos"
            variant="outlined"
            rounded="lg"
            prepend-inner-icon="mdi-school-outline"
            multiple
            chips
            class="mb-4"
            :loading="loadingAnios"
            :disabled="loadingAnios"
          />
        </v-form>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="pa-4">
        <v-spacer />

        <v-btn variant="text" color="grey" @click="cerrar"> Cancelar </v-btn>

        <v-btn color="primary" rounded="lg" elevation="2" @click="guardar">
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import api from "@/services/api";

export default {
  props: {
    modelValue: Boolean,
    asignatura: Object,
  },

  emits: ["update:modelValue", "guardado", "error", "cerrado"],

  data() {
    return {
      disciplinas: [],

      aniosAcademicos: [],
      loadingAnios: false,

      form: {
        id: null,
        nombre: "",
        fondo_tiempo: "",
        horas_clase: 0,
        horas_practica_laboral: 0,
        tiene_examen_final: false,
        tiene_trabajo_curso: false,
        id_disciplina: [],
        id_a_academico: [],
      },
    };
  },

  computed: {
    dialog: {
      get() {
        return this.modelValue;
      },

      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
    authAccess() {
      return this.$store.getters.authAccess || [];
    },
    departmentId() {
      const jefe = this.authAccess.find(
        (item) => item?.active && item?.role === "jefe_departamento"
      );
      return jefe?.departamento_id ?? jefe?.id_departamento ?? null;
    },
    fondoTiempoTotal() {
      return (
        Number(this.form.horas_clase || 0) +
        Number(this.form.horas_practica_laboral || 0)
      );
    },
  },
  watch: {
    asignatura: {
      immediate: true,

      handler(valor) {
        if (valor) {
          this.form = {
            id: valor.id,

            nombre: valor.nombre,

            fondo_tiempo: valor.fondo_tiempo,
            horas_clase:
              valor.horas_clase !== undefined
                ? Number(valor.horas_clase || 0)
                : Number(valor.fondo_tiempo || 0),
            horas_practica_laboral: Number(valor.horas_practica_laboral || 0),
            tiene_examen_final: this.toBooleanFlag(valor.tiene_examen_final),
            tiene_trabajo_curso: this.toBooleanFlag(valor.tiene_trabajo_curso),

            // disciplinas

            id_disciplina: Array.isArray(valor.disciplinas)
              ? valor.disciplinas.map((d) => Number(d.id))
              : [],

            // años académicos

            id_a_academico: Array.isArray(valor.anios_academicos)
              ? valor.anios_academicos.map((a) => Number(a.id))
              : [],
          };
        }
      },
    },
  },

  methods: {
    async obtenerDisciplinas() {
      try {
        const res = await api.get("/disciplina");

        this.disciplinas = res.data.data;
      } catch (error) {
        console.error(error);
      }
    },

    async obtenerAniosAcademicos() {
      this.loadingAnios = true;
      try {
        if (!this.departmentId) {
          await this.obtenerTodosLosAniosAcademicos();
          return;
        }

        const [carrerasRes, aniosRes] = await Promise.all([
          api.get(`/departamento/${this.departmentId}/carreras`),
          api.get("/a_academico"),
        ]);

        const carreras = this.normalizeList(carrerasRes.data);
        const programasPorId = carreras.reduce((acc, carrera) => {
          acc[Number(carrera.id)] = carrera.nombre;
          return acc;
        }, {});
        const idsProgramas = Object.keys(programasPorId).map(Number);

        this.aniosAcademicos = this.normalizeList(aniosRes.data)
          .filter((anio) => idsProgramas.includes(Number(anio.id_prog_form)))
          .map((a) => ({
            ...a,
            nombre_completo: `${a.identificador} - ${
              programasPorId[Number(a.id_prog_form)] ||
              a.programa_formacion?.nombre ||
              "Programa de formación"
            }`,
          }));
      } catch (error) {
        console.error(error);
      } finally {
        this.loadingAnios = false;
      }
    },

    async obtenerTodosLosAniosAcademicos() {
      const res = await api.get("/a_academico");

      this.aniosAcademicos = this.normalizeList(res.data).map((a) => ({
        ...a,
        nombre_completo: `${a.identificador} - ${a.programa_formacion.nombre}`,
      }));
    },

    normalizeList(payload) {
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    },
    toBooleanFlag(value) {
      return value === true || value === 1 || value === "1";
    },

    async guardar() {
      try {
        // EDITAR

        if (this.form.id) {
          await api.put(
            `/asignatura/${this.form.id}`,
            this.asignaturaPayload()
          );
        }

        // CREAR
        else {
          await api.post("/asignatura", this.asignaturaPayload());
        }

        this.cerrar();

        this.$nextTick(() => {
          this.$emit(
            "guardado",

            this.form.id
              ? "Asignatura actualizada correctamente"
              : "Asignatura creada correctamente"
          );
        });
      } catch (error) {
        console.error(error);

        this.$emit("error", "No se pudo guardar la asignatura");
      }
    },

    cerrar() {
      this.dialog = false;

      this.form = {
        id: null,
        nombre: "",
        fondo_tiempo: "",
        horas_clase: 0,
        horas_practica_laboral: 0,
        tiene_examen_final: false,
        tiene_trabajo_curso: false,
        id_disciplina: [],
        id_a_academico: [],
      };
      this.$emit("cerrado");
    },
    asignaturaPayload() {
      return {
        ...this.form,
        fondo_tiempo: this.fondoTiempoTotal,
        horas_clase: Number(this.form.horas_clase || 0),
        horas_practica_laboral: Number(this.form.horas_practica_laboral || 0),
        tiene_examen_final: this.toBooleanFlag(this.form.tiene_examen_final),
        tiene_trabajo_curso: this.toBooleanFlag(this.form.tiene_trabajo_curso),
      };
    },
  },

  mounted() {
    this.obtenerDisciplinas();

    this.obtenerAniosAcademicos();
  },
};
</script>
