export const es = {
  common: {
    save: 'Guardar',
    cancel: 'Cancelar',
    retry: 'Reintentar',
    loading: 'Cargando…',
    error: 'Ocurrió un error. Intenta de nuevo.',
    accept: 'Aceptar',
    close: 'Cerrar',
    delete: 'Eliminar',
    edit: 'Editar',
    back: 'Volver',
  },
  states: {
    emptyTitle: 'Aún no hay nada aquí',
    emptyDescription: 'Cuando registres información aparecerá en esta pantalla.',
    errorTitle: 'Algo salió mal',
  },
  designPreview: {
    title: 'Sistema de diseño',
    subtitle: 'Pantalla temporal de desarrollo. Se eliminará antes de publicar.',
  },
} as const;

export type Texts = typeof es;
