import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Kysely } from 'kysely'

import { Database } from './database.types'
import { DatabaseProvider } from './database.provider'

/**
 * In-memory implementation of DatabaseProvider
 * Used for testing without connecting to an actual database
 */
@Injectable()
export class InMemoryDatabaseProvider extends DatabaseProvider {
  // Using a more specific type for tables
  private tables: {
    assembly: Array<Partial<Database['assembly']>>
    political_party: Array<Partial<Database['political_party']>>
    elected_official: Array<Partial<Database['elected_official']>>
    decision: Array<Partial<Database['decision']>>
    individual_vote: Array<Partial<Database['individual_vote']>>
  } = {
    assembly: [],
    political_party: [],
    elected_official: [],
    decision: [],
    individual_vote: [],
  }

  constructor(configService: ConfigService) {
    super(configService)
  }

  /**
   * Override the getDb method to return a mock Kysely instance
   * with in-memory storage instead of PostgreSQL
   */
  getDb(): Kysely<Database> {
    if (!this['db']) {
      this.initializeInMemoryDb()
    }
    return this['db']
  }

  /**
   * Reset all tables to empty
   */
  reset(): void {
    Object.keys(this.tables).forEach(table => {
      // Type-safe way to reset tables
      this.tables[table as keyof typeof this.tables] = []
    })
  }

  /**
   * Seed a table with test data
   * @param tableName The name of the table to seed
   * @param data The data to seed the table with
   */
  seedTable<K extends keyof Database>(tableName: K, data: Array<Partial<Database[K]>>): void {
    // Type-safe seeding with proper typing for each table
    if (tableName === 'assembly') {
      ;(this.tables.assembly as Array<Partial<Database['assembly']>>) = [
        ...(data as Array<Partial<Database['assembly']>>),
      ]
    } else if (tableName === 'political_party') {
      ;(this.tables.political_party as Array<Partial<Database['political_party']>>) = [
        ...(data as Array<Partial<Database['political_party']>>),
      ]
    } else if (tableName === 'elected_official') {
      ;(this.tables.elected_official as Array<Partial<Database['elected_official']>>) = [
        ...(data as Array<Partial<Database['elected_official']>>),
      ]
    } else if (tableName === 'decision') {
      ;(this.tables.decision as Array<Partial<Database['decision']>>) = [
        ...(data as Array<Partial<Database['decision']>>),
      ]
    } else if (tableName === 'individual_vote') {
      ;(this.tables.individual_vote as Array<Partial<Database['individual_vote']>>) = [
        ...(data as Array<Partial<Database['individual_vote']>>),
      ]
    }
  }

  /**
   * Initialize the in-memory database
   */
  private initializeInMemoryDb() {
    // Create a mock Kysely implementation that stores data in memory
    const mockKysely = {
      selectFrom: (table: string) => this.createSelectQueryBuilder(table),
      insertInto: (table: string) => this.createInsertQueryBuilder(table),
      updateTable: (table: string) => this.createUpdateQueryBuilder(table),
      deleteFrom: (table: string) => this.createDeleteQueryBuilder(table),
      schema: {
        createTable: () => ({
          ifNotExists: () => ({
            addColumn: () => ({
              // Chain methods for schema creation
              execute: async () => ({}),
            }),
          }),
        }),
        dropTable: () => ({
          ifExists: () => ({
            execute: async () => ({}),
          }),
        }),
      },
      destroy: async () => {}, // Add mock destroy method
    } as unknown as Kysely<Database>

    this['db'] = mockKysely
  }

  /**
   * Create a select query builder for a table
   */
  private createSelectQueryBuilder(table: string) {
    let selectedColumns: string[] = []
    let whereConditions: Array<{ column: string; operator: string; value: any }> = []
    const self = this

    return {
      select: (columns: string | string[]) => {
        selectedColumns = Array.isArray(columns) ? columns : [columns]
        return this.createSelectQueryBuilder(table)
      },
      selectAll: () => {
        selectedColumns = ['*']
        return this.createSelectQueryBuilder(table)
      },
      where: (column: string, operator: string, value: any) => {
        whereConditions.push({ column, operator, value })
        return this.createSelectQueryBuilder(table)
      },
      leftJoin: () => this.createSelectQueryBuilder(table),
      limit: () => this.createSelectQueryBuilder(table),
      offset: () => this.createSelectQueryBuilder(table),
      orderBy: () => this.createSelectQueryBuilder(table),
      groupBy: () => this.createSelectQueryBuilder(table),
      execute: async () => {
        // Type-safe filtering
        return this.applyFilters(this.tables[table as keyof typeof this.tables], whereConditions)
      },
      executeTakeFirst: async () => {
        const results = await this.applyFilters(this.tables[table as keyof typeof this.tables], whereConditions)

        // Special handling for findById queries: if id is in the where conditions
        const idCondition = whereConditions.find(
          condition => condition.column === 'id' && condition.operator === '=' && condition.value !== undefined,
        )

        // If we're looking for a specific ID and no results, return null
        if (idCondition && results.length === 0) {
          return null
        }

        return results.length > 0 ? results[0] : null
      },
      executeTakeFirstOrThrow: async () => {
        const result = await this.createSelectQueryBuilder(table).executeTakeFirst()
        if (!result) {
          throw new Error(`No records found in table ${table}`)
        }
        return result
      },
    }
  }

  /**
   * Create an insert query builder for a table
   */
  private createInsertQueryBuilder(table: string) {
    return {
      values: (data: any) => {
        const records = Array.isArray(data) ? data : [data]
        return {
          returning: () => {
            return {
              execute: async () => {
                const insertedRecords = records.map(record => {
                  const newRecord = { ...record }
                  // Type-safe insertion
                  ;(this.tables[table as keyof typeof this.tables] as any[]).push(newRecord)
                  return newRecord
                })
                return insertedRecords
              },
              executeTakeFirst: async () => {
                const insertedRecords = await this.createInsertQueryBuilder(table).values(data).returning().execute()
                return insertedRecords.length > 0 ? insertedRecords[0] : null
              },
              executeTakeFirstOrThrow: async () => {
                const result = await this.createInsertQueryBuilder(table).values(data).returning().executeTakeFirst()
                if (!result) {
                  throw new Error(`Failed to insert into ${table}`)
                }
                return result
              },
            }
          },
        }
      },
    }
  }

  /**
   * Create an update query builder for a table
   */
  private createUpdateQueryBuilder(table: string) {
    return {
      set: (data: any) => {
        return {
          where: (column: string, operator: string, value: any) => {
            return {
              returning: () => {
                return {
                  execute: async () => {
                    const records = this.tables[table as keyof typeof this.tables] as any[]
                    const updatedRecords: any[] = []

                    for (let i = 0; i < records.length; i++) {
                      const colVal = this.getValueFromColumn(records[i], column)
                      if (this.compareValues(colVal, operator, value)) {
                        this.tables[table as keyof typeof this.tables][i] = { ...records[i], ...data }
                        updatedRecords.push(this.tables[table as keyof typeof this.tables][i])
                      }
                    }

                    return updatedRecords
                  },
                  executeTakeFirst: async () => {
                    const updatedRecords = await this.createUpdateQueryBuilder(table)
                      .set(data)
                      .where(column, operator, value)
                      .returning()
                      .execute()
                    return updatedRecords.length > 0 ? updatedRecords[0] : null
                  },
                  executeTakeFirstOrThrow: async () => {
                    const result = await this.createUpdateQueryBuilder(table)
                      .set(data)
                      .where(column, operator, value)
                      .returning()
                      .executeTakeFirst()
                    if (!result) {
                      throw new Error(`No records updated in ${table}`)
                    }
                    return result
                  },
                }
              },
            }
          },
        }
      },
    }
  }

  /**
   * Create a delete query builder for a table
   */
  private createDeleteQueryBuilder(table: string) {
    return {
      where: (column: string, operator: string, value: any) => {
        return {
          execute: async () => {
            const initialLength = this.tables[table as keyof typeof this.tables].length
            // Type-safe filtering for deletion
            this.tables[table as keyof typeof this.tables] = this.tables[table as keyof typeof this.tables].filter(
              record => !this.compareValues(this.getValueFromColumn(record, column), operator, value),
            )
            const affected = initialLength - this.tables[table as keyof typeof this.tables].length
            return [{ affected }]
          },
        }
      },
    }
  }

  /**
   * Apply filters to an array of records
   */
  private applyFilters<T>(data: T[], whereConditions: Array<{ column: string; operator: string; value: any }>): T[] {
    let result = [...data]

    whereConditions.forEach(({ column, operator, value }) => {
      result = result.filter(record => {
        // Handle column name formats (e.g., table.column)
        // Ensure column is a string before calling split
        const columnStr = String(column || '')
        const parts = columnStr.split('.')
        const propertyName = parts.length > 1 ? parts[1] : columnStr

        return this.compareValues(this.getValueFromColumn(record, propertyName), operator, value)
      })
    })

    return result
  }

  /**
   * Get a value from a column, handling nested objects and snake_case to camelCase conversion
   */
  private getValueFromColumn(record: any, column: string): any {
    // Handle columns with underscore (snake_case to camelCase)
    const camelColumn = column.replace(/_([a-z])/g, g => g[1].toUpperCase())

    // Try both the original column name and the camelCase version
    return record[column] !== undefined ? record[column] : record[camelColumn]
  }

  /**
   * Compare values using the given operator
   */
  private compareValues(recordValue: any, operator: string, compareValue: any): boolean {
    // Special case: if recordValue is undefined and operator is '=',
    // it should return false to ensure proper nulls
    if (recordValue === undefined && operator === '=') {
      return false
    }

    switch (operator) {
      case '=':
        return recordValue === compareValue
      case '!=':
        return recordValue !== compareValue
      case '>':
        return recordValue > compareValue
      case '>=':
        return recordValue >= compareValue
      case '<':
        return recordValue < compareValue
      case '<=':
        return recordValue <= compareValue
      case 'ilike':
        if (typeof recordValue === 'string' && typeof compareValue === 'string') {
          return recordValue.toLowerCase().includes(compareValue.replace(/%/g, '').toLowerCase())
        }
        return false
      default:
        return true
    }
  }
}
