/**
 * DateRange Value Object
 *
 * Represents a date range with validation
 */
export class DateRange {
  private constructor(
    private readonly _startDate: Date,
    private readonly _endDate: Date
  ) {}

  /**
   * Create a DateRange instance
   *
   * @param startDate - Start date
   * @param endDate - End date
   * @returns DateRange instance
   * @throws Error if dates are invalid
   */
  static create(startDate: Date, endDate: Date): DateRange {
    if (!(startDate instanceof Date) || Number.isNaN(startDate.getTime())) {
      throw new TypeError('Invalid start date');
    }

    if (!(endDate instanceof Date) || Number.isNaN(endDate.getTime())) {
      throw new TypeError('Invalid end date');
    }

    if (startDate > endDate) {
      throw new Error('Start date must be before or equal to end date');
    }

    return new DateRange(startDate, endDate);
  }

  /**
   * Get start date
   */
  get startDate(): Date {
    return new Date(this._startDate);
  }

  /**
   * Get end date
   */
  get endDate(): Date {
    return new Date(this._endDate);
  }

  /**
   * Get duration in days
   */
  getDurationInDays(): number {
    const diff = this._endDate.getTime() - this._startDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if a date is within this range
   */
  contains(date: Date): boolean {
    return date >= this._startDate && date <= this._endDate;
  }

  /**
   * Check if this range overlaps with another
   */
  overlaps(other: DateRange): boolean {
    return this._startDate <= other._endDate && this._endDate >= other._startDate;
  }

  /**
   * Check if this range is in the past
   */
  isPast(): boolean {
    return this._endDate < new Date();
  }

  /**
   * Check if this range is in the future
   */
  isFuture(): boolean {
    return this._startDate > new Date();
  }

  /**
   * Check if this range is current (includes today)
   */
  isCurrent(): boolean {
    const now = new Date();
    return this.contains(now);
  }
}
