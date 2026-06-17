<template>
  <v-card class="modern-table">
    <v-data-table
      :headers="headers"
      :items="disciplinasFiltradas"
      :loading="loading"
      item-value="id"
      show-expand
      class="elevation-1"
    >
      <template v-slot:[`item.curriculos`]="{ item }">
        <v-chip
          v-for="c in item.nombresCurriculos"
          :key="c"
          class="ma-1"
          color="primary"
          size="small"
        >
          {{ c }}
        </v-chip>
      </template>

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

      <template v-slot:expanded-row="{ columns, item }">
        <tr>
          <td :colspan="columns.length" class="expanded-cell">
            <div class="asignaturas-panel">
              <div class="asignaturas-title">
                <v-icon color="primary">mdi-book-education-outline</v-icon>
                <strong>Asignaturas de {{ item.nombre }}</strong>
              </div>

              <v-alert
                v-if="!normalizeList(item.asignaturas).length"
                type="info"
                variant="tonal"
                density="compact"
              >
                Esta disciplina no tiene asignaturas asociadas.
              </v-alert>

              <div v-else class="asignaturas-grid">
                <div
                  v-for="asignatura in normalizeList(item.asignaturas)"
                  :key="asignatura.id"
                  class="asignatura-card"
                >
                  <strong>{{ asignatura.nombre }}</strong>
                  <span>{{ asignatura.fondo_tiempo || 0 }} h</span>
                  <small>
                    Clase: {{ asignatura.horas_clase || 0 }} h · Practica:
                    {{ asignatura.horas_practica_laboral || 0 }} h
                  </small>
                </div>
              </div>
            </div>
          </td>
        </tr>
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
      disciplinas: [],
      contextoDepartamento: null,
      loading: false,
      headers: [
        { title: "Código", key: "id" },
        { title: "Nombre de la disciplina", key: "nombre" },
        { title: "Fondo de Tiempo", key: "fondo_tiempo" },
        { title: "Currículos", key: "curriculos" },
        { title: "Acciones", key: "acciones", sortable: false },
      ],
    };
  },
  computed: {
    // 🔥 FILTRO AQUÍ (NO EN EL LISTVIEW)
    disciplinasFiltradas() {
      if (!this.search) return this.disciplinas;

      return this.disciplinas.filter(
        (d) =>
          d.nombre.toLowerCase().includes(this.search.toLowerCase()) ||
          String(d.id).includes(this.search)
      );
    },
  },
  methods: {
    normalizeList(payload) {
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    },
    async obtenerDisciplinas() {
      try {
        this.loading = true;
        this.contextoDepartamento = await this.cargarContextoDepartamento();
        const [resDis, resCur, resRel] = await Promise.all([
          api.get("/disciplina"),
          api.get("/curriculo"),
          api.get("/curriculo_disciplina"),
        ]);
        const disciplinas = resDis.data.data;
        const curriculos = resCur.data.data;
        const relaciones = resRel.data.data;
        const mapaCurriculos = {};
        curriculos.forEach((c) => {
          mapaCurriculos[c.id] = c.nombre;
        });

        this.disciplinas = disciplinas
          .filter(
            (d) =>
              !this.contextoDepartamento ||
              this.contextoDepartamento.disciplinaIds.has(Number(d.id))
          )
          .map((d) => {
            const rel = relaciones.filter((r) => {
              if (r.id_disciplina !== d.id) return false;
              if (!this.contextoDepartamento) return true;
              return this.contextoDepartamento.curriculoIds.has(
                Number(r.id_curriculo)
              );
            });

            const nombresCurriculos = rel.map(
              (r) => mapaCurriculos[r.id_curriculo]
            );

            return {
              ...d,
              asignaturas: this.contextoDepartamento
                ? this.normalizeList(d.asignaturas).filter((asignatura) =>
                    this.contextoDepartamento.asignaturaIds.has(
                      Number(asignatura.id)
                    )
                  )
                : d.asignaturas,
              nombresCurriculos,
            };
          });
      } catch (error) {
        console.error("Error al cargar disciplinas:", error);
      } finally {
        this.loading = false;
      }
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
      const asignaturaIds = new Set();

      estructuras.forEach((response) => {
        this.normalizeList(response.data).forEach((curriculo) => {
          curriculoIds.add(Number(curriculo.id));
          this.normalizeList(curriculo.disciplinas).forEach((disciplina) => {
            disciplinaIds.add(Number(disciplina.id));
            this.normalizeList(disciplina.asignaturas).forEach((asignatura) => {
              asignaturaIds.add(Number(asignatura.id));
            });
          });
        });
      });

      return { programaIds, curriculoIds, disciplinaIds, asignaturaIds };
    },
  },
  mounted() {
    this.obtenerDisciplinas();
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

.expanded-cell {
  background: #f8fafc;
  padding: 0 !important;
}

.asignaturas-panel {
  display: grid;
  gap: 12px;
  padding: 16px 22px;
  border-top: 1px solid #e2e8f0;
}

.asignaturas-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #0f172a;
}

.asignaturas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
}

.asignatura-card {
  display: grid;
  gap: 4px;
  padding: 12px;
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  background: #ffffff;
}

.asignatura-card span {
  color: #2563eb;
  font-weight: 700;
}

.asignatura-card small {
  color: #64748b;
}
</style>
