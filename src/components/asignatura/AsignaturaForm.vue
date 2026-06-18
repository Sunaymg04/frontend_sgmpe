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

          <v-select
            v-if="departmentId"
            v-model="form.id_prog_form"
            :items="programas"
            item-title="nombre"
            item-value="id"
            label="Programa de formación"
            variant="outlined"
            rounded="lg"
            prepend-inner-icon="mdi-account-school-outline"
            class="mb-4"
            :loading="loadingProgramas"
            :disabled="loadingProgramas || programas.length <= 1"
            @update:model-value="cambiarPrograma"
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
                v-model="examenFinalModel"
                color="primary"
                label="Tiene examen final"
                hide-details
                inset
                :true-value="true"
                :false-value="false"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-switch
                v-model="trabajoCursoModel"
                color="primary"
                label="Tiene trabajo de curso"
                hide-details
                inset
                :true-value="true"
                :false-value="false"
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
      programas: [],
      loadingAnios: false,
      loadingProgramas: false,

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
        id_prog_form: null,
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
    examenFinalModel: {
      get() {
        return this.toBooleanFlag(this.form.tiene_examen_final);
      },
      set(value) {
        this.setExamenFinal(value);
      },
    },
    trabajoCursoModel: {
      get() {
        return this.toBooleanFlag(this.form.tiene_trabajo_curso);
      },
      set(value) {
        this.setTrabajoCurso(value);
      },
    },
  },
  watch: {
    asignatura: {
      immediate: true,

      handler(valor) {
        if (valor) {
          const tieneExamenFinal = this.toBooleanFlag(valor.tiene_examen_final);

          this.form = {
            id: valor.id,

            nombre: valor.nombre,

            fondo_tiempo: valor.fondo_tiempo,
            horas_clase:
              valor.horas_clase !== undefined
                ? Number(valor.horas_clase || 0)
                : Number(valor.fondo_tiempo || 0),
            horas_practica_laboral: Number(valor.horas_practica_laboral || 0),
            tiene_examen_final: tieneExamenFinal,
            tiene_trabajo_curso:
              !tieneExamenFinal &&
              this.toBooleanFlag(valor.tiene_trabajo_curso),

            // disciplinas

            id_disciplina: Array.isArray(valor.disciplinas)
              ? valor.disciplinas.map((d) => Number(d.id))
              : [],

            // años académicos

            id_a_academico: Array.isArray(valor.anios_academicos)
              ? valor.anios_academicos.map((a) => Number(a.id))
              : [],

            id_prog_form: Array.isArray(valor.anios_academicos)
              ? valor.anios_academicos.find((a) => a?.id_prog_form)
                  ?.id_prog_form ?? null
              : null,
          };
        }
      },
    },
    "form.tiene_examen_final"(value) {
      if (this.toBooleanFlag(value) && this.form.tiene_trabajo_curso) {
        this.form.tiene_trabajo_curso = false;
      }
    },
    "form.tiene_trabajo_curso"(value) {
      if (this.toBooleanFlag(value) && this.form.tiene_examen_final) {
        this.form.tiene_examen_final = false;
      }
    },
  },

  methods: {
    async obtenerDisciplinas() {
      try {
        if (this.departmentId) {
          const programaIds = this.form.id_prog_form
            ? [Number(this.form.id_prog_form)]
            : this.programas.map((programa) => Number(programa.id));

          if (programaIds.length) {
            const estructuras = await Promise.all(
              programaIds.map((id) =>
                api.get(`/progForm/${id}/estructura-curricular`).catch(() => ({
                  data: [],
                }))
              )
            );

            this.disciplinas =
              this.extraerDisciplinasDeEstructuras(estructuras);
            return;
          }
        }

        const res = await api.get("/disciplina");

        this.disciplinas = res.data.data;
      } catch (error) {
        console.error(error);
      }
    },
    extraerDisciplinasDeEstructuras(estructuras) {
      const mapa = new Map();

      estructuras.forEach((response) => {
        this.normalizeList(response.data).forEach((curriculo) => {
          this.normalizeList(curriculo.disciplinas).forEach((disciplina) => {
            mapa.set(Number(disciplina.id), {
              ...disciplina,
              nombre: `${disciplina.nombre} (${curriculo.nombre})`,
            });
          });
        });
      });

      return Array.from(mapa.values());
    },
    async obtenerProgramasDepartamento() {
      if (!this.departmentId) return;

      this.loadingProgramas = true;
      try {
        const res = await api.get(
          `/departamento/${this.departmentId}/carreras`
        );
        this.programas = this.normalizeList(res.data);

        if (!this.form.id_prog_form && this.programas.length === 1) {
          this.form.id_prog_form = Number(this.programas[0].id);
        }
      } catch (error) {
        console.error(error);
      } finally {
        this.loadingProgramas = false;
      }
    },
    async cambiarPrograma() {
      this.form.id_disciplina = [];
      this.form.id_a_academico = [];
      await Promise.all([
        this.obtenerDisciplinas(),
        this.obtenerAniosAcademicos(),
      ]);
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

        const carreras = this.programas.length
          ? this.programas
          : this.normalizeList(carrerasRes.data);
        const programasPorId = carreras.reduce((acc, carrera) => {
          acc[Number(carrera.id)] = carrera.nombre;
          return acc;
        }, {});
        const idsProgramas = this.form.id_prog_form
          ? [Number(this.form.id_prog_form)]
          : Object.keys(programasPorId).map(Number);

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
    setExamenFinal(value) {
      const activo = this.toBooleanFlag(value);

      this.form.tiene_examen_final = activo;

      if (activo) {
        this.form.tiene_trabajo_curso = false;
      }
    },
    setTrabajoCurso(value) {
      const activo = this.toBooleanFlag(value);

      this.form.tiene_trabajo_curso = activo;

      if (activo) {
        this.form.tiene_examen_final = false;
      }
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
        id_prog_form:
          this.programas.length === 1 ? Number(this.programas[0].id) : null,
      };
      this.$emit("cerrado");
    },
    asignaturaPayload() {
      const tieneExamenFinal = this.toBooleanFlag(this.form.tiene_examen_final);
      const tieneTrabajoCurso =
        !tieneExamenFinal && this.toBooleanFlag(this.form.tiene_trabajo_curso);

      return {
        ...this.form,
        fondo_tiempo: this.fondoTiempoTotal,
        horas_clase: Number(this.form.horas_clase || 0),
        horas_practica_laboral: Number(this.form.horas_practica_laboral || 0),
        tiene_examen_final: tieneExamenFinal,
        tiene_trabajo_curso: tieneTrabajoCurso,
      };
    },
  },

  mounted() {
    this.obtenerProgramasDepartamento().then(() => {
      this.obtenerDisciplinas();
      this.obtenerAniosAcademicos();
    });
  },
};
</script>
