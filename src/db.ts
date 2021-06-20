import {Database} from 'sqlite3';

const sqlite3 = require('sqlite3').verbose();

class SqDatabase {
    private db: Database;

    constructor() {
        this.db = new sqlite3.Database("./db.db", (err: Error | null) => {
            if (err) {
                throw new Error(err.message);
            }
        });
    }

    all = async (sql: string, params: any[] = []): Promise<any> => {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err: Error | null, rows: any[]) => {
                if (err) return reject(err);
                return resolve(rows);
            });
        });
    };
    run = async (sql: string, params: any[] = []): Promise<any> => {
        return new Promise((resolve, reject) => {
            return this.db.run(sql, params, (err: Error | null, rows: any[]) => {
                if (err) return reject(err);
                return resolve(rows);
            });
        });
    };
    get = async (sql: string, params: any[] = []): Promise<any> => {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err: Error | null, rows: any[]) => {
                if (err) return reject(err);
                return resolve(rows);
            });
        });
    };
    delete = async (table_name: string): Promise<Error | boolean> => {
        return new Promise((resolve, reject) => {
            this.db.run(`DELETE
                         FROM ${table_name}`, [], (err: Error | null) => {
                if (err) return reject(err);
                return resolve(true);
            });
        });
    };
}

export default SqDatabase;