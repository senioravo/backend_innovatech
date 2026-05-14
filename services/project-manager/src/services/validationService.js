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

    if (!data.name && !data.description) {
      errors.push('Debe proporcionar nombre o descripción para actualizar');
    }

    if (data.name && data.name.trim().length < 3) {
      errors.push('El nombre debe tener al menos 3 caracteres');
    }

    if (data.description && data.description.trim().length < 10) {
      errors.push('La descripción debe tener al menos 10 caracteres');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = ValidationService;
