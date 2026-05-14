class ValidationService {
  static validateProjectInput(data) {
    const errors = [];
    const name = data.name ?? data.nombre;
    const description = data.description ?? data.descripcion;

    if (!name || typeof name !== 'string' || !name.trim()) {
      errors.push('El nombre es requerido y debe ser texto');
    } else if (name.trim().length < 3) {
      errors.push('El nombre debe tener al menos 3 caracteres');
    }

    if (!description || typeof description !== 'string' || !description.trim()) {
      errors.push('La descripción es requerida y debe ser texto');
    } else if (description.trim().length < 10) {
      errors.push('La descripción debe tener al menos 10 caracteres');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateUpdateInput(data) {
    const errors = [];
    const name = data.name ?? data.nombre;
    const description = data.description ?? data.descripcion;

    if (!name && !description) {
      errors.push('Debe proporcionar nombre o descripción para actualizar');
    }

    if (name && name.trim().length < 3) {
      errors.push('El nombre debe tener al menos 3 caracteres');
    }

    if (description && description.trim().length < 10) {
      errors.push('La descripción debe tener al menos 10 caracteres');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateTaskInput(data) {
    const errors = [];
    const title = data.title ?? data.titulo;
    const description = data.description ?? data.descripcion;

    if (!title || typeof title !== 'string' || !title.trim()) {
      errors.push('El título es requerido y debe ser texto');
    } else if (title.trim().length < 3) {
      errors.push('El título debe tener al menos 3 caracteres');
    }

    if (description !== undefined && description !== null && String(description).trim() !== '') {
      if (typeof description !== 'string' || description.trim().length < 10) {
        errors.push('La descripción, si se informa, debe tener al menos 10 caracteres');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateTaskUpdateInput(data) {
    const errors = [];
    const title = data.title ?? data.titulo;
    const description = data.description ?? data.descripcion;

    const hasTitle = data.title !== undefined || data.titulo !== undefined;
    const hasDescription = data.description !== undefined || data.descripcion !== undefined;
    const hasCompleted = data.completed !== undefined || data.completado !== undefined;

    if (!hasTitle && !hasDescription && !hasCompleted) {
      errors.push('Debe proporcionar título, descripción o completado para actualizar');
    }

    if (hasTitle) {
      if (!title || typeof title !== 'string' || !title.trim() || title.trim().length < 3) {
        errors.push('El título debe tener al menos 3 caracteres');
      }
    }

    if (hasDescription) {
      if (typeof description !== 'string' || description.trim().length < 10) {
        errors.push('La descripción debe tener al menos 10 caracteres');
      }
    }

    if (hasCompleted && typeof (data.completed ?? data.completado) !== 'boolean') {
      errors.push('completado debe ser booleano');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * responsableId / userId: identificador acordado con el microservicio de usuarios (sin validación remota aquí).
   */
  static validateResponsableInput(data) {
    const errors = [];
    const rid = data.responsableId ?? data.userId;
    if (rid === undefined || rid === null) {
      errors.push('Debe enviar responsableId o userId');
    } else if (typeof rid !== 'string' || !rid.trim()) {
      errors.push('El identificador del responsable debe ser texto no vacío');
    } else if (rid.trim().length > 120) {
      errors.push('El identificador del responsable es demasiado largo');
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = ValidationService;
