declare module 'better-sqlite3' {
  export default class Database {
    constructor(path: string);
    prepare(sql: string): Statement;
    exec(sql: string): void;
    pragma(command: string, options?: any): any;
  }
  
  interface Statement {
    run(...params: any[]): { lastInsertRowid: number | bigint; changes: number };
    get(...params: any[]): any;
    all(...params: any[]): any[];
  }
}

