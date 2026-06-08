<template>
  <v-dialog
    v-model="dialog"
    max-width="650"
    transition="dialog-bottom-transition"
  >
    <v-card class="rounded-xl pa-2">
      <!-- Header -->
      <v-card-title class="text-h5 font-weight-bold d-flex align-center">
        <v-icon class="mr-2" color="primary">
          mdi-book-open-page-variant
        </v-icon>

        {{ form.id ? "Editar Disciplina" : "Crear Disciplina" }}
      </v-card-title>

      <!-- Form -->
      <v-card-text>
        <v-form>
          <!-- Nombre -->
          <v-text-field
            v-model="form.nombre"
            label="Nombre de la disciplina"
            variant="outlined"
            rounded="lg"
            prepend-inner-icon="mdi-book-outline"
            class="mb-4"
          />

          <!-- Fondo tiempo calculado -->
          <v-text-field
            :model-value="fondoTiempoCalculado"
            label="Fondo de tiempo calculado"
            type="number"
            variant="outlined"
            rounded="lg"
            prepend-inner-icon="mdi-timer-outline"
            class="mb-4"
            readonly
            disabled
          />

          <!-- Curriculo -->
          <v-select
            v-model="form.id_curriculo"
            :items="curriculos"
            item-title="nombre"
            item-value="id"
            label="Currículos"
            variant="outlined"
            rounded="lg"
            prepend-inner-icon="mdi-school-outline"
            multiple
            chips
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
    disciplina: Object,
  },

  emits: ["update:modelValue", "guardado", "error", "cerrado"],

  data() {
    return {
      curriculos: [],

      form: {
        id: null,
        nombre: "",
        fondo_tiempo: 0,
        id_curriculo: [],
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
    fondoTiempoCalculado() {
      return Number(this.form.fondo_tiempo || 0);
    },
  },
  watch: {
    disciplina: {
      immediate: true,

      handler(valor) {
        if (valor) {
          this.form = {
            id: valor.id,

            nombre: valor.nombre,

            fondo_tiempo: Number(valor.fondo_tiempo || 0),

            id_curriculo: Array.isArray(valor.curriculos)
              ? valor.curriculos.map((c) => Number(c.id))
              : [],
          };
        }
      },
    },
  },

  methods: {
    async obtenerCurriculos() {
      try {
        const res = await api.get("/curriculo");

        this.curriculos = res.data.data;
      } catch (error) {
        console.error(error);
      }
    },

    async guardar() {
      try {
        // EDITAR

        if (this.form.id) {
          await api.put(
            `/disciplina/${this.form.id}`,
            this.disciplinaPayload()
          );
        }

        // CREAR
        else {
          await api.post("/disciplina", this.disciplinaPayload());
        }

        this.cerrar();

        this.$nextTick(() => {
          this.$emit(
            "guardado",

            this.form.id
              ? "Disciplina actualizada correctamente"
              : "Disciplina creada correctamente"
          );
        });
      } catch (error) {
        console.error(error);

        this.$emit("error", "No se pudo guardar la disciplina");
      }
    },

    cerrar() {
      this.dialog = false;

      this.form = {
        id: null,
        nombre: "",
        fondo_tiempo: 0,
        id_curriculo: [],
      };
      this.$emit("cerrado");
    },
    disciplinaPayload() {
      return {
        id: this.form.id,
        nombre: this.form.nombre,
        id_curriculo: this.form.id_curriculo,
      };
    },
  },

  mounted() {
    this.obtenerCurriculos();
  },
};
</script>
