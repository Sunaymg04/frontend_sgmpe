<template>
  <v-container>
    <div class="page-header">
      <div>
        <h2 class="mb-1">Planes de estudio</h2>
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

        <template v-slot:[`item.acciones`]="{ item }">
          <v-btn
            icon
            variant="text"
            color="primary"
            :loading="detalleLoading && planDetalle?.id === item.id"
            @click="abrirDetalle(item)"
          >
            <v-icon>mdi-eye-outline</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialogCrear" max-width="1080" persistent>
      <v-card class="wizard-card">
        <div class="wizard-header">
          <div>
            <div class="text-h6 font-weight-bold">Crear plan de estudio</div>
            <div class="text-body-2 text-medium-emphasis">
              Complete la estructura desde la carrera hasta las asignaturas
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
            <div class="wizard-grid">
              <v-alert
                v-if="!departmentId"
                type="warning"
                variant="tonal"
                density="comfortable"
                class="grid-full"
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

              <v-select
                v-model="form.id_modalidad"
                :items="modalidadesPrograma"
                item-title="nombre"
                item-value="id"
                label="Modalidad"
                prepend-inner-icon="mdi-book-open-variant"
                variant="outlined"
                rounded="lg"
                :loading="loadingModalities"
                :disabled="loadingModalities || !form.id_prog_form"
              />

              <v-text-field
                :model-value="calificacionSeleccionada?.nombre || ''"
                label="Calificación"
                prepend-inner-icon="mdi-certificate-outline"
                variant="outlined"
                rounded="lg"
                readonly
              />

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
            </div>
          </section>

          <section v-else-if="step === 2">
            <div class="section-heading">
              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  Currículos del plan
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Seleccione uno o varios currículos para componer el plan.
                </div>
              </div>
              <v-progress-circular
                v-if="loadingCurriculos"
                indeterminate
                color="primary"
                size="28"
              />
            </div>

            <v-alert
              v-if="form.id_prog_form && !estructuraTieneAsignaturas"
              type="info"
              variant="tonal"
              density="comfortable"
              class="mb-4"
            >
              No hay disciplinas ni asignaturas cargadas para el programa
              seleccionado.
            </v-alert>

            <div class="curriculo-grid">
              <button
                v-for="curriculo in curriculos"
                :key="curriculo.id"
                type="button"
                class="curriculo-card"
                :class="{ selected: isCurriculoSelected(curriculo.id) }"
                @click="toggleCurriculo(curriculo.id)"
              >
                <span class="selection-dot">
                  <v-icon size="16">
                    {{
                      isCurriculoSelected(curriculo.id)
                        ? "mdi-check"
                        : "mdi-plus"
                    }}
                  </v-icon>
                </span>
                <strong>{{ curriculo.nombre }}</strong>
                <small>
                  {{ curriculo.disciplinas.length }} disciplinas ·
                  {{ countAsignaturas(curriculo) }} asignaturas
                </small>
              </button>
            </div>
          </section>

          <section v-else-if="step === 3">
            <div class="section-heading">
              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  Estructura resultante
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Las asignaturas se muestran agrupadas por currículo y
                  disciplina.
                </div>
              </div>
            </div>

            <v-expansion-panels variant="accordion" multiple>
              <v-expansion-panel
                v-for="curriculo in curriculosSeleccionados"
                :key="curriculo.id"
                class="tree-panel"
              >
                <v-expansion-panel-title>
                  <div class="panel-title">
                    <v-icon color="primary">mdi-file-tree-outline</v-icon>
                    <span>{{ curriculo.nombre }}</span>
                    <v-chip size="small" color="primary" variant="tonal">
                      {{ curriculo.disciplinas.length }} disciplinas
                    </v-chip>
                  </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <div
                    v-for="disciplina in curriculo.disciplinas"
                    :key="disciplina.id"
                    class="disciplina-block"
                  >
                    <div class="disciplina-title">
                      <v-icon size="18" color="secondary">
                        mdi-book-open-page-variant
                      </v-icon>
                      <strong>{{ disciplina.nombre }}</strong>
                      <span>{{ disciplina.fondo_tiempo || 0 }} h</span>
                    </div>

                    <div class="asignatura-list">
                      <div
                        v-for="asignatura in disciplina.asignaturas"
                        :key="asignatura.id"
                        class="asignatura-row"
                      >
                        <div>
                          <strong>{{ asignatura.nombre }}</strong>
                          <span>{{ asignatura.fondo_tiempo || 0 }} h</span>
                        </div>
                        <div class="anio-chip-list">
                          <v-chip
                            v-for="anio in asignatura.anios"
                            :key="anio.id"
                            size="small"
                            variant="outlined"
                          >
                            {{ anio.identificador }}
                          </v-chip>
                          <v-chip
                            v-if="!asignatura.anios.length"
                            size="small"
                            color="warning"
                            variant="tonal"
                          >
                            Sin año
                          </v-chip>
                        </div>
                      </div>
                    </div>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </section>

          <section v-else>
            <v-card class="summary-card" elevation="0">
              <div class="text-subtitle-2 font-weight-bold mb-2">
                Resumen del plan
              </div>
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
              <div class="summary-row">
                <span>Currículos</span>
                <strong>{{ curriculosSeleccionados.length }}</strong>
              </div>
            </v-card>

            <div class="review-tree">
              <div
                v-for="curriculo in curriculosSeleccionados"
                :key="curriculo.id"
                class="review-block"
              >
                <div class="review-title">
                  <v-icon color="primary"
                    >mdi-file-document-edit-outline</v-icon
                  >
                  <strong>{{ curriculo.nombre }}</strong>
                </div>
                <div
                  v-for="disciplina in curriculo.disciplinas"
                  :key="disciplina.id"
                  class="review-disciplina"
                >
                  <span>{{ disciplina.nombre }}</span>
                  <small>{{ disciplina.asignaturas.length }} asignaturas</small>
                </div>
              </div>
            </div>
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
            v-if="step < steps.length"
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

    <v-dialog v-model="dialogDetalle" max-width="1180">
      <v-card class="detail-card">
        <div class="detail-header">
          <div>
            <div class="text-overline text-primary font-weight-bold">
              Plan del proceso docente
            </div>
            <div class="text-h6 font-weight-bold">
              {{ planDetalle?.nombre || "Plan de estudio" }}
            </div>
          </div>
          <v-btn icon variant="text" @click="cerrarDetalle">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <v-card-text class="px-0">
          <v-alert
            v-if="detalleError"
            type="error"
            variant="tonal"
            density="comfortable"
            class="mb-4"
          >
            {{ detalleError }}
          </v-alert>

          <div v-if="detalleLoading" class="detail-loading">
            <v-progress-circular indeterminate color="primary" />
            <span>Cargando estructura del plan...</span>
          </div>

          <template v-else>
            <div class="plan-cover">
              <div class="cover-main">
                <strong>
                  {{ detallePrograma || "Programa de formación" }}
                </strong>
                <small>Plan de estudio</small>
              </div>
              <div class="cover-meta">
                <div>
                  <span>Modalidad</span>
                  <strong>{{ detalleModalidad || "-" }}</strong>
                </div>
                <div>
                  <span>Calificación</span>
                  <strong>{{ detalleCalificacion || "-" }}</strong>
                </div>
                <div>
                  <span>Curso</span>
                  <strong>{{ detalleCurso || "-" }}</strong>
                </div>
              </div>
            </div>

            <div class="detail-metrics">
              <div>
                <span>Currículos</span>
                <strong>{{ detalleStats.curriculos }}</strong>
              </div>
              <div>
                <span>Disciplinas</span>
                <strong>{{ detalleStats.disciplinas }}</strong>
              </div>
              <div>
                <span>Asignaturas</span>
                <strong>{{ detalleStats.asignaturas }}</strong>
              </div>
              <div>
                <span>Horas registradas</span>
                <strong>{{ detalleStats.horas }} h</strong>
              </div>
            </div>

            <v-alert
              v-if="!detalleCurriculos.length"
              type="info"
              variant="tonal"
              density="comfortable"
              class="mb-4"
            >
              Este plan no tiene currículos asociados o aún no se pudo resolver
              su estructura.
            </v-alert>

            <div
              v-for="curriculo in detalleCurriculos"
              :key="curriculo.id"
              class="detail-curriculo"
            >
              <div class="curriculo-detail-title">
                <div>
                  <span>Currículo</span>
                  <strong>{{ curriculo.nombre }}</strong>
                </div>
                <v-chip color="primary" variant="tonal" size="small">
                  {{ countAsignaturas(curriculo) }} asignaturas
                </v-chip>
              </div>

              <div class="detail-table">
                <div class="detail-table-head">
                  <span>Disciplina y asignatura</span>
                  <span>Total</span>
                  <span>Clase</span>
                  <span>Práctica laboral</span>
                  <span>Año académico</span>
                </div>

                <template
                  v-for="disciplina in curriculo.disciplinas"
                  :key="disciplina.id"
                >
                  <div class="detail-disciplina-row">
                    <span>{{ disciplina.nombre }}</span>
                    <strong>{{ disciplina.fondo_tiempo || 0 }} h</strong>
                    <strong>{{ disciplina.horas_clase || 0 }} h</strong>
                    <strong>
                      {{ disciplina.horas_practica_laboral || 0 }} h
                    </strong>
                    <small>
                      {{ disciplina.asignaturas.length }} asignaturas
                    </small>
                  </div>

                  <div
                    v-for="asignatura in disciplina.asignaturas"
                    :key="asignatura.id"
                    class="detail-asignatura-row"
                  >
                    <span>{{ asignatura.nombre }}</span>
                    <strong>{{ asignatura.fondo_tiempo || 0 }} h</strong>
                    <strong>
                      {{
                        asignatura.horas_clase !== undefined
                          ? asignatura.horas_clase
                          : asignatura.fondo_tiempo || 0
                      }}
                      h
                    </strong>
                    <strong>
                      {{ asignatura.horas_practica_laboral || 0 }} h
                    </strong>
                    <div class="anio-chip-list">
                      <v-chip
                        v-for="anio in asignatura.anios"
                        :key="anio.id"
                        size="small"
                        variant="outlined"
                      >
                        {{ anio.identificador }}
                      </v-chip>
                      <v-chip
                        v-if="!asignatura.anios.length"
                        size="small"
                        color="warning"
                        variant="tonal"
                      >
                        Sin año
                      </v-chip>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </template>
        </v-card-text>
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
      curriculos: [],
      dialogCrear: false,
      dialogDetalle: false,
      step: 1,
      steps: ["Datos base", "Currículos", "Estructura", "Resumen"],
      formError: "",
      detalleError: "",
      loadingPrograms: false,
      loadingModalities: false,
      loadingCourses: false,
      loadingCurriculos: false,
      detalleLoading: false,
      saving: false,
      planDetalle: null,
      detalleCurriculos: [],
      form: {
        id_prog_form: null,
        id_modalidad: null,
        id_calificacion: null,
        id_curso: null,
        id_curriculo: [],
      },
      headers: [
        { title: "Código", key: "id" },
        { title: "Nombre", key: "nombre" },
        { title: "Programa de formación", key: "programa" },
        { title: "Modalidad", key: "modalidad" },
        { title: "Calificación", key: "calificacion" },
        { title: "Curso", key: "curso" },
        { title: "Acciones", key: "acciones", sortable: false, align: "end" },
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
    curriculosSeleccionados() {
      return this.curriculos.filter((item) =>
        this.form.id_curriculo.includes(Number(item.id))
      );
    },
    estructuraTieneAsignaturas() {
      return this.curriculos.some((curriculo) =>
        curriculo.disciplinas.some(
          (disciplina) => disciplina.asignaturas.length > 0
        )
      );
    },
    detallePrograma() {
      return (
        this.getNestedName(this.planDetalle, [
          "programa_formacion",
          "programa_nombre",
          "programa",
        ]) || this.planDetalle?.programa_nombre
      );
    },
    detalleModalidad() {
      return (
        this.getNestedName(this.planDetalle, [
          "modalidad",
          "modalidad_carrera",
          "modalidad_nombre",
        ]) || this.planDetalle?.modalidad_nombre
      );
    },
    detalleCalificacion() {
      return (
        this.getNestedName(this.planDetalle, [
          "calificacion",
          "calificacion_nombre",
        ]) || this.planDetalle?.calificacion_nombre
      );
    },
    detalleCurso() {
      return (
        this.getNestedName(this.planDetalle, ["curso", "curso_nombre"]) ||
        this.planDetalle?.curso_nombre
      );
    },
    detalleStats() {
      const stats = {
        curriculos: this.detalleCurriculos.length,
        disciplinas: 0,
        asignaturas: 0,
        horas: 0,
      };

      this.detalleCurriculos.forEach((curriculo) => {
        stats.disciplinas += curriculo.disciplinas.length;
        curriculo.disciplinas.forEach((disciplina) => {
          stats.asignaturas += disciplina.asignaturas.length;
          disciplina.asignaturas.forEach((asignatura) => {
            stats.horas += Number(asignatura.fondo_tiempo || 0);
          });
        });
      });

      return stats;
    },
  },
  methods: {
    normalizeList(payload) {
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    },
    normalizeModalidades(payload) {
      if (Array.isArray(payload?.data?.modalidades)) {
        return payload.data.modalidades;
      }
      if (Array.isArray(payload?.modalidades)) {
        return payload.modalidades;
      }
      return this.normalizeList(payload);
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
          this.getFirst(["/modalidad", "/modalidad_carrera"]).catch(() => ({
            data: [],
          })),
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
    async abrirDetalle(plan) {
      this.dialogDetalle = true;
      this.detalleLoading = true;
      this.detalleError = "";
      this.planDetalle = plan;
      this.detalleCurriculos = [];

      try {
        const [planRes, curriculos] = await Promise.all([
          api.get(`/plan_estudio/${plan.id}`),
          this.cargarCurriculosArbol(plan.id_prog_form),
        ]);

        const planData = planRes?.data?.data || planRes?.data || plan;
        this.planDetalle = {
          ...plan,
          ...planData,
          programa_nombre: plan.programa_nombre,
          modalidad_nombre: plan.modalidad_nombre,
          calificacion_nombre: plan.calificacion_nombre,
          curso_nombre: plan.curso_nombre,
        };

        const ids = this.normalizeList(planData.curriculos).map((item) =>
          Number(item.id)
        );
        this.detalleCurriculos = curriculos.filter((curriculo) =>
          ids.includes(Number(curriculo.id))
        );
      } catch (error) {
        console.error(error);
        this.detalleError = "No fue posible cargar el detalle del plan.";
      } finally {
        this.detalleLoading = false;
      }
    },
    cerrarDetalle() {
      this.dialogDetalle = false;
      this.detalleError = "";
      this.planDetalle = null;
      this.detalleCurriculos = [];
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
      this.curriculos = [];
      this.form = {
        id_prog_form: null,
        id_modalidad: null,
        id_calificacion: null,
        id_curso: null,
        id_curriculo: [],
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
      this.curriculos = [];
      if (!this.form.id_prog_form) return;

      const idCalificacion =
        this.selectedProgram?.id_calificacion ??
        this.selectedProgram?.calificacion?.id ??
        null;
      if (idCalificacion) this.form.id_calificacion = Number(idCalificacion);

      await Promise.all([
        this.cargarModalidades(),
        this.cargarCalificacion(),
        this.cargarCurriculos(),
      ]);
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
        this.modalidades = this.normalizeModalidades(modalidadesRes.data);
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
        this.getFirst(["/progFormMod", "/prog_form_modalidad_carrera"]),
        this.getFirst(["/modalidad", "/modalidad_carrera"]),
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
    async cargarCurriculos() {
      this.loadingCurriculos = true;
      try {
        this.curriculos = await this.cargarCurriculosArbol();
      } catch (error) {
        console.error(error);
        this.formError = "No fue posible cargar los currículos.";
      } finally {
        this.loadingCurriculos = false;
      }
    },
    async cargarCurriculosArbol(programaId = this.form.id_prog_form) {
      const endpoints = programaId
        ? [`/progForm/${programaId}/estructura-curricular`]
        : ["/curriculo/arbol", "/curriculo"];
      const res = await this.getFirst(endpoints);
      return this.normalizeList(res.data).map((curriculo) => ({
        ...curriculo,
        disciplinas: this.normalizeList(curriculo.disciplinas).map(
          (disciplina) => ({
            ...disciplina,
            asignaturas: this.normalizeList(disciplina.asignaturas).map(
              (asignatura) => ({
                ...asignatura,
                anios: this.normalizeList(
                  asignatura.anios || asignatura.anios_academicos
                ),
              })
            ),
          })
        ),
      }));
    },
    toggleCurriculo(id) {
      const normalizedId = Number(id);
      if (this.form.id_curriculo.includes(normalizedId)) {
        this.form.id_curriculo = this.form.id_curriculo.filter(
          (item) => item !== normalizedId
        );
        return;
      }

      this.form.id_curriculo = [...this.form.id_curriculo, normalizedId];
    },
    isCurriculoSelected(id) {
      return this.form.id_curriculo.includes(Number(id));
    },
    countAsignaturas(curriculo) {
      return curriculo.disciplinas.reduce(
        (total, disciplina) => total + disciplina.asignaturas.length,
        0
      );
    },
    siguiente() {
      this.formError = "";
      if (this.step === 1) {
        if (!this.form.id_prog_form) {
          this.formError = "Seleccione un programa de formación.";
          return;
        }
        if (!this.form.id_modalidad) {
          this.formError = "Seleccione una modalidad.";
          return;
        }
        if (!this.form.id_calificacion) {
          this.formError =
            "El programa seleccionado no tiene una calificación asociada.";
          return;
        }
        if (!this.form.id_curso) {
          this.formError = "Seleccione un curso.";
          return;
        }
      }
      if (this.step === 2 && !this.form.id_curriculo.length) {
        this.formError = "Seleccione al menos un currículo.";
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
        const programaNombre = this.selectedProgram?.nombre || "programa";
        await api.post("/plan_estudio", {
          id_prog_form: Number(this.form.id_prog_form),
          id_modalidad: Number(this.form.id_modalidad),
          id_calificacion: Number(this.form.id_calificacion),
          id_curso: Number(this.form.id_curso),
          id_curriculo: this.form.id_curriculo.map(Number),
        });
        this.dialogCrear = false;
        this.resetForm();
        await this.cargarPlanes();
        toast.success("Plan de estudio creado correctamente");
        this.$store.dispatch("registerActivity", {
          type: "plan_estudio",
          label: `Creó un plan de estudio para ${programaNombre}`,
        });
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

.detail-card {
  padding: 28px;
  border-radius: 8px !important;
}

.detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.detail-loading {
  display: flex;
  min-height: 260px;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #475569;
  font-weight: 600;
}

.plan-cover {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
  gap: 16px;
  margin-bottom: 16px;
  padding: 18px;
  border: 1px solid #dbe4ee;
  border-radius: 8px;
  background: #f8fafc;
}

.cover-main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  min-width: 0;
}

.cover-main span,
.cover-main small,
.cover-meta span,
.detail-metrics span,
.curriculo-detail-title span {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.cover-main strong {
  color: #0f172a;
  font-size: 22px;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.cover-meta {
  display: grid;
  gap: 8px;
}

.cover-meta div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
}

.cover-meta strong {
  text-align: right;
  overflow-wrap: anywhere;
}

.detail-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.detail-metrics div {
  padding: 14px;
  border: 1px solid #dbe4ee;
  border-radius: 8px;
  background: #ffffff;
}

.detail-metrics strong {
  display: block;
  margin-top: 6px;
  color: #0f172a;
  font-size: 22px;
}

.detail-curriculo {
  margin-bottom: 18px;
  border: 1px solid #dbe4ee;
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
}

.curriculo-detail-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  background: #f8fafc;
}

.curriculo-detail-title strong {
  display: block;
  margin-top: 2px;
  color: #0f172a;
  font-size: 16px;
}

.detail-table {
  display: grid;
}

.detail-table-head,
.detail-disciplina-row,
.detail-asignatura-row {
  display: grid;
  grid-template-columns:
    minmax(220px, 1.45fr)
    minmax(78px, 0.35fr)
    minmax(78px, 0.35fr)
    minmax(130px, 0.5fr)
    minmax(160px, 0.7fr);
  align-items: center;
  gap: 12px;
}

.detail-table-head {
  padding: 10px 16px;
  color: #334155;
  background: #edf2f7;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

.detail-table-head span:nth-child(n + 2),
.detail-disciplina-row strong,
.detail-disciplina-row small,
.detail-asignatura-row strong,
.detail-asignatura-row .anio-chip-list {
  text-align: right;
}

.detail-disciplina-row {
  padding: 12px 16px;
  color: #0f172a;
  background: #f8fafc;
  border-top: 1px solid #dbe4ee;
}

.detail-disciplina-row span {
  font-weight: 800;
}

.detail-disciplina-row small {
  color: #64748b;
  font-weight: 700;
  text-align: right;
}

.detail-asignatura-row {
  padding: 10px 16px 10px 34px;
  border-top: 1px solid #edf2f7;
}

.detail-asignatura-row span {
  min-width: 0;
  overflow-wrap: anywhere;
}

.detail-asignatura-row strong,
.detail-disciplina-row strong {
  color: #334155;
}

.detail-asignatura-row .anio-chip-list,
.detail-disciplina-row small {
  justify-content: flex-end;
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

.wizard-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.grid-full {
  grid-column: 1 / -1;
}

.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.curriculo-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.curriculo-card {
  position: relative;
  display: flex;
  min-height: 132px;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 8px;
  padding: 18px;
  border: 1px solid #d6dee8;
  border-radius: 8px;
  color: #18212f;
  background: #ffffff;
  text-align: left;
  transition: border-color 0.16s ease, box-shadow 0.16s ease,
    transform 0.16s ease;
}

.curriculo-card:hover {
  border-color: #2563eb;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.12);
  transform: translateY(-1px);
}

.curriculo-card.selected {
  border-color: #2563eb;
  background: #f8fbff;
  box-shadow: inset 0 0 0 1px #2563eb;
}

.curriculo-card strong {
  font-size: 15px;
  line-height: 1.25;
}

.curriculo-card small {
  color: #64748b;
  font-size: 12px;
}

.selection-dot {
  position: absolute;
  top: 14px;
  right: 14px;
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 50%;
  color: #2563eb;
  background: #eff6ff;
}

.curriculo-card.selected .selection-dot {
  color: #ffffff;
  background: #2563eb;
}

.tree-panel {
  margin-bottom: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px !important;
}

.panel-title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.disciplina-block {
  padding: 14px 0;
  border-top: 1px solid #e2e8f0;
}

.disciplina-block:first-child {
  border-top: 0;
}

.disciplina-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  color: #172033;
}

.disciplina-title span,
.asignatura-row span {
  margin-left: auto;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.asignatura-list {
  display: grid;
  gap: 8px;
}

.asignatura-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid #eef2f7;
  border-radius: 8px;
  background: #fbfdff;
}

.asignatura-row > div:first-child {
  display: flex;
  min-width: 0;
  flex: 1;
  gap: 10px;
}

.asignatura-row strong {
  overflow-wrap: anywhere;
}

.anio-chip-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
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

.summary-row strong {
  text-align: right;
}

.review-tree {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.review-block {
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
}

.review-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.review-disciplina {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 0;
  border-top: 1px solid #edf2f7;
}

.review-disciplina small {
  color: #64748b;
  white-space: nowrap;
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

  .wizard-card {
    padding: 18px;
  }

  .detail-card {
    padding: 18px;
  }

  .plan-cover,
  .wizard-grid,
  .curriculo-grid,
  .review-tree,
  .detail-metrics {
    grid-template-columns: 1fr;
  }

  .cover-meta div,
  .curriculo-detail-title {
    align-items: flex-start;
    flex-direction: column;
  }

  .cover-meta strong {
    text-align: left;
  }

  .detail-table-head {
    display: none;
  }

  .detail-disciplina-row,
  .detail-asignatura-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .detail-disciplina-row strong,
  .detail-disciplina-row small,
  .detail-asignatura-row strong,
  .detail-asignatura-row .anio-chip-list {
    text-align: left;
    justify-content: flex-start;
  }

  .detail-asignatura-row {
    padding-left: 18px;
  }

  .asignatura-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .anio-chip-list {
    justify-content: flex-start;
  }
}
</style>
