import pgStructure from 'pg-structure';
import userConfig from './config.js';

function getEntity(entity, config) {
  const baseUrl = (config && config.baseUrl) || '';
  const version =
    (config && config.schemaVersion) ||
    'http://json-schema.org/draft-07/schema#';
  const jsonSchema = {
    $schema: version,
    $id: `${baseUrl}/${entity.schema.name}/${entity.name}/schema.json`,
    title: entity.name,
    description: entity.comment,
    properties: {},
    required: [],
    type: 'object'
  };
  const columns = entity.columns;
  for (const column of columns) {
    jsonSchema.properties[column.name] = _getColumnData(column);
    if (column.notNull && column.defaultWithTypeCast === null) {
      jsonSchema.required.push(column.name);
    }
  }

  return jsonSchema;
}

async function getSchemas(override = {}) {
  const config = Object.assign({}, userConfig.config, override);
  const schemas = config.schemas.map((i) => i.name);
  const db = await pgStructure.default(
    {
      database: config.db.database,
      user: config.db.user,
      password: config.db.password
    },
    { includeSchemas: schemas }
  );

  const collection = {};
  for (const dbSchema of schemas) {
    const schema = db.get(dbSchema);
    collection[schema.name] = {};
    const schemaConfig = config.schemas.find((s) => s.name === schema.name);
    const tables = schema.tables.filter(
      (table) => !schemaConfig.ignores.includes(table.name)
    );
    for (const table of tables) {
      collection[schema.name][table.name] = getEntity(table, config);
    }
  }

  return collection;
}

function _getColumnData(column) {
  const columnType = column.type.name;
  const isArray = column.arrayDimension > 0;

  switch (columnType) {
    case 'bit':
    case 'bit varying':
    case 'varbit':
    case 'character':
    case 'character varying':
    case 'geography':
    case 'text': {
      const typeDef = { type: 'string' };
      if (isArray) {
        return { type: 'array', items: typeDef };
      }

      return typeDef;
    }

    case 'uuid': {
      const typeDef = { type: 'string', format: 'uuid' };
      if (isArray) {
        return { type: 'array', items: typeDef };
      }

      return typeDef;
    }

    case 'date': {
      const typeDef = { type: 'string', format: 'date' };
      if (isArray) {
        return { type: 'array', items: typeDef };
      }

      return typeDef;
    }

    case 'time with time zone':
    case 'time without time zone': {
      const typeDef = { type: 'string', format: 'time' };
      if (isArray) {
        return { type: 'array', items: typeDef };
      }

      return typeDef;
    }

    case 'timestamp with time zone':
    case 'timestamp without time zone':
    case 'timestamp': {
      const typeDef = { type: 'string', format: 'date-time' };
      if (isArray) {
        return { type: 'array', items: typeDef };
      }

      return typeDef;
    }

    case 'boolean': {
      const typeDef = { type: 'boolean' };
      if (isArray) {
        return { type: 'array', items: typeDef };
      }

      return typeDef;
    }

    case 'bigint':
    case 'decimal':
    case 'double precision':
    case 'float8':
    case 'int':
    case 'integer':
    case 'smallint':
    case 'numeric':
    case 'real': {
      const typeDef = { type: 'number' };
      if (isArray) {
        return { type: 'array', items: typeDef };
      }

      return typeDef;
    }

    case 'json':
    case 'jsonb': {
      const typeDef = { type: 'object', properties: {} };
      if (isArray) {
        return { type: 'array', items: typeDef };
      }

      return typeDef;
    }

    case 'interval': {
      const typeDef = {
        oneOf: [
          {
            type: 'number',
            description: 'Duration in seconds'
          },
          {
            type: 'string',
            description: 'Descriptive duration i.e. 8 hours'
          },
          {
            type: 'object',
            description: 'Duration object',
            properties: {
              years: { type: 'number' },
              months: { type: 'number' },
              days: { type: 'number' },
              hours: { type: 'number' },
              minutes: { type: 'number' },
              seconds: { type: 'number' },
              milliseconds: { type: 'number' }
            }
          }
        ]
      };
      if (isArray) {
        return { type: 'array', items: typeDef };
      }

      return typeDef;
    }

    default: {
      if (column.type.category === 'E' && Array.isArray(column.type.values)) {
        return { enum: column.type.values };
      }

      console.warn(
        `Unsupported column type: ${columnType}. Defaulting to null`
      );
      return { type: 'null' };
    }
  }
}

export { getEntity, getSchemas };
