<template>
  <div class="dean-review">
    <div class="page-header">
      <div>
        <h2 class="mb-1">{{ pageTitle }}</h2>
        <p class="text-body-2 text-medium-emphasis mb-0">
          {{ pageSubtitle }}
        </p>
      </div>
      <v-btn icon variant="text" :loading="loading" @click="cargarSolicitudes">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </div>

    <div class="review-tabs">
      <v-btn
        :to="{ name: solicitudesRouteName }"
        :variant="isHistorial ? 'text' : 'flat'"
        color="primary"
      >
        <v-icon class="mr-2">mdi-clipboard-check-outline</v-icon>
        Pendientes
      </v-btn>
      <v-btn
        :to="{ name: historialRouteName }"
        :variant="isHistorial ? 'flat' : 'text'"
        color="primary"
      >
        <v-icon class="mr-2">mdi-history</v-icon>
        Historial
      </v-btn>
    </div>

    <v-alert
      v-if="requiresFaculty && !facultyId"
      type="warning"
      variant="tonal"
      density="comfortable"
      class="mb-4"
    >
      Este usuario no tiene facultad asociada.
    </v-alert>

    <v-card class="review-card" elevation="0">
      <v-card-text>
        <div v-if="loading" class="loading-state">
          <v-progress-circular indeterminate color="primary" />
          <span>Cargando solicitudes...</span>
        </div>

        <v-alert
          v-else-if="solicitudes.length === 0"
          type="info"
          variant="tonal"
          density="comfortable"
        >
          No hay solicitudes enviadas para revisar.
        </v-alert>

        <div v-else class="request-list">
          <v-card
            v-for="plan in solicitudes"
            :key="plan.id"
            class="request-item"
            elevation="0"
          >
            <div class="request-main">
              <div>
                <div class="text-overline text-primary font-weight-bold">
                  {{ plan.programa_formacion?.nombre || plan.programa_nombre }}
                </div>
                <h3>{{ plan.nombre }}</h3>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  Curso {{ plan.curso?.curso || plan.curso_nombre || "-" }} ·
                  {{ plan.modalidad?.nombre || plan.modalidad_nombre || "-" }}
                </p>
              </div>
              <v-chip
                :color="solicitudColor(plan)"
                variant="tonal"
                size="small"
              >
                {{ solicitudLabel(plan) }}
              </v-chip>
            </div>

            <div v-if="!planEsNuevo(plan)" class="changes-panel">
              <div class="changes-title">
                <v-icon color="secondary">mdi-compare-horizontal</v-icon>
                <strong>Cambios propuestos</strong>
              </div>
              <div
                v-for="line in resumenLineas(plan)"
                :key="line"
                class="change-line modified"
              >
                {{ line }}
              </div>
            </div>

            <v-alert
              v-else
              type="info"
              variant="tonal"
              density="comfortable"
              class="mt-4"
            >
              Se ha creado un nuevo plan de estudio para revisión.
            </v-alert>

            <div class="full-plan-actions">
              <v-btn
                variant="tonal"
                color="primary"
                :loading="detalleLoading === plan.id"
                @click="toggleDetallePlan(plan)"
              >
                <v-icon class="mr-2">
                  {{
                    detalleAbiertoId === plan.id
                      ? "mdi-eye-off-outline"
                      : "mdi-eye-outline"
                  }}
                </v-icon>
                {{
                  detalleAbiertoId === plan.id
                    ? "Ocultar plan"
                    : "Ver plan completo"
                }}
              </v-btn>
            </div>

            <v-expand-transition>
              <div v-if="detalleAbiertoId === plan.id" class="full-plan-panel">
                <v-alert
                  v-if="detalleError"
                  type="error"
                  variant="tonal"
                  density="comfortable"
                >
                  {{ detalleError }}
                </v-alert>

                <template v-else>
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
                  >
                    Este plan no tiene currículos asociados o aún no se pudo
                    resolver su estructura.
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
                          <strong>{{ asignatura.horas_clase || 0 }} h</strong>
                          <strong>
                            {{ asignatura.horas_practica_laboral || 0 }} h
                          </strong>
                          <div class="anio-chip-list">
                            <v-chip
                              v-for="anio in normalizeList(asignatura.anios)"
                              :key="anio.id || anio.identificador || anio"
                              size="small"
                              variant="outlined"
                            >
                              {{ anio.identificador || anio }}
                            </v-chip>
                            <v-chip
                              v-if="!normalizeList(asignatura.anios).length"
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
              </div>
            </v-expand-transition>

            <div v-if="!isHistorial" class="request-actions">
              <v-btn
                variant="outlined"
                color="error"
                :loading="accionLoading === `cancelar-${plan.id}`"
                :disabled="Boolean(accionLoading)"
                @click="cancelarSolicitud(plan)"
              >
                {{
                  planEsNuevo(plan) ? "Rechazar plan" : "Rechazar modificación"
                }}
              </v-btn>
              <v-btn
                color="success"
                :loading="accionLoading === `aprobar-${plan.id}`"
                :disabled="Boolean(accionLoading)"
                @click="aprobarSolicitud(plan)"
              >
                {{
                  planEsNuevo(plan) ? "Aprobar plan" : "Aprobar modificación"
                }}
              </v-btn>
            </div>
          </v-card>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import api from "@/services/api";
import { toast } from "vue-sonner";

export default {
  name: "SolicitudesModificacionView",
  data() {
    return {
      loading: false,
      accionLoading: "",
      solicitudes: [],
      detalleAbiertoId: null,
      detalleLoading: null,
      detalleError: "",
      detalleCurriculos: [],
    };
  },
  computed: {
    isHistorial() {
      return Boolean(this.$route?.meta?.historial);
    },
    reviewerRole() {
      return this.$route?.meta?.reviewerRole || "decano";
    },
    isViceDeanReview() {
      return this.reviewerRole === "vicedecano_docente";
    },
    requiresFaculty() {
      return !this.isViceDeanReview;
    },
    pageTitle() {
      return this.isViceDeanReview
        ? "Revisión Final Académica"
        : "Revisión Académica";
    },
    pageSubtitle() {
      return this.isViceDeanReview
        ? "Solicitudes aprobadas por el decano y enviadas para revisión final."
        : "Solicitudes enviadas por los departamentos de la facultad.";
    },
    solicitudesRouteName() {
      return this.isViceDeanReview
        ? "vicedecano_solicitudes"
        : "decano_solicitudes";
    },
    historialRouteName() {
      return this.isViceDeanReview
        ? "vicedecano_historial"
        : "decano_historial";
    },
    facultyId() {
      const access = this.$store.getters.authAccess || [];
      const reviewer = access.find(
        (item) => item?.active && item?.role === this.reviewerRole
      );
      return reviewer?.facultad_id ?? null;
    },
    solicitudesEndpoint() {
      return this.isViceDeanReview
        ? "/plan_estudio/vicedecano/solicitudes"
        : "/plan_estudio/decano/solicitudes";
    },
    historialEndpoint() {
      return this.isViceDeanReview
        ? "/plan_estudio/vicedecano/historial"
        : "/plan_estudio/decano/historial";
    },
    detalleStats() {
      const stats = {
        curriculos: this.detalleCurriculos.length,
        disciplinas: 0,
        asignaturas: 0,
        horas: 0,
      };

      this.detalleCurriculos.forEach((curriculo) => {
        stats.disciplinas += this.normalizeList(curriculo.disciplinas).length;
        this.normalizeList(curriculo.disciplinas).forEach((disciplina) => {
          stats.asignaturas += this.normalizeList(
            disciplina.asignaturas
          ).length;
          this.normalizeList(disciplina.asignaturas).forEach((asignatura) => {
            stats.horas += Number(asignatura.fondo_tiempo || 0);
          });
        });
      });

      return stats;
    },
  },
  methods: {
    async cargarSolicitudes() {
      if (this.requiresFaculty && !this.facultyId) return;

      this.loading = true;
      try {
        const endpoint = this.isHistorial
          ? this.historialEndpoint
          : this.solicitudesEndpoint;
        const params = this.requiresFaculty
          ? { facultad_id: this.facultyId }
          : {};
        const res = await api.get(endpoint, {
          params,
        });
        this.solicitudes = Array.isArray(res.data?.data) ? res.data.data : [];
      } catch (error) {
        console.error(error);
        toast.error("No se pudieron cargar las solicitudes");
      } finally {
        this.loading = false;
      }
    },
    planEsNuevo(plan) {
      return plan?.tipo_plan === "original";
    },
    solicitudLabelBase(plan) {
      if (this.isViceDeanReview) {
        return this.planEsNuevo(plan)
          ? "Nuevo plan para revisión final"
          : "Modificación para revisión final";
      }

      return this.planEsNuevo(plan) ? "Nuevo plan" : "Modificación enviada";
    },
    solicitudLabel(plan) {
      if (this.isHistorial) {
        return this.estadoSolicitudLabel(plan);
      }

      return this.solicitudLabelBase(plan);
    },
    solicitudColor(plan) {
      const estado = String(plan?.estado || "");
      if (estado === "vigente") return "success";
      if (["rechazado", "modificacion_cancelada"].includes(estado)) {
        return "error";
      }
      if (["enviado_decano", "enviado_vicedecano"].includes(estado)) {
        return "info";
      }
      if (this.planEsNuevo(plan)) return "primary";
      return "secondary";
    },
    estadoSolicitudLabel(plan) {
      const estado = String(plan?.estado || "");
      const labels = {
        enviado_decano: this.planEsNuevo(plan)
          ? "Nuevo plan pendiente"
          : "Modificación pendiente",
        enviado_vicedecano: this.isViceDeanReview
          ? "Pendiente de revisión final"
          : "Enviado al vicedecano docente",
        vigente: this.planEsNuevo(plan)
          ? "Plan aprobado"
          : "Modificación aprobada",
        rechazado: "Plan rechazado",
        modificacion_cancelada: this.isViceDeanReview
          ? "Modificación rechazada"
          : "Modificación cancelada",
      };

      return labels[estado] || estado || "Solicitud";
    },
    resumenLineas(plan) {
      const resumen = plan.modificacion?.resumen_cambios || {};
      const lineas = [];

      this.normalizeList(resumen.datos_base).forEach((cambio) => {
        lineas.push(
          `${cambio.campo}: ${cambio.antes || "-"} -> ${cambio.despues || "-"}`
        );
      });

      [
        ["Currículo agregado", resumen.curriculos_agregados],
        ["Currículo eliminado", resumen.curriculos_eliminados],
        ["Disciplina agregada", resumen.disciplinas_agregadas],
        ["Disciplina eliminada", resumen.disciplinas_eliminadas],
        ["Asignatura agregada", resumen.asignaturas_agregadas],
        ["Asignatura eliminada", resumen.asignaturas_eliminadas],
      ].forEach(([label, items]) => {
        this.normalizeList(items).forEach((item) =>
          lineas.push(`${label}: ${item}`)
        );
      });

      this.normalizeList(resumen.disciplinas_modificadas).forEach((item) => {
        lineas.push(
          `Disciplina modificada: ${item.disciplina} (${this.formatCambios(
            item.cambios
          )})`
        );
      });

      this.normalizeList(resumen.asignaturas_modificadas).forEach((item) => {
        lineas.push(
          `Asignatura modificada: ${item.asignatura} (${this.formatCambios(
            item.cambios
          )})`
        );
      });

      return lineas.length ? lineas : ["Sin detalle de cambios disponible"];
    },
    formatCambios(cambios = []) {
      return this.normalizeList(cambios)
        .map(
          (cambio) => `${cambio.campo}: ${cambio.antes} -> ${cambio.despues}`
        )
        .join("; ");
    },
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
    async toggleDetallePlan(plan) {
      if (this.detalleAbiertoId === plan.id) {
        this.detalleAbiertoId = null;
        this.detalleCurriculos = [];
        this.detalleError = "";
        return;
      }

      this.detalleAbiertoId = plan.id;
      await this.cargarDetallePlan(plan);
    },
    async cargarDetallePlan(plan) {
      this.detalleLoading = plan.id;
      this.detalleError = "";
      this.detalleCurriculos = [];

      try {
        const [planRes, curriculos] = await Promise.all([
          api.get(`/plan_estudio/${plan.id}`),
          this.cargarCurriculosArbol(plan.id_prog_form),
        ]);
        const planData = planRes?.data?.data || plan;

        const ids = this.normalizeList(planData.curriculos).map((item) =>
          Number(item.id)
        );
        this.detalleCurriculos = curriculos.filter((curriculo) =>
          ids.includes(Number(curriculo.id))
        );

        if (planData.modificacion?.estructura_snapshot?.estructura) {
          this.detalleCurriculos = this.curriculosDesdeSnapshot(
            planData.modificacion.estructura_snapshot.estructura
          );
        }
      } catch (error) {
        console.error(error);
        this.detalleError = "No fue posible cargar el detalle del plan.";
      } finally {
        this.detalleLoading = null;
      }
    },
    async cargarCurriculosArbol(programaId) {
      const res = await this.getFirst([
        `/progForm/${programaId}/estructura-curricular`,
        "/curriculo/arbol",
        "/curriculo",
      ]);
      return this.normalizeList(res.data).map((curriculo) => ({
        ...curriculo,
        disciplinas: this.normalizeList(curriculo.disciplinas).map(
          (disciplina) => ({
            ...disciplina,
            asignaturas: this.normalizeList(disciplina.asignaturas).map(
              (asignatura) => ({
                ...asignatura,
                horas_clase:
                  asignatura.horas_clase !== undefined
                    ? Number(asignatura.horas_clase || 0)
                    : Number(asignatura.fondo_tiempo || 0),
                horas_practica_laboral: Number(
                  asignatura.horas_practica_laboral || 0
                ),
                anios: this.normalizeList(
                  asignatura.anios || asignatura.anios_academicos
                ),
              })
            ),
          })
        ),
      }));
    },
    curriculosDesdeSnapshot(estructura) {
      return this.normalizeList(estructura).map((curriculo) => ({
        ...curriculo,
        disciplinas: this.normalizeList(curriculo.disciplinas).map(
          (disciplina) => ({
            ...disciplina,
            fondo_tiempo: this.disciplinaTotalHoras(disciplina),
            horas_clase: this.disciplinaHorasClase(disciplina),
            horas_practica_laboral:
              this.disciplinaHorasPracticaLaboral(disciplina),
            asignaturas: this.normalizeList(disciplina.asignaturas).map(
              (asignatura) => ({
                ...asignatura,
                fondo_tiempo: this.asignaturaTotalHoras(asignatura),
                anios: this.normalizeList(asignatura.anios),
              })
            ),
          })
        ),
      }));
    },
    asignaturaTotalHoras(asignatura) {
      return (
        Number(asignatura?.horas_clase || 0) +
        Number(asignatura?.horas_practica_laboral || 0)
      );
    },
    disciplinaHorasClase(disciplina) {
      return this.normalizeList(disciplina?.asignaturas).reduce(
        (total, asignatura) => total + Number(asignatura.horas_clase || 0),
        0
      );
    },
    disciplinaHorasPracticaLaboral(disciplina) {
      return this.normalizeList(disciplina?.asignaturas).reduce(
        (total, asignatura) =>
          total + Number(asignatura.horas_practica_laboral || 0),
        0
      );
    },
    disciplinaTotalHoras(disciplina) {
      return this.normalizeList(disciplina?.asignaturas).reduce(
        (total, asignatura) => total + this.asignaturaTotalHoras(asignatura),
        0
      );
    },
    countAsignaturas(curriculo) {
      return this.normalizeList(curriculo?.disciplinas).reduce(
        (total, disciplina) =>
          total + this.normalizeList(disciplina.asignaturas).length,
        0
      );
    },
    async aprobarSolicitud(plan) {
      this.accionLoading = `aprobar-${plan.id}`;
      try {
        const endpoint = this.isViceDeanReview
          ? `/plan_estudio/${plan.id}/vicedecano/aprobar`
          : `/plan_estudio/${plan.id}/aprobar`;
        await api.post(endpoint, {
          username: this.$store.getters.authUsername,
        });
        const message = this.planEsNuevo(plan)
          ? "Plan aprobado correctamente"
          : "Modificación aprobada correctamente";
        toast.success(
          this.isViceDeanReview
            ? `${message}. Queda vigente`
            : `${message}. Enviado al vicedecano docente`
        );
        this.detalleAbiertoId = null;
        await this.cargarSolicitudes();
      } catch (error) {
        console.error(error);
        toast.error(
          error?.response?.data?.message || "No se pudo aprobar la solicitud"
        );
      } finally {
        this.accionLoading = "";
      }
    },
    async cancelarSolicitud(plan) {
      this.accionLoading = `cancelar-${plan.id}`;
      try {
        const endpoint = this.isViceDeanReview
          ? `/plan_estudio/${plan.id}/vicedecano/cancelar`
          : `/plan_estudio/${plan.id}/cancelar`;
        await api.post(endpoint, {
          username: this.$store.getters.authUsername,
        });
        toast.success(
          this.planEsNuevo(plan)
            ? "Plan rechazado correctamente"
            : "Modificación rechazada correctamente"
        );
        this.detalleAbiertoId = null;
        await this.cargarSolicitudes();
      } catch (error) {
        console.error(error);
        toast.error(
          error?.response?.data?.message || "No se pudo rechazar la solicitud"
        );
      } finally {
        this.accionLoading = "";
      }
    },
  },
  mounted() {
    this.cargarSolicitudes();
  },
  watch: {
    "$route.name"() {
      this.detalleAbiertoId = null;
      this.detalleCurriculos = [];
      this.detalleError = "";
      this.cargarSolicitudes();
    },
  },
};
</script>

<style scoped>
.dean-review {
  display: grid;
  gap: 20px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.review-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  padding: 6px;
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  background: #ffffff;
}

.review-card,
.request-item {
  border: 1px solid #dbe3ef;
  border-radius: 8px;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  gap: 12px;
}

.request-list {
  display: grid;
  gap: 14px;
}

.request-item {
  padding: 18px;
}

.request-main,
.request-actions,
.full-plan-actions {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.request-actions {
  justify-content: flex-end;
  margin-top: 16px;
}

.full-plan-actions {
  justify-content: flex-start;
  margin-top: 16px;
}

.changes-panel,
.full-plan-panel {
  display: grid;
  gap: 8px;
  margin-top: 16px;
  padding: 14px;
  border-radius: 8px;
  background: #f8fafc;
}

.changes-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.change-line {
  padding: 10px 12px;
  border-left: 4px solid #3b82f6;
  border-radius: 8px;
  background: #ffffff;
  color: #0f172a;
}

.detail-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.detail-metrics > div {
  padding: 12px;
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  background: #ffffff;
}

.detail-metrics span,
.curriculo-detail-title span {
  display: block;
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.detail-metrics strong {
  display: block;
  margin-top: 6px;
  color: #0f172a;
  font-size: 1.1rem;
}

.detail-curriculo {
  overflow: hidden;
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  background: #ffffff;
}

.curriculo-detail-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px;
  background: #f8fafc;
}

.detail-table {
  min-width: 760px;
}

.detail-table-head,
.detail-disciplina-row,
.detail-asignatura-row {
  display: grid;
  grid-template-columns: minmax(220px, 1.5fr) repeat(4, minmax(110px, 1fr));
  gap: 12px;
  align-items: center;
  padding: 10px 14px;
}

.detail-table-head {
  color: #0f172a;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  background: #e8eef6;
}

.detail-disciplina-row {
  font-weight: 800;
  background: #f8fafc;
}

.detail-asignatura-row {
  border-top: 1px solid #edf2f7;
}

.anio-chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

@media (max-width: 960px) {
  .request-main,
  .request-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .detail-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
