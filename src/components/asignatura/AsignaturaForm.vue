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

          <!-- Fondo tiempo -->
          <v-text-field
            v-model="form.fondo_tiempo"
            label="Fondo de tiempo"
            type="number"
            variant="outlined"
            rounded="lg"
            prepend-inner-icon="mdi-timer-outline"
            class="mb-4"
          />

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

      form: {
        id: null,
        nombre: "",
        fondo_tiempo: "",
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
      try {
        const res = await api.get("/a_academico");

        this.aniosAcademicos = res.data.data.map((a) => ({
          ...a,
          nombre_completo: `${a.identificador} - ${a.programa_formacion.nombre}`,
        }));
      } catch (error) {
        console.error(error);
      }
    },

    async guardar() {
      try {
        // EDITAR

        if (this.form.id) {
          await api.put(`/asignatura/${this.form.id}`, this.form);
        }

        // CREAR
        else {
          await api.post("/asignatura", this.form);
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
        id_disciplina: [],
        id_a_academico: [],
      };
      this.$emit("cerrado");
    },
  },

  mounted() {
    this.obtenerDisciplinas();

    this.obtenerAniosAcademicos();
  },
};
</script>
