/**
 * Fixed-Interval Spaced Repetition Schedule
 *
 * Revision # → Days until next review
 *   1st  →  1 day
 *   2nd  →  3 days
 *   3rd  →  7 days
 *   4th  → 14 days
 *   5th+ → 30 days (repeats)
 */
const REVISION_INTERVALS = [2, 7, 15, 30, 60, 90];

/**
 * Generates the full revision schedule from a start date.
 * @param {Date|string} startDate - The date the problem was first solved.
 * @returns {Date[]} - Array of future revision dates.
 */
const generateFullSchedule = (startDate) => {
    const baseDate = new Date(startDate);
    return REVISION_INTERVALS.map(days => {
        const revDate = new Date(baseDate);
        revDate.setDate(revDate.getDate() + days);
        return revDate;
    });
};

/**
 * Returns the number of days until the next revision
 * based on how many times the problem has already been reviewed.
 * @param {number} revisionCount - current count BEFORE this review
 */
const getNextInterval = (revisionCount) => {
    const idx = Math.min(revisionCount, REVISION_INTERVALS.length - 1);
    return REVISION_INTERVALS[idx];
};

/**
 * Calculates the fields to update after a revision is marked complete.
 * @param {object} problem - Mongoose Problem document
 * @returns {object} - fields to merge into the problem before saving
 */
const calculateNextRevision = (problem) => {
    const newCount = problem.revisionCount + 1;
    const daysUntilNext = getNextInterval(newCount);

    const nextRevisionDate = new Date();
    nextRevisionDate.setDate(nextRevisionDate.getDate() + daysUntilNext);

    return {
        revisionCount: newCount,
        nextRevisionDate,
        lastReviewed: new Date(),
    };
};

/**
 * Returns the initial nextRevisionDate when a problem is first added.
 * First revision is always 1 day from today.
 */
const getInitialRevisionDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + REVISION_INTERVALS[0]); // +1 day
    return date;
};

module.exports = { calculateNextRevision, getInitialRevisionDate, generateFullSchedule };
