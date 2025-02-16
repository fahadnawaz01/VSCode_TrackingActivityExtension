export default class TimeTracker {
  private _timer: number;
  private _filetype: Record<string, number>;
  private _myDate: Date;

  constructor(
    timer?: number,
    filetype?: Record<string, number>,
    myDate?: Date
  ) {
    this._timer = timer ?? 0;
    this._filetype = filetype ?? {};
    this._myDate = myDate ?? new Date();
  }

  public get getTimer(): number {
    return this._timer;
  }

  public get getFiletype(): Record<string, number> {
    return this._filetype;
  }

  public get getMyDate(): Date {
    return this._myDate;
  }

  public set setTimer(timer: number) {
    this._timer = timer;
  }

  public set setFiletype(filetype: Record<string, number>) {
    this._filetype = filetype;
  }

  public set setMyDate(myDate: Date) {
    this._myDate = myDate;
  }

  addFileType(fileType: string, time: number) {
    this._filetype[fileType] = time;
  }

  getTimeForFileType(fileType: string): number | undefined {
    return this._filetype[fileType]; // Returns undefined if not found
  }

  toJSON(): {
    timer: number;
    filetype: [string, number][];
    myDate: string;
  } {
    // Add types for better clarity
    return {
      timer: this._timer,
      filetype: Object.entries(this._filetype),
      myDate: this._myDate.toISOString(), // Convert Date to string for JSON
    };
  }
}
