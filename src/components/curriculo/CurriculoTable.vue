<template>
  <v-card class="modern-table">
    <v-data-table
      :headers="headers"
      :items="curriculosFiltrados"
      :loading="loading"
      class="elevation-1"
    >
      <template v-slot:[`item.acciones`]="{ item }">
        <v-btn
          icon
          color="primary"
          variant="text"
          @click="$emit('editar', item)"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>

        <v-btn icon color="red" variant="text" @click="$emit('eliminar', item)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import api from "@/services/api";
export default {
  props: {
    search: String,
  },
  data() {
    return {
      curriculos: [],
      contextoDepartamento: null,
      loading: false,
      headers: [
        { title: "Código", key: "id" },
        { title: "Nombre del currículo", key: "nombre" },
        { title: "Disciplinas", key: "disciplinas" },
        { title: "Acciones", key: "acciones", sortable: false },
      ],
    };
  },
  computed: {
    // 🔥 FILTRO AQUÍ (NO EN EL LISTVIEW)
    curriculosFiltrados() {
      if (!this.search) return this.curriculos;

      return this.curriculos.filter(
        (d) =>
          d.nombre.toLowerCase().includes(this.search.toLowerCase()) ||
          String(d.id).includes(this.search)
      );
    },
  },
  methods: {
    async obtenerCurriculos() {
      try {
        this.loading = true;
        this.contextoDepartamento = await this.cargarContextoDepartamento();

        const [resCur, resRel] = await Promise.all([
          api.get("/curriculo"),
          api.get("/curriculo_disciplina"),
        ]);

        const curriculos = resCur.data.data;
        const relaciones = resRel.data.data;

        // contar disciplinas por currículo
        this.curriculos = curriculos
          .filter(
            (c) =>
              !this.contextoDepartamento ||
              this.contextoDepartamento.curriculoIds.has(Number(c.id))
          )
          .map((c) => {
            const cantidad = relaciones.filter((r) => {
              if (r.id_curriculo !== c.id) return false;
              if (!this.contextoDepartamento) return true;
              return this.contextoDepartamento.disciplinaIds.has(
                Number(r.id_disciplina)
              );
            }).length;

            return {
              ...c,
              disciplinas: cantidad,
            };
          });

        console.log(this.curriculos);
      } catch (error) {
        console.error("Error al cargar disciplinas:", error);
      } finally {
        this.loading = false;
      }
    },
    normalizeList(payload) {
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    },
    getDepartmentId() {
      const access = this.$store.getters.authAccess || [];
      const jefe = access.find(
        (item) => item?.active && item?.role === "jefe_departamento"
      );
      return jefe?.departamento_id ?? jefe?.id_departamento ?? null;
    },
    async cargarContextoDepartamento() {
      const departmentId = this.getDepartmentId();
      if (!departmentId) return null;

      const carrerasRes = await api.get(
        `/departamento/${departmentId}/carreras`
      );
      const programaIds = this.normalizeList(carrerasRes.data).map((programa) =>
        Number(programa.id)
      );
      const estructuras = await Promise.all(
        programaIds.map((id) =>
          api.get(`/progForm/${id}/estructura-curricular`).catch(() => ({
            data: [],
          }))
        )
      );
      const curriculoIds = new Set();
      const disciplinaIds = new Set();

      estructuras.forEach((response) => {
        this.normalizeList(response.data).forEach((curriculo) => {
          curriculoIds.add(Number(curriculo.id));
          this.normalizeList(curriculo.disciplinas).forEach((disciplina) => {
            disciplinaIds.add(Number(disciplina.id));
          });
        });
      });

      return { programaIds, curriculoIds, disciplinaIds };
    },
  },
  mounted() {
    this.obtenerCurriculos();
  },
};
</script>
<style scoped>
.modern-table {
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}
.modern-table :deep(th) {
  font-weight: 700;
  color: #0f172a;
  font-size: 13.5px;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}
.modern-table :deep(thead) {
  background: linear-gradient(to right, #f8fafc, #f1f5f9);
}
</style>
